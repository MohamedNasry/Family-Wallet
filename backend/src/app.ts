import express from "express";

import authRoutes from "./modules/auth/auth.routes";
import familyRoutes from "./modules/families/family.routes";


const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/families", familyRoutes);

export default app;