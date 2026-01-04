// src/lib/goplus.ts
import axios from 'axios';

export interface GoPlusResult {
  is_contract: boolean;
  contract_name?: string;
  contract_symbol?: string;
  token_age?: number;
  total_supply?: string;
  holder_count?: number;
  transfer_count?: number;
  result: {
    [key: string]: {
      honeypot_deposit_count?: number;
      honeypot_withdraw_count?: number;
      owner_address?: string;
      can_take_back_ownership?: '0' | '1';
      is_proxy?: '0' | '1';
      proxy?: string;
      mintable?: '0' | '1';
      owner_change_balance?: string;
      blocked?: '0' | '1';
      blacklist?: '0' | '1';
      white_list?: '0' | '1';
      hidden_owner?: '0' | '1';
      trusted_score?: number; // 0-100
      simulation?: any;
    };
  };
}

export async function scanToken(chainId: number, tokenAddress: string): Promise<GoPlusResult | null> {
  try {
    const response = await axios.get(
      `https://api.gopluslabs.io/api/v2/token_security/${chainId}?contract_addresses=${tokenAddress}`,
      { timeout: 10000 }
    );
    return response.data.result?.[tokenAddress.toLowerCase()] ? response.data : null;
  } catch (error) {
    console.error('GoPlus API error:', error);
    return null;
  }
}