import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Bell, Shield, Eye, Download, Save, Moon, Sun, Monitor, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    highRiskAlerts: true,
    largeTransactionAlerts: true,
    largeTransactionThreshold: "10000",
    autoRefresh: true,
    refreshInterval: "5",
    darkMode: "system",
    currency: "DKK",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your dashboard preferences and notifications.</p>
        </div>

        <div className="grid gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configure alert preferences for important events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts for important events</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  data-testid="switch-notifications"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highRisk">High-Risk Player Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a high-risk player is flagged</p>
                </div>
                <Switch
                  id="highRisk"
                  checked={settings.highRiskAlerts}
                  onCheckedChange={(checked) => updateSetting('highRiskAlerts', checked)}
                  disabled={!settings.notifications}
                  data-testid="switch-high-risk-alerts"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="largeTransaction">Large Transaction Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when transactions exceed threshold</p>
                </div>
                <Switch
                  id="largeTransaction"
                  checked={settings.largeTransactionAlerts}
                  onCheckedChange={(checked) => updateSetting('largeTransactionAlerts', checked)}
                  disabled={!settings.notifications}
                />
              </div>
              {settings.largeTransactionAlerts && settings.notifications && (
                <div className="flex items-center gap-4 pl-4 animate-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="threshold" className="whitespace-nowrap">Threshold (DKK)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={settings.largeTransactionThreshold}
                    onChange={(e) => updateSetting('largeTransactionThreshold', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Display</CardTitle>
              </div>
              <CardDescription>Customize how data is displayed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                  <Button
                    variant={settings.darkMode === 'light' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateSetting('darkMode', 'light')}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={settings.darkMode === 'dark' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateSetting('darkMode', 'dark')}
                    className="gap-2"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={settings.darkMode === 'system' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateSetting('darkMode', 'system')}
                    className="gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="currency">Currency</Label>
                  <p className="text-sm text-muted-foreground">Default currency for display</p>
                </div>
                <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DKK">DKK</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRefresh">Auto-Refresh Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh dashboard data</p>
                </div>
                <Switch
                  id="autoRefresh"
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                  data-testid="switch-auto-refresh"
                />
              </div>
              {settings.autoRefresh && (
                <div className="flex items-center gap-4 pl-4 animate-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="interval" className="whitespace-nowrap">Refresh Interval</Label>
                  <Select value={settings.refreshInterval} onValueChange={(value) => updateSetting('refreshInterval', value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle>Data Export</CardTitle>
              </div>
              <CardDescription>Export data for reporting and analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Players (CSV)
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Transactions (CSV)
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Game Stats (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 py-4">
          <Button variant="outline" data-testid="button-cancel">Cancel</Button>
          <Button onClick={handleSave} className="gap-2 min-w-32" data-testid="button-save-settings">
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
