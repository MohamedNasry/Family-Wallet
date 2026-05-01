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


const recalculateBillStatus = async (client: any, billId: number) => {
  const splitStatsResult = await client.query(
    `SELECT
       COUNT(*)::int AS total_splits,
       COUNT(*) FILTER (WHERE status = 'PAID')::int AS paid_splits
     FROM bill_split
     WHERE bill_id = $1`,
    [billId]
  );

  const totalSplits = Number(splitStatsResult.rows[0].total_splits);
  const paidSplits = Number(splitStatsResult.rows[0].paid_splits);

  let newStatus = "PENDING";

  if (totalSplits === 0) {
    newStatus = "PAID";
  } else if (paidSplits === totalSplits) {
    newStatus = "PAID";
  } else if (paidSplits > 0) {
    newStatus = "PARTIAL";
  } else {
    newStatus = "PENDING";
  }

  const billResult = await client.query(
    `UPDATE bill
     SET status = $1
     WHERE bill_id = $2
     RETURNING
       bill_id AS "billId",
       title,
       total_amount AS "totalAmount",
       currency,
       status`,
    [newStatus, billId]
  );

  return billResult.rows[0];
};

export const charge = async ({
  authUserId,
  bankAccountID,
  billID,
  cost,
  splitID,
}: {
  authUserId: number;
  bankAccountID: number;
  billID: number;
  cost: number;
  splitID?: number | null;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Lock bank account
    const accountResult = await client.query(
      `
      SELECT
        bank_account_id,
        user_id,
        bank_name,
        masked_card_number,
        is_default,
        balance
      FROM bank_account
      WHERE bank_account_id = $1
        AND user_id = $2
      FOR UPDATE
      `,
      [bankAccountID, authUserId]
    );

    if (accountResult.rows.length === 0) {
      throw new Error("BANK_ACCOUNT_NOT_FOUND");
    }

    const account = accountResult.rows[0];

    // 2. Lock bill
    const billResult = await client.query(
      `
      SELECT
        bill_id,
        wallet_id,
        total_amount,
        status
      FROM bill
      WHERE bill_id = $1
      FOR UPDATE
      `,
      [billID]
    );

    if (billResult.rows.length === 0) {
      throw new Error("BILL_NOT_FOUND");
    }

    let chargeAmount = Number(cost);
    let split = null;

    // 3. إذا أرسلنا splitID، نستعمل amount_due من database وليس من frontend
    // هذا أكثر أمانًا، لأن المستخدم لا يستطيع تغيير المبلغ من الواجهة.
    if (splitID) {
      const splitResult = await client.query(
        `
        SELECT
          split_id,
          bill_id,
          user_id,
          amount_due,
          status
        FROM bill_split
        WHERE split_id = $1
          AND bill_id = $2
          AND user_id = $3
        FOR UPDATE
        `,
        [splitID, billID, authUserId]
      );

      if (splitResult.rows.length === 0) {
        throw new Error("SPLIT_NOT_FOUND");
      }

      split = splitResult.rows[0];

      if (split.status === "PAID") {
        throw new Error("SPLIT_ALREADY_PAID");
      }

      chargeAmount = Number(split.amount_due);
    }

    // 4. Check balance
    if (Number(account.balance) < chargeAmount) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    // 5. Decrease bank balance
    const updatedAccountResult = await client.query(
      `
      UPDATE bank_account
      SET balance = balance - $1
      WHERE bank_account_id = $2
        AND user_id = $3
      RETURNING
        bank_account_id AS "bankAccountId",
        user_id AS "userId",
        bank_name AS "bankName",
        masked_card_number AS "maskedCardNumber",
        is_default AS "isDefault",
        balance
      `,
      [chargeAmount, bankAccountID, authUserId]
    );

    // 6. Mark split as PAID إذا كان الدفع متعلقًا بـ split
    let updatedSplit = null;

    if (splitID) {
      const updatedSplitResult = await client.query(
        `
        UPDATE bill_split
        SET status = 'PAID'
        WHERE split_id = $1
        RETURNING
          split_id AS "splitId",
          bill_id AS "billId",
          user_id AS "userId",
          split_type AS "splitType",
          percentage,
          fixed_amount AS "fixedAmount",
          amount_due AS "amountDue",
          status
        `,
        [splitID]
      );

      updatedSplit = updatedSplitResult.rows[0];
    }

    // 7. Insert payment record
    // إذا عندك payment table بأعمدة مختلفة، عدّل هذه query فقط.
    const paymentResult = await client.query(
      `
      INSERT INTO payment (
        bill_id,
        user_id,
        amount,
        method
      )
      VALUES ($1, $2, $3, 'BANK')
      RETURNING *
      `,
      [billID, authUserId, chargeAmount]
    );

    // 8. Update bill status: PENDING / PARTIAL / PAID
    const updatedBill = await recalculateBillStatus(client, billID);

    await client.query("COMMIT");

    return {
      success: true,
      message: "Payment charged successfully",
      account: updatedAccountResult.rows[0],
      split: updatedSplit,
      bill: updatedBill,
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
  authUserId,
  bankAccountID,
  billID,
  cost,
  splitID,
}: {
  authUserId: number;
  bankAccountID: number;
  billID: number;
  cost: number;
  splitID?: number | null;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const accountResult = await client.query(
      `SELECT
         bank_account_id,
         user_id,
         balance
       FROM bank_account
       WHERE bank_account_id = $1
         AND user_id = $2
       FOR UPDATE`,
      [bankAccountID, authUserId]
    );

    if (accountResult.rows.length === 0) {
      throw new Error("BANK_ACCOUNT_NOT_FOUND");
    }

    const billResult = await client.query(
      `SELECT bill_id, status
       FROM bill
       WHERE bill_id = $1
       FOR UPDATE`,
      [billID]
    );

    if (billResult.rows.length === 0) {
      throw new Error("BILL_NOT_FOUND");
    }

    if (splitID) {
      await client.query(
        `UPDATE bill_split
         SET status = 'UNPAID'
         WHERE split_id = $1
           AND bill_id = $2
           AND user_id = $3`,
        [splitID, billID, authUserId]
      );
    } else {
      await client.query(
        `UPDATE bill_split
         SET status = 'UNPAID'
         WHERE bill_id = $1
           AND user_id = $2`,
        [billID, authUserId]
      );
    }

    const updatedAccountResult = await client.query(
      `UPDATE bank_account
       SET balance = balance + $1
       WHERE bank_account_id = $2
         AND user_id = $3
       RETURNING
         bank_account_id AS "bankAccountId",
         user_id AS "userId",
         bank_name AS "bankName",
         masked_card_number AS "cardNumber",
         is_default AS "isDefault",
         balance`,
      [cost, bankAccountID, authUserId]
    );

    const updatedBill = await recalculateBillStatus(client, billID);

    await client.query("COMMIT");

    return {
      success: true,
      message: "Payment refunded successfully",
      account: updatedAccountResult.rows[0],
      bill: updatedBill,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};