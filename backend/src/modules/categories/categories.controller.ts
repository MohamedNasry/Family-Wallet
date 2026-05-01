import { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getCategoriesService,
  createCategoryService,
} from "./categories.service";

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





export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, isHarmful } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await createCategoryService({
      name: String(name),
      isHarmful: Boolean(isHarmful),
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    if (error.message === "CATEGORY_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};