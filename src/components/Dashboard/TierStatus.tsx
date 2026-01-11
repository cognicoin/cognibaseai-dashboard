// src/components/Dashboard/TierStatus.tsx
'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Paywall } from '@unlock-protocol/paywall';
import networks from '@unlock-protocol/networks';
import { getEffectivePlan } from '@/lib/userTier';
import { LOCKS } from '@/lib/unlock';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const paywall = new Paywall(networks);

export default function TierStatus() {
  const { address, isConnected } = useAccount();
  const [tierInfo, setTierInfo] = useState<{
    plan: string;
    baseTier: string;
    paidTier: string | null;
    expiry?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    getEffectivePlan(address as `0x${string}`)
      .then((info) => {
        if (isMounted) {
          setTierInfo(info);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load tier status:', err);
        if (isMounted) {
          toast.error('Could not load your subscription status');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [address, isConnected]);

  const handleUpgrade = (tier: keyof typeof LOCKS) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const checkoutConfig = {
        locks: {
          [LOCKS[tier]]: {
            network: 8453, // Base mainnet
          },
        },
        pessimistic: true,
        title: `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        icon: 'https://cognibaseai.io/icon.png', // optional - your logo
      };

      paywall.loadCheckoutModal(checkoutConfig);
    } catch (err) {
      console.error('Failed to open checkout:', err);
      toast.error('Failed to open subscription checkout');
    }
  };

  const formatExpiry = (timestamp?: number) => {
    if (!timestamp || timestamp <= Math.floor(Date.now() / 1000)) return 'Expired';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
        <Skeleton height={40} className="mb-6" />
        <Skeleton count={4} />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl text-center">
        <h3 className="text-2xl font-bold mb-4 text-cyan-400">Connect Wallet</h3>
        <p className="text-gray-400">Connect your wallet to view your tier status</p>
      </div>
    );
  }

  const isPaid = !!tierInfo?.paidTier;
  const nextTierButtons = !isPaid && tierInfo?.plan !== 'architect';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl hover:shadow-cyan-500/30 transition-shadow duration-300"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
        Your Tier & Subscription
      </h2>

      <div className="space-y-6 text-center">
        <div>
          <p className="text-xl font-semibold text-white">Current Plan</p>
          <p className="text-3xl font-bold mt-2 uppercase tracking-wide text-cyan-400">
            {tierInfo?.plan || 'Observer (Base)'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 mb-1">Base Tier (Stake)</p>
            <p className="font-medium">{tierInfo?.baseTier.toUpperCase() || 'None'}</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 mb-1">Paid Upgrade</p>
            <p className="font-medium">
              {tierInfo?.paidTier
                ? `${tierInfo.paidTier.toUpperCase()} until ${formatExpiry(tierInfo.expiry)}`
                : 'None'}
            </p>
          </div>
        </div>

        {/* Upgrade / Renew buttons */}
        {nextTierButtons && (
          <div className="pt-4 border-t border-gray-700 mt-4">
            <p className="text-gray-300 mb-4 text-sm">
              Unlock higher limits & advanced features
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tierInfo?.plan !== 'observer+' && (
                <button
                  onClick={() => handleUpgrade('observer+')}
                  className="py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition transform disabled:opacity-50"
                >
                  Observer+ ($5/mo)
                </button>
              )}

              {tierInfo?.plan !== 'analyst' && tierInfo?.plan !== 'architect' && (
                <button
                  onClick={() => handleUpgrade('analyst')}
                  className="py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition transform disabled:opacity-50"
                >
                  Analyst ($19/mo)
                </button>
              )}

              {tierInfo?.plan !== 'architect' && (
                <button
                  onClick={() => handleUpgrade('architect')}
                  className="py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:scale-105 transition transform disabled:opacity-50 col-span-1 sm:col-span-2"
                >
                  Architect ($59/mo)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info tooltip/hover */}
        <motion.div
          className="relative inline-block mt-4"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs text-gray-500 cursor-help">
            Hover for tier info
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            whileHover={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-gray-900 border border-cyan-500/30 rounded-xl text-sm text-left shadow-2xl z-10 pointer-events-none"
          >
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Observer</strong>: Free with 10k+ $COG stake</li>
              <li>• <strong>Observer+</strong>: + monthly subscription</li>
              <li>• Paid tiers override base stake tier</li>
              <li>• Higher tiers = more scans, faster AI, etc.</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}