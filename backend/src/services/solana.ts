import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, getAccount } from '@solana/spl-token';

export class SolanaService {
  private connection: Connection;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Verify if a token mint address is valid
   */
  async verifyTokenMint(mintAddress: string): Promise<boolean> {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await getMint(this.connection, mintPubkey);
      return mintInfo !== null;
    } catch (error) {
      console.error('Error verifying token mint:', error);
      return false;
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(mintAddress: string) {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await getMint(this.connection, mintPubkey);
      
      return {
        address: mintAddress,
        decimals: mintInfo.decimals,
        supply: mintInfo.supply.toString(),
        mintAuthority: mintInfo.mintAuthority?.toString() || null,
        freezeAuthority: mintInfo.freezeAuthority?.toString() || null,
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw new Error('Failed to fetch token information');
    }
  }

  /**
   * Verify wallet address
   */
  async verifyWalletAddress(address: string): Promise<boolean> {
    try {
      const pubkey = new PublicKey(address);
      return PublicKey.isOnCurve(pubkey.toBytes());
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<number> {
    try {
      const pubkey = new PublicKey(address);
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  /**
   * Get token account balance
   */
  async getTokenBalance(walletAddress: string, tokenMint: string): Promise<string> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(tokenMint);
      
      // This is a simplified version - in production you'd need to find the associated token account
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: mintPubkey }
      );

      if (tokenAccounts.value.length === 0) {
        return '0';
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }
}

export const solanaService = new SolanaService();

