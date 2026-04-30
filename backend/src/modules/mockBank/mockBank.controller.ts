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

    const { bankAccountID, billID, cost } = req.body;

    if (
      bankAccountID === undefined ||
      billID === undefined ||
      cost === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "bankAccountID, billID and cost are required",
      });
    }

    const parsedBankAccountID = Number(bankAccountID);
    const parsedBillID = Number(billID);
    const parsedCost = Number(cost);

    if (
      !parsedBankAccountID ||
      !parsedBillID ||
      Number.isNaN(parsedCost) ||
      parsedCost <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input values",
      });
    }

    const data = await charge({
      userId: req.user.userId,
      walletId: req.user.walletId,
      bankAccountId: parsedBankAccountID,
      billId: parsedBillID,
      cost: parsedCost,
    });

    return res.status(201).json({
      success: true,
      message: "Charge completed successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

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
      message: "Charge failed",
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

    const { paymentID, bankAccountID } = req.body;

    if (paymentID === undefined || bankAccountID === undefined) {
      return res.status(400).json({
        success: false,
        message: "paymentID and bankAccountID are required",
      });
    }

    const parsedPaymentID = Number(paymentID);
    const parsedBankAccountID = Number(bankAccountID);

    if (!parsedPaymentID || !parsedBankAccountID) {
      return res.status(400).json({
        success: false,
        message: "Invalid input values",
      });
    }

    const data = await refund({
      userId: req.user.userId,
      paymentId: parsedPaymentID,
      bankAccountId: parsedBankAccountID,
    });

    return res.status(200).json({
      success: true,
      message: "Refund completed successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "PAYMENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (error.message === "BANK_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    if (error.message === "NO_PERMISSION") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to refund this payment",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Refund failed",
    });
  }
};