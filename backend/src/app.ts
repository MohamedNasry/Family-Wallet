import express from "express";

import authRoutes from "./modules/auth/auth.routes";
import mockBankRouter from "./modules/mockBank/mockBank.routes";
import familyRoutes from "./modules/families/family.routes";
import billRoutes from "./modules/bills/bills.routes";
import splitRoutes from "./modules/splits/splits.routes";
import pointsRoutes from "./modules/childrenPoints/childrenPoints.routes";


const app = express();

app.use(express.json());



app.use("/uploads", express.static("uploads"));

app.use("/api/bills", billRoutes);
app.use("/api/splits", splitRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/mock-bank", mockBankRouter);
app.use("/api/families", familyRoutes);
app.use("/api/points", pointsRoutes);

export default app;