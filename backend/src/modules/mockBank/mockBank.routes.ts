import { Router } from "express";
import { getAccountInfo, postCharge, postRefund} from "./mockBank.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/accounts/:userId", authMiddleware,getAccountInfo);
router.post("/charge", authMiddleware,postCharge);
router.post("/refund", authMiddleware,postRefund);


export default router;