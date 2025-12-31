import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Key, ExternalLink, Heart } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}: SettingsModalProps) => {
  const [key, setKey] = useState(apiKey);

  const handleSave = () => {
    onSaveApiKey(key);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle className="font-romantic text-2xl text-primary flex items-center gap-2">
            <Heart className="w-5 h-5 fill-heart text-heart" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI Girlfriend experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Hugging Face API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="hf_xxxxxxxxxx..."
              className="bg-secondary/50 border-0"
            />
            <p className="text-xs text-muted-foreground">
              Get your free API key from{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Hugging Face <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold mb-2">WebRTC Signaling Instructions</h4>
            <div className="text-xs text-muted-foreground space-y-2 bg-secondary/30 p-3 rounded-lg">
              <p>To test video calls, open this app in two browser tabs:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Start Call" in Tab 1 to get the offer signal</li>
                <li>Copy the signal from console (Cmd/Ctrl + Shift + J)</li>
                <li>In Tab 2, paste the signal and click "Answer"</li>
                <li>Copy the answer signal from Tab 2's console</li>
                <li>Paste it in Tab 1 to complete the connection</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="romantic" onClick={handleSave}>
            Save Settings 💕
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
