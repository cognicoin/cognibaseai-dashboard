// src/app/dashboard/page.tsx - FINAL COMPLETE DASHBOARD
'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

const TOKEN = '0xaF4b5982BC89201551f1eD2518775a79a2705d47' as `0x${string}`;
const STAKING = '0x75B226DBee2858885f2E168F85024b883B460744' as `0x${string}`;
const NFT = '0x002b9FFdDaeCb48f76e6Fa284907b5ee87970bAa' as `0x${string}`;

const stakingABI = [
  {"inputs":[{"internalType":"address","name":"_cogniToken","type":"address"},{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"tier","type":"uint8"}],"name":"Staked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint8","name":"oldTier","type":"uint8"},{"indexed":false,"internalType":"uint8","name":"newTier","type":"uint8"}],"name":"TierUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"UnstakeRequested","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},
  {"inputs":[],"name":"ANALYST_THRESHOLD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"ARCHITECT_THRESHOLD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"COOLDOWN_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"OBSERVER_THRESHOLD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"cogniToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"completeUnstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getStakeInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"unstakeRequestTime","type":"uint256"},{"internalType":"uint8","name":"tier","type":"uint8"},{"internalType":"bool","name":"canUnstake","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_stakedAmount","type":"uint256"}],"name":"getTier","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"requestUnstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"unstakeRequestTime","type":"uint256"},{"internalType":"uint8","name":"tier","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
] as const;

