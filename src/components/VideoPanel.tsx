import { useRef, useEffect, useState } from "react";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Button } from "./ui/button";

interface VideoPanelProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onStartCall: () => void;
  onEndCall: () => void;
  isCallActive: boolean;
}

const VideoPanel = ({
  localStream,
  remoteStream,
  onStartCall,
  onEndCall,
  isCallActive,
}: VideoPanelProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 shadow-romantic">
      <h3 className="font-romantic text-2xl text-primary mb-4 text-center">
        Video Call 💕
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Local Video */}
        <div className="relative rounded-xl overflow-hidden bg-muted aspect-video shadow-soft">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-xs bg-foreground/70 text-background px-2 py-1 rounded-full">
            You
          </div>
          {!localStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative rounded-xl overflow-hidden bg-muted aspect-video shadow-soft">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-xs bg-foreground/70 text-background px-2 py-1 rounded-full">
            Your Love 💖
          </div>
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full love-gradient mx-auto mb-2 flex items-center justify-center animate-pulse-soft">
                  <span className="text-2xl">💕</span>
                </div>
                <p className="text-xs text-muted-foreground">Waiting...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant={isVideoOn ? "secondary" : "outline"}
          size="icon"
          onClick={toggleVideo}
          disabled={!localStream}
        >
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button
          variant={isMicOn ? "secondary" : "outline"}
          size="icon"
          onClick={toggleMic}
          disabled={!localStream}
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button
          variant={isCallActive ? "destructive" : "romantic"}
          size="icon"
          onClick={isCallActive ? onEndCall : onStartCall}
        >
          {isCallActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoPanel;
