import pool from "../../config/db";

export const accountsInfo = async (userID: number) => {
  const query = {
    text: `
      SELECT * 
      FROM bank_account 
      WHERE user_id = $1
    `,
    values: [userID],
  };

  const result = await pool.query(query);

  if (result.rows.length === 0) {
    throw new Error("NO_BANK_ACCOUNTS_FOUND");
  }

  return result.rows;
};

export const charge = async (
    userID: number,
    bankAccountID: number,
    billID: number,
    cost: number
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // جلب الحساب البنكي
        const bankRes = await client.query(
            "SELECT * FROM bank_account WHERE bank_account_id = $1 AND user_id = $2 FOR UPDATE",
            [bankAccountID, userID]
        );

        const bank = bankRes.rows[0];

        if (!bank) {
            throw new Error("BANK_ACCOUNT_NOT_FOUND");
        }

        // تحقق الرصيد
        if (bank.balance < cost) {
            throw new Error("INSUFFICIENT_BALANCE");
        }

        // خصم الرصيد
        await client.query(
            "UPDATE bank_account SET balance = balance - $1 WHERE bank_account_id = $2",
            [cost, bankAccountID]
        );

        // تسجيل الدفع في payment
        await client.query(
            `INSERT INTO payment (bill_id, user_id, amount, method)
       VALUES ($1, $2, $3, $4)`,
            [billID, userID, cost, "BANK"]
        );

        await client.query("COMMIT");

        return {
            success: true,
            newBalance: bank.balance - cost,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const refund = async (
  paymentID: number,
  bankAccountID: number
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // جلب عملية الدفع
    const paymentRes = await client.query(
      "SELECT * FROM payment WHERE payment_id = $1 FOR UPDATE",
      [paymentID]
    );

    const payment = paymentRes.rows[0];

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    // جلب الحساب البنكي
    const bankRes = await client.query(
      "SELECT * FROM bank_account WHERE bank_account_id = $1 FOR UPDATE",
      [bankAccountID]
    );

    const bank = bankRes.rows[0];

    if (!bank) {
      throw new Error("BANK_ACCOUNT_NOT_FOUND");
    }

    // إرجاع المبلغ
    await client.query(
      "UPDATE bank_account SET balance = balance + $1 WHERE bank_account_id = $2",
      [payment.amount, bankAccountID]
    );

    // (اختياري) حذف الدفع أو تعليمه
    // await client.query(
    //   "DELETE FROM payment WHERE payment_id = $1",
    //   [paymentID]
    // );

    await client.query("COMMIT");

    return {
      success: true,
      refundedAmount: payment.amount,
      newBalance: bank.balance + payment.amount,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};