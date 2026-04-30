import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { getCategoriesService } from "./categories.service";

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await getCategoriesService();

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};