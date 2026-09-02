import { test } from "node:test";
import assert from "node:assert/strict";
import { Block } from "../src/engine/Block.js";

test("same hash when transaction keys were added in different order", () => {
  const tx1 = {
    serialNumber: "WATCH-001",
    fromAddress: "0xMfg",
    toAddress: "0xA",
    timestamp: 1000,
  };
  const tx2 = {
    timestamp: 1000,
    toAddress: "0xA",
    fromAddress: "0xMfg",
    serialNumber: "WATCH-001",
  };

  const block1 = new Block(1, 500, [tx1], "prev");
  const block2 = new Block(1, 500, [tx2], "prev");

  assert.equal(block1.hash, block2.hash);
});

test("mineBlock(1) makes hash start with one zero", () => {
  const block = new Block(1, 500, [], "prev");
  block.mineBlock(1);

  assert.equal(block.hash.startsWith("0"), true);
});

test("hash is 64-character hex after mining", () => {
  const block = new Block(1, 500, [], "prev");
  block.mineBlock(1);

  assert.match(block.hash, /^[0-9a-f]{64}$/);
});
