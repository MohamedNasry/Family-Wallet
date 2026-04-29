import { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser,joinWithInviteUser } from "./auth.service";
import type { AuthRequest } from "../../middlewares/auth.middleware";



export const parentOnly = async (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome parent. You have access to this route.",
    user: req.user,
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      familyName,
      country,
      currency,
    } = req.body;

    if (!fullName || !email || !password || !familyName || !country || !currency) {
      return res.status(400).json({
        success: false,
        message:
          "fullName, email, password, familyName, country and currency are required",
      });
    }

    const data = await registerUser(
      fullName,
      email,
      password,
      familyName,
      country,
      currency
    );

    return res.status(201).json({
      success: true,
      message: "Family wallet and parent user created successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const data = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...data,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getCurrentUser(req.user!.userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

export const joinWithInvite = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, inviteCode, role } = req.body;

    if (!fullName || !email || !password || !inviteCode || !role) {
      return res.status(400).json({
        success: false,
        message: "fullName, email, password, inviteCode and role are required",
      });
    }

    

    const data = await joinWithInviteUser(
      fullName,
      email,
      password,
      inviteCode,
      role
    );

    return res.status(201).json({
      success: true,
      message: "User joined family wallet successfully",
      ...data,
    });
  } catch (error: any) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (error.message === "INVALID_INVITE_CODE") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invite code",
      });
    }

    if (error.message === "INVALID_ROLE") {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles are MEMBER or CHILD",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to join with invite code",
    });
  }
};