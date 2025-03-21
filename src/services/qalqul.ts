import io from "socket.io-client";
import { Calls, Manager } from '@qalqul/sdk-call';

interface QalqulConfig {
  username: string;
  password: string;
  userId: string;
}

interface QalqulSubscription {
  unsubscribe: () => void;
}

interface QalqulEvent {
  type: string;
  value: string;
  error?: any;
}

interface QalqulCall {
  id: string;
  status: string;
  on: (event: 'end' | 'error', callback: (error?: any) => void) => void;
  disconnect: () => void;
  mute: (muted: boolean) => void;
  subscribe: (callback: (event: QalqulEvent) => void) => QalqulSubscription;
  hangup: () => void;
}

interface QalqulCallResponse {
  id: string;
  status: string;
  subscribe: (callback: (event: QalqulEvent) => void) => QalqulSubscription;
  hangup: () => void;
  mute: (muted: boolean) => void;
  number?: string;
}

interface QalqulClient {
  call: (recipient: string, headers: any) => QalqulCallResponse;
  subscribe: (callback: (call: QalqulCallResponse) => void) => void;
  register: (headers: any) => void;
  stop: (code: number) => void;
  logout: () => Promise<void>;
  getCalls: () => Promise<QalqulCallResponse[]>;
  dial: (phoneNumber: string) => Promise<string>;
}

export class QalqulService {
  private static instance: QalqulService;
  private client: QalqulClient | null = null;
  private statusManager: any;
  private initialized = false;
  private settings: any;
  private callManage: NodeJS.Timeout | undefined;
  private currentCallId: string | null = null;
  private calls: QalqulCallResponse[] = [];

  private constructor() {}

  static getInstance(): QalqulService {
    if (!QalqulService.instance) {
      QalqulService.instance = new QalqulService();
    }
    return QalqulService.instance;
  }

  private add(call: QalqulCallResponse): void {
    this.calls.push(call);

    const subscription = call.subscribe(event => {
      if (event.type === 'status' && event.value === 'TERMINATED') {
        subscription.unsubscribe();
        this.calls = [];
        this.initialize(this.settings.generalSettings.agent).catch(error => {
          console.error('Failed to reinitialize after call:', error);
        }); // Re-initialize connection after a call ends
        setTimeout(() => this.remove(call), 10000);
      }

      if (call.status === Calls.Status.CONNECTED && this.settings.generalSettings.logLevel) {
        console.log('Call connected');
      }
    });
  }

  private remove(call: QalqulCallResponse): void {
    this.calls = this.calls.filter(_call => call.number !== _call.number);
  }

  async initialize(config: QalqulConfig): Promise<void> {
    if (this.initialized && this.client) {
      console.log("Qalqul SDK exists => logout");
      await this.logout();
    }

    try {
      this.settings = {
        generalSettings: {
          agent: {
            username: config.username,
            password: config.password,
            name: config.username,
            sipAddress: `sip:${config.username}@digital-works.qalqul.io`,
          },
          baseUrl: 'https://digital-works.qalqul.io',
          server: {
            realm: 'digital-works.qalqul.io',
            ws: 'wss://digital-works.qalqul.io:10443',
          },
          iceServers: [{ url: "stun:digital-works.qalqul.io:3478" }],
          logLevel: false
        },
        headerData: {
          callerId: 8678,
          outCallerId: "0522774125",
          CampaignID: 3,
          agent: 7,
          sipNumber: 8595,
          QueueName: 'DigitalWorksQueueMA',
          queueId: 11,
          CountryCode: 212,
          outRouteId: 72,
          outGatewayId: 94,
          outGatewayName: 'Ma_GW',
          agentusername: config.username,
          CampaignName: "",
          Disposition: "",
          InteractionID: null,
          PCIRecord: false,
          RecordChannel: "",
          UniqueID: null,
          WrapupStrict: "No",
          WrapupTime: 0,
          DispositionType: 'Yes',
          transfer: false,
          WrapupStatus: false,
          profileId: '16045',
        }
      };

      console.log("Initializing Qalqul SDK with settings:", this.settings);
      const statusManagerInitializer = new Manager.StatusManagerInitializer(io, this.settings.generalSettings.baseUrl, this.settings.generalSettings.agent.username, this.settings.generalSettings.agent.password, this.settings.generalSettings.logLevel);

      const statusManager = await statusManagerInitializer.initializeStatusManager();
      this.statusManager = statusManager;

      this.client = await Manager.Client.connect(
        this.settings.generalSettings,
        io,
        this.settings.baseUrl,
        this.settings.generalSettings.agent.username
      ) as QalqulClient;

      if (!this.client) {
        throw new Error('Failed to initialize Qalqul client');
      }

      this.client.subscribe(call => { this.add(call) });
      const headers = this.settings.generalSettings;
      this.client.register(headers);

      console.log("Qalqul SDK initialized successfully");
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Qalqul:', error);
      throw error;
    }
  }

