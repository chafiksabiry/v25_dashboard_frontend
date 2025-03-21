declare module '@qalqul/sdk-call' {
  import { Socket } from 'socket.io-client';

  export interface QalqulSettings {
    generalSettings: {
      agent: {
        username: string;
        password: string;
        name: string;
        sipAddress: string;
      };
      baseUrl: string;
      server: {
        realm: string;
        ws: string;
      };
      iceServers: Array<{ url: string }>;
      logLevel: boolean;
    };
    headerData: {
      callerId: number;
      outCallerId: string;
      CampaignID: number;
      agent: number;
      sipNumber: number;
      QueueName: string;
      queueId: number;
      CountryCode: number;
      outRouteId: number;
      outGatewayId: number;
      outGatewayName: string;
      agentusername: string;
      CampaignName: string;
      Disposition: string;
      InteractionID: null | string;
      PCIRecord: boolean;
      RecordChannel: string;
      UniqueID: null | string;
      WrapupStrict: string;
      WrapupTime: number;
      DispositionType: string;
      transfer: boolean;
      WrapupStatus: boolean;
      profileId: string;
    };
  }

  export interface QalqulCall {
    id: string;
    status: string;
    on: (event: 'end' | 'error', callback: (error?: any) => void) => void;
    disconnect: () => void;
    mute: (muted: boolean) => void;
    subscribe: (callback: (event: any) => void) => void;
    hangup: () => void;
  }

  export class Manager {
    static StatusManagerInitializer: {
      new (io: any, baseUrl: string, username: string, password: string, logLevel: boolean): any;
    };
    static Client: {
      connect(settings: QalqulSettings, io: any, baseUrl: string, username: string): Promise<any>;
    };
  }

  export class Calls {
    static Status: {
      CONNECTED: string;
      TERMINATED: string;
    };
  }

  export class QalqulSDK {
    constructor(io: any, settings: QalqulSettings, callback: () => void);
    initialize(): Promise<void>;
    dial(phoneNumber: string): Promise<string>;
    getCalls(): Promise<QalqulCall[]>;
    logout(): Promise<void>;
  }
}

declare module '@qalqul/sdk-call/dist/model/QalqulSDK' {
  export class QalqulSDK {
    constructor(io: any, settings: any, callback: () => void);
    initialize(): Promise<void>;
    getCalls(): Promise<any[]>;
    logout(): Promise<void>;
    dial(recipient: string): Promise<string>;
  }
} 