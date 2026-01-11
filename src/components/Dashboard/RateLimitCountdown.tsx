// src/components/Dashboard/RateLimitCountdown.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type RateInfo = {
  used: number;
  limit: number;
  remaining: number;
  reset: number; // unix seconds
  plan?: string;
};

interface RateLimitCountdownProps {
  rateInfo?: RateInfo | null;
  title: string; // e.g. "Token Scanner" or "AI Chat"
  className?: string;
}

export default function RateLimitCountdown({
  rateInfo,
  title,
  className = '',
}: RateLimitCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!rateInfo?.reset) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = rateInfo.reset - now;

      if (diff <= 0) {
        setTimeLeft('Reset now – refresh page');
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [rateInfo?.reset]);

  if (!rateInfo || rateInfo.remaining === rateInfo.limit) {
    return null; // No need to show if full
  }

  const isLow = rateInfo.remaining <= Math.floor(rateInfo.limit * 0.2);
  const planLabel = rateInfo.plan ? ` (${rateInfo.plan})` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 p-4 rounded-xl border ${
        isLow ? 'border-red-500/40 bg-red-900/20' : 'border-yellow-500/30 bg-yellow-900/10'
      } text-sm ${className}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{title} Rate Limit{planLabel}</p>
          <p className="text-gray-300">
            {rateInfo.used}/{rateInfo.limit} used • {rateInfo.remaining} remaining
          </p>
        </div>

        <div className="text-right">
          <p className={`font-bold ${isLow ? 'text-red-400' : 'text-yellow-400'}`}>
            Resets in: {timeLeft}
          </p>
        </div>
      </div>

      {isLow && (
        <p className="mt-2 text-xs text-red-300">
          Almost out – upgrade tier for more usage!
        </p>
      )}
    </motion.div>
  );
}