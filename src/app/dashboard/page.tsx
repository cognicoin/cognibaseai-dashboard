'use client';

import nextDynamic from 'next/dynamic';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ConnectWalletButton = nextDynamic(
  () => import('@/components/ConnectWalletButton'),
  { ssr: false }
);

export const dynamic = 'force-dynamic';


// === Deployed contract addresses (Base) ===
const TOKEN = '0xaF4b5982BC89201551f1eD2518775a79a2705d47' as `0x${string}`;
const STAKING = '0x75B226DBee2858885f2E168F85024b883B460744' as `0x${string}`;
const NFT = '0x002b9FFdDaeCb48f76e6Fa284907b5ee87970bAa' as `0x${string}`;

// Unlock env (public) — for checkout links
const UNLOCK_NETWORK = Number(process.env.NEXT_PUBLIC_UNLOCK_NETWORK || '8453');
const LOCK_OBSERVER_PLUS = process.env.NEXT_PUBLIC_UNLOCK_LOCK_OBSERVER_PLUS || '';
const LOCK_ANALYST = process.env.NEXT_PUBLIC_UNLOCK_LOCK_ANALYST || '';
const LOCK_ARCHITECT = process.env.NEXT_PUBLIC_UNLOCK_LOCK_ARCHITECT || '';

function checkoutUrl(lockAddress: string) {
  return `https://app.unlock-protocol.com/checkout?lock=${lockAddress}&network=${UNLOCK_NETWORK}`;
}

// ===== ABIs =====
const stakingABI = [
  { inputs: [], name: 'getStakeInfo', outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }, { internalType: 'uint256', name: 'unstakeRequestTime', type: 'uint256' }, { internalType: 'uint8', name: 'tier', type: 'uint8' }, { internalType: 'bool', name: 'canUnstake', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'requestUnstake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'completeUnstake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }], name: 'stake', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const;

