import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { markSplitAsPaid } from "../bills/bills.controller";
import { getMySplits } from "./splits.controller";

const router = Router();

router.patch("/:splitId/pay", authMiddleware, markSplitAsPaid);
router.get("/my", authMiddleware, getMySplits);

export default router;