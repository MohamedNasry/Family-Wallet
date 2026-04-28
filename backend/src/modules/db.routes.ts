import { Router, Request, Response } from "express";
import pool from "../config/db";

const router = Router();

router.get("/db-test", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "Database query successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database query failed",
    });
  }
});

export default router;