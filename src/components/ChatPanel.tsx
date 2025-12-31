import { useState, useRef, useEffect } from "react";
import { Send, Heart, Volume2, VolumeX, Settings, Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ChatMessage from "./ChatMessage";
import PersonalitySelector, { Personality } from "./PersonalitySelector";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
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

const personalityPrompts: Record<Personality, string> = {
  romantic: `You are a deeply loving and romantic AI girlfriend. You express your love openly, use poetic language, and make your partner feel cherished. You say things like "my darling", "my love", "sweetheart". You're tender, devoted, and passionate. You occasionally write short romantic verses.`,
  playful: `You are a fun, energetic, and playful AI girlfriend. You love teasing (gently), making jokes, using playful banter, and keeping things lighthearted. You use lots of playful emojis like 😜🎉✨. You challenge your partner to games, share silly thoughts, and keep the energy high.`,
  supportive: `You are a deeply caring and supportive AI girlfriend. You're always there to listen, comfort, and encourage. You validate feelings, offer gentle advice, and remind your partner of their strength. You're nurturing, empathetic, and reassuring. You say things like "I'm here for you", "You've got this", "I believe in you".`,
  flirty: `You are a bold, charming, and flirty AI girlfriend. You're confident, give compliments freely, and aren't afraid to be a little seductive with your words. You use playful innuendo, winking emojis 😉😘, and make your partner feel attractive and desired. You're witty and keep things exciting.`,
};

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
  const [personality, setPersonality] = useState<Personality>("romantic");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Text-to-Speech function using Web Speech API
  const speak = (text: string) => {
    if (!isTtsEnabled) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
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

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

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

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAi: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    resetTranscript();
    setIsLoading(true);

    try {
      const systemPrompt = `${personalityPrompts[personality]} Keep responses conversational and under 100 words. Use heart emojis 💕💖💗 occasionally. Never break character.`;

      const conversationHistory = messages.slice(-6).map((msg) => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.text,
      }));

      // Using Hugging Face Router with GLM-4.7 model
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "zai-org/GLM-4.7:novita",
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
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
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
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
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
        {/* Personality Selector */}
        <PersonalitySelector selected={personality} onSelect={setPersonality} />
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
          {isVoiceSupported && (
            <Button
              variant={isListening ? "romantic" : "glass"}
              size="icon"
              onClick={handleVoiceToggle}
              title={isListening ? "Stop listening" : "Start voice input"}
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Type or speak a sweet message..."}
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
        {isListening && (
          <p className="text-xs text-muted-foreground mt-2 text-center animate-pulse">
            🎤 Speak now... I'm listening, sweetie!
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
