import { useState, useEffect } from "react";
import { Heart, Sparkles } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import VideoPanel from "@/components/VideoPanel";
import SettingsModal from "@/components/SettingsModal";
import { useWebRTC } from "@/hooks/useWebRTC";

const Index = () => {
  const [apiKey, setApiKey] = useState(() => {
    // Use stored key or default to provided key
    return localStorage.getItem("hf_api_key") || "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";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    localStream,
    remoteStream,
    isCallActive,
    initLocalStream,
    startCall,
    endCall,
  } = useWebRTC();

  // Initialize camera on mount
  useEffect(() => {
    initLocalStream();
  }, [initLocalStream]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("hf_api_key", key);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-soft/30 blur-3xl" />
      </div>

      {/* Floating Hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-primary/20 fill-primary/10 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
              width: `${20 + i * 5}px`,
              height: `${20 + i * 5}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full love-gradient flex items-center justify-center shadow-glow animate-pulse-soft">
              <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
            <h1 className="font-romantic text-4xl md:text-5xl text-gradient">
              AI Girlfriend
            </h1>
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">
            Your loving companion • Always here for you 💕
          </p>
        </header>

        {/* Main Grid */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
          {/* Chat Section */}
          <div className="h-[500px] lg:h-[600px]">
            <ChatPanel
              apiKey={apiKey}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>

          {/* Video Section */}
          <div className="space-y-4">
            <VideoPanel
              localStream={localStream}
              remoteStream={remoteStream}
              onStartCall={startCall}
              onEndCall={endCall}
              isCallActive={isCallActive}
            />

            {/* Quick Tips */}
            <div className="glass-card rounded-xl p-4 shadow-soft">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Quick Tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Chat with your AI girlfriend using the text input</li>
                <li>• She'll speak her responses aloud (toggle with 🔊)</li>
                <li>• Start a video call and share signals via console</li>
                <li>• Set your Hugging Face API key in Settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 text-xs text-muted-foreground">
          <p>Made with 💕 • Powered by Hugging Face AI</p>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
};

export default Index;