  private async updateCallsState(): Promise<QalqulCallResponse[]> {
    if (!this.client) {
      throw new Error('Client is not initialized');
    }
    console.log("Updating calls state");
    const calls = await this.client.getCalls();
    console.log("Current calls:", calls);
    return calls;
  }

  private startCallMonitoring(): void {
    if (this.callManage) {
      clearInterval(this.callManage);
    }

    this.callManage = setInterval(async () => {
      const calls = await this.updateCallsState();
      
      if (calls && calls.length > 0) {
        const currentCall = calls[0];
        console.log("Current call status:", currentCall.status);

        if (currentCall.status === "TERMINATING") {
          console.log("Call is terminating");
          this.stopCallMonitoring();
          await this.logout();
        }
      }
    }, 1000);
  }

  private stopCallMonitoring(): void {
    if (this.callManage) {
      clearInterval(this.callManage);
      this.callManage = undefined;
    }
  }

  async makeCall(phoneNumber: string): Promise<QalqulCall> {
    if (!this.initialized || !this.client) {
      throw new Error('Qalqul is not initialized');
    }

    try {
      // Format phone number to include country code if not present
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      console.log("Initiating call to:", formattedNumber);
      this.currentCallId = await this.client.dial(formattedNumber);
      console.log("Call initiated with ID:", this.currentCallId);

      // Start monitoring the call
      this.startCallMonitoring();

      // Wait for a short time to ensure the call is properly initialized
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all active calls
      const calls = await this.updateCallsState();
      
      // Find the call by ID
      const call = calls.find((c: QalqulCallResponse) => c.id === this.currentCallId);
      
      if (!call) {
        throw new Error(`Call with ID ${this.currentCallId} not found after initialization`);
      }

      // Create a wrapper for the call object
      const callWrapper: QalqulCall = {
        id: call.id,
        status: call.status,
        on: (event: 'end' | 'error', callback: (error?: any) => void) => {
          if (event === 'end') {
            call.subscribe((event: QalqulEvent) => {
              if (event.type === 'status' && event.value === 'TERMINATED') {
                callback();
              }
            });
          } else if (event === 'error') {
            call.subscribe((event: QalqulEvent) => {
              if (event.type === 'error') {
                callback(event.error);
              }
            });
          }
        },
        disconnect: () => {
          this.stopCallMonitoring();
          call.hangup();
        },
        mute: (muted: boolean) => {
          call.mute(muted);
        },
        subscribe: (callback: (event: QalqulEvent) => void) => {
          return call.subscribe(callback);
        },
        hangup: () => {
          this.stopCallMonitoring();
          call.hangup();
        }
      };

      return callWrapper;
    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  }

  async logout() {
    this.stopCallMonitoring();
    if (this.client) {
      await this.client.logout();
      this.initialized = false;
      this.currentCallId = null;
    }
  }
} 