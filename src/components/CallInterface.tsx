import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { Device, Call } from '@twilio/voice-sdk';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calls } from "@qalqul/sdk-call";
import { QalqulSDK } from "@qalqul/sdk-call/dist/model/QalqulSDK";
import io from "socket.io-client";
import { callsApi } from "../services/api/calls";
//import { QalqulSDKInstance } from '../types/qalqul';

type CallStatus = 'idle' | 'initiating' | 'active' | 'ended';

interface AIAssistantMessage {
  role: 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface CallInterfaceProps {
  phoneNumber: string;
  agentId: string;
  onEnd: () => void;
  onCallSaved?: () => void;
  provider?: 'twilio' | 'qalqul';
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function CallInterface({ phoneNumber, agentId, onEnd, onCallSaved, provider = 'twilio' }: CallInterfaceProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [connection, setConnection] = useState<Call | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [audioProcessor, setAudioProcessor] = useState<AudioWorkletNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { currentUser } = useAuth();
  let qalqulSDK: QalqulSDK | undefined;
  let calls: any[] = [];
  let isSdkInitialized: boolean = false;
  let start_timer_var = 0;
  let callTimer = "00:00:00";
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
      ...(phoneNumber.startsWith('+212') || phoneNumber.startsWith('00212') ? {
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
      } : phoneNumber.startsWith('+33') || phoneNumber.startsWith('0033') ? {
        callerId: 8678,
        outCallerId: "33162151114",
        CampaignID: 3, 
        agent: 7,
        sipNumber: 8595,
        QueueName: 'DigitalWorksQueueFR',
        queueId: 2,
        CountryCode: 33,
        outRouteId: 47,
        outGatewayId: 29,
        outGatewayName: 'GW_FR_new',
      } : {}),
      agentusername: 'Agent.1',
      CampaignName: "",
      Disposition: "",
      InteractionID: null,
      PCIRecord: false,
      RecordChannel: "",
      UniqueID: null,
      WrapupStrict: 'No', // No|Yes|Strict|Loose
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
      //function to update the rest of call details in DB
      if (uuId) {
        await updateCallDetailsInDB(uuId);
      }
    }
  };
  let updateCallDetailsInDB = async (callSid: string) => {
    console.log("update call details in DB:", callSid);
    //function to update the rest of call details in DB

    const res = await callsApi.storeCallInDBAtEndCall(phoneNumber, callSid);
    const callDetails = res.data.data;
    console.log("call details from DB:", callDetails);

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
    await qalqulSDK?.logout();
    console.log("qalqulSDK logged out");
  };
  const storeQalqulCallInDbInStart = async (callUuid: string) => {
    console.log("storing call from qalqul in DB au lancement de l'appel:", callUuid);

    try {
      const storeCall = {
        call_id: callUuid,
       // script: script_form._id,
        id_lead: "65d2b8f4e45a3c5a12e8f123",
        //sip_started_at: start_time,
        caller: agentId,
       // project: project,
      };
      console.log("data call to store:", storeCall);
      const res = await callsApi.storeCallInDBAtStartCall(storeCall);
      console.log("result of storing call:", res);
      const storedCallId = res._id;
      console.log("id of callObject in DB:", storedCallId);
    } catch (error) {
      console.log("error in storing qalqul call in DB:", error);
    }
  };

