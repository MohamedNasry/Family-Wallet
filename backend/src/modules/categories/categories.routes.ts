import { Router } from "express";
import { getCategories ,
    createCategory
} from "./categories.controller";
import { authMiddleware,requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getCategories);

router.post(
    "/",
    authMiddleware,
    requireRole("PARENT"),
    createCategory
  );

export default router;