const nftABI = [
  { inputs: [{ internalType: 'address', name: '_staking', type: 'address' }], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'mintObserver', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const;

const erc20ABI = [
  { inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: 'result', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
] as const;

// ===== Chains for scanning =====
const SUPPORTED_CHAINS = [
  { name: 'Base', value: '8453' },
  { name: 'Ethereum', value: '1' },
  { name: 'BSC', value: '56' },
  { name: 'Polygon', value: '137' },
  { name: 'Arbitrum', value: '42161' },
  { name: 'Optimism', value: '10' },
  { name: 'Avalanche', value: '43114' },
  { name: 'Fantom', value: '250' },
  { name: 'Solana', value: 'solana' },
];

const tierImages = {
  none: null,
  observer: '/observer.png',
  analyst: '/analyst.png',
  architect: '/architect.png',
};

const tierName = {
  none: 'No Tier',
  observer: 'Observer 👁️',
  analyst: 'Analyst 📊',
  architect: 'Architect 🏆',
};

const tierThresholds = {
  observer: 10000,
  analyst: 100000,
  architect: 1000000,
};

type SubscriptionStatus = {
  observerPlus: boolean;
  analyst: boolean;
  architect: boolean;
};

type WatchItem = {
  chainId: string;
  address: string;
  label?: string;
  addedAt: number;
  lastRisk?: { score: number; verdict: string } | null;
};

function keyWatchlist(wallet?: string) {
  return wallet ? `cogni_watchlist_${wallet.toLowerCase()}` : 'cogni_watchlist_anon';
}

function safeParseJson<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function compactAddr(a: string) {
  if (!a) return '';
  if (a.length <= 12) return a;
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();


  const [stakeAmount, setStakeAmount] = useState('');
  const [scanAddress, setScanAddress] = useState('');
  const [selectedChainId, setSelectedChainId] = useState('8453');

  const [scanLoading, setScanLoading] = useState(false);
  const [scanGoPlus, setScanGoPlus] = useState<any>(null);
  const [scanDuneBundle, setScanDuneBundle] = useState<any>(null);
  const [scanKpis, setScanKpis] = useState<any>(null);
  const [scanRisk, setScanRisk] = useState<{ score: number; verdict: string; reasons: string[] } | null>(null);

  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [chatLoading, setChatLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isAutoAction, setIsAutoAction] = useState(false);
  const [showUnstakeWarning, setShowUnstakeWarning] = useState(false);

  const [txHistory, setTxHistory] = useState<Array<{ type: string; amount?: number; timestamp: number }>>([]);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>({ observerPlus: false, analyst: false, architect: false });
  const [subLoading, setSubLoading] = useState(false);

  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [watchlistOpen, setWatchlistOpen] = useState(true);

  const walletBalanceRef = useRef<HTMLSpanElement>(null);
  const stakedAmountRef = useRef<HTMLSpanElement>(null);

  const { data: tokenBalRaw, isLoading: balLoading, refetch: refetchBalance } = useBalance({
    address,
    token: TOKEN,
  });

  const { data: stakeInfoRaw, isLoading: stakeLoading, refetch: refetchStake } = useReadContract({
    address: STAKING,
    abi: stakingABI,
    functionName: 'getStakeInfo',
  });

  const { data: nftBal, refetch: refetchNftBal } = useReadContract({
    address: NFT,
    abi: nftABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const parsedStake = useMemo(() => {
    let stakedAmount = 0;
    let unstakeRequested = false;
    let canUnstake = false;
    let unstakeRequestTime = 0n;

    if (stakeInfoRaw) {
      const infoArray = stakeInfoRaw as unknown as any[];
      if (Array.isArray(infoArray) && infoArray.length >= 4) {
        const amount = infoArray[0] as bigint;
        stakedAmount = Number(formatEther(amount));
        unstakeRequestTime = infoArray[1] as bigint;
        unstakeRequested = unstakeRequestTime > 0n;
        canUnstake = Boolean(infoArray[3]);
      }
    }

    return { stakedAmount, unstakeRequested, canUnstake, unstakeRequestTime };
  }, [stakeInfoRaw]);

  const stakedAmount = parsedStake.stakedAmount;
  const unstakeRequested = parsedStake.unstakeRequested;
  const canUnstake = parsedStake.canUnstake;
  const unstakeRequestTime = parsedStake.unstakeRequestTime;

  const isWrongChain = chain?.id !== 8453;
  const isEligibleForBadge = stakedAmount >= 10_000;
  const loading = balLoading || stakeLoading;

  const stakedTier = useMemo(() => {
    if (stakedAmount >= tierThresholds.architect) return 'architect';
    if (stakedAmount >= tierThresholds.analyst) return 'analyst';
    if (stakedAmount >= tierThresholds.observer) return 'observer';
    return 'none';
  }, [stakedAmount]);

  const nextTier =
    stakedTier === 'architect'
      ? null
      : stakedTier === 'analyst'
        ? 'architect'
        : stakedTier === 'observer'
          ? 'analyst'
          : 'observer';

  const nextTierThreshold = nextTier ? tierThresholds[nextTier] : 0;
  const progressToNext = nextTier ? (stakedAmount / nextTierThreshold) * 100 : 100;

  const stakedTierName = tierName[stakedTier as keyof typeof tierName];
  const stakedTierImage = tierImages[stakedTier as keyof typeof tierImages];

  // ===== Allowance / approval logic =====
  const stakeAmountWei = useMemo(() => {
    try {
      if (!stakeAmount || Number(stakeAmount) <= 0) return 0n;
      return parseEther(stakeAmount);
    } catch {
      return 0n;
    }
  }, [stakeAmount]);

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: TOKEN,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING] : undefined,
  });

  const needsApproval = useMemo(() => {
    if (!stakeAmountWei || stakeAmountWei === 0n) return false;
    const allowance = allowanceRaw as unknown as bigint | undefined;
    if (!allowance) return true;
    return allowance < stakeAmountWei;
  }, [allowanceRaw, stakeAmountWei]);

  // ===== Theme =====
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ? saved === 'dark' : prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle('dark', initial);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // ===== tx history =====
  useEffect(() => {
    if (typeof window === 'undefined' || !address) return;
    const saved = localStorage.getItem(`txHistory_${address}`);
    if (saved) setTxHistory(safeParseJson(saved, []));
  }, [address]);

  const addToHistory = (type: string, amount?: number) => {
    if (!address || typeof window === 'undefined') return;
    const newEntry = { type, amount, timestamp: Date.now() };
    const updated = [newEntry, ...txHistory].slice(0, 10);
    setTxHistory(updated);
    localStorage.setItem(`txHistory_${address}`, JSON.stringify(updated));
  };

  // ===== watchlist (localStorage) =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(keyWatchlist(address));
    setWatchlist(safeParseJson(saved, []));
  }, [address]);

  const persistWatchlist = (items: WatchItem[]) => {
    setWatchlist(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(keyWatchlist(address), JSON.stringify(items));
    }
  };

  const addToWatchlist = () => {
    const addr = scanAddress.trim();
    if (!addr) return;
    const exists = watchlist.some((w) => w.chainId === selectedChainId && w.address.toLowerCase() === addr.toLowerCase());
    if (exists) {
      toast('Already in watchlist', { icon: 'ℹ️' });
      return;
    }
    const newItem: WatchItem = {
      chainId: selectedChainId,
      address: addr,
      label: '',
      addedAt: Date.now(),
      lastRisk: scanRisk ? { score: scanRisk.score, verdict: scanRisk.verdict } : null,
    };
    persistWatchlist([newItem, ...watchlist].slice(0, 50));
    toast.success('Saved to watchlist');
  };

  const removeFromWatchlist = (idx: number) => {
    const updated = watchlist.filter((_, i) => i !== idx);
    persistWatchlist(updated);
  };

  const quickScanFromWatch = async (item: WatchItem) => {
    setSelectedChainId(item.chainId);
    setScanAddress(item.address);
    await handleScan(item.chainId, item.address, true);
  };

  // ===== refetch on connect =====
  useEffect(() => {
    if (isConnected && address) {
      refetchBalance();
      refetchStake();
      refetchAllowance();
    }
  }, [isConnected, address, refetchBalance, refetchStake, refetchAllowance]);

  // ===== cooldown timer =====
  useEffect(() => {
    if (!unstakeRequested || unstakeRequestTime === 0n) {
      setTimeLeft('');
      return;
    }
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const requestTime = Number(unstakeRequestTime);
      const cooldownEnd = requestTime + 72 * 3600;
      const remaining = cooldownEnd - now;
      if (remaining <= 0) {
        setTimeLeft('Ready to complete unstake!');
        return;
      }
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [unstakeRequested, unstakeRequestTime]);

  // ===== count-up animations =====
  const animateCount = (element: HTMLSpanElement | null, target: number) => {
    if (!element) return;
    element.textContent = '0.00';
    let start = 0;
    const increment = target / 90;
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
    if (tokenBalRaw && walletBalanceRef.current) {
      const balance = Number(formatEther(tokenBalRaw.value));
      animateCount(walletBalanceRef.current, balance);
    }
  }, [tokenBalRaw]);

  useEffect(() => {
    if (stakedAmountRef.current) {
      animateCount(stakedAmountRef.current, stakedAmount);
    }
  }, [stakedAmount]);

  // ===== subscription status (existing endpoint) =====
  useEffect(() => {
    const run = async () => {
      if (!address) return;
      setSubLoading(true);
      try {
        const res = await fetch('/api/subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        const data = await res.json();
        if (data?.ok) {
          setSubStatus({
            observerPlus: Boolean(data.observerPlus),
            analyst: Boolean(data.analyst),
            architect: Boolean(data.architect),
          });
        }
      } catch {
        // ignore
      } finally {
        setSubLoading(false);
      }
    };
    if (isConnected && address && !isWrongChain) run();
  }, [isConnected, address, isWrongChain]);

  const activePlanLabel = useMemo(() => {
    if (subStatus.architect) return 'Architect (Paid)';
    if (subStatus.analyst) return 'Analyst (Paid)';
    if (subStatus.observerPlus) return 'Observer Plus (Paid)';
    return 'None';
  }, [subStatus]);

  const openUnlockCheckout = (lock: string) => {
    if (!lock) {
      toast.error('Unlock lock address not configured');
      return;
    }
    window.open(checkoutUrl(lock), '_blank', 'noopener,noreferrer');
  };

  // ===== tx actions =====
  const { writeContractAsync, isPending: isTxPending } = useWriteContract();
  const isPending = isTxPending || isAutoAction;

  const handleStake = async () => {
    try {
      if (!stakeAmountWei || stakeAmountWei === 0n) return;

      if (needsApproval) {
        await writeContractAsync({
          address: TOKEN,
          abi: erc20ABI,
          functionName: 'approve',
          args: [STAKING, stakeAmountWei],
        });
        toast.success('Approval successful! Now stake.');
        await refetchAllowance();
        return;
      }

      await writeContractAsync({
        address: STAKING,
        abi: stakingABI,
        functionName: 'stake',
        args: [stakeAmountWei],
      });

      toast.success('Staked successfully!');
      addToHistory('Staked', Number(stakeAmount));
      setStakeAmount('');
      await refetchStake();
      await refetchNftBal();
      await refetchBalance();
      await refetchAllowance();

      if (isEligibleForBadge && Number(nftBal || 0) === 0) {
        setIsAutoAction(true);
        toast('Auto-minting Observer badge...', { icon: 'ℹ️' });

        setTimeout(async () => {
          try {
            await writeContractAsync({
              address: NFT,
              abi: nftABI,
              functionName: 'mintObserver',
            });
            toast.success('Observer badge auto-minted!');
            await refetchNftBal();
          } catch (error: any) {
            toast.error(error.shortMessage || 'Auto-mint failed');
          } finally {
            setIsAutoAction(false);
          }
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.shortMessage || 'Transaction failed');
      console.error(error);
    }
  };

  const handleRequestUnstake = async () => setShowUnstakeWarning(true);

  const confirmUnstake = async () => {
    try {
      await writeContractAsync({
        address: STAKING,
        abi: stakingABI,
        functionName: 'requestUnstake',
      });
      toast.success('Unstake requested – 72hr cooldown started');
      addToHistory('Unstake Requested');
      await refetchStake();
      await refetchBalance();
      setShowUnstakeWarning(false);
    } catch (error: any) {
      toast.error(error.shortMessage || 'Request failed');
    }
  };

  const handleCompleteUnstake = async () => {
    try {
      await writeContractAsync({
        address: STAKING,
        abi: stakingABI,
        functionName: 'completeUnstake',
      });
      toast.success('Unstaked successfully!');
      addToHistory('Unstaked', stakedAmount);
      await refetchStake();
      await refetchNftBal();
      await refetchBalance();
      await refetchAllowance();
    } catch (error: any) {
      toast.error(error.shortMessage || 'Unstake failed');
    }
  };

  const handleMintObserver = async () => {
    try {
      await writeContractAsync({
        address: NFT,
        abi: nftABI,
        functionName: 'mintObserver',
      });
      toast.success('Observer badge minted!');
      addToHistory('Badge Minted');
      await refetchNftBal();
    } catch (error: any) {
      toast.error(error.shortMessage || 'Mint failed');
    }
  };

  // ===== Scanner: now calls backend that returns KPIs + Risk =====
  const handleScan = async (chainId?: string, addr?: string, silent?: boolean) => {
    if (!address) {
      toast.error('Connect wallet first');
      return;
    }

    const cid = (chainId ?? selectedChainId).trim();
    const a = (addr ?? scanAddress).trim();

    setScanLoading(true);
    setScanGoPlus(null);
    setScanDuneBundle(null);
    setScanKpis(null);
    setScanRisk(null);
    setAiSummary(null);

    try {
      const res = await fetch('/api/token-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId: cid, address: a, wallet: address }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        const msg = data?.error || 'Scan failed';
        if (res.status === 429) {
          toast.error(msg);
        } else {
          toast.error(msg);
        }
        setScanGoPlus({ error: msg, rate: data?.rate });
        return;
      }

      setScanGoPlus(data.goPlus || null);
      setScanDuneBundle(data.dune || null);
      setScanKpis(data.kpis || null);
      setScanRisk(data.risk || null);

      // update lastRisk on watchlist items if exists
      if (silent !== true) toast.success('Scan complete!');
    } catch (e: any) {
      toast.error(e?.message || 'Scan failed');
      setScanGoPlus({ error: e?.message || 'Scan failed' });
    } finally {
      setScanLoading(false);
    }
  };

  const handleAiSummary = async () => {
    if (!address) return;
    if (!scanGoPlus || scanGoPlus?.error) return;

    setAiLoading(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goPlus: scanGoPlus, kpis: scanKpis, risk: scanRisk, wallet: address }),
      });

      const summary = await res.json();

      if (!res.ok && res.status === 429) {
        toast.error(summary?.error || 'Rate limit reached');
        return;
      }

      setAiSummary(summary);
      toast.success('AI review ready!');
    } catch {
      toast.error('AI summary failed — check server logs');
    } finally {
      setAiLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!address) return;
    if (!chatInput.trim()) return;
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, wallet: address }),
      });
      const data = await res.json();
      if (!res.ok && res.status === 429) {
        toast.error(data?.error || 'Rate limit reached');
        return;
      }
      setChatResponse(data.response || 'No response');
    } catch {
      toast.error('Chat failed — check server logs');
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  // ===== update watchlist lastRisk when we scan current token =====
  useEffect(() => {
    if (!scanRisk || !scanAddress) return;
    const addr = scanAddress.trim().toLowerCase();
    const cid = selectedChainId;
    const updated = watchlist.map((w) => {
      if (w.chainId === cid && w.address.toLowerCase() === addr) {
        return { ...w, lastRisk: { score: scanRisk.score, verdict: scanRisk.verdict } };
      }
      return w;
    });
    persistWatchlist(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanRisk]);

  return (
    <>
      <Navbar />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark/light mode"
        className="fixed top-20 right-4 z-50 p-3 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-black shadow-lg hover:scale-110 transition-all duration-300"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {isPending && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50">
          <p className="text-3xl text-cyan-400 animate-pulse">Processing...</p>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black dark:from-gray-100 dark:via-gray-50 dark:to-white text-white dark:text-black pt-20 px-4">
        <div className="max-w-7xl mx-auto space-y-20 py-12">
          {!isConnected ? (
            <div className="text-center space-y-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">
                Cogni Dashboard
              </h1>
              <p className="text-2xl text-gray-300 dark:text-gray-700">Connect wallet to access tools</p>
<ConnectWalletButton className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl shadow-2xl hover:scale-105 transition">
  CONNECT WALLET
</ConnectWalletButton>


            </div>
          ) : isWrongChain ? (
            <div className="text-center space-y-8">
              <h1 className="text-5xl font-bold text-red-500">Wrong Network</h1>
              <p className="text-xl">Switch to Base chain (8453)</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                <StatCard title="Wallet Balance">
                  {loading ? <Skeleton height={40} /> : <span ref={walletBalanceRef}>0.00</span>} $COG
                </StatCard>

                <StatCard title="Staked Amount">
                  {loading ? <Skeleton height={40} /> : <span ref={stakedAmountRef}>{stakedAmount.toFixed(2)}</span>} $COG
                </StatCard>

                <StatCard title="Current Tier">
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton circle width={80} height={80} />
                      <Skeleton height={32} />
                    </div>
                  ) : (
                    <>
                      {stakedTierImage && (
                        <Image src={stakedTierImage} alt={stakedTierName} width={80} height={80} className="mx-auto mb-4" />
                      )}
                      <p className="text-2xl text-center">{stakedTierName}</p>

                      {nextTier && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 dark:text-gray-600 text-center mb-2">
                            Progress to {tierName[nextTier as keyof typeof tierName]}
                          </p>
                          <div className="w-full bg-gray-700 dark:bg-gray-300 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
                              style={{ width: `${Math.min(progressToNext, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-1">
                            {stakedAmount.toFixed(0)} / {nextTierThreshold.toLocaleString()} $COG
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </StatCard>

                <StatCard title="Subscription Status">
                  {subLoading ? (
                    <Skeleton height={90} />
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-2xl font-bold text-cyan-400">{activePlanLabel}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-600">
                        Stake unlocks eligibility • Subscription activates usage (limits)
                      </p>

                      <div className="flex gap-2 justify-center flex-wrap pt-2">
                        <button onClick={() => openUnlockCheckout(LOCK_OBSERVER_PLUS)} className="px-4 py-2 rounded-xl bg-gray-800/70 dark:bg-gray-200/60 font-semibold hover:scale-105 transition">
                          Observer Plus
                        </button>
                        <button onClick={() => openUnlockCheckout(LOCK_ANALYST)} className="px-4 py-2 rounded-xl bg-gray-800/70 dark:bg-gray-200/60 font-semibold hover:scale-105 transition">
                          Analyst
                        </button>
                        <button onClick={() => openUnlockCheckout(LOCK_ARCHITECT)} className="px-4 py-2 rounded-xl bg-gray-800/70 dark:bg-gray-200/60 font-semibold hover:scale-105 transition">
                          Architect
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-500 pt-1">
                        Active: {subStatus.architect ? 'Architect' : subStatus.analyst ? 'Analyst' : subStatus.observerPlus ? 'Observer Plus' : 'None'}
                      </div>
                    </div>
                  )}
                </StatCard>
              </div>

              {/* Watchlist */}
              <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                    Watchlist (Saved Scans)
                  </h2>
                  <button
                    onClick={() => setWatchlistOpen((v) => !v)}
                    className="px-4 py-2 rounded-xl bg-gray-800/70 dark:bg-gray-200/60 font-semibold hover:scale-105 transition"
                  >
                    {watchlistOpen ? 'Hide' : 'Show'}
                  </button>
                </div>

                {watchlistOpen && (
                  <div className="mt-6">
                    {watchlist.length === 0 ? (
                      <p className="text-gray-400 dark:text-gray-600">No saved tokens yet. Run a scan and click “Save to Watchlist”.</p>
                    ) : (
                      <div className="space-y-3">
                        {watchlist.map((w, idx) => (
                          <div key={`${w.chainId}-${w.address}-${w.addedAt}`} className="bg-gray-800/50 dark:bg-gray-200/30 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-[240px]">
                              <div className="font-semibold">
                                {SUPPORTED_CHAINS.find((c) => c.value === w.chainId)?.name || w.chainId} • {compactAddr(w.address)}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-600">
                                Added {new Date(w.addedAt).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              {w.lastRisk ? (
                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-black/30 dark:bg-white/30">
                                  {w.lastRisk.verdict} • {w.lastRisk.score}/100
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-600">No risk yet</span>
                              )}

                              <button
                                onClick={() => quickScanFromWatch(w)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:scale-105 transition"
                              >
                                Re-scan
                              </button>

                              <button
                                onClick={() => removeFromWatchlist(idx)}
                                className="px-4 py-2 rounded-xl bg-red-600/70 font-semibold hover:bg-red-700 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stake / Unstake */}
              <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
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
                      className="w-full px-6 py-5 text-xl bg-gray-800/80 dark:bg-gray-200 rounded-2xl border border-gray-700 dark:border-gray-400 focus:border-cyan-500 focus:outline-none text-center"
                    />

                    <button
                      onClick={handleStake}
                      disabled={!stakeAmount || Number(stakeAmount) <= 0 || isPending}
                      className="w-full py-5 text-xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl shadow-xl hover:shadow-cyan-500/60 hover:scale-105 disabled:opacity-50 transition-all duration-300"
                    >
                      {isPending ? 'Processing...' : needsApproval ? 'APPROVE' : 'STAKE NOW'}
                    </button>

                    <p className="text-sm text-center text-gray-400 dark:text-gray-600">
                      {needsApproval ? 'Approval required before staking.' : 'Ready to stake.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-center">Unstake (72hr Cooldown)</h3>

                    <p className="text-center text-xl">
                      Staked:{' '}
                      {loading ? (
                        <Skeleton width={120} inline />
                      ) : (
                        <span className="font-bold text-orange-400">{stakedAmount.toFixed(2)} $COG</span>
                      )}
                    </p>

                    {unstakeRequested && (
                      <p className="text-center text-2xl font-bold text-cyan-400 py-4 bg-cyan-900/30 dark:bg-cyan-900/20 rounded-2xl">
                        {timeLeft || 'Calculating...'}
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

              {/* Unstake Warning Modal */}
              {showUnstakeWarning && (
                <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 px-4">
                  <div className="bg-gray-900/90 dark:bg-gray-100/90 backdrop-blur-xl rounded-3xl p-8 max-w-md border border-red-500/50 dark:border-red-400/50 shadow-2xl">
                    <h3 className="text-2xl font-bold text-red-400 dark:text-red-600 mb-4">
                      Warning: Unstake Request
                    </h3>
                    <p className="text-gray-300 dark:text-gray-700 mb-6">Once you request unstake:</p>
                    <ul className="space-y-2 text-gray-300 dark:text-gray-700 mb-8">
                      <li>• You enter a 72-hour cooldown</li>
                      <li>• Usage is restricted during cooldown</li>
                      <li>• When cooldown ends, you can complete withdrawal</li>
                    </ul>
                    <div className="flex gap-4">
                      <button onClick={confirmUnstake} className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition">
                        Confirm Unstake
                      </button>
                      <button
                        onClick={() => setShowUnstakeWarning(false)}
                        className="flex-1 py-3 bg-gray-700 dark:bg-gray-300 rounded-xl font-bold hover:bg-gray-600 dark:hover:bg-gray-400 transition text-white dark:text-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Observer Badge NFT */}
              <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Observer Badge NFT
                </h2>

                <div className="flex justify-center gap-12 flex-wrap">
                  <button
                    onClick={handleMintObserver}
                    disabled={!isEligibleForBadge || Number(nftBal || 0) > 0 || isPending}
                    className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl shadow-xl hover:scale-105 disabled:opacity-50 transition"
                  >
                    {Number(nftBal || 0) > 0 ? 'ALREADY OWNED' : 'MINT BADGE'}
                  </button>
                </div>
              </div>

              {/* Token Scanner */}
              <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Token Scanner (Any Chain/Token)
                </h2>

                <div className="max-w-3xl mx-auto space-y-6">
                  <select
                    value={selectedChainId}
                    onChange={(e) => setSelectedChainId(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800 dark:bg-gray-200 rounded-xl text-white dark:text-black"
                  >
                    {SUPPORTED_CHAINS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Enter any token contract address"
                    value={scanAddress}
                    onChange={(e) => setScanAddress(e.target.value.trim())}
                    className="w-full px-6 py-4 bg-gray-800 dark:bg-gray-200 rounded-xl text-center text-white dark:text-black"
                  />

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleScan()}
                      disabled={scanLoading || !scanAddress}
                      className="flex-1 py-5 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-xl hover:scale-105 disabled:opacity-50 transition"
                    >
                      {scanLoading ? 'Scanning...' : 'SCAN TOKEN 🔍'}
                    </button>

                    <button
                      onClick={addToWatchlist}
                      disabled={!scanAddress}
                      className="px-5 py-5 text-lg font-bold bg-gray-800/80 dark:bg-gray-200 rounded-xl hover:scale-105 transition"
                    >
                      Save to Watchlist ⭐
                    </button>
                  </div>
                </div>

                {scanLoading ? (
                  <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-gray-800/80 dark:bg-gray-200/50 rounded-3xl p-6">
                        <Skeleton height={20} width="60%" className="mb-3" />
                        <Skeleton height={40} />
                      </div>
                    ))}
                  </div>
                ) : scanGoPlus && !scanGoPlus.error ? (
                  <>
                    {/* Risk score banner */}
                    {scanRisk && (
                      <div className="mt-10 bg-gray-800/70 dark:bg-gray-200/30 rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <div className="text-sm text-gray-400 dark:text-gray-700">Risk Score</div>
                            <div className="text-4xl font-extrabold">
                              {scanRisk.score}/100{' '}
                              <span className="text-xl font-bold text-cyan-400">• {scanRisk.verdict}</span>
                            </div>
                          </div>
                          <div className="max-w-xl text-sm text-gray-300 dark:text-gray-700">
                            <div className="font-semibold mb-1">Why:</div>
                            <ul className="list-disc ml-5 space-y-1">
                              {scanRisk.reasons?.length ? scanRisk.reasons.map((r, i) => <li key={i}>{r}</li>) : <li>No major flags detected.</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-6">
                      <RiskItem label="Honeypot" value={scanGoPlus.is_honeypot === '1' ? 'YES' : 'No'} safe={scanGoPlus.is_honeypot !== '1'} />
                      <RiskItem label="Mintable" value={scanGoPlus.is_mintable === '1' ? 'YES' : 'No'} safe={scanGoPlus.is_mintable !== '1'} />
                      <RiskItem label="Proxy" value={scanGoPlus.is_proxy === '1' ? 'YES' : 'No'} safe={scanGoPlus.is_proxy !== '1'} />
                      <RiskItem label="Open Source" value={scanGoPlus.is_open_source === '1' ? 'Yes' : 'No'} safe={scanGoPlus.is_open_source === '1'} />
                      <RiskItem label="LP Locked" value={scanGoPlus.lp_locked === '1' ? 'Yes' : 'No'} safe={scanGoPlus.lp_locked === '1'} />
                    </div>

                    {/* Dune KPI snapshot */}
                    {scanKpis && (
                      <div className="mt-8 bg-gray-800/60 dark:bg-gray-200/30 rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-2">Market Snapshot (Dune KPIs)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <Kpi label="Holders" value={scanKpis.holders} />
                          <Kpi label="Volume 24h" value={scanKpis.volume24h} prefix="$" />
                          <Kpi label="Trades 24h" value={scanKpis.trades24h} />
                          <Kpi label="Price Δ 24h" value={scanKpis.priceChange24h} suffix="%" />
                          <Kpi label="Price Δ 7d" value={scanKpis.priceChange7d} suffix="%" />
                          <Kpi label="Liquidity" value={scanKpis.liquidityUsd} prefix="$" />
                          <Kpi label="MCap/FDV" value={scanKpis.mcapUsd} prefix="$" />
                        </div>

                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-gray-400 dark:text-gray-700">Show raw Dune bundle</summary>
                          <pre className="mt-3 text-xs overflow-auto max-h-64 bg-black/30 dark:bg-white/40 p-4 rounded-xl">
                            {JSON.stringify(scanDuneBundle, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}

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
                      <div className="mt-10 bg-gray-800/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 dark:border-purple-400/30 shadow-2xl">
                        <h3 className="text-3xl font-bold text-center mb-6">{aiSummary.verdict}</h3>
                        <ul className="space-y-3 text-lg mb-6">
                          {(aiSummary.bullets || []).map((bullet: string, i: number) => (
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
                ) : scanGoPlus?.error ? (
                  <p className="text-center text-red-400 text-lg mt-12">{scanGoPlus.error}</p>
                ) : null}
              </div>

              {/* Dune embeds gated by stake (your existing model) */}
              {stakedTier !== 'none' ? (
                <div className="space-y-16">
                  <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                    Live On-Chain Analytics (Powered by Dune)
                  </h2>

                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-center mb-6">Aerodrome Finance Metrics (Top Base DEX)</h3>
                    <div className="w-full h-[600px]">
                      <iframe
                        src="https://dune.com/embeds/2986326/4954062"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 'none', background: 'transparent', colorScheme: 'dark' }}
                        title="Aerodrome Finance Metrics"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-center mb-6">Base DEX Volume & Top Pairs</h3>
                    <div className="w-full h-[600px]">
                      <iframe
                        src="https://dune.com/embeds/3565396/6000018"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 'none', background: 'transparent', colorScheme: 'dark' }}
                        title="Base DEX Metrics"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-16 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl text-center">
                  <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                    Unlock Live On-Chain Analytics
                  </h2>
                  <p className="text-2xl text-gray-300 dark:text-gray-700 mb-6">
                    Stake 10,000+ $COG to access real-time Dune dashboards
                  </p>
                  <button
                    onClick={() => toast('Go to Stake section to unlock!', { icon: '🔓' })}
                    className="px-12 py-5 text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-2xl hover:scale-105 transition"
                  >
                    Stake Now to Unlock
                  </button>
                </div>
              )}

              {/* Transaction History */}
              <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Recent Transactions
                </h2>
                {txHistory.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-gray-600">No transactions yet</p>
                ) : (
                  <div className="space-y-4">
                    {txHistory.map((tx, i) => (
                      <div key={i} className="bg-gray-800/50 dark:bg-gray-200/30 rounded-xl p-4 flex justify-between items-center">
                        <span className="font-medium">
                          {tx.type} {tx.amount ? `(${tx.amount} $COG)` : ''}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-600">
                          {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Chat */}
              <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Ask the Degen AI
                </h2>
                <div className="max-w-3xl mx-auto space-y-6">
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800 dark:bg-gray-200 rounded-xl text-white dark:text-black"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !chatInput}
                    className="w-full py-5 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl hover:scale-105 disabled:opacity-50 transition"
                  >
                    {chatLoading ? 'Thinking...' : 'ASK AI 🧠'}
                  </button>
                  {chatResponse && (
                    <div className="mt-8 bg-gray-800/80 dark:bg-gray-200/30 p-6 rounded-xl">
                      <p className="text-lg whitespace-pre-wrap">{chatResponse}</p>
                    </div>
                  )}
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
    <div className="bg-gray-900/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 dark:border-cyan-300/20 shadow-2xl hover:shadow-cyan-500/40 transition-all duration-500">
      <h3 className="text-gray-400 dark:text-gray-600 text-sm uppercase tracking-wider mb-4">{title}</h3>
      <div className="text-3xl sm:text-4xl font-bold text-white dark:text-black">{children}</div>
    </div>
  );
}

function RiskItem({ label, value, safe }: { label: string; value: string; safe: boolean }) {
  return (
    <div className="bg-gray-800/80 dark:bg-white/10 backdrop-blur rounded-3xl p-6 border border-gray-700 dark:border-gray-300 shadow-xl text-center transition-all hover:shadow-cyan-500/40">
      <p className="text-gray-400 dark:text-gray-600 text-sm mb-3">{label}</p>
      <p className={`text-2xl font-bold ${safe ? 'text-green-400' : 'text-red-400'}`}>{value}</p>
    </div>
  );
}

function Kpi({ label, value, prefix, suffix }: { label: string; value: any; prefix?: string; suffix?: string }) {
  const v = typeof value === 'number' && Number.isFinite(value) ? value : null;
  const display =
    v === null
      ? '—'
      : Math.abs(v) >= 1_000_000
        ? `${(v / 1_000_000).toFixed(2)}M`
        : Math.abs(v) >= 1_000
          ? `${(v / 1_000).toFixed(2)}K`
          : `${v.toFixed(2)}`;

  return (
    <div className="bg-black/30 dark:bg-white/30 rounded-xl p-4">
      <div className="text-xs text-gray-400 dark:text-gray-700">{label}</div>
      <div className="text-lg font-bold">
        {prefix || ''}
        {display}
        {suffix || ''}
      </div>
    </div>
  );
}
