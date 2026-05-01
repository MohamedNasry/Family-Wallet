import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  accountsInfo,
  charge,
  refund,
  createBankAccountService,
} from "./mockBank.service";

export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const { bankName, cardNumber, isDefault, balance } = req.body;

    if (!bankName || !cardNumber) {
      return res.status(400).json({
        success: false,
        message: "bankName and cardNumber are required",
      });
    }

    const account = await createBankAccountService({
      userId: req.user.userId,
      bankName,
      cardNumber,
      isDefault: Boolean(isDefault),
      balance: balance !== undefined ? Number(balance) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Bank account created successfully",
      account,
    });
  } catch (error: any) {
    if (error.message === "INVALID_CARD_NUMBER") {
      return res.status(400).json({
        success: false,
        message: "Invalid card number",
      });
    }

    if (error.message === "INVALID_BALANCE") {
      return res.status(400).json({
        success: false,
        message: "Balance must be greater than or equal to 0",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create bank account",
    });
  }
};

export const getAccountInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const accounts = await accountsInfo({
      requestedUserId: userId,
      authUserId: req.user.userId,
      authWalletId: req.user.walletId,
      authRole: req.user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      accounts,
    });
  } catch (error: any) {
    if (error.message === "NO_PERMISSION") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access these accounts",
      });
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (error.message === "NO_BANK_ACCOUNTS_FOUND") {
      return res.status(404).json({
        success: false,
        message: "No bank accounts found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch account info",
    });
  }
};




export const postCharge = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const bankAccountID = Number(req.body.bankAccountID);
    const billID = Number(req.body.billID);
    const cost = Number(req.body.cost);

    // جديد: اختياري
    const splitID = req.body.splitID ? Number(req.body.splitID) : null;

    if (!bankAccountID || Number.isNaN(bankAccountID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bankAccountID",
      });
    }

    if (!billID || Number.isNaN(billID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billID",
      });
    }

    if (!cost || Number.isNaN(cost) || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cost",
      });
    }

    if (req.body.splitID && (!splitID || Number.isNaN(splitID))) {
      return res.status(400).json({
        success: false,
        message: "Invalid splitID",
      });
    }

    const result = await charge({
      authUserId: req.user.userId,
      bankAccountID,
      billID,
      cost,
      splitID,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "BANK_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    if (error.message === "BILL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (error.message === "SPLIT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Split not found for this user",
      });
    }

    if (error.message === "SPLIT_ALREADY_PAID") {
      return res.status(400).json({
        success: false,
        message: "This split is already paid",
      });
    }

    if (error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to charge payment",
      error: error.message,
    });
  }
};

export const postRefund = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const bankAccountID = Number(req.body.bankAccountID);
    const billID = Number(req.body.billID);
    const cost = Number(req.body.cost);
    const splitID = req.body.splitID ? Number(req.body.splitID) : null;

    if (!bankAccountID || Number.isNaN(bankAccountID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bankAccountID",
      });
    }

    if (!billID || Number.isNaN(billID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billID",
      });
    }

    if (!cost || Number.isNaN(cost) || cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cost",
      });
    }

    const result = await refund({
      authUserId: req.user.userId,
      bankAccountID,
      billID,
      cost,
      splitID,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "BANK_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    if (error.message === "BILL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to refund payment",
    });
  }
};