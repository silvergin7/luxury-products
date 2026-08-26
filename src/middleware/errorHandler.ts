import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError.js";

function isInvalidJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    typeof (error as SyntaxError & { status?: number }).status === "number" &&
    (error as SyntaxError & { status?: number }).status === 400
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isInvalidJsonError(err)) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
