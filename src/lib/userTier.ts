// src/lib/userTier.ts
import { PlanName } from '@/lib/rateLimit'
import { getValidPaidTier, PaidTier } from '@/lib/unlock'
import { createPublicClient, http, parseEther } from 'viem'
import { base } from 'viem/chains'

const STAKING_ADDRESS = '0x75B226DBee2858885f2E168F85024b883B460744' as `0x${string}`

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
})

const stakingABI = [
  {
    inputs: [],
    name: 'OBSERVER_THRESHOLD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ANALYST_THRESHOLD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ARCHITECT_THRESHOLD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
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
] as const

export async function getThresholds() {
  try {
    const [observer, analyst, architect] = await publicClient.multicall({
      contracts: [
        { address: STAKING_ADDRESS, abi: stakingABI, functionName: 'OBSERVER_THRESHOLD' },
        { address: STAKING_ADDRESS, abi: stakingABI, functionName: 'ANALYST_THRESHOLD' },
        { address: STAKING_ADDRESS, abi: stakingABI, functionName: 'ARCHITECT_THRESHOLD' },
      ],
    })

    return {
      observer: observer.result ?? parseEther('10000'),
      analyst: analyst.result ?? parseEther('100000'),
      architect: architect.result ?? parseEther('1000000'),
    }
  } catch {
    return {
      observer: parseEther('10000'),
      analyst: parseEther('100000'),
      architect: parseEther('1000000'),
    }
  }
}

export function getBaseTierFromStake(amount: bigint, thresholds: { observer: bigint; analyst: bigint; architect: bigint }): PlanName {
  if (amount >= thresholds.architect) return 'architect'
  if (amount >= thresholds.analyst) return 'analyst'
  if (amount >= thresholds.observer) return 'observer'
  return 'free'
}

export async function getEffectivePlan(wallet: `0x${string}` | undefined): Promise<{
  plan: PlanName
  baseTier: PlanName
  paidTier: PaidTier
  expiry?: number
}> {
  if (!wallet) return { plan: 'observer', baseTier: 'free', paidTier: null }

  try {
    const thresholds = await getThresholds()

    const stakeInfo = await publicClient.readContract({
      address: STAKING_ADDRESS,
      abi: stakingABI,
      functionName: 'getStakeInfo',
      args: [wallet],
    }) as [bigint, bigint, number, boolean]

    const stakedAmount = stakeInfo[0]
    const baseTier = getBaseTierFromStake(stakedAmount, thresholds)

    const paidTier = await getValidPaidTier(wallet)
    let expiry: number | undefined

    if (paidTier) {
      expiry = await getKeyExpiry(LOCKS[paidTier], wallet)
    }

    const plan = paidTier || baseTier

    return { plan: plan as PlanName, baseTier, paidTier, expiry }
  } catch (error) {
    console.error('getEffectivePlan error:', error)
    return { plan: 'observer', baseTier: 'free', paidTier: null }
  }
}