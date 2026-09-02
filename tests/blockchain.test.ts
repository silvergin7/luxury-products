import { test } from "node:test";
import assert from "node:assert/strict";
import { Blockchain } from "../src/engine/Blockchain.js";

process.env.POW_DIFFICULTY = "1";

test("genesis block is mined and valid", () => {
  const blockchain = new Blockchain();
  const genesis = blockchain.chain[0];

  assert.equal(genesis.index, 0);
  assert.equal(genesis.hash.startsWith("0".repeat(blockchain.difficulty)), true);
  assert.equal(genesis.hash, genesis.calculateHash());
});

test("first registration can be mined into a block", () => {
  const blockchain = new Blockchain();

  blockchain.addTransaction({
    serialNumber: "BAG-001",
    fromAddress: "0xMfg",
    toAddress: "0xA",
    timestamp: 1000,
  });

  const block = blockchain.minePendingTransactions();

  assert.equal(block.data.length, 1);
  assert.equal(block.data[0].serialNumber, "BAG-001");
});

test("only the current owner can transfer after mining", () => {
  const blockchain = new Blockchain();

  blockchain.addTransaction({
    serialNumber: "BAG-002",
    fromAddress: "0xMfg",
    toAddress: "0xA",
    timestamp: 1000,
  });
  blockchain.minePendingTransactions();

  assert.throws(
    () => {
      blockchain.addTransaction({
        serialNumber: "BAG-002",
        fromAddress: "0xC",
        toAddress: "0xD",
        timestamp: 2000,
      });
    },
    /Only the current owner can transfer this product/
  );

  assert.doesNotThrow(() => {
    blockchain.addTransaction({
      serialNumber: "BAG-002",
      fromAddress: "0xA",
      toAddress: "0xB",
      timestamp: 3000,
    });
  });
});

test("second pending transfer for same serialNumber throws", () => {
  const blockchain = new Blockchain();

  blockchain.addTransaction({
    serialNumber: "BAG-003",
    fromAddress: "0xMfg",
    toAddress: "0xA",
    timestamp: 1000,
  });

  assert.throws(
    () => {
      blockchain.addTransaction({
        serialNumber: "BAG-003",
        fromAddress: "0xA",
        toAddress: "0xB",
        timestamp: 2000,
      });
    },
    /Pending transfer already exists for this product/
  );
});

test("minePendingTransactions throws when pending is empty", () => {
  const blockchain = new Blockchain();

  assert.throws(
    () => blockchain.minePendingTransactions(),
    /No pending transactions to mine/
  );
});

test("isChainValid is true after a normal mine", () => {
  const blockchain = new Blockchain();

  blockchain.addTransaction({
    serialNumber: "BAG-004",
    fromAddress: "0xMfg",
    toAddress: "0xA",
    timestamp: 1000,
  });
  blockchain.minePendingTransactions();

  assert.equal(blockchain.isChainValid(), true);
});

test("isChainValid is false after changing mined block data", () => {
  const blockchain = new Blockchain();

  blockchain.addTransaction({
    serialNumber: "BAG-005",
    fromAddress: "0xMfg",
    toAddress: "0xA",
    timestamp: 1000,
  });
  blockchain.minePendingTransactions();

  blockchain.chain[1].data[0].toAddress = "hacked";

  assert.equal(blockchain.isChainValid(), false);
});