const nftABI = [
  {"inputs":[{"internalType":"address","name":"_staking","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},
  {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_toTokenId","type":"uint256"}],"name":"BatchMetadataUpdate","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"MetadataUpdate","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isValid","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"mintObserver","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint8","name":"tier","type":"uint8"}],"name":"mintTier","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"nextId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"requiredStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"staking","outputs":[{"internalType":"contract IStaking","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint8","name":"","type":"uint8"}],"name":"tierURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenTier","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}
] as const;

const erc20ABI = [
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
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

function shortenAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Dashboard() {
  const { address, isConnected, chain } = useAccount();
  const { open } = useAppKit();

  const [stakeAmount, setStakeAmount] = useState('');
  const [scanAddress, setScanAddress] = useState('');
  const [selectedChainId, setSelectedChainId] = useState('8453');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [chatLoading, setChatLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [nftBalance, setNftBalance] = useState(0);
  const [isAutoAction, setIsAutoAction] = useState(false);
  const [recentAction, setRecentAction] = useState(false);

  const walletBalanceRef = useRef<HTMLSpanElement>(null);
  const stakedAmountRef = useRef<HTMLSpanElement>(null);

  const { data: tokenBal } = useBalance({ address, token: TOKEN });

  const { data: stakeInfoRaw, refetch: refetchStake } = useReadContract({
    address: STAKING,
    abi: stakingABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
  });

  const { data: stakeMapping } = useReadContract({
    address: STAKING,
    abi: stakingABI,
    functionName: 'stakes',
    args: address ? [address] : undefined,
  });

  let stakedAmount = 0;
  let unstakeRequested = false;
  let canUnstake = false;

  if (stakeInfoRaw) {
    const infoArray = stakeInfoRaw as unknown as any[];
    if (Array.isArray(infoArray) && infoArray.length >= 4) {
      const amount = infoArray[0] as bigint;
      stakedAmount = Number(formatEther(amount));
      unstakeRequested = infoArray[1] > 0n;
      canUnstake = Boolean(infoArray[3]);
    }
  } else if (stakeMapping) {
    const amount = (stakeMapping as any)?.amount || 0n;
    stakedAmount = Number(formatEther(amount));
    unstakeRequested = (stakeMapping as any)?.unstakeRequestTime > 0n;
  }

  const { data: nftBal, refetch: refetchNftBal } = useReadContract({
    address: NFT,
    abi: nftABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContractAsync, isPending: isTxPending } = useWriteContract();
  const isPending = isTxPending || isAutoAction;

  const isWrongChain = chain?.id !== 8453;

  let stakedTier: 'none' | 'observer' | 'analyst' | 'architect' = 'none';
  if (stakedAmount >= 1_000_000) stakedTier = 'architect';
  else if (stakedAmount >= 100_000) stakedTier = 'analyst';
  else if (stakedAmount >= 10_000) stakedTier = 'observer';

  const stakedTierName = tierName[stakedTier];
  const stakedTierImage = tierImages[stakedTier];
  const isEligibleForBadge = stakedAmount >= 10_000;

  useEffect(() => {
    if (nftBal !== undefined) setNftBalance(Number(nftBal));
  }, [nftBal]);

  useEffect(() => {
    if (!isConnected) return;
    const shouldPoll = unstakeRequested || recentAction;
    if (!shouldPoll) return;
    const pollInterval = setInterval(async () => {
      await refetchStake();
      await refetchNftBal();
      if (!unstakeRequested) setRecentAction(false);
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [isConnected, unstakeRequested, recentAction, refetchStake, refetchNftBal]);

  useEffect(() => {
    if (isConnected && address) {
      toast.success(`Wallet connected: ${shortenAddress(address)}`, { duration: 4000 });
    }
    if (chain?.id !== 8453) {
      toast.error('Please switch to Base network for full functionality', { duration: 6000 });
    }
  }, [isConnected, address, chain]);

  useEffect(() => {
    if (tokenBal && walletBalanceRef.current) {
      const balance = Number(formatEther(tokenBal.value));
      animateCount(walletBalanceRef.current, balance);
    }
    if (stakedAmountRef.current) {
      animateCount(stakedAmountRef.current, stakedAmount);
    }
  }, [tokenBal, stakedAmount]);

  const animateCount = (element: HTMLSpanElement | null, target: number) => {
    if (!element) return;
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

  const triggerRecentAction = () => setRecentAction(true);

  const handleStake = async () => {
    try {
      if (needsApproval) {
        await writeContractAsync({
          address: TOKEN,
          abi: erc20ABI,
          functionName: 'approve',
          args: [STAKING, parseEther(stakeAmount)],
        });
        setNeedsApproval(false);
        toast.success('Approval successful! Now stake.');
      } else {
        await writeContractAsync({
          address: STAKING,
          abi: stakingABI,
          functionName: 'stake',
          args: [parseEther(stakeAmount)],
        });
        toast.success('Staked successfully!');
        setStakeAmount('');
        await refetchStake();
        await refetchNftBal();
        triggerRecentAction();
        if (isEligibleForBadge && nftBalance === 0) {
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
          }, 2000);
        }
      }
    } catch (error: any) {
      toast.error(error.shortMessage || 'Transaction failed');
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
      toast.success('Unstake requested – 72hr cooldown started');
      await refetchStake();
      triggerRecentAction();
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
      await refetchStake();
      await refetchNftBal();
      triggerRecentAction();
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
      await refetchNftBal();
    } catch (error: any) {
      toast.error(error.shortMessage || 'Mint failed');
    }
  };

  const handleScan = async () => {
    const today = new Date().toDateString();
    const scanCountKey = `scanCount_${today}`;
    let scanCount = parseInt(localStorage.getItem(scanCountKey) || '0', 10);
    const limits = { none: 0, observer: 5, analyst: 100, architect: Infinity };
    if (scanCount >= limits[stakedTier as keyof typeof limits]) {
      toast.error('Daily scan limit reached');
      return;
    }
    setScanLoading(true);
    setScanResult(null);
    setAiSummary(null);
    try {
      let goPlusUrl = '';
      if (selectedChainId === 'solana') {
        goPlusUrl = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${scanAddress}`;
      } else {
        goPlusUrl = `https://api.gopluslabs.io/api/v1/token_security/${selectedChainId}?contract_addresses=${scanAddress}`;
      }
      const goPlusRes = await fetch(goPlusUrl);
      const goPlusData = await goPlusRes.json();
      let tokenData = null;
      if (selectedChainId === 'solana') {
        tokenData = goPlusData.result?.[scanAddress.toLowerCase()] || goPlusData.result || {};
      } else {
        tokenData = goPlusData[scanAddress.toLowerCase()] || goPlusData.result?.[scanAddress.toLowerCase()] || goPlusData;
      }
      if (!tokenData || Object.keys(tokenData).length === 0) {
        throw new Error('No security data found for this token');
      }
      setScanResult(tokenData);
      toast.success('Scan complete!');
      scanCount++;
      localStorage.setItem(scanCountKey, scanCount.toString());
    } catch (error) {
      setScanResult({ error: 'Invalid address, unsupported chain, or no data found' });
      toast.error('Scan failed');
    } finally {
      setScanLoading(false);
    }
  };

  const handleAiSummary = async () => {
    if (!scanResult || scanResult.error) return;
    setAiLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const summary = await res.json();
      setAiSummary(summary);
      toast.success('AI review ready!');
    } catch (error) {
      toast.error('AI summary failed — check server logs');
      console.error('AI Summary error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setChatResponse(data.response || 'No response');
    } catch (error) {
      toast.error('Chat failed — check server logs');
      console.error('AI Chat error:', error);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {isPending && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <p className="text-3xl text-cyan-400 animate-pulse">Processing...</p>
        </div>
      )}
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white pt-20 px-4">
        <div className="max-w-7xl mx-auto space-y-20 py-12">
          {!isConnected ? (
            <div className="text-center space-y-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">
                Cogni Dashboard
              </h1>
              <p className="text-2xl text-gray-300">Connect wallet to access tools</p>
              <button onClick={() => open()} className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-orange-600 to-cyan-600 rounded-2xl shadow-2xl hover:scale-105 transition">
                CONNECT WALLET
              </button>
            </div>
          ) : isWrongChain ? (
            <div className="text-center space-y-8">
              <h1 className="text-5xl font-bold text-red-500">Wrong Network</h1>
              <p className="text-xl">Switch to Base chain</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                <StatCard title="Wallet Balance">
                  <span ref={walletBalanceRef}>0.00</span> $COG
                </StatCard>
                <StatCard title="Staked Amount">
                  <span ref={stakedAmountRef}>{stakedAmount.toFixed(2)}</span> $COG
                </StatCard>
                <StatCard title="Current Tier">
                  {stakedTierImage && <Image src={stakedTierImage} alt={stakedTierName} width={80} height={80} className="mx-auto mb-4" />}
                  <p className="text-2xl text-center">{stakedTierName}</p>
                  {stakedTier === 'none' && (
                    <p className="text-sm text-gray-400 text-center mt-2">Stake 10k+ $COG to unlock</p>
                  )}
                </StatCard>
                <StatCard title="Badge NFT">
                  {nftBalance > 0 ? (
                    <>
                      <Image src={stakedTierImage || '/observer.png'} alt="Badge" width={100} height={100} className="mx-auto" />
                      <p className="text-green-400 text-center mt-4">OWNED</p>
                    </>
                  ) : (
                    <p className="text-center">Not Owned</p>
                  )}
                </StatCard>
              </div>

              {/* Stake / Unstake */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
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

              {/* Observer Badge NFT */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Observer Badge NFT
                </h2>
                <div className="flex justify-center gap-12 flex-wrap">
                  <button
                    onClick={handleMintObserver}
                    disabled={!isEligibleForBadge || nftBalance > 0 || isPending}
                    className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl shadow-xl hover:scale-105 disabled:opacity-50 transition"
                  >
                    MINT BADGE
                  </button>
                </div>
              </div>

              {/* Token Scanner */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Token Scanner (Any Chain/Token)
                </h2>
                <div className="max-w-3xl mx-auto space-y-6">
                  <select value={selectedChainId} onChange={(e) => setSelectedChainId(e.target.value)} className="w-full px-6 py-4 bg-gray-800 rounded-xl">
                    {SUPPORTED_CHAINS.map((c) => (
                      <option key={c.value} value={c.value}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Enter any token contract address"
                    value={scanAddress}
                    onChange={(e) => setScanAddress(e.target.value.trim())}
                    className="w-full px-6 py-4 bg-gray-800 rounded-xl text-center"
                  />
                  <button
                    onClick={handleScan}
                    disabled={scanLoading || !scanAddress}
                    className="w-full py-5 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-xl hover:scale-105 disabled:opacity-50 transition"
                  >
                    {scanLoading ? 'Scanning...' : 'SCAN TOKEN 🔍'}
                  </button>
                </div>
                {scanResult && !scanResult.error && (
                  <>
                    <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-6">
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

              {/* AI Chat */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl">
                <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  Ask the Degen AI
                </h2>
                <div className="max-w-3xl mx-auto space-y-6">
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-800 rounded-xl"
                  />
                  <button onClick={handleChatSubmit} disabled={chatLoading || !chatInput} className="w-full py-5 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl hover:scale-105 disabled:opacity-50 transition">
                    {chatLoading ? 'Thinking...' : 'ASK AI 🧠'}
                  </button>
                  {chatResponse && (
                    <div className="mt-8 bg-gray-800/80 p-6 rounded-xl">
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