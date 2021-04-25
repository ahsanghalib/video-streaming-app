interface UserDeviceInfo {
  appCodeName: string;
  appName: string;
  appVersion: string;
  language: string;
  languages: string[];
  platform: string;
  product: string;
  userAgent: string;
  vendor: string;
}

export const getUserDeviceInfo = (): UserDeviceInfo => {
  return {
    appCodeName: navigator.appCodeName,
    appName: navigator.appName,
    appVersion: navigator.appVersion,
    language: navigator.language,
    languages: navigator.languages as string[],
    platform: navigator.platform,
    product: navigator.product,
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
  };
};

export const hasUserMedia = () => {
  return false;
};
