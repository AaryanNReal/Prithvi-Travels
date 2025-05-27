import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  referrer: string;
  timestamp: any;
  path: string;
}

export const trackDevice = async (path: string = "/") => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  const deviceInfo: DeviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer,
    timestamp: serverTimestamp(),
    path: path
  };

  try {
    const deviceId = await generateDeviceId(deviceInfo);
    const sanitizedPath = sanitizeFirestorePath(path);
    const collectionPath = `deviceInfo/${sanitizedPath}/visitors`;
    const docRef = doc(db, collectionPath, deviceId);
    await setDoc(docRef, deviceInfo, { merge: true });
  } catch (error) {
    console.error("Analytics error:", error);
    // Consider adding error reporting here
  }
};

const generateDeviceId = async (deviceInfo: DeviceInfo): Promise<string> => {
  const str = `${deviceInfo.userAgent}_${deviceInfo.platform}_${deviceInfo.screenWidth}x${deviceInfo.screenHeight}_${deviceInfo.language}`;
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const sanitizeFirestorePath = (path: string): string => {
  // Remove leading/trailing slashes and replace multiple slashes with single
  return path
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/+/g, '/')      // Replace multiple slashes with single
    .split('/')
    .map(segment => segment.trim() || 'root') // Replace empty segments
    .join('/');
};