import express from "express";

import authRoutes from "./modules/auth/auth.routes";
import mock_bank from "./modules/mockBank/mockBank.routes";
import familyRoutes from "./modules/families/family.routes";
import billRoutes from "./modules/bills/bills.routes";
import splitRoutes from "./modules/splits/splits.routes";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(
    cors({
      origin: ["http://localhost:8081", "http://localhost:19006"],
      credentials: true,
    })
  );
  

app.use("/uploads", express.static("uploads"));

app.use("/api/bills", billRoutes);
app.use("/api/splits", splitRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/mock-bank", mock_bank);
app.use("/api/families", familyRoutes);

export default app;