import { Router } from "express";
import {
  getApprovals,
  approveApproval,
  declineApproval,
  getBlockedCategories,
  updateBlockedCategory,
} from "./parental.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/approvals",
  authMiddleware,
  requireRole("PARENT"),
  getApprovals
);

router.patch(
  "/approvals/:id/approve",
  authMiddleware,
  requireRole("PARENT"),
  approveApproval
);

router.patch(
  "/approvals/:id/decline",
  authMiddleware,
  requireRole("PARENT"),
  declineApproval
);

router.get(
  "/blocked-categories",
  authMiddleware,
  requireRole("PARENT"),
  getBlockedCategories
);

router.patch(
  "/blocked-categories/:categoryId",
  authMiddleware,
  requireRole("PARENT"),
  updateBlockedCategory
);

export default router;