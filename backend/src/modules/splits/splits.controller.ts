import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { getMySplitsService } from "./splits.service";

export const getMySplits = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const splits = await getMySplitsService({
      userId: req.user.userId,
      walletId: req.user.walletId,
    });

    return res.status(200).json({
      success: true,
      count: splits.length,
      splits,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user splits",
    });
  }
};