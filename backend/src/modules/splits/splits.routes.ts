import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { markSplitAsPaid } from "../bills/bills.controller";

const router = Router();

router.patch("/:splitId/pay", authMiddleware, markSplitAsPaid);

export default router;