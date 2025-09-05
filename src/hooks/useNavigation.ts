import { useState } from 'react';

export function useNavigation() {
  const [currentDomain, setCurrentDomain] = useState<string>('quickwins');
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return {
    currentDomain,
    currentLevel,
    mobileMenuOpen,
    setCurrentDomain,
    setCurrentLevel,
    setMobileMenuOpen,
  };
}
