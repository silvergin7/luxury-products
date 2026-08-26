import express from "express";
import apiRouter from "./routes/api.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();

app.use(express.json());
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
