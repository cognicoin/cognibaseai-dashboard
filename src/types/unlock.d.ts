// src/types/unlock.d.ts
interface Window {
  unlockProtocol?: {
    loadCheckoutModal: (config: any) => void;
  };
}