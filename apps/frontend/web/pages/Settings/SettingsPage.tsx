import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Separator } from '@/shared/ui/Separator';
import { cn } from '@/shared/lib/utils';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Key, 
  Globe, 
  Database, 
  Bot, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsPageProps {
  onSave?: (settings: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Attorney',
    email: 'john.attorney@counselflow.com',
    phone: '+1 (555) 123-4567',
    title: 'Senior Partner',
    firm: 'Legal Associates LLC',
    barNumber: 'BAR123456',
    jurisdiction: 'New York',
    bio: 'Experienced attorney specializing in corporate law and litigation.'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginNotifications: true,
    sessionTimeout: 30,
    passwordChangeRequired: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    matterUpdates: true,
    contractReminders: true,
    riskAlerts: true,
    systemAlerts: true
  });

  const [aiSettings, setAiSettings] = useState({
    aiAssistantEnabled: true,
    autoResearch: true,
    contractAnalysis: true,
    riskAssessment: true,
    documentGeneration: true,
    preferredModel: 'gpt-4'
  });

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      const allSettings = {
        profile: profileData,
        security: securitySettings,
        notifications: notificationSettings,
        ai: aiSettings,
        theme: { darkMode: isDarkMode }
      };

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (onSave) {
        onSave(allSettings);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Settings', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={profileData.firstName}
            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={profileData.email}
          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={profileData.title}
            onChange={(e) => setProfileData({...profileData, title: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firm">Law Firm</Label>
          <Input
            id="firm"
            value={profileData.firm}
            onChange={(e) => setProfileData({...profileData, firm: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="barNumber">Bar Number</Label>
          <Input
            id="barNumber"
            value={profileData.barNumber}
            onChange={(e) => setProfileData({...profileData, barNumber: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="jurisdiction">Jurisdiction</Label>
        <Input
          id="jurisdiction"
          value={profileData.jurisdiction}
          onChange={(e) => setProfileData({...profileData, jurisdiction: e.target.value})}
        />
      </div>

      <div>
        <Label htmlFor="bio">Professional Bio</Label>
        <textarea
          id="bio"
          rows={4}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={profileData.bio}
          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
        />
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h3 className="font-medium text-yellow-800">Security Notice</h3>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          These settings affect the security of your account. Please review carefully.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <Checkbox
            checked={securitySettings.twoFactorEnabled}
            onChange={(e) => setSecuritySettings({...securitySettings, twoFactorEnabled: e.target.checked})}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Login Notifications</h4>
            <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
          </div>
          <Checkbox
            checked={securitySettings.loginNotifications}
            onChange={(e) => setSecuritySettings({...securitySettings, loginNotifications: e.target.checked})}
          />
        </div>

        <div className="p-4 border rounded-lg">
          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
            className="mt-2"
          />
        </div>

        <div className="p-4 border rounded-lg">
          <Button variant="outline" className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Checkbox
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
            </div>
            <Checkbox
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
            </div>
            <Checkbox
              checked={notificationSettings.smsNotifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Content Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Matter Updates</h4>
              <p className="text-sm text-gray-600">Get notified about matter status changes</p>
            </div>
            <Checkbox
              checked={notificationSettings.matterUpdates}
              onChange={(e) => setNotificationSettings({...notificationSettings, matterUpdates: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Contract Reminders</h4>
              <p className="text-sm text-gray-600">Reminders for contract deadlines and renewals</p>
            </div>
            <Checkbox
              checked={notificationSettings.contractReminders}
              onChange={(e) => setNotificationSettings({...notificationSettings, contractReminders: e.target.checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Risk Alerts</h4>
              <p className="text-sm text-gray-600">Get alerted about high-risk situations</p>
            </div>
            <Checkbox
              checked={notificationSettings.riskAlerts}
              onChange={(e) => setNotificationSettings({...notificationSettings, riskAlerts: e.target.checked})}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAiTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">AI Assistant Configuration</h3>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Configure how AI features work in your CounselFlow experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">AI Assistant</h4>
            <p className="text-sm text-gray-600">Enable the AI legal assistant for help and guidance</p>
          </div>
          <Checkbox
            checked={aiSettings.aiAssistantEnabled}
            onChange={(e) => setAiSettings({...aiSettings, aiAssistantEnabled: e.target.checked})}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Auto Legal Research</h4>
            <p className="text-sm text-gray-600">Automatically research legal precedents and cases</p>
          </div>
          <Checkbox
            checked={aiSettings.autoResearch}
            onChange={(e) => setAiSettings({...aiSettings, autoResearch: e.target.checked})}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Contract Analysis</h4>
            <p className="text-sm text-gray-600">AI-powered contract review and risk assessment</p>
          </div>
          <Checkbox
            checked={aiSettings.contractAnalysis}
            onChange={(e) => setAiSettings({...aiSettings, contractAnalysis: e.target.checked})}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Document Generation</h4>
            <p className="text-sm text-gray-600">AI-assisted document and contract generation</p>
          </div>
          <Checkbox
            checked={aiSettings.documentGeneration}
            onChange={(e) => setAiSettings({...aiSettings, documentGeneration: e.target.checked})}
          />
        </div>

        <div className="p-4 border rounded-lg">
          <Label htmlFor="preferredModel">Preferred AI Model</Label>
          <select
            id="preferredModel"
            value={aiSettings.preferredModel}
            onChange={(e) => setAiSettings({...aiSettings, preferredModel: e.target.value})}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="gpt-4">GPT-4 (Most Accurate)</option>
            <option value="gpt-3.5">GPT-3.5 (Faster)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="gemini">Gemini (Google)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Dark Mode</h4>
            <p className="text-sm text-gray-600">Switch to dark theme for better low-light viewing</p>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Checkbox
              checked={isDarkMode}
              onChange={(e) => setIsDarkMode(e.target.checked)}
            />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Layout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <h4 className="font-medium">Compact View</h4>
            <p className="text-sm text-gray-600">More information in less space</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <h4 className="font-medium">Comfortable View</h4>
            <p className="text-sm text-gray-600">Spacious layout for better readability</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Third-Party Integrations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium">Email Integration</h4>
                <p className="text-sm text-gray-600">Connect with Outlook, Gmail, or other email providers</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium">Calendar Integration</h4>
                <p className="text-sm text-gray-600">Sync with Google Calendar, Outlook Calendar</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium">Document Storage</h4>
                <p className="text-sm text-gray-600">Connect to Dropbox, Google Drive, or SharePoint</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'ai':
        return renderAiTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'integrations':
        return renderIntegrationsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <SettingsIcon className="h-6 w-6 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              </div>
              
              <div className="flex items-center gap-2">
                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Settings saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Error saving settings</span>
                  </div>
                )}
                
                <Button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4">
                <ul className="space-y-2">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors',
                          activeTab === tab.id
                            ? 'bg-teal-100 text-teal-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};