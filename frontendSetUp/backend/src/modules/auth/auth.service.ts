import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import pool from "../../config/db";


export const registerUser = async (
  fullName: string,
  email: string,
  password: string,
  familyName: string,
  country: string,
  currency: string
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT user_id FROM app_user WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const walletResult = await client.query(
      `INSERT INTO family_wallet (name, country, currency)
       VALUES ($1, $2, $3)
       RETURNING wallet_id, name, country, currency, created_at`,
      [familyName, country, currency]
    );

    const wallet = walletResult.rows[0];

    const userResult = await client.query(
      `INSERT INTO app_user (wallet_id, full_name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, wallet_id, full_name, email, role, joined_at`,
      [wallet.wallet_id, fullName, email, hashedPassword, "PARENT"]
    );

    const user = userResult.rows[0];

    await client.query("COMMIT");

    return {
      user,
      wallet,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query(
    "SELECT * FROM app_user WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET_NOT_FOUND");
  }
  
  const payload = {
    userId: user.user_id,
    walletId: user.wallet_id,
    role: user.role,
    email: user.email,
  };
  
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
  };
  
  const token = jwt.sign(payload, jwtSecret, options);

  return {
    token,
    user: {
      userId: user.user_id,
      walletId: user.wallet_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId: number) => {
  const result = await pool.query(
    `SELECT user_id, wallet_id, full_name, email, phone, role, joined_at
     FROM app_user
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0];
};