import { Router } from "express";
import {
  addTransaction,
  getChain,
  mine,
  verify,
} from "../controllers/blockchainController.js";

const apiRouter = Router();

apiRouter.get("/chain", getChain);
apiRouter.post("/transactions", addTransaction);
apiRouter.post("/mine", mine);
apiRouter.get("/verify/:id", verify);

export default apiRouter;
