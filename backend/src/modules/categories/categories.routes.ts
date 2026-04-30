import { Router } from "express";
import { getCategories } from "./categories.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getCategories);

export default router;