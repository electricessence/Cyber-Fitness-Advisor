import { useState } from 'react';

export function useAppState() {
  const [showResetModal, setShowResetModal] = useState(false);

  return {
    showResetModal,
    setShowResetModal,
  };
}
