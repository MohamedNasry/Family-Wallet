import { Router } from "express";
import { getAccountInfo, postCharge, postRefund, createAccount} 
from "./mockBank.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/accounts", authMiddleware, createAccount);
router.get("/accounts/:userId", authMiddleware,getAccountInfo);
router.post("/charge", authMiddleware,postCharge);
router.post("/refund", authMiddleware,postRefund);


export default router;