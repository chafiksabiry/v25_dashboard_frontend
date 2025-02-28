
    import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Device } from '@twilio/voice-sdk';
import axios from 'axios';
import {callsApi} from '../services/api/calls';

interface CallInterfaceProps {
  phoneNumber: string;
  agentId: string;
  onEnd: () => void;
}

export function CallInterface({ phoneNumber, agentId, onEnd }: CallInterfaceProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'initiating' | 'active' | 'ended'>('initiating');
  const [connection, setConnection] = useState<any>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callSid, setCallSid] = useState<string | null>(null); // Add this line for the call SID


  useEffect(() => {
    const initiateCall = async () => {
      console.log('Initiating the call...');
    
      try {
        // Get Twilio Access Token from backend
        const response = await callsApi.generateTwilioToken();
        const  token  = response.token;
        console.log('Token received:', typeof token, token);
        // Initialize Twilio Device with the token
        const newDevice = new Device(token, {
          codecPreferences: ['pcmu', 'pcma'] as any,  // Force TypeScript to accept it
        });
        console.log("newDevice",newDevice);
        console.log('Device state before call:', newDevice.state);
         await  newDevice.register();
        console.log('Device state after refistration:', newDevice.state);
        try {
          console.log("📞 Making the call to", phoneNumber);
        
          const conn = await newDevice.connect({
            params: { To: phoneNumber },
            rtcConfiguration: { sdpSemantics: "unified-plan" },
          }  as any );
          console.log("conn",conn);
          conn.on("error", (error) => {
            console.error("⚠️ Twilio Call Error:", error);
          });
        
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
        
    
          conn.on("disconnect", async () => { // ✅ Marked as async
            console.log("❌ Call disconnected");
            //const callsid = conn.parameters.CallSid;
           // console.log("callsid", callsid);
            setCallStatus("ended");
          
          /*   if (callsid) {
              try {
                const call = await saveCallToDB(callsid);
                console.log("Call in db:", call);
              } catch (error) {
                console.error("Error fetching call details:", error);
              }
            } else {
              console.warn("CallSid not available, cannot fetch details.");
            } */
          
            onEnd();
          });
          


        } catch (error) {
          console.error("❌ Error making the call:", error);
          setError("Failed to initiate call");
          onEnd();
        }
        
    
        newDevice.on('error', (error) => {
          console.error('Twilio Device error:', error);
          setError('Twilio Device error');
        });

        if (newDevice.state !== 'registered') {
          console.log('Device is not yet registered');
        } else {
          console.log('Device is successfully registered');
        }
      } catch (err) {
        console.error("Error initiating call:", err);
        setError('Failed to initiate call');
        onEnd();
      }
    };
    

    initiateCall();
  }, [phoneNumber, onEnd]);
  //console.log("callSid props",callSid);
  const saveCallToDB = async (callSid: string) => {
    const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
    try {
      const result = await callsApi.getCallDetails(callSid);
      const call =  result.data;
      console.log("call",result.data.recordingUrl);
      await delay(2000);
    const Cloudinaryrecord = await callsApi.fetchTwilioRecording(call.recordingUrl);
    console.log("record",Cloudinaryrecord);
const callInDB = await callsApi.saveCallToDB(callSid,'679a4734b56943f404edb57c','679a4734b56943f404edb57c',call, Cloudinaryrecord);
    return callInDB;
    } catch (error) {
      console.error("Error fetching call details:", error);
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
    if (connection) {
      connection.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleAudioToggle = () => {
   /*  if (device && device.audio) {
      // Check the current output volume and toggle between 0 (mute) and 1 (unmute)
      const newVolume = isAudioEnabled ? 0 : 1;
      device.audio.setOutputVolume(newVolume);  // Set the audio output volume
      setIsAudioEnabled(!isAudioEnabled);  // Toggle the audio state
    } */
  };
  
  

  const handleEndCall = async () => {
    if (connection) {
      connection.disconnect();
      setCallStatus('ended');
      console.log('callsid in handleendcall',callSid);

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
          className={`p-4 rounded-full ${
            isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}
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
          className={`p-4 rounded-full ${
            !isAudioEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}
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
