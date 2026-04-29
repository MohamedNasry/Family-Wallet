import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getMyFamilyService,
  getFamilyMembersService,
} from "./family.service";

export const getMyFamily = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const family = await getMyFamilyService(req.user.walletId);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found",
      });
    }

    return res.status(200).json({
      success: true,
      family,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get family",
    });
  }
};

export const getFamilyMembers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const familyId = Number(req.params.familyId);

    if (!familyId) {
      return res.status(400).json({
        success: false,
        message: "Invalid family id",
      });
    }

    // حماية مهمة: المستخدم لا يستطيع رؤية أعضاء عائلة أخرى
    if (familyId !== req.user.walletId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this family",
      });
    }

    const members = await getFamilyMembersService(familyId);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get family members",
    });
  }
};