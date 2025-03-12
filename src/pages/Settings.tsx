
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const Settings = () => {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: false,
    darkMode: false,
    offlineMode: false,
    autoCalculate: true
  });

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: "Success",
          description: "App has been installed successfully!",
        });
      }
      setDeferredPrompt(null);
    }
  };

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
    
    toast({
      title: "Settings Updated",
      description: `${setting} has been ${!settings[setting] ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      {deferredPrompt && (
        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-2">Install App</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Install Nelson PediCare for quick access and offline capabilities
          </p>
          <Button onClick={handleInstall}>Install App</Button>
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Switch
              id={key}
              checked={value}
              onCheckedChange={() => handleSettingChange(key as keyof typeof settings)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
