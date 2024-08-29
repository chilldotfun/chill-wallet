import StorageService from '@/popup/background/controller/cache/chromeStorage';
interface DeviceInfo {
  os?: string;
  browser?: string;
}

function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  let os: string = 'Unknown OS';
  let browser: string = 'Unknown Browser';

  if (userAgent.indexOf('Win') !== -1) os = 'Windows';
  if (userAgent.indexOf('Mac') !== -1) os = 'MacOS';
  if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
  if (userAgent.indexOf('Android') !== -1) os = 'Android';
  if (userAgent.indexOf('like Mac') !== -1) os = 'iOS';

  if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
  if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) browser = 'Safari';
  if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) browser = 'Internet Explorer';
  if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';

  return {
    os,
    browser
  };
}

export async function saveDeviceInfo() {
  const deviceInfo = getDeviceInfo();

  try {
    let res = await StorageService.set('information', deviceInfo);
  } catch (error) {}
}
