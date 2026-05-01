import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getApprovalsService,
  approveApprovalService,
  declineApprovalService,
  getBlockedCategoriesService,
  updateBlockedCategoryService,
} from "./parental.service";

export const getApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status ? String(req.query.status) : "PENDING";

    const approvals = await getApprovalsService({
      walletId: req.user!.walletId,
      status,
    });

    return res.status(200).json({
      success: true,
      count: approvals.length,
      approvals,
    });
  } catch (error: any) {
    if (error.message === "INVALID_STATUS") {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch approvals",
    });
  }
};

export const approveApproval = async (req: AuthRequest, res: Response) => {
  try {
    const approvalId = Number(req.params.id);

    if (!approvalId) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval id",
      });
    }

    const approval = await approveApprovalService({
      approvalId,
      walletId: req.user!.walletId,
      parentId: req.user!.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Approval request approved successfully",
      approval,
    });
  } catch (error: any) {
    if (error.message === "APPROVAL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (error.message === "APPROVAL_ALREADY_REVIEWED") {
      return res.status(409).json({
        success: false,
        message: "This approval request has already been reviewed",
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
          message: "Child does not have enough points",
        });
      }
      
      if (error.message === "PARENT_BANK_ACCOUNT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Parent default bank account not found",
        });
      }
      
      if (error.message === "PARENT_INSUFFICIENT_FUNDS") {
        return res.status(400).json({
          success: false,
          message: "Parent has insufficient funds",
        });
      }
      
      if (error.message === "PARENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Parent not found",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to approve request",
      });
  }
};

export const declineApproval = async (req: AuthRequest, res: Response) => {
  try {
    const approvalId = Number(req.params.id);
    const { reason } = req.body;

    if (!approvalId) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval id",
      });
    }

    const approval = await declineApprovalService({
      approvalId,
      walletId: req.user!.walletId,
      parentId: req.user!.userId,
      reason: reason ? String(reason) : null,
    });

    return res.status(200).json({
      success: true,
      message: "Approval request declined successfully",
      approval,
    });
  } catch (error: any) {
    if (error.message === "APPROVAL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    if (error.message === "APPROVAL_ALREADY_REVIEWED") {
      return res.status(409).json({
        success: false,
        message: "This approval request has already been reviewed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to decline request",
    });
  }
};

export const getBlockedCategories = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const categories = await getBlockedCategoriesService({
      walletId: req.user!.walletId,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blocked categories",
    });
  }
};

export const updateBlockedCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const { blocked } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    if (typeof blocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "blocked must be boolean",
      });
    }

    const category = await updateBlockedCategoryService({
      walletId: req.user!.walletId,
      categoryId,
      blocked,
    });

    return res.status(200).json({
      success: true,
      message: "Blocked category updated successfully",
      category,
    });
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update blocked category",
    });
  }
};