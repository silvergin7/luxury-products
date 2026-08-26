import { createHash } from "node:crypto";
import type { Transaction } from "../models/Transaction.js";

export class Block {
  index: number;
  timestamp: number;
  data: Transaction[];
  previousHash: string;
  nonce: number;
  hash: string;

  constructor(
    index: number,
    timestamp: number,
    data: Transaction[],
    previousHash: string
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    const data = this.data.map((tx) => ({
      serialNumber: tx.serialNumber,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      timestamp: tx.timestamp,
    }));

    const blockContent = {
      index: this.index,
      timestamp: this.timestamp,
      data,
      previousHash: this.previousHash,
      nonce: this.nonce,
    };

    return createHash("sha256")
      .update(JSON.stringify(blockContent))
      .digest("hex");
  }

  mineBlock(difficulty: number): void {
    const target = "0".repeat(difficulty);

    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}
