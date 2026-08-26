import { Block } from "./Block.js";
import type { Transaction } from "../models/Transaction.js";

export class Blockchain {
  chain: Block[];
  pendingTransactions: Transaction[];
  difficulty: number;

  constructor() {
    const envDifficulty = Number(process.env.POW_DIFFICULTY);
    this.difficulty =
      Number.isInteger(envDifficulty) && envDifficulty >= 1
        ? envDifficulty
        : 1;

    this.chain = [];
    const genesis = new Block(0, 0, [], "0");
    genesis.mineBlock(this.difficulty);
    this.chain.push(genesis);
    this.pendingTransactions = [];
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction: Transaction): void {
    const serialNumber = transaction.serialNumber?.trim();
    const fromAddress = transaction.fromAddress?.trim();
    const toAddress = transaction.toAddress?.trim();
    const timestamp = transaction.timestamp;

    if (!serialNumber || !fromAddress || !toAddress) {
      throw new Error("Invalid transaction fields");
    }

    if (!Number.isFinite(timestamp)) {
      throw new Error("Invalid timestamp");
    }

    if (
      this.pendingTransactions.some((tx) => tx.serialNumber === serialNumber)
    ) {
      throw new Error("Pending transfer already exists for this product");
    }

    const owner = this.getCurrentOwner(serialNumber);

    if (owner !== null && fromAddress !== owner) {
      throw new Error("Only the current owner can transfer this product");
    }

    this.pendingTransactions.push({
      serialNumber,
      fromAddress,
      toAddress,
      timestamp,
    });
  }

  minePendingTransactions(): Block {
    if (this.pendingTransactions.length === 0) {
      throw new Error("No pending transactions to mine");
    }

    const transactions = this.pendingTransactions.map((tx) => ({
      ...tx,
    }));

    const block = new Block(
      this.chain.length,
      Date.now(),
      transactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [];

    return block;
  }

  isChainValid(): boolean {
    const target = "0".repeat(this.difficulty);

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];

      if (block.hash !== block.calculateHash()) {
        return false;
      }

      if (!block.hash.startsWith(target)) {
        return false;
      }

      if (i > 0 && block.previousHash !== this.chain[i - 1].hash) {
        return false;
      }
    }

    return true;
  }

  private getCurrentOwner(serialNumber: string): string | null {
    let owner: string | null = null;

    for (const block of this.chain) {
      for (const tx of block.data) {
        if (tx.serialNumber === serialNumber) {
          owner = tx.toAddress;
        }
      }
    }

    return owner;
  }
}
