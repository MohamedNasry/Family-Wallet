import { Router } from "express";
import {
  getMyFamily,
  getFamilyMembers,
} from "./family.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/my-family", authMiddleware, getMyFamily);

router.get("/:familyId/members", authMiddleware, getFamilyMembers);

export default router;