import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError.js";
import { blockchain } from "../engine/blockchainInstance.js";
import type { Transaction } from "../models/Transaction.js";

export function getChain(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    res.status(200).json(blockchain.chain);
  } catch (error) {
    next(error);
  }
}

export function addTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body.serialNumber !== "string" ||
      typeof body.fromAddress !== "string" ||
      typeof body.toAddress !== "string" ||
      !Number.isFinite(body.timestamp)
    ) {
      throw new HttpError(400, "Invalid request body");
    }

    blockchain.addTransaction({
      serialNumber: body.serialNumber,
      fromAddress: body.fromAddress,
      toAddress: body.toAddress,
      timestamp: body.timestamp,
    });

    const serialNumber = body.serialNumber.trim();
    const pending = blockchain.pendingTransactions.find(
      (tx) => tx.serialNumber === serialNumber
    );

    res.status(201).json(pending);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Invalid transaction fields" ||
        error.message === "Invalid timestamp"
      ) {
        next(new HttpError(400, error.message));
        return;
      }

      if (error.message === "Pending transfer already exists for this product") {
        next(new HttpError(422, error.message));
        return;
      }

      if (error.message === "Only the current owner can transfer this product") {
        next(new HttpError(422, error.message));
        return;
      }
    }

    next(error);
  }
}

export function mine(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const block = blockchain.minePendingTransactions();
    res.status(200).json(block);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "No pending transactions to mine"
    ) {
      next(new HttpError(400, error.message));
      return;
    }

    next(error);
  }
}

export function verify(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const serialNumber = String(req.params.id).trim();
    const history: Transaction[] = [];

    for (const block of blockchain.chain) {
      for (const tx of block.data) {
        if (tx.serialNumber === serialNumber) {
          history.push(tx);
        }
      }
    }

    const pending = blockchain.pendingTransactions.some(
      (tx) => tx.serialNumber === serialNumber
    );

    if (history.length === 0 && !pending) {
      throw new HttpError(404, "Not found");
    }

    const currentOwner =
      history.length > 0 ? history[history.length - 1].toAddress : null;

    res.status(200).json({
      serialNumber,
      currentOwner,
      history,
      pending,
    });
  } catch (error) {
    next(error);
  }
}
