import { Router } from "express";
import {
  register,
  login,
  me,
  parentOnly,
  joinWithInvite,
} from "./auth.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);


router.post("/login-with-invite", joinWithInvite);

router.get("/me", authMiddleware, me);

router.get(
  "/parent-only",
  authMiddleware,
  requireRole("PARENT"),
  parentOnly
);

export default router;