import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  splitBillService,
  getBillSplitsService,
  markSplitAsPaidService,
  processBillOcrService,
  confirmOcrBillService,
  createBillService,
  getBillsService,
  getBillsSummaryService,
} from "./bills.service";



export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const {
      title,
      totalAmount,
      currency,
      categoryId,
      billDate,
      items,
    } = req.body;

    if (!title || totalAmount === undefined || !currency) {
      return res.status(400).json({
        success: false,
        message: "title, totalAmount and currency are required",
      });
    }

    const data = await createBillService({
      walletId: req.user.walletId,
      userId: req.user.userId,
      title,
      totalAmount: Number(totalAmount),
      currency,
      categoryId: categoryId ? Number(categoryId) : null,
      billDate: billDate || null,
      items: Array.isArray(items) ? items : [],
    });

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "INVALID_TOTAL_AMOUNT") {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount",
      });
    }

    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Category not found in this family wallet",
      });
    }

    if (error.message === "INVALID_ITEMS") {
      return res.status(400).json({
        success: false,
        message: "Invalid bill items",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create bill",
    });
  }
};


export const splitBill = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const billId = Number(req.params.billId);
    const { splitType, participants } = req.body;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill id",
      });
    }

    if (!splitType || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: "splitType and participants are required",
      });
    }

    const data = await splitBillService({
      billId,
      walletId: req.user.walletId,
      splitType,
      participants,
    });

    return res.status(201).json({
      success: true,
      message: "Bill split created successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "BILL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (error.message === "INVALID_SPLIT_TYPE") {
      return res.status(400).json({
        success: false,
        message: "Invalid split type",
      });
    }

    if (error.message === "INVALID_PARTICIPANTS") {
      return res.status(400).json({
        success: false,
        message: "Invalid participants",
      });
    }

    if (error.message === "USERS_NOT_IN_WALLET") {
      return res.status(403).json({
        success: false,
        message: "All participants must belong to this family wallet",
      });
    }

    if (error.message === "INVALID_PERCENTAGE_TOTAL") {
      return res.status(400).json({
        success: false,
        message: "Percentages must total 100",
      });
    }

    if (error.message === "INVALID_FIXED_TOTAL") {
      return res.status(400).json({
        success: false,
        message: "Fixed amounts must equal bill total amount",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to split bill",
    });
  }
};

export const getBillSplits = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const billId = Number(req.params.billId);

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill id",
      });
    }

    const splits = await getBillSplitsService(billId, req.user.walletId);

    return res.status(200).json({
      success: true,
      count: splits.length,
      splits,
    });
  } catch (error: any) {
    if (error.message === "BILL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get bill splits",
    });
  }
};

export const markSplitAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const splitId = Number(req.params.splitId);

    if (!splitId) {
      return res.status(400).json({
        success: false,
        message: "Invalid split id",
      });
    }

    const split = await markSplitAsPaidService({
      splitId,
      walletId: req.user.walletId,
      userId: req.user.userId,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Split marked as paid",
      split,
    });
  } catch (error: any) {
    if (error.message === "SPLIT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Split not found",
      });
    }

    if (error.message === "NO_PERMISSION") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this split",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update split status",
    });
  }
};

export const processBillOcr = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Bill image is required",
      });
    }

    const data = await processBillOcrService({
      file: req.file,
      userId: req.user.userId,
      walletId: req.user.walletId,
    });

    return res.status(201).json({
      success: true,
      message: "OCR processed successfully",
      ...data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process OCR",
    });
  }
};


export const confirmOcrBill = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const ocrId = Number(req.params.ocrId);

    if (!ocrId) {
      return res.status(400).json({
        success: false,
        message: "Invalid OCR id",
      });
    }

    const {
      title,
      totalAmount,
      currency,
      categoryId,
      billDate,
    } = req.body;

    if (!title || totalAmount === undefined || !currency) {
      return res.status(400).json({
        success: false,
        message: "title, totalAmount and currency are required",
      });
    }

    const data = await confirmOcrBillService({
      ocrId,
      walletId: req.user.walletId,
      userId: req.user.userId,
      title,
      totalAmount,
      currency,
      categoryId: categoryId ? Number(categoryId) : null,
      billDate: billDate || null,
    });

    return res.status(201).json({
      success: true,
      message: "Bill created successfully after OCR confirmation",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "OCR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "OCR draft not found",
      });
    }

    if (error.message === "OCR_ALREADY_CONFIRMED") {
      return res.status(409).json({
        success: false,
        message: "This OCR draft has already been confirmed",
      });
    }
    if (error.message === "INVALID_CURRENCY") {
      return res.status(400).json({
        success: false,
        message: "Invalid currency",
      });
    }
    
    if (error.message === "INVALID_TOTAL_AMOUNT") {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount",
      });
    }
    
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Category not found in this family wallet",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to confirm OCR bill",
    });
  }
};


export const getBills = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const {
      categoryId,
      status,
      source,
      fromDate,
      toDate,
      limit,
    } = req.query;

    const bills = await getBillsService({
      walletId: req.user.walletId,
      categoryId: categoryId ? Number(categoryId) : null,
      status: status ? String(status) : null,
      source: source ? String(source) : null,
      fromDate: fromDate ? String(fromDate) : null,
      toDate: toDate ? String(toDate) : null,
      limit: limit ? Number(limit) : 20,
    });

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to get bills",
    });
  }
};

export const getBillsSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const summary = await getBillsSummaryService({
      walletId: req.user.walletId,
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to get bills summary",
    });
  }
};