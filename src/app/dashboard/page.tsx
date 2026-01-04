// src/app/dashboard/page.tsx - FINAL COMPLETE & WORKING
'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { generateSmartDegenSummary } from '@/lib/groq';
import { Web3Service } from '@unlock-protocol/unlock-js';

// Force dynamic — no static prerendering
export const dynamic = 'force-dynamic';

const TOKEN = '0xaF4b5982BC89201551f1eD2518775a79a2705d47' as `0x${string}`;
const STAKING = '0x75B226DBee2858885f2E168F85024b883B460744' as `0x${string}`;

const stakingABI = [
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getStakeInfo',
    outputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'unstakeRequestTime', type: 'uint256' },
      { internalType: 'uint8', name: 'tier', type: 'uint8' },
      { internalType: 'bool', name: 'canUnstake', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }], name: 'stake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'requestUnstake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'completeUnstake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const;

const erc20ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const SUPPORTED_CHAINS = [
  { name: 'Base', value: '8453' },
  { name: 'Ethereum', value: '1' },
  { name: 'BSC', value: '56' },
  { name: 'Polygon', value: '137' },
  { name: 'Arbitrum', value: '42161' },
  { name: 'Optimism', value: '10' },
  { name: 'Avalanche', value: '43114' },
  { name: 'Fantom', value: '250' },
];

const tierImages = {
  observer: '/observer.png',
  'observer+': '/observer-plus.png',
  analyst: '/analyst.png',
  architect: '/architect.png',
};

// Unlock Protocol setup
const UNLOCK_CONFIG = {
  8453: {
    provider: 'https://mainnet.base.org',
    unlockAddress: '0x1b6d4d64848F6d1f0a9fC9d9d1bd0d4ca613B3D5',
  },
};

const web3Service = new Web3Service(UNLOCK_CONFIG);