  const [aiMessages, setAiMessages] = useState<AIAssistantMessage[]>([]);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(false);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');
  const [transcriptBuffer, setTranscriptBuffer] = useState<string>('');
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTranscription = async (transcription: string) => {
    console.log("🎯 Attempting to send transcription:", transcription);
    
    if (!transcription || transcription.trim().length === 0) {
      console.log("❌ Empty transcription, skipping");
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL_CALL}/api/calls/ai-assist`;
      console.log("📡 Sending request to:", apiUrl);
      console.log("🔍 Environment variable VITE_API_URL_CALL:", import.meta.env.VITE_API_URL_CALL);
      
      const payload = {
        transcription,
        callSid,
        context: aiMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
      console.log("📦 Request payload:", payload);

      const response = await axios.post(apiUrl, payload);
      console.log("✅ API Response:", response.data);
      
      if (response.data && response.data.suggestion) {
        const newMessage: AIAssistantMessage = {
          role: 'assistant',
          content: response.data.suggestion,
          timestamp: new Date()
        };
        console.log("💬 Adding new AI message:", newMessage);
        setAiMessages(prev => {
          console.log("Current messages:", prev);
          return [...prev, newMessage];
        });
      } else {
        console.warn("⚠️ API response missing suggestion:", response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("🚨 API call failed:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            baseURL: error.config?.baseURL,
            data: error.config?.data
          }
        });

        // Log the full error response for debugging
        if (error.response?.data) {
          console.error("🔍 Server error details:", error.response.data);
        }

        // Check if it's a connection error
        if (!error.response) {
          console.error("🌐 Network error - Could not connect to server");
        }

        // Check for specific error types
        if (error.response?.status === 500) {
          console.error("⚠️ Server error - Please check the backend logs");
        }
      } else {
        console.error("🚨 Unknown error:", error);
      }
    }
  };

  const processTranscriptBuffer = useCallback(() => {
    if (transcriptBuffer && transcriptBuffer !== lastProcessedTranscript) {
      console.log("Processing transcript buffer:", transcriptBuffer);
      handleTranscription(transcriptBuffer);
      setLastProcessedTranscript(transcriptBuffer);
      setTranscriptBuffer('');
    }
  }, [transcriptBuffer, lastProcessedTranscript, handleTranscription]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, []);

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
          const response = await axios.get(`${import.meta.env.VITE_API_URL_CALL}/api/calls/token`);
          const token = response.data.token;

          const newDevice = new Device(token, {
            codecPreferences: ['pcmu', 'pcma'] as any,
            edge: ['ashburn', 'dublin', 'sydney']
          });
          
          await newDevice.register();
          const conn = await newDevice.connect({
            params: { 
              To: phoneNumber,
              MediaStream: true,
            },
            rtcConfiguration: { 
              sdpSemantics: "unified-plan",
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
              ]
            },
            audio: {
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true
            }
          } as any);
          
          setConnection(conn);
          setCallStatus("initiating");

          conn.on('connect', () => {
            const callSid = conn.parameters.CallSid;
            console.log("CallSid:", callSid);
          });

          conn.on('accept', () => {
            console.log("✅ Call accepted");
            const Sid = conn.parameters.CallSid;
            console.log("CallSid recupéré", Sid);
            setCallSid(Sid);
            setCallStatus("active");

            // Wait a moment for the media stream to be ready
            setTimeout(() => {
              const stream = conn.getRemoteStream();
              console.log("mediaStream:", stream);
              
              if (stream) {
                try {
                  // Create an audio context to process the stream
                  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const source = audioContext.createMediaStreamSource(stream);
                  
                  // Create audio analyzer to monitor audio levels
                  const analyzer = audioContext.createAnalyser();
                  analyzer.fftSize = 2048;
                  source.connect(analyzer);

                  // Initialize WebSocket connection for streaming audio to backend
                  const getLanguageFromPhoneNumber = (phone: string): string => {
                    if (phone.startsWith('+33') || phone.startsWith('0033')) {
                      return 'fr-FR';
                    } else if (phone.startsWith('+212') || phone.startsWith('00212')) {
                      return 'ar-MA';
                    } else if (phone.startsWith('+34') || phone.startsWith('0034')) {
                      return 'es-ES';
                    } else if (phone.startsWith('+49') || phone.startsWith('0049')) {
                      return 'de-DE';
                    } else {
                      return 'en-US'; // Default to English
                    }
                  };

                  const wsUrl = `${import.meta.env.VITE_API_URL_CALL.replace('http', 'ws')}/speech-to-text`;
                  console.log('Connecting to WebSocket URL:', wsUrl);
                  const newWs = new WebSocket(wsUrl);
                  setWs(newWs);
                  let newAudioProcessor: AudioWorkletNode | null = null;
                  
                  newWs.onopen = async () => {
                    console.log('WebSocket connection established for speech-to-text');
                    try {
                      // Create audio worklet for processing after WebSocket is ready
                      await audioContext.audioWorklet.addModule('/audio-processor.js');
                      newAudioProcessor = new AudioWorkletNode(audioContext, 'audio-processor', {
                        numberOfInputs: 1,
                        numberOfOutputs: 1,
                        channelCount: 1,
                        processorOptions: {
                          sampleRate: audioContext.sampleRate
                        }
                      });
                      setAudioProcessor(newAudioProcessor);
                      
                      source.connect(newAudioProcessor);
                      newAudioProcessor.connect(audioContext.destination);

                      // Send configuration message with automatic language detection
                      const config = {
                        config: {
                          encoding: 'LINEAR16',
                          sampleRateHertz: 48000,
                          enableAutomaticPunctuation: true,
                          model: 'latest_long',
                          useEnhanced: true,
                          audioChannelCount: 1,
                          enableWordConfidence: true,
                          enableSpeakerDiarization: true,
                          enableAutomaticLanguageIdentification: true, // Enable automatic language detection
                          alternativeLanguageCodes: ['en-US', 'fr-FR', 'ar-MA', 'es-ES', 'de-DE'] // Support multiple languages
                        }
                      };
                      
                      console.log('Sending speech recognition config:', config);
                      newWs.send(JSON.stringify(config));

                      // Handle audio data from worklet
                      newAudioProcessor.port.onmessage = (event) => {
                        if (newWs.readyState === WebSocket.OPEN) {
                          try {
                            const audioData = event.data;
                            // Log detailed audio information
                            console.log('Audio data details:', {
                              size: audioData.byteLength,
                              type: audioData.constructor.name,
                              isValid: audioData instanceof ArrayBuffer
                            });
                            newWs.send(audioData);
                          } catch (error) {
                            console.error('Error sending audio data:', error);
                          }
                        }
                      };

                      // Start monitoring audio levels with more detail
                      const analyzeAudio = () => {
                        const dataArray = new Float32Array(analyzer.frequencyBinCount);
                        analyzer.getFloatTimeDomainData(dataArray);
                        
                        // Calculate RMS value
                        let rms = 0;
                        let peak = 0;
                        for (let i = 0; i < dataArray.length; i++) {
                          const amplitude = Math.abs(dataArray[i]);
                          rms += amplitude * amplitude;
                          peak = Math.max(peak, amplitude);
                        }
                        rms = Math.sqrt(rms / dataArray.length);
                        
                        // Log audio levels if there's significant audio
                        if (rms > 0.01) {
                          console.log('Audio levels:', {
                            rms: rms.toFixed(3),
                            peak: peak.toFixed(3),
                            bufferSize: dataArray.length
                          });
                        }
                        
                        requestAnimationFrame(analyzeAudio);
                      };
                      analyzeAudio();

                    } catch (error) {
                      console.error('Error initializing audio worklet:', error);
                    }
                  };

                  newWs.onerror = (error) => {
                    console.error('WebSocket error:', error);
                  };

                  newWs.onclose = (event) => {
                    console.log('WebSocket connection closed:', event.code, event.reason);
                  };

                  newWs.onmessage = (event) => {
                    try {
                      const data = JSON.parse(event.data);
                      console.log('📥 Received WebSocket message:', data);
                      
                      if (data.error) {
                        console.error('❌ Speech recognition error:', data.error);
                        return;
                      }

                      // Track if we've found a transcript to process
                      let transcriptToProcess = '';

                      // Handle direct transcript in response
                      if (data.transcript && data.transcript.trim()) {
                        console.log('🎤 New transcript:', data.transcript);
                        transcriptToProcess = data.transcript;
                      }
                      // Fallback to old format if needed
                      else if (data.results && data.results[0]) {
                        const result = data.results[0];
                        const transcript = result.alternatives[0]?.transcript;
                        
                        if (transcript && transcript.trim()) {
                          console.log('🎤 New transcript:', transcript);
                          transcriptToProcess = transcript;
                        }
                      }

                      // Process transcript if we found one and it's different from the last one
                      if (transcriptToProcess && transcriptToProcess !== lastProcessedTranscript) {
                        handleTranscription(transcriptToProcess);
                        setLastProcessedTranscript(transcriptToProcess);
                      }
                    } catch (error) {
                      console.error('❌ Error processing WebSocket message:', error);
                    }
                  };
                  
                  // Cleanup function
                  return () => {
                    if (analyzer && audioContext) {
                      analyzer.disconnect();
                      source.disconnect();
                      if (newAudioProcessor) {
                        newAudioProcessor.disconnect();
                      }
                      audioContext.close();
                    }
                    if (newWs.readyState === WebSocket.OPEN) {
                      newWs.close();
                    }
                  };
                } catch (error) {
                  console.error('Error initializing audio processing:', error);
                }
              } else {
                console.error("No media stream available - Make sure media permissions are granted");
              }
            }, 1000);
          });

          conn.on("disconnect", async () => {
            console.log("❌ Call disconnected");
            // Close WebSocket and cleanup audio processing
            if (ws && ws.readyState === WebSocket.OPEN) {
              console.log("Closing speech recognition WebSocket");
              ws.close();
            }
            if (audioProcessor) {
              console.log("Disconnecting audio processor");
              audioProcessor.disconnect();
            }
            if (audioContext) {
              console.log("Closing audio context");
              audioContext.close();
            }
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
        connection?.mute(!isMuted);
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
        // Close WebSocket and cleanup audio processing before disconnecting
        if (ws && ws.readyState === WebSocket.OPEN) {
          console.log("Closing speech recognition WebSocket");
          ws.close();
        }
        if (audioProcessor) {
          console.log("Disconnecting audio processor");
          audioProcessor.disconnect();
        }
        if (audioContext) {
          console.log("Closing audio context");
          audioContext.close();
        }
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

  const renderAIAssistant = () => {
    if (isAssistantMinimized) {
      return (
        <button
          onClick={() => setIsAssistantMinimized(false)}
          className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
          {aiMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {aiMessages.length}
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl">
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-semibold">AI Assistant</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm">{aiMessages.length} messages</span>
            <button 
              onClick={() => setIsAssistantMinimized(true)}
              className="text-white hover:bg-blue-700 rounded-lg p-1"
            >
              <span className="sr-only">Minimize</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 h-96 overflow-y-auto bg-gray-50">
          {aiMessages.length > 0 ? (
            aiMessages.map((message, index) => (
              <div key={index} className="mb-4 animate-fade-in">
                <div className="text-sm text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </div>
                <div className="bg-white p-3 rounded-lg mt-1 shadow-sm border border-gray-100">
                  {message.content}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center p-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              AI assistant is listening and will provide suggestions during the call...
            </div>
          )}
        </div>
      </div>
    );
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

      {callStatus === 'active' && provider === 'twilio' && renderAIAssistant()}
    </div>
  );
}