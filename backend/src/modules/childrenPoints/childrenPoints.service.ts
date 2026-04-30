import pool from "../../config/db";
import { accountsInfo, charge } from "../mockBank/mockBank.service";

export const childPointsData = async (childId: number) => {
    const query = {
        text: `
            SELECT points
            FROM child_points
            WHERE child_id = ?
        `
    };

    const result = await pool.query(query, [childId]);

    if (result.rows.length === 0) {
        throw new Error("CHILD_NOT_FOUND");
    }

    return result.rows[0];
}

export const topUpPoints = async (childId: number, parentUserId: number, points: number) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        // تحقق من وجود الطفل
        const childRes = await client.query(
            "SELECT * FROM app_user WHERE user_id = $1 AND role = 'CHILD' FOR UPDATE",
            [childId]
        );

        const child = childRes.rows[0];

        if (!child) {
            throw new Error("CHILD_NOT_FOUND");
        }

        // تحقق من وجود محفظة النقاط
        const walletRes = await client.query(
            "SELECT * FROM child_points_wallet WHERE child_user_id = $1 FOR UPDATE",
            [childId]
        );

        const wallet = walletRes.rows[0];

        if (!wallet) {
            throw new Error("WALLET_NOT_FOUND");
        }

        // تحقق من أن الوالد هو صاحب المحفظة
        if (wallet.parent_user_id !== parentUserId) {
            throw new Error("UNAUTHORIZED");
        }

        // شحن النقاط
        const newBalance = wallet.points_balance + points;

        await client.query(
            "UPDATE child_points_wallet SET points_balance = $1 WHERE points_wallet_id = $2",
            [newBalance, wallet.points_wallet_id]
        );

        // تسجيل المعاملة
        await client.query(
            "INSERT INTO point_transaction (points_wallet_id, child_user_id, points_amount, type) VALUES ($1, $2, $3, 'TOP_UP')",
            [wallet.points_wallet_id, childId, points]
        );

        await client.query("COMMIT");

        return { points_balance: newBalance };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export const spendPoints = async (childId: number, points: number) => {
    const clint = await pool.connect();
    try {
        await clint.query("BEGIN");
        // تحقق من وجود الطفل
        const childRes = await clint.query(
            "SELECT * FROM app_user WHERE user_id = ? AND role = 'CHILD'",
            [childId]
        );

        const child = childRes.rows[0];

        if (!child) {
            throw new Error("CHILD_NOT_FOUND");
        }

        // تحقق من وجود محفظة النقاط 
        const pointWalletRes = await clint.query(
            "SELECT * FROM child_points_wallet WHERE child_user_id = ?",
            [childId]
        );

        const pointWallet = pointWalletRes.rows[0];

        if (!pointWallet) {
            throw new Error("WALLET_NOT_FOUND");
        }

        // تحقق من وجود نقاط كافية
        if (pointWallet.points_balance < points) {
            throw new Error("INSUFFICIENT_POINTS");
        }

        // التحقق ان حساب الوالد مرتبط بمحفظة الطفل
        const parent_user_id = pointWallet.parent_user_id;

        const parentDataRes = await clint.query(
            "SELECT * FROM app_user WHERE user_id = ? AND role = 'PARENT'",
            [parent_user_id]
        );

        // تحقق من وجود الوالد
        if (parentDataRes.rows.length === 0) {
            throw new Error("PARENT_NOT_FOUND");
        }

        // جلب محفظة العائلة
        const familyWalletId = parentDataRes.rows[0].wallet_id;

        const familyWalletRes = await clint.query(
            "SELECT * FROM family_wallet WHERE wallet_id = ?",
            [familyWalletId]
        );

        const familyWallet = familyWalletRes.rows[0];

        if (!familyWallet) {
            throw new Error("FAMILY_WALLET_NOT_FOUND");
        }

        // جلب العملة من محفظة العائلة
        const currency = familyWallet.currency;

        // جلب حسابات الوالد البنكية
        const parentBankAcounts = await accountsInfo(parent_user_id);

        if (parentBankAcounts.length === 0) {
            throw new Error("PARENT_WALLET_NOT_FOUND");
        }

        const parentWallet = parentBankAcounts.find((acc) => acc.is_default);

        if (!parentWallet) {
            throw new Error("PARENT_WALLET_NOT_FOUND");
        }

        const costPerPoint = 0.1; // افتراضياً 1 نقطة تساوي 0.1 دولار
        const totalCost = points * costPerPoint;

        if (parentWallet.balance < totalCost) {
            throw new Error("PARENT_INSUFFICIENT_FUNDS");
        }

        // خصم النقاط من محفظة الطفل
        const newBalance = pointWallet.points_balance - points;
        await clint.query(
            "UPDATE child_points_wallet SET points_balance = ? WHERE points_wallet_id = ?",
            [newBalance, pointWallet.points_wallet_id]
        );

        // انشاء الفئة اذا كانت غير موجودة
        const categoryRes = await clint.query(
            "SELECT * FROM category WHERE name = ? AND wallet_id = ?",
            ["POINTS_SPEND", familyWalletId]
        );

        let category;

        if (categoryRes.rows.length === 0) {
            const insertCategoryRes = await clint.query(
                "INSERT INTO category (wallet_id, name) VALUES (?, ?, ?)",
                [familyWalletId, "POINTS_SPEND", "red"]
            );
            category = insertCategoryRes.rows[0].category_id;
        } else {
            category = categoryRes.rows[0].category_id;
        }

        // إنشاء فاتورة في النظام

        const billRes = await clint.query(
            `INSERT INTO bill (wallet_id, category_id, title, total_amount, currency, source, bill_date)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING bill_id`,
            [familyWalletId, category, `Purchase ${points} points for child ${childId}`, totalCost, currency, "POINTS_SPEND"]
        );

        const billId = billRes.rows[0].bill_id;

        // خصم المال من حساب الوالد
        await charge(parent_user_id, parentWallet.bank_account_id, billId, totalCost);

        await clint.query("COMMIT");

        return { points_balance: newBalance };
    } catch (err: any) {
        await clint.query("ROLLBACK");
        if (err.message === "CHILD_NOT_FOUND") {
            throw new Error("CHILD_NOT_FOUND");
        } else if (err.message === "WALLET_NOT_FOUND") {
            throw new Error("WALLET_NOT_FOUND");
        } else if (err.message === "INSUFFICIENT_POINTS") {
            throw new Error("INSUFFICIENT_POINTS");
        } else if (err.message === "PARENT_WALLET_NOT_FOUND") {
            throw new Error("PARENT_WALLET_NOT_FOUND");
        } else if (err.message === "PARENT_INSUFFICIENT_FUNDS") {
            throw new Error("PARENT_INSUFFICIENT_FUNDS");
        }
        throw err;
    } finally {
        clint.release();
    }
}

export const transactionHistory = async (childId: number) => {
    const clint = await pool.connect();
    try {
        const query = {
            text: `
                SELECT points_amount, type, created_at FROM point_transaction WHERE child_user_id = $1 ORDER BY created_at DESC
            `,
            values: [childId]
        };
        const result = await clint.query(query);

        if (result.rows.length === 0) {
            throw new Error("NO_TRANSACTIONS_FOUND");
        }

        return result.rows;
    } catch (err) {
        clint.query("ROLLBACK");
        throw err;
    } finally {
        clint.release();
    }
};