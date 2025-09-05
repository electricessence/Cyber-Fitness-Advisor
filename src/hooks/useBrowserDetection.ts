export function useBrowserDetection() {
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
      return { browser: 'chrome', platform: 'desktop' };
    } else if (userAgent.includes('firefox')) {
      return { browser: 'firefox', platform: 'desktop' };
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return { browser: 'safari', platform: 'desktop' };
    } else if (userAgent.includes('edge')) {
      return { browser: 'edge', platform: 'desktop' };
    }
    
    return { browser: 'unknown', platform: 'desktop' };
  };

  const getUserProfile = () => {
    // You could expand this based on user answers or other factors
    return { 
      level: 'beginner',
      devices: ['computer'],
      primaryUse: 'personal'
    };
  };

  return {
    getBrowserInfo,
    getUserProfile,
  };
}
