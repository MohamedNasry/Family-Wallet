import pool from "../../config/db";

export const getMySplitsService = async ({
  userId,
  walletId,
}: {
  userId: number;
  walletId: number;
}) => {
  const result = await pool.query(
    `SELECT
       bs.split_id AS "splitId",
       bs.bill_id AS "billId",
       b.title AS "billTitle",
       b.total_amount AS "billTotal",
       b.currency,
       b.status AS "billStatus",
       c.name AS "categoryName",
       bs.user_id AS "userId",
       au.full_name AS "userName",
       bs.split_type AS "splitType",
       bs.percentage,
       bs.fixed_amount AS "fixedAmount",
       bs.amount_due AS "amountDue",
       bs.status,
       b.bill_date AS "billDate",
       b.created_at AS "createdAt"
     FROM bill_split bs
     INNER JOIN bill b ON b.bill_id = bs.bill_id
     INNER JOIN app_user au ON au.user_id = bs.user_id
     LEFT JOIN category c ON c.category_id = b.category_id
     WHERE bs.user_id = $1
       AND b.wallet_id = $2
     ORDER BY bs.split_id DESC`,
    [userId, walletId]
  );

  return result.rows.map((row) => ({
    ...row,
    billTotal: Number(row.billTotal),
    amountDue: Number(row.amountDue),
    percentage:
      row.percentage === null || row.percentage === undefined
        ? null
        : Number(row.percentage),
    fixedAmount:
      row.fixedAmount === null || row.fixedAmount === undefined
        ? null
        : Number(row.fixedAmount),
  }));
};