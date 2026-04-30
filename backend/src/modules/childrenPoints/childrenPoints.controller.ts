import { Request, Response } from "express";
import {
    childPointsData,
    topUpPoints,
    spendPoints,
    transactionHistory
} from "./childrenPoints.service";

export const getChildPointsData = async (req: Request, res: Response) => {
    try {
        const { childId } = req.params;

        if (!childId || isNaN(Number(childId))) {
            return res.status(400).json({ error: "INVALID_CHILD_ID" });
        }

        const result = await childPointsData(Number(childId));
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}

export const postTopUpPoints = async (req: Request, res: Response) => {
    try {
        const { childId, points } = req.body;
        const {user} = req as any;

        if (!childId || !points || points <= 0 || !Number.isInteger(points)) {
            return res.status(400).json({ error: "MISSING_PARAMETERS" });
        }

        if (!user || user.role !== "PARENT" || !user.user_id || user.user_id !== childId) {
            return res.status(403).json({ error: "FORBIDDEN" });
        }

        const result = await topUpPoints(childId, user.user_id, points);
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}

export const postSpendPoints = async (req: Request, res: Response) => {
    try {
        const { childId, points } = req.body;

        if (!childId || !points || points <= 0 || !Number.isInteger(points)) {
            return res.status(400).json({ error: "MISSING_PARAMETERS" });
        }

        if (!childId || isNaN(Number(childId))) {
            return res.status(400).json({ error: "INVALID_CHILD_ID" });
        }

        const result = await spendPoints(childId, points);
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}

export const getTransactionHistory = async (req: Request, res: Response) => {
    try {
        const { childId } = req.params;

        if (!childId || isNaN(Number(childId))) {
            return res.status(400).json({ error: "INVALID_CHILD_ID" });
        }

        const result = await transactionHistory(Number(childId));
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}