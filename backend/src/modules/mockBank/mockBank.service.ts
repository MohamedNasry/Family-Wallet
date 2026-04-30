import pool from "../../config/db";

type UserRole = "PARENT" | "CHILD" | "MEMBER";

export const accountsInfo = async ({
  requestedUserId,
  authUserId,
  authWalletId,
  authRole,
}: {
  requestedUserId: number;
  authUserId: number;
  authWalletId: number;
  authRole: UserRole;
}) => {
  if (requestedUserId !== authUserId && authRole !== "PARENT") {
    throw new Error("NO_PERMISSION");
  }

  const userResult = await pool.query(
    `SELECT user_id, wallet_id
     FROM app_user
     WHERE user_id = $1`,
    [requestedUserId]
  );

  if (userResult.rows.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const requestedUser = userResult.rows[0];

  if (
    authRole === "PARENT" &&
    Number(requestedUser.wallet_id) !== Number(authWalletId)
  ) {
    throw new Error("NO_PERMISSION");
  }

  const result = await pool.query(
    `SELECT
       bank_account_id AS "bankAccountId",
       user_id AS "userId",
       bank_name AS "bankName",
       masked_card_number AS "cardNumber",
       is_default AS "isDefault",
       balance
     FROM bank_account
     WHERE user_id = $1
     ORDER BY is_default DESC, bank_account_id ASC`,
    [requestedUserId]
  );

  if (result.rows.length === 0) {
    throw new Error("NO_BANK_ACCOUNTS_FOUND");
  }

  return result.rows;
};

export const createBankAccountService = async ({
  userId,
  bankName,
  cardNumber,
  isDefault,
  balance,
}: {
  userId: number;
  bankName: string;
  cardNumber: string;
  isDefault: boolean;
  balance: number;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cleanCardNumber = String(cardNumber).replace(/\s/g, "");

    if (!/^\d{8,20}$/.test(cleanCardNumber)) {
      throw new Error("INVALID_CARD_NUMBER");
    }

    if (Number.isNaN(balance) || balance < 0) {
      throw new Error("INVALID_BALANCE");
    }

    const existingAccounts = await client.query(
      `SELECT bank_account_id
       FROM bank_account
       WHERE user_id = $1`,
      [userId]
    );

    const shouldBeDefault = existingAccounts.rows.length === 0 || isDefault;

    if (shouldBeDefault) {
      await client.query(
        `UPDATE bank_account
         SET is_default = false
         WHERE user_id = $1`,
        [userId]
      );
    }

    const result = await client.query(
      `INSERT INTO bank_account (
         user_id,
         bank_name,
         masked_card_number,
         is_default,
         balance
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         bank_account_id AS "bankAccountId",
         user_id AS "userId",
         bank_name AS "bankName",
         masked_card_number AS "cardNumber",
         is_default AS "isDefault",
         balance`,
      [
        userId,
        bankName,
        cleanCardNumber,
        shouldBeDefault,
        balance,
      ]
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const charge = async ({
  userId,
  walletId,
  bankAccountId,
  billId,
  cost,
}: {
  userId: number;
  walletId: number;
  bankAccountId: number;
  billId: number;
  cost: number;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bankResult = await client.query(
      `SELECT
         bank_account_id,
         user_id,
         balance
       FROM bank_account
       WHERE bank_account_id = $1
         AND user_id = $2
       FOR UPDATE`,
      [bankAccountId, userId]
    );

    if (bankResult.rows.length === 0) {
      throw new Error("BANK_ACCOUNT_NOT_FOUND");
    }

    const bank = bankResult.rows[0];
    const currentBalance = Number(bank.balance);

    if (currentBalance < cost) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const billResult = await client.query(
      `SELECT bill_id, wallet_id, total_amount
       FROM bill
       WHERE bill_id = $1
         AND wallet_id = $2`,
      [billId, walletId]
    );

    if (billResult.rows.length === 0) {
      throw new Error("BILL_NOT_FOUND");
    }

    const updatedAccountResult = await client.query(
      `UPDATE bank_account
       SET balance = balance - $1
       WHERE bank_account_id = $2
       RETURNING
         bank_account_id AS "bankAccountId",
         user_id AS "userId",
         bank_name AS "bankName",
         masked_card_number AS "cardNumber",
         is_default AS "isDefault",
         balance`,
      [cost, bankAccountId]
    );

    const paymentResult = await client.query(
      `INSERT INTO payment (
         bill_id,
         user_id,
         amount,
         method
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         payment_id AS "paymentId",
         bill_id AS "billId",
         user_id AS "userId",
         amount,
         method`,
      [billId, userId, cost, "BANK"]
    );

    await client.query("COMMIT");

    return {
      account: updatedAccountResult.rows[0],
      payment: paymentResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const refund = async ({
  userId,
  paymentId,
  bankAccountId,
}: {
  userId: number;
  paymentId: number;
  bankAccountId: number;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      `SELECT payment_id, bill_id, user_id, amount, method
       FROM payment
       WHERE payment_id = $1
       FOR UPDATE`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = paymentResult.rows[0];

    if (Number(payment.user_id) !== Number(userId)) {
      throw new Error("NO_PERMISSION");
    }

    const bankResult = await client.query(
      `SELECT bank_account_id, user_id, balance
       FROM bank_account
       WHERE bank_account_id = $1
         AND user_id = $2
       FOR UPDATE`,
      [bankAccountId, userId]
    );

    if (bankResult.rows.length === 0) {
      throw new Error("BANK_ACCOUNT_NOT_FOUND");
    }

    const updatedAccountResult = await client.query(
      `UPDATE bank_account
       SET balance = balance + $1
       WHERE bank_account_id = $2
       RETURNING
         bank_account_id AS "bankAccountId",
         user_id AS "userId",
         bank_name AS "bankName",
         masked_card_number AS "cardNumber",
         is_default AS "isDefault",
         balance`,
      [payment.amount, bankAccountId]
    );

    await client.query("COMMIT");

    return {
      refundedAmount: Number(payment.amount),
      account: updatedAccountResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};