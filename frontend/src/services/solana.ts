import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed');
  }

  async verifyTokenMint(mintAddress: string): Promise<boolean> {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      await getMint(this.connection, mintPubkey);
      return true;
    } catch (error) {
      console.error('Error verifying token mint:', error);
      return false;
    }
  }

  async getTokenInfo(mintAddress: string) {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await getMint(this.connection, mintPubkey);
      
      return {
        address: mintAddress,
        decimals: mintInfo.decimals,
        supply: mintInfo.supply.toString(),
      };
    } catch (error) {
      throw new Error('Failed to fetch token information');
    }
  }
}

export const solanaService = new SolanaService();

