import { Heart } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isAi: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isAi, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={`flex animate-slide-up ${isAi ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAi
            ? "glass-card shadow-romantic"
            : "love-gradient text-primary-foreground shadow-soft"
        }`}
      >
        {isAi && (
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3 h-3 text-heart fill-heart animate-heart-beat" />
            <span className="text-xs font-romantic text-primary font-semibold">
              Your Love
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
        <span className="text-[10px] opacity-60 mt-1 block">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
