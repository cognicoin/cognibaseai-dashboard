// src/lib/unlock.ts
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org'

const publicLockAbi = [
  {
    type: 'function',
    name: 'getHasValidKey',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'keyExpirationTimestampFor',
    stateMutability: 'view',
    inputs: [{ name: '_keyOwner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

const client = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
})

export const LOCKS = {
  'observer+': '0xeE2751a38e66BF0F88BeBE461e5699C5b8986310' as `0x${string}`,
  analyst: '0xc90b353BDcfF5F5A31cc257434aDB48Fb5C4cf51' as `0x${string}`,
  architect: '0xE00b66e2c5992AdA5550bA719ab46e0591C8c7aE' as `0x${string}`,
} as const

export type PaidTier = keyof typeof LOCKS | null

export async function getValidPaidTier(user: `0x${string}`): Promise<PaidTier> {
  const tiers = ['architect', 'analyst', 'observer+'] as const

  for (const tier of tiers) {
    const lock = LOCKS[tier]
    try {
      const [hasKey, expiry] = await client.multicall({
        contracts: [
          { address: lock, abi: publicLockAbi, functionName: 'getHasValidKey', args: [user] },
          { address: lock, abi: publicLockAbi, functionName: 'keyExpirationTimestampFor', args: [user] },
        ],
      })

      if (hasKey.result === true && Number(expiry.result) > Math.floor(Date.now() / 1000)) {
        return tier
      }
    } catch (err) {
      console.warn(`Failed to check ${tier} lock for ${user}:`, err)
    }
  }

  return null
}

export async function getKeyExpiry(lockAddress: `0x${string}`, user: `0x${string}`): Promise<number> {
  try {
    const expiry = await client.readContract({
      address: lockAddress,
      abi: publicLockAbi,
      functionName: 'keyExpirationTimestampFor',
      args: [user],
    })
    return Number(expiry)
  } catch {
    return 0
  }
}