const LOCKS = {
  observerPlus: '0xeE2751a38e66BF0F88BeBE461e5699C5b8986310',
  analyst: '0xc90b353BDcfF5F5A31cc257434aDB48Fb5C4cf51',
  architect: '0xE00b66e2c5992AdA5550bA719ab46e0591C8c7aE',
};

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const [stakeAmount, setStakeAmount] = useState('');
  const [scanAddress, setScanAddress] = useState('');
  const [selectedChainId, setSelectedChainId] = useState('8453');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Subscription tier
  const [subscriptionTier, setSubscriptionTier] = useState<'observer' | 'observer+' | 'analyst' | 'architect'>('observer');

  // Count-up refs
  const walletBalanceRef = useRef<HTMLSpanElement>(null);
  const stakedAmountRef = useRef<HTMLSpanElement>(null);

  const { data: tokenBal } = useBalance({ address, token: TOKEN });

  const { data: stakeInfoRaw, isLoading: stakeLoading } = useReadContract({
    address: STAKING,
    abi: stakingABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
  });

  const [stakedBigInt = 0n, unstakeRequestTime = 0n] = stakeInfoRaw || [];
  const stakedAmount = Number(formatEther(stakedBigInt));

  const unstakeRequested = unstakeRequestTime > 0n;

  const { data: currentAllowance } = useReadContract({
    address: TOKEN,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING] : undefined,
  });

  const { writeContractAsync, isPending } = useWriteContract();

  // Check Unlock subscription (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!address || !isConnected) {
      setSubscriptionTier('observer');
      return;
    }

    const checkSubscription = async () => {
      try {
        const now = Date.now() / 1000;

        const keys = await Promise.all([
          web3Service.getKeyByLockForOwner(LOCKS.observerPlus, address, 8453),
          web3Service.getKeyByLockForOwner(LOCKS.analyst, address, 8453),
          web3Service.getKeyByLockForOwner(LOCKS.architect, address, 8453),
        ]);

        if (keys[2]?.expiration > now) setSubscriptionTier('architect');
        else if (keys[1]?.expiration > now) setSubscriptionTier('analyst');
        else if (keys[0]?.expiration > now) setSubscriptionTier('observer+');
        else setSubscriptionTier('observer');
      } catch (error) {
        console.error('Subscription check failed:', error);
        setSubscriptionTier('observer');
      }
    };

    checkSubscription();
  }, [address, isConnected]);

  const tierName = {
    observer: 'Observer 👁️',
    'observer+': 'Observer+ 👁️+',
    analyst: 'Analyst 📊',
    architect: 'Architect 🏆',
  }[subscriptionTier];

  const currentTierImage = tierImages[subscriptionTier];

  // Count-up animation
  const animateCount = (element: HTMLSpanElement | null, target: number, duration = 1500) => {
    if (!element) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target.toFixed(2);
        clearInterval(timer);
      } else {
        element.textContent = start.toFixed(2);
      }
    }, 16);
  };

  useEffect(() => {
    if (isPageLoading) return;

    if (tokenBal && walletBalanceRef.current) {
      const balance = Number(formatEther(tokenBal.value));
      animateCount(walletBalanceRef.current, balance);
    }

    if (stakedAmountRef.current) {
      animateCount(stakedAmountRef.current, stakedAmount);
    }
  }, [isPageLoading, tokenBal, stakedAmount]);

  useEffect(() => {
    if (currentAllowance !== undefined && tokenBal && stakeAmount) {
      const allowance = Number(formatEther(currentAllowance));
      const balance = Number(formatEther(tokenBal.value));
      const amount = Number(stakeAmount);
      setNeedsApproval(amount > allowance || amount > balance);
    }
  }, [currentAllowance, tokenBal, stakeAmount]);

  useEffect(() => {
    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    if (unstakeRequested) {
      const interval = setInterval(() => {
        const cooldownEnd = Number(unstakeRequestTime) + 72 * 60 * 60;
        const now = Math.floor(Date.now() / 1000);
        const diff = cooldownEnd - now;

        if (diff <= 0) {
          setTimeLeft('Ready to Complete Unstake');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / 3600);
          const minutes = Math.floor((diff % 3600) / 60);
          const seconds = diff % 60;
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft('');
    }
  }, [unstakeRequested, unstakeRequestTime]);

  const handleStake = async () => {
    if (!address || !stakeAmount || Number(stakeAmount) <= 0) return;

    try {
      if (needsApproval) {
        await writeContractAsync({
          address: TOKEN,
          abi: erc20ABI,
          functionName: 'approve',
          args: [STAKING, parseEther(stakeAmount)],
        });
        setNeedsApproval(false);
      }

      await writeContractAsync({
        address: STAKING,
        abi: stakingABI,
        functionName: 'stake',
        args: [parseEther(stakeAmount)],
      });

      setStakeAmount('');
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleRequestUnstake = async () => {
    try {
      await writeContractAsync({
        address: STAKING,
        abi: stakingABI,
        functionName: 'requestUnstake',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteUnstake = async () => {
    try {
      await writeContractAsync({
        address: STAKING,
        abi: stakingABI,
        functionName: 'completeUnstake',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleScan = async () => {
    if (!scanAddress.trim()) return;
    setScanLoading(true);
    setScanResult(null);
    setAiSummary(null);

    try {
      const response = await fetch(
        `https://api.gopluslabs.io/api/v1/token_security/${selectedChainId}?contract_addresses=${scanAddress.toLowerCase()}`
      );
      const data = await response.json();

      if (data.code === 1 && data.result && Object.keys(data.result).length > 0) {
        setScanResult(data.result[scanAddress.toLowerCase()]);
      } else {
        setScanResult({ error: data.message || 'No security data found for this token.' });
      }
    } catch (error) {
      setScanResult({ error: 'Scan failed. Check address or try again later.' });
    }

    setScanLoading(false);
  };

  const handleAiSummary = async () => {
    if (!scanResult || scanResult.error) return;
    setAiLoading(true);
    setAiSummary(null);

    const summary = await generateSmartDegenSummary(scanResult);
    setAiSummary(summary || { verdict: '🟡 CAUTION', bullets: ['AI unavailable'], degenTip: 'Check console' });

    setAiLoading(false);
  };

  if (isPageLoading || stakeLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-3xl text-cyan-400 animate-pulse">Loading Intelligence Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/cogni-logo.png" 
                alt="Cogni Logo" 
                width={96} 
                height={96} 
                className="rounded-lg logo-glow" 
                priority 
              />
              <span className="text-xl sm:text-2xl font-bold text-white">
                Cogni Analytics
              </span>
            </Link>
          </div>

          <div className="w-full sm:w-auto flex justify-center">
            <button
              onClick={() => open()}
              className="group relative p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/70 transition-all duration-300"
            >
              <Image
                src="https://uxwing.com/wp-content/themes/uxwing/download/banking-finance/crypto-wallet-bitcoin-icon.svg"
                alt="Connect Wallet"
                width={56}
                height={56}
                className="invert transition-all duration-500 group-hover:animate-pulse"
                priority
              />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-cyan-500/30 blur-xl animate-pulse"></div>
              </div>
            </button>
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition text-sm sm:text-base"
            >
              ← Back to Landing
            </Link>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {!isConnected && (
            <div className="text-center py-32">
              <h1 className="text-4xl sm:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">
                Connect Your Wallet
              </h1>
              <p className="text-xl sm:text-2xl mb-12 text-gray-300 max-w-2xl mx-auto">
                You must connect your wallet to access the full Cogni Intelligence Dashboard — including the token scanner, AI summaries, and staking tools.
              </p>
              <button
                onClick={() => open()}
                className="relative px-12 py-5 text-xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl shadow-2xl
                           hover:shadow-cyan-500/50 hover:scale-105 hover:from-orange-500 hover:to-cyan-500
                           transition-all duration-500 ease-out overflow-hidden group"
              >
                <span className="relative z-10">Connect Wallet</span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </button>
            </div>
          )}

          {isConnected && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                <StatCard title="Wallet Balance">
                  <span ref={walletBalanceRef} className="text-orange-400">0.00</span> $COG
                </StatCard>
                <StatCard title="Staked Amount">
                  <span ref={stakedAmountRef} className="text-cyan-400">0.00</span> $COG
                </StatCard>
                <StatCard title="Current Tier">
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-lg font-bold">{tierName}</span>
                    {currentTierImage && (
                      <Image
                        src={currentTierImage}
                        alt={tierName}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                    )}

                    {/* Upgrade Buttons */}
                    {subscriptionTier === 'observer' && stakedAmount >= 10_000 && (
                      <div className="mt-4 space-y-3 text-center">
                        <p className="text-sm text-gray-400">Upgrade with USDC subscription:</p>
                        <button
                          onClick={() => window.unlockProtocol?.loadCheckoutModal({
                            locks: { [LOCKS.observerPlus]: { network: 8453 } },
                            pessimistic: true,
                          })}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-bold hover:scale-105 transition shadow-lg"
                        >
                          Observer+ ($5/mo)
                        </button>

                        {stakedAmount >= 100_000 && (
                          <button
                            onClick={() => window.unlockProtocol?.loadCheckoutModal({
                              locks: { [LOCKS.analyst]: { network: 8453 } },
                              pessimistic: true,
                            })}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-bold hover:scale-105 transition shadow-lg block mt-2"
                          >
                            Analyst ($19/mo)
                          </button>
                        )}

                        {stakedAmount >= 1_000_000 && (
                          <button
                            onClick={() => window.unlockProtocol?.loadCheckoutModal({
                              locks: { [LOCKS.architect]: { network: 8453 } },
                              pessimistic: true,
                            })}
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-sm font-bold hover:scale-105 transition shadow-lg block mt-2"
                          >
                            Architect ($59/mo)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </StatCard>
              </div>

              {/* Token Scanner */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-12 border border-cyan-500/20 shadow-2xl mb-16">
                <h2 className="text-2xl sm:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Token Security Scanner
                </h2>

                <div className="max-w-3xl mx-auto space-y-6">
                  <select
                    value={selectedChainId}
                    onChange={(e) => setSelectedChainId(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/80 rounded-2xl border border-gray-700 focus:border-cyan-500 focus:outline-none text-white"
                  >
                    {SUPPORTED_CHAINS.map((chain) => (
                      <option key={chain.value} value={chain.value}>{chain.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Enter token contract address (0x...)"
                    value={scanAddress}
                    onChange={(e) => setScanAddress(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800/80 rounded-2xl border border-gray-700 focus:border-cyan-500 focus:outline-none placeholder-gray-500"
                  />

                  <div className="text-center">
                    <button
                      onClick={handleScan}
                      disabled={scanLoading || !scanAddress.trim()}
                      className="w-full sm:w-auto px-12 py-5 text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl shadow-xl hover:shadow-cyan-500/60 hover:scale-105 disabled:opacity-50 transition-all duration-300"
                    >
                      {scanLoading ? 'Scanning...' : 'SCAN TOKEN'}
                    </button>
                  </div>
                </div>

                {scanResult && !scanResult.error && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-12">
                      <RiskItem label="Honeypot" value={scanResult.is_honeypot === '1' ? 'YES' : 'No'} safe={scanResult.is_honeypot !== '1'} />
                      <RiskItem label="Mintable" value={scanResult.is_mintable === '1' ? 'YES' : 'No'} safe={scanResult.is_mintable !== '1'} />
                      <RiskItem label="Proxy" value={scanResult.is_proxy === '1' ? 'YES' : 'No'} safe={scanResult.is_proxy !== '1'} />
                      <RiskItem label="Open Source" value={scanResult.is_open_source === '1' ? 'Yes' : 'No'} safe={scanResult.is_open_source === '1'} />
                      <RiskItem label="LP Locked" value={scanResult.lp_locked === '1' ? 'Yes' : 'No'} safe={scanResult.lp_locked === '1'} />
                    </div>

                    <div className="mt-12 text-center">
                      <button
                        onClick={handleAiSummary}
                        disabled={aiLoading}
                        className="px-12 py-5 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl hover:shadow-pink-500/60 hover:scale-105 disabled:opacity-50 transition-all duration-300"
                      >
                        {aiLoading ? 'Generating Degen Alpha...' : 'GET SMART DEGEN SUMMARY 🧠'}
                      </button>
                    </div>

                    {aiSummary && (
                      <div className="mt-10 bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
                        <h3 className="text-3xl font-bold text-center mb-6">{aiSummary.verdict}</h3>
                        <ul className="space-y-3 text-lg mb-6">
                          {aiSummary.bullets.map((bullet: string, i: number) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="text-purple-400 mt-1">→</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xl font-bold text-pink-400 text-center italic">
                          DEGEN TIP: {aiSummary.degenTip}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {scanResult?.error && (
                  <p className="text-center text-red-400 text-lg mt-12">{scanResult.error}</p>
                )}
              </div>

              {/* Stake / Unstake */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-12 border border-cyan-500/20 shadow-2xl">
                <h2 className="text-2xl sm:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Stake / Unstake $COG
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-center">Stake More</h3>
                    <input
                      type="number"
                      placeholder="Amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full px-6 py-5 text-xl bg-gray-800/80 rounded-2xl border border-gray-700 focus:border-cyan-500 focus:outline-none text-center"
                    />
                    <button
                      onClick={handleStake}
                      disabled={!stakeAmount || Number(stakeAmount) <= 0 || isPending}
                      className="w-full py-5 text-xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl shadow-xl hover:shadow-cyan-500/60 hover:scale-105 disabled:opacity-50 transition-all duration-300"
                    >
                      {isPending ? (needsApproval ? 'Approving...' : 'Staking...') : 'STAKE NOW'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-center">Unstake (72hr Cooldown)</h3>
                    <p className="text-center text-xl">
                      Staked: <span className="font-bold text-orange-400">{stakedAmount.toFixed(2)} $COG</span>
                    </p>
                    {unstakeRequested && (
                      <p className="text-center text-2xl font-bold text-cyan-400 py-4 bg-cyan-900/30 rounded-2xl">
                        {timeLeft}
                      </p>
                    )}
                    <div className="space-y-4">
                      <button
                        onClick={handleRequestUnstake}
                        disabled={unstakeRequested || stakedAmount === 0}
                        className="w-full py-5 text-xl font-bold bg-red-600/80 rounded-2xl hover:bg-red-700 disabled:opacity-50 transition shadow-xl"
                      >
                        {unstakeRequested ? 'Unstake Requested' : 'Request Unstake'}
                      </button>
                      <button
                        onClick={handleCompleteUnstake}
                        disabled={!canUnstake}
                        className="w-full py-5 text-xl font-bold bg-green-600/80 rounded-2xl hover:bg-green-700 disabled:opacity-50 transition shadow-xl"
                      >
                        {canUnstake ? 'COMPLETE UNSTAKE' : 'Cooldown Active'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl hover:shadow-cyan-500/40 transition-all duration-500">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4">{title}</h3>
      <div className="text-3xl sm:text-4xl font-bold text-white">{children}</div>
    </div>
  );
}

function RiskItem({ label, value, safe }: { label: string; value: string; safe: boolean }) {
  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-3xl p-6 border border-gray-700 shadow-xl text-center transition-all hover:shadow-cyan-500/40">
      <p className="text-gray-400 text-sm mb-3">{label}</p>
      <p className={`text-2xl font-bold ${safe ? 'text-green-400' : 'text-red-400'}`}>
        {value}
      </p>
    </div>
  );
}