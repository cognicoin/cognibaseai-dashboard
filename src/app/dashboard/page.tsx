// src/app/dashboard/page.tsx
'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

const TOKEN_ADDRESS = '0xaF4b5982BC89201551f1eD2518775a79a2705d47' as `0x${string}`
const STAKING_ADDRESS = '0x75B226DBee2858885f2E168F85024b883B460744' as `0x${string}`
const NFT_ADDRESS = '0x002b9FFdDaeCb48f76e6Fa284907b5ee87970bAa' as `0x${string}`

const tokenABI = [
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

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
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'requestUnstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'completeUnstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

const nftABI = [
  {
    inputs: [],
    name: 'mintObserver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export default function Dashboard() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeLoading, setUnstakeLoading] = useState(false)
  const [txHistory, setTxHistory] = useState<{ type: string; amount?: string; timestamp: number }[]>([])

  const [scanInput, setScanInput] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [scanRateInfo, setScanRateInfo] = useState<any>(null)

  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatResponse, setChatResponse] = useState('')
  const [chatRateInfo, setChatRateInfo] = useState<any>(null)

  const { data: tokenBalance } = useBalance({ address, token: TOKEN_ADDRESS })

  const { data: stakedInfo } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'getStakeInfo',
    args: address ? [address] : undefined,
  }) as { data: [bigint, bigint, number, boolean] | undefined }

  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    if (address) {
      const interval = setInterval(() => {}, 30000)
      return () => clearInterval(interval)
    }
  }, [address])

  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return toast.error('Enter valid amount')
    try {
      await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: tokenABI,
        functionName: 'approve',
        args: [STAKING_ADDRESS, parseEther(stakeAmount)],
      })
      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: stakingABI,
        functionName: 'stake',
        args: [parseEther(stakeAmount)],
      })
      setTxHistory((prev) => [...prev, { type: 'Stake', amount: stakeAmount, timestamp: Date.now() }])
      toast.success('Staked successfully!')
      setStakeAmount('')
    } catch (err: any) {
      toast.error(err.shortMessage || 'Stake failed')
    }
  }

  const handleRequestUnstake = async () => {
    try {
      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: stakingABI,
        functionName: 'requestUnstake',
      })
      toast.success('Unstake requested (72h cooldown)')
      setTxHistory((prev) => [...prev, { type: 'Request Unstake', timestamp: Date.now() }])
    } catch (err: any) {
      toast.error(err.shortMessage || 'Request failed')
    }
  }

  const handleCompleteUnstake = async () => {
    setUnstakeLoading(true)
    try {
      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: stakingABI,
        functionName: 'completeUnstake',
      })
      toast.success('Unstake completed!')
      setTxHistory((prev) => [...prev, { type: 'Complete Unstake', timestamp: Date.now() }])
    } catch (err: any) {
      toast.error(err.shortMessage || 'Complete failed')
    } finally {
      setUnstakeLoading(false)
    }
  }

  const handleMintBadge = async () => {
    try {
      await writeContractAsync({
        address: NFT_ADDRESS,
        abi: nftABI,
        functionName: 'mintObserver',
      })
      toast.success('Observer badge minted!')
    } catch (err: any) {
      toast.error(err.shortMessage || 'Mint failed')
    }
  }

  const handleScan = async () => {
    if (!scanInput.trim()) return toast.error('Enter token address')
    setScanLoading(true)
    setScanResult(null)
    setScanRateInfo(null)

    try {
      const res = await fetch('/api/token-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId: '8453', address: scanInput.trim(), wallet: address }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setScanRateInfo(data.rate)
          return toast.error(`Rate limit: ${data.rate?.remaining || 0} remaining`)
        }
        throw new Error(data.error || 'Scan failed')
      }

      setScanResult(data)
      setScanRateInfo(data.rate)
      toast.success('Scan complete!')
    } catch (err: any) {
      toast.error(err.message || 'Token scan failed')
    } finally {
      setScanLoading(false)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return toast.error('Type a message')
    setChatLoading(true)
    setChatResponse('')
    setChatRateInfo(null)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput.trim(), wallet: address }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setChatRateInfo(data.rate)
          return toast.error(`Rate limit: ${data.rate?.remaining || 0} remaining`)
        }
        throw new Error(data.error || 'Chat failed')
      }

      setChatResponse(data.response)
      setChatRateInfo(data.rate)
    } catch (err: any) {
      toast.error(err.message || 'AI chat failed')
    } finally {
      setChatLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center px-4">
        <Navbar />
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
            Cogni Dashboard
          </h1>
          <button
            onClick={() => open()}
            className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-xl font-bold hover:scale-105 transition shadow-2xl"
          >
            Connect Wallet
          </button>
        </div>
      </main>
    )
  }

  const stakedAmount = stakedInfo ? formatEther(stakedInfo[0]) : '0'
  const canUnstake = stakedInfo?.[3] ?? false

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white pb-20">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        {/* Placeholder Tier Status */}
        <div className="mb-12">
          <TierStatus />
        </div>

        {/* Rate Limit Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <RateLimitCountdown rateInfo={scanRateInfo} title="Token Scanner" />
          <RateLimitCountdown rateInfo={chatRateInfo} title="AI Chat" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Staking */}
          <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-cyan-500/30 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
              Stake Management
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <p className="text-gray-400 mb-2">Wallet Balance</p>
                <p className="text-2xl font-bold">
                  {tokenBalance ? Number(formatEther(tokenBalance.value)).toFixed(2) : <Skeleton width={140} />}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <p className="text-gray-400 mb-2">Staked Amount</p>
                <p className="text-2xl font-bold">{stakedAmount} $COG</p>
              </div>
            </div>

            <div className="space-y-5">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount to stake"
                className="w-full px-6 py-4 bg-gray-800/70 rounded-xl border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                onClick={handleStake}
                disabled={!stakeAmount}
                className="w-full py-5 bg-gradient-to-r from-orange-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 shadow-lg"
              >
                Stake Now
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  onClick={handleRequestUnstake}
                  className="py-5 bg-gradient-to-r from-pink-700 to-purple-700 rounded-xl font-bold hover:scale-105 transition shadow-lg"
                >
                  Request Unstake
                </button>
                <button
                  onClick={handleCompleteUnstake}
                  disabled={!canUnstake || unstakeLoading}
                  className="py-5 bg-gradient-to-r from-red-700 to-orange-700 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 shadow-lg"
                >
                  {unstakeLoading ? 'Processing...' : 'Complete Unstake'}
                </button>
              </div>

              <button
                onClick={handleMintBadge}
                className="w-full py-5 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl font-bold hover:scale-105 transition shadow-lg"
              >
                Mint Observer Badge NFT
              </button>
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-8">
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-cyan-500/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Token Scanner
              </h2>
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="0x... token address (Base)"
                className="w-full px-6 py-4 mb-5 bg-gray-800/70 rounded-xl border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                onClick={handleScan}
                disabled={scanLoading || !scanInput.trim()}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 shadow-lg"
              >
                {scanLoading ? 'Scanning...' : 'SCAN TOKEN'}
              </button>

              <RateLimitCountdown rateInfo={scanRateInfo} title="Token Scanner" />

              {scanResult && (
                <div className="mt-8 p-6 bg-gray-800/60 rounded-2xl border border-cyan-500/20 max-h-96 overflow-auto text-sm">
                  <pre className="whitespace-pre-wrap text-gray-200">{JSON.stringify(scanResult, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-cyan-500/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Ask Degen AI
              </h2>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about crypto..."
                className="w-full px-6 py-4 mb-5 bg-gray-800/70 rounded-xl border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                onClick={handleChatSubmit}
                disabled={chatLoading || !chatInput.trim()}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 shadow-lg"
              >
                {chatLoading ? 'Thinking...' : 'ASK AI'}
              </button>

              <RateLimitCountdown rateInfo={chatRateInfo} title="AI Chat" />

              {chatResponse && (
                <div className="mt-8 p-6 bg-gray-800/60 rounded-2xl border border-purple-500/20">
                  <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">{chatResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-12 bg-gray-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-cyan-500/30 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
            Activity Log
          </h2>
          {txHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No activity yet</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {txHistory.map((tx, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-800/50 p-5 rounded-xl border-l-4 border-cyan-500/40"
                >
                  <div>
                    <p className="font-medium">{tx.type}</p>
                    {tx.amount && <p className="text-cyan-300 text-sm">{tx.amount} $COG</p>}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}