import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Device } from '@twilio/voice-sdk';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calls } from "@qalqul/sdk-call";
import { QalqulSDK } from "@qalqul/sdk-call/dist/model/QalqulSDK";
import io from "socket.io-client";
import { callsApi } from "../services/api/calls";

interface QalqulSDKInstance {
  initialize: () => Promise<void>;
  getCalls: () => Promise<Calls[]>;
  logout: () => Promise<void>;
  dial: (phoneNumber: string) => Promise<string>;
}

interface CallInterfaceProps {
  phoneNumber: string;
  agentId: string;
  onEnd: () => void;
  onCallSaved?: () => void;
  provider?: 'twilio' | 'qalqul';
}

export function CallInterface({ phoneNumber, agentId, onEnd, onCallSaved, provider = 'twilio' }: CallInterfaceProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'initiating' | 'active' | 'ended'>('initiating');
  const [connection, setConnection] = useState<any>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callSid, setCallSid] = useState<string | null>(null);
  const { currentUser } = useAuth();
  let qalqulSDK: QalqulSDKInstance | undefined;
  let calls: any[] = [];
  let isSdkInitialized: boolean = false;
  let start_timer_var = 0;  
  let callTimer = "00 : 00 : 00";
  let uuId: string | null = null;
  let settings1 = {
    generalSettings: {
        agent: {
        username: "Agent.1",
        password: "ewyaHtvzDPRdXrZL",
        name: "Agent.1",
        sipAddress: `sip:Agent.1@digital-works.qalqul.io`,
      } ,
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
      agent: 7,  // id agent
      sipNumber: 8595,   // extension id for agent
      QueueName: 'DigitalWorksQueueMA', //call center queue name
      queueId: 11,   //call center queue id
      CountryCode: 212,
      outRouteId: 72,
      outGatewayId: 94,
      outGatewayName: 'Ma_GW',
      agentusername: 'Agent.1',
      CampaignName : "",
      Disposition : "",
      InteractionID : null,
      PCIRecord: false,
      RecordChannel: "",
      UniqueID: null,
      WrapupStrict: `No`, // No|Yes|Strict|Loose
      WrapupTime: 0,
      DispositionType: 'Yes', // No|Yes
      transfer: false,
      WrapupStatus: false,
      profileId: '16045',
  }
  };
  let callManage: NodeJS.Timeout | undefined;
  let intervalTimer;
  let callback = async () => {
    console.log("Start callback function");
    if (!qalqulSDK) return;
    
    //Get Calls from SDK Qalqul
    await updateCallsState();
    console.log("callback function suite");
    //There is no call : appel terminé
    const calls = await qalqulSDK.getCalls();
    if (calls.length === 0) {
      console.log("fin du call:", qalqulSDK);
      console.log("clear timer to getCalls:", callManage);
      clearInterval(callManage);
      callManage = undefined;
      console.log("stop call timer:", intervalTimer);
      clearInterval(intervalTimer);
      await setCallStatus('ended');
      console.log("terminated call -> popup to register info in DB");
    }
  };
  let updateCallsState = async () => {
    console.log("Début de la fonction : updateCallsState");
    if (!qalqulSDK) return;
    calls = await qalqulSDK.getCalls();
    console.log(" Fin : calls in update calls state:", calls);
  };
  let handleDial = async () => {
    console.log("Start Handle Dial Function:");
    start_timer_var = 0;
    callTimer = "00 : 00 : 00";
    const recipient = phoneNumber;
    console.log("Lead phone number to call:", recipient);
    try {
      if (!qalqulSDK) {
        console.error("SDK not initialized");
        return;
      }
      
      uuId = await qalqulSDK.dial(recipient);
      console.log("Call initiated with UUID:", uuId);
     await storeQalqulCallInDbInStart(uuId);
      console.log("in dial after store in db");

      await updateCallsState();

      await getCalls();
    } catch (error) {
      console.error("Error dialing:", error);
    } finally {
      console.log("Finish Handle Dial Function:");
    }
  };
  let getCalls = async () => {
    console.log("getCalls en boucle");
    callManage = setInterval(async () => {
      if (!qalqulSDK) {
        console.error("SDK not initialized");
        clearInterval(callManage);
        return;
      }
      
      try {
        calls = await qalqulSDK.getCalls();
        console.log("calls exist ?", calls);
        console.log("start_timer_var:", start_timer_var);
        if (calls.length > 0) {
          if (calls[0].status == "CONNECTED" && start_timer_var == 0) {
            console.log("accepted call -> start timer");
            //start_timer_var += 1;
          //  startCallTimer();
          setCallStatus('active');
          }
          console.log("call status:", calls[0].status);
          if (calls[0].status === "TERMINATING") {
            console.log("Handle Terminating case:");
            clearInterval(callManage);
            callManage = undefined;
            clearInterval(intervalTimer);
            await setCallStatus('ended');
            console.log("terminated call -> ");
            qalqulSDK.logout();
          }
        } else {
          console.log("no calls");
        }
      } catch (error) {
        console.error("Error getting calls:", error);
      }
    }, 1000);
  };
  let initializeSdk = async () => {
    // console.log("before initialize qalqulSdk:", qalqulSDK);
    if (qalqulSDK) {
      console.log("qalqulSdk exists => logout qalqulSdk:", qalqulSDK);
      await qalqulSDK.logout();
    }

    qalqulSDK = new QalqulSDK(io, settings1, callback);
    console.log("init qalqulSdk", qalqulSDK);
    try {
      await qalqulSDK.initialize();
      console.log("after init:", qalqulSDK);
      isSdkInitialized = true;
      await updateCallsState();
      return true;
    } catch (error) {
      console.log("Erreur dans l'initialisation du SDK : ", error);
      console.warn("Erreur dans l'initialisation du SDK. Veuillez réessayer plus tard");
      return false;
    }
  };

  let manageMuteCall = (call: any) => {
    if (provider === 'qalqul' && call) {
      call.isMuted() ? call.unMute() : call.mute();
      console.log("call after mute:", call);
    }
  };

  let manageOnHoldCall = (call: any) => {
    if (provider === 'qalqul' && call) {
      call.isOnHold() ? call.resume() : call.hold();
      console.log("call after onHold:", call);
    }
  };
  let manageHangupCall = async (call: any) => {
    console.log("call in hangup:", call);
    call.hangup();
    console.log("call terminated:", call);

    // Arrêter les timers et boucles associés à cet appel
    console.log("stop call timer");
    clearInterval(intervalTimer);

    console.log("stop loop to get calls states");
    clearInterval(callManage);
    callManage = undefined;

    // La gestion après l'appel sera déléguée à la fonction callback
    console.log("Hangup logic done. Waiting for callback to handle post-call actions.");
  };
  const storeQalqulCallInDbInStart = async (callUuid: string) => {
    console.log("storing call from qalqul in DB au lancement de l'appel:", callUuid);

    try {
      const storeCall = {
        call_id: callUuid,
       // script: script_form._id,
        id_lead: phoneNumber,
        //sip_started_at: start_time,
        caller: agentId,
       // project: project,
      };
      console.log("data call to store:", storeCall);
      const res = await callsApi.storeCallInDBAtStartCall(storeCall);
      console.log("result of storing call:", res);
      const storedCallId = res.data.data._id;
      console.log("id of callObject in DB:", storedCallId);
    } catch (error) {
      console.log("error in storing qalqul call in DB:", error);
    }
  };


  useEffect(() => {
    const initiateCall = async () => {
      if (!currentUser) {
        setError('You must be logged in to make calls');
        return;
      }

      console.log('Initiating the call...');

      try {
        if (provider === 'qalqul') {
            // Initialize Qalqul with credentials
          await initializeSdk();
if(isSdkInitialized){
  await handleDial();
}
          

        } else {
          // Existing Twilio implementation
          const response = await axios.get(`${import.meta.env.VITE_API_URL_CALL}/api/calls/token`/* , {
            userId: '65d2b8f4e45a3c5a12e8f123'
          } */);
          const token = response.data.token;

          const newDevice = new Device(token, {
            codecPreferences: ['pcmu', 'pcma'] as any,
          });
          
          await newDevice.register();
          
        /*   const conn = await newDevice.connect({
            params: { 
              To: phoneNumber,
              userId: '65d2b8f4e45a3c5a12e8f123'
            },
            rtcConfiguration: { sdpSemantics: "unified-plan" },
          } as any); */
          const conn = await newDevice.connect({
            params: { To: phoneNumber },
            rtcConfiguration: { sdpSemantics: "unified-plan" },
          } as any);
          console.log("conn", conn);


          setConnection(conn);
          setCallStatus("initiating");

          conn.on('connect', () => {
            const callSid = conn.parameters.CallSid;
            console.log("CallSid:", callSid);
          });

          conn.on("accept", () => {
            console.log("✅ Call accepted");
            const Sid = conn.parameters.CallSid;
            console.log("CallSid recupéré", Sid);
            setCallSid(Sid);  // Store the CallSid in the state
            //console.log("callSid props",callSid);
            setCallStatus("active");
          });


       /*    conn.on("disconnect", async () => {
            setCallStatus("ended");
            if (callSid) {
              try {
                await saveCallToDB(callSid);
              } catch (error) {
                console.error("Error saving call:", error);
              }
            }
            onEnd();
          }); */
          conn.on("disconnect", async () => { // ✅ Marked as async
            console.log("❌ Call disconnected");
            setCallStatus("ended");
            onEnd();
          });

        }
      } catch (err) {
        console.error("Error initiating call:", err);
        setError('Failed to initiate call');
        onEnd();
      }
    };

    initiateCall();
  }, [phoneNumber, onEnd, '65d2b8f4e45a3c5a12e8f123', provider]);

  const saveCallToDB = async (callSid: string) => {
    try {
      const result = await axios.post(`${import.meta.env.VITE_API_URL_CALL}/api/calls/call-details`, {
        callSid,
        userId: '65d2b8f4e45a3c5a12e8f123'
      });
      const call = result.data.data;
      console.log("call details from twilio", result.data);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cloudinaryRecord = await axios.post(`${import.meta.env.VITE_API_URL_CALL}/api/calls/fetch-recording`, {
        recordingUrl: call.recordingUrl,
        userId: '65d2b8f4e45a3c5a12e8f123'
      });
      
      const callInDB = await axios.post(`${import.meta.env.VITE_API_URL_CALL}/api/calls/store-call`, {
        CallSid: callSid,
        agentId,
        leadId: agentId,
        call,
        cloudinaryrecord: cloudinaryRecord.data.url,
        userId: '65d2b8f4e45a3c5a12e8f123'
      });
      
      console.log('callInDB:', callInDB);
      if (onCallSaved) {
        onCallSaved();
      }
      return callInDB;
    } catch (error) {
      console.error("Error saving call:", error);
      throw error;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === 'active') {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    if (provider === 'qalqul' ? qalqulSDK : connection) {
      if (provider === 'qalqul') {
        manageMuteCall(calls[calls.length - 1]);
      } else {
        connection.mute(!isMuted);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleAudioToggle = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleEndCall = async () => {
    if (connection) {
      if (provider === 'qalqul') {
        manageHangupCall(calls[calls.length - 1]);
      } else {
        connection.disconnect();
      }
      setCallStatus('ended');
      onEnd();
      
      if (callSid) {
        try {
          const call = await saveCallToDB(callSid);
          console.log("Call in db:", call);
        } catch (error) {
          console.error("Error fetching call details:", error);
        }
      } else {
        console.warn("CallSid not available, cannot fetch details.");
      }
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="text-xl font-semibold mb-2">{phoneNumber}</div>
        <div className="text-gray-500">{formatDuration(duration)}</div>
        {callStatus === 'initiating' && (
          <div className="text-blue-600">Initiating call...</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleMuteToggle}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6 mx-auto" /> : <Mic className="w-6 h-6 mx-auto" />}
        </button>
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 text-white"
        >
          <Phone className="w-6 h-6 mx-auto transform rotate-135" />
        </button>
        <button
          onClick={handleAudioToggle}
          className={`p-4 rounded-full ${!isAudioEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
        >
          {isAudioEnabled ? (
            <Volume2 className="w-6 h-6 mx-auto" />
          ) : (
            <VolumeX className="w-6 h-6 mx-auto" />
          )}
        </button>
      </div>

      <div className="text-sm text-gray-500">
        {callStatus === 'active' ? 'Call in progress...' : 'Connecting...'}
      </div>
    </div>
  );
}