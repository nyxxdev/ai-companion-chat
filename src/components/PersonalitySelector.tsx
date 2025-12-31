import { Heart, Sparkles, HandHeart, Flame } from "lucide-react";
import { Button } from "./ui/button";

export type Personality = "romantic" | "playful" | "supportive" | "flirty";

interface PersonalitySelectorProps {
  selected: Personality;
  onSelect: (personality: Personality) => void;
}

const personalities: { id: Personality; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "romantic",
    label: "Romantic",
    icon: <Heart className="w-4 h-4" />,
    description: "Sweet & loving",
  },
  {
    id: "playful",
    label: "Playful",
    icon: <Sparkles className="w-4 h-4" />,
    description: "Fun & teasing",
  },
  {
    id: "supportive",
    label: "Supportive",
    icon: <HandHeart className="w-4 h-4" />,
    description: "Caring & comforting",
  },
  {
    id: "flirty",
    label: "Flirty",
    icon: <Flame className="w-4 h-4" />,
    description: "Bold & charming",
  },
];

const PersonalitySelector = ({ selected, onSelect }: PersonalitySelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {personalities.map((p) => (
        <Button
          key={p.id}
          variant={selected === p.id ? "romantic" : "glass"}
          size="sm"
          onClick={() => onSelect(p.id)}
          className="gap-1.5"
          title={p.description}
        >
          {p.icon}
          <span className="text-xs">{p.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default PersonalitySelector;
