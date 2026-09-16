import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Code2, Copy, Smartphone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CodeViewerModal: React.FC = () => {
  const { isCodeModalOpen, setIsCodeModalOpen, platform } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<'app' | 'biometrics' | 'offline' | 'push'>('app');

  if (!isCodeModalOpen) return null;

  const codeSnippets = {
    app: `// React Native Cross-Platform Entry Point (iOS & Android)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BiometricAuthProvider } from './src/services/Biometrics';
import { OfflineSyncProvider } from './src/services/OfflineSyncEngine';

import HomeScreen from './src/screens/HomeScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import LearnScreen from './src/screens/LearnScreen';
import GrowScreen from './src/screens/GrowScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <BiometricAuthProvider>
        <OfflineSyncProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
                tabBarActiveTintColor: '#38bdf8',
                tabBarInactiveTintColor: '#64748b',
              }}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Connect" component={ConnectScreen} />
              <Tab.Screen name="Learn" component={LearnScreen} />
              <Tab.Screen name="Grow" component={GrowScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </OfflineSyncProvider>
      </BiometricAuthProvider>
    </SafeAreaProvider>
  );
}`,
    biometrics: `// Biometric Authentication Engine (iOS Face ID & Android Fingerprint)
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export async function verifyBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return false; // Fallback to PIN
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'ScottHub Privacy Authentication',
    fallbackLabel: 'Enter 4-Digit Passcode',
    disableDeviceFallback: false,
    cancelLabel: 'Cancel',
  });

  if (result.success) {
    // Retrieve encrypted token from SecureStore hardware enclave
    const userToken = await SecureStore.getItemAsync('scotthub_auth_token');
    return true;
  }
  return false;
}`,
    offline: `// Offline Support & Data Persistence (AsyncStorage / WatermelonDB)
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineQueueEngine {
  private static QUEUE_KEY = '@scotthub_outbox_queue';

  static async enqueueAction(action: { type: string; payload: any }) {
    const queueJson = await AsyncStorage.getItem(this.QUEUE_KEY);
    const queue = queueJson ? JSON.parse(queueJson) : [];
    queue.push({ ...action, timestamp: Date.now() });
    await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  static async processPendingQueue(apiClient: any) {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;

    const queueJson = await AsyncStorage.getItem(this.QUEUE_KEY);
    if (!queueJson) return;

    const queue = JSON.parse(queueJson);
    for (const item of queue) {
      await apiClient.post(item.type, item.payload);
    }
    await AsyncStorage.removeItem(this.QUEUE_KEY);
  }
}`,
    push: `// Push Notifications Engine (Expo Notifications / APNs & FCM)
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'ScottHub Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38bdf8',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-white flex flex-col max-h-[85vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">React Native Codebase</h3>
                <p className="text-xs text-slate-400">Consistent iOS & Android TypeScript Architecture</p>
              </div>
            </div>

            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* File Selector Tabs */}
          <div className="flex gap-2 py-3 overflow-x-auto border-b border-slate-800/80">
            {[
              { id: 'app', label: 'App.native.tsx' },
              { id: 'biometrics', label: 'Biometrics.native.ts' },
              { id: 'offline', label: 'OfflineSyncEngine.ts' },
              { id: 'push', label: 'PushNotifications.ts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFile(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition shrink-0 ${
                  selectedFile === tab.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="relative flex-1 my-4 bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <pre className="pr-12">
              <code>{codeSnippets[selectedFile]}</code>
            </pre>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Targeting iOS 16+ & Android 12+ (API 31+)</span>
            </div>
            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
