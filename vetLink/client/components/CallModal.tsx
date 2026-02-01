import { useState, useEffect, useRef } from 'react';
import { X, Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { toast } from 'sonner';
import { CallManager } from '@/lib/CallManager';

interface CallModalProps {
  isOpen: boolean;
  callData: any;
  onClose: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  isIncoming?: boolean;
  currentUserId?: number;
}

export default function CallModal({
  isOpen,
  callData,
  onClose,
  onAccept,
  onDecline,
  isIncoming = false,
  currentUserId,
}: CallModalProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callData?.callType === 'video');
  const [callStatus, setCallStatus] = useState<string>('connecting');
  const [error, setError] = useState<string | null>(null);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callManagerRef = useRef<CallManager | null>(null);

  // Initialize CallManager
  useEffect(() => {
    if (!currentUserId) return;

    callManagerRef.current = new CallManager(currentUserId);

    // Prepare ringtone audio after user interaction
    callManagerRef.current.getRingtoneManager().prepareAudio().catch(err => {
      console.warn('Could not prepare ringtone audio:', err);
    });

    callManagerRef.current.setOnLocalStream((stream) => {
      console.log('📹 Local stream ready');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallStatus('connected');
      startCallTimer();
    });

    callManagerRef.current.setOnRemoteStream((stream) => {
      console.log('📹 Remote stream ready');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    callManagerRef.current.setOnCallEnded(() => {
      console.log('📵 Call ended');
      stopCallTimer();
      toast.info('Call ended');
      handleClose();
    });

    callManagerRef.current.setOnError((errorMsg) => {
      console.error('❌ Call error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    });

    // If this is an outgoing call, initiate it immediately
    if (!isIncoming && callData && callData.recipientId) {
      console.log('🚀 Initiating outgoing call...');
      // Small delay to ensure everything is ready
      setTimeout(() => {
        callManagerRef.current?.initiateCall(
          callData.recipientId,
          callData.id,
          callData.callType === 'video'
        ).catch(err => {
          console.error('Failed to initiate call:', err);
          setError('Failed to initiate connection');
        });
      }, 500);
    }

    return () => {
      // Cleanup call manager when modal closes
      if (callManagerRef.current) {
        console.log('🧹 Destroying CallManager instance');
        callManagerRef.current.destroy();
        callManagerRef.current = null;
      }
    };
  }, [currentUserId, isOpen]);

  // Handle call acceptance
  const handleAccept = async () => {
    try {
      if (!callManagerRef.current || !callData) return;

      setCallStatus('accepting...');

      // Call the backend first to update status
      onAccept?.();

      // Create the SDP offer object for the accept call
      // In a real scenario, this would come from the signaling message
      const enableVideo = callData.callType === 'video';

      await callManagerRef.current.acceptCall(
        callData.senderId,
        callData.id,
        undefined,
        enableVideo
      );

      setCallStatus('connected');
      toast.success('Call accepted');
    } catch (err) {
      console.error('❌ Error accepting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept call');
      toast.error('Failed to accept call');
    }
  };

  // Handle call rejection
  const handleDecline = () => {
    if (callManagerRef.current && callData) {
      callManagerRef.current.rejectCall(callData.senderId, callData.id);
    }
    onDecline?.();
    handleClose();
    toast.info('Call rejected');
  };

  // Handle call end
  const handleEndCall = async () => {
    try {
      if (callManagerRef.current) {
        await callManagerRef.current.endCall();
      }
      stopCallTimer();
      handleClose();
    } catch (err) {
      console.error('❌ Error ending call:', err);
      toast.error('Error ending call');
    }
  };

  // Toggle mute
  const handleToggleMute = () => {
    if (callManagerRef.current) {
      callManagerRef.current.toggleAudio(!isMuted);
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Microphone on' : 'Microphone muted');
    }
  };

  // Toggle video
  const handleToggleVideo = () => {
    if (callManagerRef.current) {
      callManagerRef.current.toggleVideo(!isVideoOn);
      setIsVideoOn(!isVideoOn);
      toast.success(isVideoOn ? 'Camera off' : 'Camera on');
    }
  };

  // Start call timer
  const startCallTimer = () => {
    setDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Handle modal close
  const handleClose = () => {
    stopCallTimer();
    setDuration(0);
    setCallStatus('connecting');
    setError(null);
    onClose();
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isVideoCall = callData?.callType === 'video' || isVideoOn;
  const callTypeLabel = isVideoCall ? 'Video Call' : 'Voice Call';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md ${isVideoCall ? 'aspect-video max-w-2xl' : ''
          }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-t-lg">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <p className="text-sm font-medium opacity-90">{callTypeLabel}</p>
            <p className="text-xl font-bold">
              {isIncoming ? 'Incoming Call' : 'Calling...'}
            </p>
            {callStatus === 'connected' && (
              <p className="text-lg font-mono mt-2">{formatDuration(duration)}</p>
            )}
            {error && <p className="text-red-200 text-sm mt-2">{error}</p>}
          </div>
        </div>

        {/* Video Area (if video call) */}
        {isVideoCall && (
          <div className="relative bg-black/10 aspect-video overflow-hidden">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local Video - Picture in Picture */}
            <div className="absolute bottom-4 right-4 w-24 h-32 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          </div>
        )}

        {/* Audio Call Display */}
        {!isVideoCall && (
          <div className="bg-gradient-to-b from-gray-50 to-white p-12 aspect-square flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center animate-pulse">
                <Phone className="h-10 w-10 text-primary" />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 text-center">
              {callData?.userName || 'User'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {isIncoming ? 'Incoming call' : callStatus}
            </p>
            {callStatus === 'connected' && (
              <p className="text-2xl font-mono text-primary mt-4">{formatDuration(duration)}</p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
          {isIncoming && callStatus !== 'connected' ? (
            // Incoming call controls
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleDecline}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
                title="Reject call"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
              <button
                onClick={handleAccept}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all shadow-lg"
                title="Accept call"
              >
                <Phone className="h-6 w-6" />
              </button>
            </div>
          ) : (
            // Active call controls
            <div className="flex items-center justify-center gap-4">
              {/* Mute Button */}
              <button
                onClick={handleToggleMute}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isMuted
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              {/* Video Button (video calls only) */}
              {isVideoCall && (
                <button
                  onClick={handleToggleVideo}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${!isVideoOn
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  title={isVideoOn ? 'Stop camera' : 'Start camera'}
                >
                  {isVideoOn ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
                title="End call"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Call Status Text */}
          <p className="text-center text-sm text-gray-600 mt-4 font-medium">
            {isIncoming && callStatus !== 'connected'
              ? 'Incoming call from ' + (callData?.userName || 'User')
              : callStatus === 'connected'
                ? 'Call in progress'
                : callStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
