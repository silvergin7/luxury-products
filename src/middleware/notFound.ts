import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/HttpError.js";

export function notFound(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new HttpError(404, "Not found"));
}
