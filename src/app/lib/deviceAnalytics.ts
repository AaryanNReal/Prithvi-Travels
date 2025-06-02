import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

interface DeviceInfo {
  // Basic device info
  userAgent: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  referrer: string;
  timestamp: any;
  path: string;
  
  // Network info
  ipAddress?: string;
  networkInfo?: {
    asn?: string;
    isp?: string;
    proxy?: boolean;
    hosting?: boolean;
  };
  
  // Location info
  geoInfo?: {
    country?: string;
    countryCode?: string;
    region?: string;
    regionName?: string;
    city?: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
    continent?: string;
    continentCode?: string;
  };
  
  // Device capabilities
  deviceData: {
    cookieEnabled: boolean;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    maxTouchPoints?: number;
    doNotTrack: boolean;
    pdfViewerEnabled: boolean;
  };
}

export const trackDevice = async (path: string = "/") => {
  if (typeof window === 'undefined') return;

  // Collect all available client-side data
  const deviceInfo: Omit<DeviceInfo, 'ipAddress' | 'networkInfo' | 'geoInfo'> = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer,
    timestamp: serverTimestamp(),
    path: path,
    deviceData: {
      cookieEnabled: navigator.cookieEnabled,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      doNotTrack: navigator.doNotTrack === "1" || false,
      pdfViewerEnabled: navigator.pdfViewerEnabled || false
    }
  };

  try {
    const deviceId = await generateDeviceId(deviceInfo);
    const sanitizedPath = sanitizeFirestorePath(path);
    const collectionPath = `analytics/${sanitizedPath}/visitors`;
    const docRef = doc(db, collectionPath, deviceId);

    // First store the client-side data immediately
    await setDoc(docRef, deviceInfo, { merge: true });

    // Then try to get IP and location data
    const ipData = await getIpAndLocationData();
    if (ipData) {
      await setDoc(docRef, ipData, { merge: true });
    }

  } catch (error) {
    console.error("Analytics error:", error);
    // Consider using an error tracking service here
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }
};

async function getIpAndLocationData(): Promise<Partial<DeviceInfo> | null> {
  try {
    // First try Cloudflare headers (faster and free)
    const cfData = await getCloudflareIpData();
    if (cfData) return cfData;

    // Fallback to IP-API if Cloudflare headers not available
    return await getIpApiData();
  } catch (e) {
    console.error("Failed to get IP data:", e);
    return null;
  }
}

async function getCloudflareIpData(): Promise<Partial<DeviceInfo> | null> {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/ipdata@1.0.0/country.js', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });

    const cfGeo = {
      country: response.headers.get('cf-ipcountry'),
      region: response.headers.get('cf-region'),
      city: response.headers.get('cf-city'),
      latitude: response.headers.get('cf-latitude'),
      longitude: response.headers.get('cf-longitude'),
      postalCode: response.headers.get('cf-postal-code'),
      asn: response.headers.get('cf-asn'),
      isp: response.headers.get('cf-isp')
    };

    if (!cfGeo.country) return null;

    return {
      ipAddress: response.headers.get('cf-connecting-ip') || undefined,
      networkInfo: {
        asn: cfGeo.asn || undefined,
        isp: cfGeo.isp || undefined
      },
      geoInfo: {
        country: cfGeo.country || undefined,
        countryCode: cfGeo.country || undefined,
        region: cfGeo.region || undefined,
        city: cfGeo.city || undefined,
        latitude: cfGeo.latitude ? parseFloat(cfGeo.latitude) : undefined,
        longitude: cfGeo.longitude ? parseFloat(cfGeo.longitude) : undefined
      }
    };
  } catch (e) {
    return null;
  }
}

async function getIpApiData(): Promise<Partial<DeviceInfo> | null> {
  try {
    // Using IP-API's pro endpoint (free for limited use)
    // Note: For production, consider using your own backend to call this API
    // to avoid exposing your API key and to handle rate limiting
    const response = await fetch('http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query');
    const data = await response.json();

    if (data.status !== 'success') return null;

    return {
      ipAddress: data.query,
      networkInfo: {
        asn: data.as,
        isp: data.isp,
        proxy: data.proxy,
        hosting: data.hosting
      },
      geoInfo: {
        continent: data.continent,
        continentCode: data.continentCode,
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
        latitude: data.lat,
        longitude: data.lon
      }
    };
  } catch (e) {
    console.error("IP-API error:", e);
    return null;
  }
}

const generateDeviceId = async (deviceInfo: Omit<DeviceInfo, 'ipAddress' | 'networkInfo' | 'geoInfo'>): Promise<string> => {
  const str = `${deviceInfo.userAgent}_${deviceInfo.platform}_${deviceInfo.screenWidth}x${deviceInfo.screenHeight}_${deviceInfo.language}_${deviceInfo.deviceData.hardwareConcurrency}`;
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const sanitizeFirestorePath = (path: string): string => {
  return path
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
    .split('/')
    .map(segment => segment.replace(/[^a-zA-Z0-9-_]/g, '').trim() || 'root')
    .join('/');
};