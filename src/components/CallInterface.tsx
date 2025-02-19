/* 
  import React, { useState, useEffect } from 'react';
  import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
  import axios from 'axios';
  
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
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const initiateCall = async () => {
        try {
          const response = await axios.post('/api/calls/initiate', {
            agentId,
            phoneNumber
          });
          
          if (response.data.success) {
            setCallStatus('active');
          }
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to initiate call');
          onEnd();
        }
      };
  
      initiateCall();
    }, [phoneNumber, agentId]);
  
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
  
    const handleEndCall = async () => {
      try {
        setCallStatus('ended');
        onEnd();
      } catch (err) {
        setError('Failed to end call');
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
            onClick={() => setIsMuted(!isMuted)}
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
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
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
  } */
    import React, { useState, useEffect } from 'react';
    import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
    import axios from 'axios';
    
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
      const [error, setError] = useState<string | null>(null);
    
      useEffect(() => {
        const initiateCall = async () => {
          try {
            const response = await axios.post('/api/calls/initiate', {
              agentId,
              phoneNumber
            });
            
            if (response.data.success) {
              setCallStatus('active');
            }
          } catch (err) {
            setError((err as any)?.response?.data?.error || 'Failed to initiate call');
            onEnd();
          }
        };
    
        initiateCall();
      }, [phoneNumber, agentId, onEnd]);
    
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
    
      const handleEndCall = async () => {
        try {
          setCallStatus('ended');
          onEnd();
        } catch (err) {
          setError('Failed to end call');
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
              onClick={() => setIsMuted(!isMuted)}
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
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
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
    