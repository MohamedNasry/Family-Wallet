import pool from "../../config/db";

export const getMyFamilyService = async (walletId: number) => {
  const result = await pool.query(
    `SELECT 
       wallet_id AS "familyId",
       name,
       country,
       currency,
       created_at AS "createdAt"
     FROM family_wallet
     WHERE wallet_id = $1`,
    [walletId]
  );

  return result.rows[0];
};

export const getFamilyMembersService = async (walletId: number) => {
  const result = await pool.query(
    `SELECT 
       user_id AS "userId",
       wallet_id AS "familyId",
       full_name AS "fullName",
       email,
       phone,
       role,
       joined_at AS "joinedAt"
     FROM app_user
     WHERE wallet_id = $1
     ORDER BY joined_at ASC`,
    [walletId]
  );

  return result.rows;
};