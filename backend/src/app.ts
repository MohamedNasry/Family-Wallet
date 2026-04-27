import express from "express";

import dbRoutes from "./routes/db.routes";

const app = express();

app.use(express.json());


app.use("/api", dbRoutes);

export default app;