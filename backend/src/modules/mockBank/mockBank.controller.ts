import { Request, Response } from "express";
import { accountsInfo, charge, refund } from "./mockBank.service";

export const getAccountInfo = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { user } = req as any;

        // تحقق
        if (!userId && !user) {
            return res.status(400).json({
                success: false,
                message: "userID is required",
            });
        }

        const parsedUserID = Number(userId);

        if (isNaN(parsedUserID)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userID",
            });
        }

        const data = user.id === parsedUserID ? await accountsInfo(parsedUserID) : null;

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Account fetched successfully",
            data,
        });

    } catch (error: any) {
        if (error.message === "BANK_ACCOUNT_NOT_EXISTS") {
            return res.status(404).json({
                success: false,
                message: "Bank account not found",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch account info",
        });
    }
};

export const postCharge = async (req: Request, res: Response) => {
    try {
        const { userID, bankAccountID, billID, cost } = req.body;

        // تحقق من الوجود
        if ([userID, bankAccountID, billID, cost].some(v => v === undefined)) {
            return res.status(400).json({
                success: false,
                message: "userID, bankAccountID, billID, cost are required",
            });
        }

        // تحقق من النوع والقيم
        if (
            typeof userID !== "number" ||
            typeof bankAccountID !== "number" ||
            typeof billID !== "number" ||
            typeof cost !== "number" ||
            cost <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input values",
            });
        }

        const data = await charge(userID, bankAccountID, billID, cost);

        return res.status(201).json({
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

        return res.status(500).json({
            success: false,
            message: "Charge failed",
        });
    }
};

export const postRefund = async (req: Request, res: Response) => {
    try {
        const { paymentID, bankAccountID } = req.body;

        // تحقق من الوجود
        if ([paymentID, bankAccountID].some(v => v === undefined)) {
            return res.status(400).json({
                success: false,
                message: "paymentID and bankAccountID are required",
            });
        }

        // تحقق من النوع
        if (
            typeof paymentID !== "number" ||
            typeof bankAccountID !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input values",
            });
        }

        const data = await refund(paymentID, bankAccountID);

        return res.status(200).json({
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

        return res.status(500).json({
            success: false,
            message: "Refund failed",
        });
    }
};