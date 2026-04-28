import express from "express";

import authRoutes from "./modules/auth/auth.routes";
import mock_bank from "./modules/mockBank/mockBank.routes"

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/mock-bank", mock_bank)

export default app;