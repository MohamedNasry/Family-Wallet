import { Router } from "express";
import {
  getChildPointsData,
  postTopUpPoints,
  postSpendPoints,
  getTransactionHistory,
} from "./childrenPoints.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/topup", authMiddleware, requireRole("PARENT"), postTopUpPoints);
router.post("/spend", authMiddleware, postSpendPoints);

router.get("/:childId/transactions", authMiddleware, getTransactionHistory);
router.get("/:childId", authMiddleware, getChildPointsData);

export default router;