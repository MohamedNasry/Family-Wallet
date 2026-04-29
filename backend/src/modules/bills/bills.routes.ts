import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createBill,
  splitBill,
  getBillSplits,
  processBillOcr,
  confirmOcrBill,
} from "./bills.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
//process.cwd() يعني root الخاص بالمشروع.
const uploadDir = path.join(process.cwd(), "uploads", "bills");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {//cb معناها callback.
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});//إذا رفع المستخدم صورة أكبر من 5MB، multer سيرفضها.


router.post("/", authMiddleware, createBill);
router.post("/ocr", authMiddleware, upload.single("image"), processBillOcr);

router.post(
  "/ocr/:ocrId/confirm",
  authMiddleware,
  confirmOcrBill
);
router.post("/:billId/split", authMiddleware, splitBill);
router.get("/:billId/splits", authMiddleware, getBillSplits);

export default router;