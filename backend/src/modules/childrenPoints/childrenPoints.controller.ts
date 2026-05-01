import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  childPointsData,
  topUpPoints,
  createSpendPointsApproval,
  transactionHistory,
} from "./childrenPoints.service";

export const getChildPointsData = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const childId = Number(req.params.childId);

    if (!childId || Number.isNaN(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childId",
      });
    }

    const data = await childPointsData({
      childId,
      authUserId: req.user.userId,
      authWalletId: req.user.walletId,
      authRole: req.user.role,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    if (error.message === "NO_PERMISSION") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this child points wallet",
      });
    }

    if (error.message === "CHILD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (error.message === "POINTS_WALLET_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Points wallet not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get child points data",
    });
  }
};

export const postTopUpPoints = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const childId = Number(req.body.childId);
    const points = Number(req.body.points);

    if (!childId || Number.isNaN(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childId",
      });
    }

    if (
      !points ||
      Number.isNaN(points) ||
      !Number.isInteger(points) ||
      points <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "points must be a positive integer",
      });
    }

    const result = await topUpPoints({
      childId,
      parentUserId: req.user.userId,
      parentWalletId: req.user.walletId,
      points,
    });

    return res.status(200).json({
      success: true,
      message: "Points topped up successfully",
      ...result,
    });
  } catch (error: any) {
    if (error.message === "NO_PERMISSION" || error.message === "UNAUTHORIZED") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to top up this child wallet",
      });
    }

    if (error.message === "CHILD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (error.message === "POINTS_WALLET_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Points wallet not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to top up points",
    });
  }
};

export const postSpendPoints = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const { childId, points, title } = req.body;

    const parsedPoints = Number(points);
    const parsedChildId = childId ? Number(childId) : req.user.userId;

    if (!parsedChildId || Number.isNaN(parsedChildId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childId",
      });
    }

    if (
      !parsedPoints ||
      Number.isNaN(parsedPoints) ||
      !Number.isInteger(parsedPoints) ||
      parsedPoints <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "points must be a positive integer",
      });
    }

    const data = await createSpendPointsApproval({
      authUserId: req.user.userId,
      authWalletId: req.user.walletId,
      authRole: req.user.role,
      childId: parsedChildId,
      points: parsedPoints,
      title: title ? String(title) : null,
    });

    return res.status(201).json({
      success: true,
      message: "Spend points approval request created successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "NO_PERMISSION") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create this request",
      });
    }

    if (error.message === "CHILD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (error.message === "POINTS_WALLET_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Points wallet not found",
      });
    }

    if (error.message === "INSUFFICIENT_POINTS") {
      return res.status(400).json({
        success: false,
        message: "Insufficient points",
      });
    }

    if (error.message === "PARENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    if (error.message === "FAMILY_WALLET_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Family wallet not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create spend points approval request",
    });
  }
};

export const getTransactionHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const childId = Number(req.params.childId);

    if (!childId || Number.isNaN(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid childId",
      });
    }

    const transactions = await transactionHistory({
      childId,
      authUserId: req.user.userId,
      authWalletId: req.user.walletId,
      authRole: req.user.role,
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error: any) {
    if (error.message === "NO_PERMISSION") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access these transactions",
      });
    }

    if (error.message === "CHILD_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (error.message === "NO_TRANSACTIONS_FOUND") {
      return res.status(404).json({
        success: false,
        message: "No transactions found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get transaction history",
    });
  }
};