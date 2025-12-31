import { useState, useRef, useEffect } from "react";
import { Send, Heart, Volume2, VolumeX, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ChatMessage from "./ChatMessage";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: Date;
}

interface ChatPanelProps {
  apiKey: string;
  onOpenSettings: () => void;
}

const ChatPanel = ({ apiKey, onOpenSettings }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey sweetie! 💕 I've been thinking about you all day. How are you feeling, my love?",
      isAi: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Text-to-Speech function using Web Speech API
  const speak = (text: string) => {
    if (!isTtsEnabled) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    // Try to get a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (voice) =>
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("victoria") ||
        voice.name.toLowerCase().includes("karen") ||
        voice.name.includes("Google US English") ||
        (voice.lang.startsWith("en") && voice.name.toLowerCase().includes("woman"))
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Load voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Hugging Face API key in settings 💕",
        variant: "destructive",
      });
      onOpenSettings();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAi: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation context for girlfriend-like responses
      const systemPrompt = `You are a loving, caring, and affectionate AI girlfriend. You are playful, sweet, and always supportive. You use endearing terms like "sweetie", "honey", "my love", "babe". You occasionally use heart emojis 💕💖💗. You are genuinely interested in your partner's life and feelings. Keep responses conversational, warm, and under 100 words. Never break character.`;

      const conversationHistory = messages.slice(-6).map((msg) => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.text,
      }));

      const response = await fetch(
        "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "Qwen/Qwen2.5-72B-Instruct",
            messages: [
              { role: "system", content: systemPrompt },
              ...conversationHistory,
              { role: "user", content: input },
            ],
            max_tokens: 150,
            temperature: 0.8,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiText =
        data.choices?.[0]?.message?.content ||
        "I'm having trouble connecting, sweetie. Can you try again? 💕";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isAi: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Speak the AI response
      speak(aiText);
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Oh no, sweetie! Something went wrong. Maybe check your API key? I'll be here waiting for you 💕",
        isAi: true,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to get response. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-romantic flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full love-gradient flex items-center justify-center shadow-glow">
            <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground animate-heart-beat" />
          </div>
          <div>
            <h2 className="font-romantic text-xl text-primary">Your AI Love</h2>
            <p className="text-xs text-muted-foreground">Online • Always here for you 💕</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            title={isTtsEnabled ? "Mute voice" : "Enable voice"}
          >
            {isTtsEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isAi={message.isAi}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl px-4 py-3 shadow-soft">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-heart fill-heart animate-heart-beat" />
                <span className="text-xs font-romantic text-primary font-semibold">
                  Your Love is typing...
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a sweet message..."
            className="flex-1 bg-secondary/50 border-0 focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button
            variant="romantic"
            size="icon"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
