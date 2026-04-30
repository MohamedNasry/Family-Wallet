import pool from "../../config/db";

type ApprovalStatus = "PENDING" | "APPROVED" | "DECLINED" | "ALL";

const normalizeStatus = (status: string): ApprovalStatus => {
  const upperStatus = status.toUpperCase();

  if (
    upperStatus !== "PENDING" &&
    upperStatus !== "APPROVED" &&
    upperStatus !== "DECLINED" &&
    upperStatus !== "ALL"
  ) {
    throw new Error("INVALID_STATUS");
  }

  return upperStatus as ApprovalStatus;
};

export const getApprovalsService = async ({
  walletId,
  status,
}: {
  walletId: number;
  status: string;
}) => {
  const normalizedStatus = normalizeStatus(status);

  const values: any[] = [walletId];
  let whereClause = `WHERE par.wallet_id = $1`;

  if (normalizedStatus !== "ALL") {
    values.push(normalizedStatus);
    whereClause += ` AND par.status = $2`;
  }

  const result = await pool.query(
    `SELECT
       par.approval_id AS "approvalId",
       par.wallet_id AS "walletId",
       par.child_id AS "childId",
       child.full_name AS "childName",
       par.category_id AS "categoryId",
       c.name AS "categoryName",
       par.title,
       par.amount,
       par.currency,
       par.status,
       par.requested_at AS "requestedAt",
       par.reviewed_by AS "reviewedBy",
       parent.full_name AS "reviewedByName",
       par.reviewed_at AS "reviewedAt",
       par.decline_reason AS "declineReason"
     FROM parental_approval_request par
     JOIN app_user child ON child.user_id = par.child_id
     LEFT JOIN app_user parent ON parent.user_id = par.reviewed_by
     LEFT JOIN category c ON c.category_id = par.category_id
     ${whereClause}
     ORDER BY par.requested_at DESC`,
    values
  );

  return result.rows.map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));
};

export const approveApprovalService = async ({
    approvalId,
    walletId,
    parentId,
  }: {
    approvalId: number;
    walletId: number;
    parentId: number;
  }) => {
    const client = await pool.connect();
  
    try {
      await client.query("BEGIN");
  
      // 1. جلب طلب الموافقة
      const approvalResult = await client.query(
        `SELECT
           par.approval_id,
           par.wallet_id,
           par.child_id,
           par.category_id,
           par.title,
           par.amount,
           par.currency,
           par.status,
           c.name AS category_name
         FROM parental_approval_request par
         LEFT JOIN category c ON c.category_id = par.category_id
         WHERE par.approval_id = $1
           AND par.wallet_id = $2
         FOR UPDATE`,
        [approvalId, walletId]
      );
  
      if (approvalResult.rows.length === 0) {
        throw new Error("APPROVAL_NOT_FOUND");
      }
  
      const approval = approvalResult.rows[0];
  
      if (approval.status !== "PENDING") {
        throw new Error("APPROVAL_ALREADY_REVIEWED");
      }
  
      const amount = Number(approval.amount);
  
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("INVALID_APPROVAL_AMOUNT");
      }
  
      // 2. إذا لم يكن الطلب خاصًا بالنقاط، فقط وافق عليه
      // لأننا لا نعرف عدد النقاط إلا لطلبات POINTS_SPEND
      if (approval.category_name !== "POINTS_SPEND") {
        const updateOnlyResult = await client.query(
          `UPDATE parental_approval_request
           SET status = 'APPROVED',
               reviewed_by = $1,
               reviewed_at = NOW(),
               decline_reason = NULL
           WHERE approval_id = $2
           RETURNING
             approval_id AS "approvalId",
             wallet_id AS "walletId",
             child_id AS "childId",
             category_id AS "categoryId",
             title,
             amount,
             currency,
             status,
             requested_at AS "requestedAt",
             reviewed_by AS "reviewedBy",
             reviewed_at AS "reviewedAt",
             decline_reason AS "declineReason"`,
          [parentId, approvalId]
        );
  
        await client.query("COMMIT");
  
        return {
          approval: {
            ...updateOnlyResult.rows[0],
            amount: Number(updateOnlyResult.rows[0].amount),
          },
          message: "Approval approved without points processing",
        };
      }
  
      // 3. حساب عدد النقاط من المبلغ
      // نفس القاعدة التي استعملناها في spendPoints:
      // 1 point = 0.1
      const costPerPoint = 0.1;
      const pointsToSpend = Math.round(amount / costPerPoint);
  
      if (!pointsToSpend || pointsToSpend <= 0) {
        throw new Error("INVALID_POINTS_AMOUNT");
      }
  
      // 4. جلب wallet ديال النقاط للطفل
      const pointsWalletResult = await client.query(
        `SELECT
           points_wallet_id,
           child_user_id,
           parent_user_id,
           points_balance
         FROM child_points_wallet
         WHERE child_user_id = $1
         FOR UPDATE`,
        [approval.child_id]
      );
  
      if (pointsWalletResult.rows.length === 0) {
        throw new Error("POINTS_WALLET_NOT_FOUND");
      }
  
      const pointsWallet = pointsWalletResult.rows[0];
  
      if (Number(pointsWallet.points_balance) < pointsToSpend) {
        throw new Error("INSUFFICIENT_POINTS");
      }
  
      const parentUserId = Number(pointsWallet.parent_user_id);
  
      // 5. التحقق من parent
      const parentResult = await client.query(
        `SELECT user_id, wallet_id, role
         FROM app_user
         WHERE user_id = $1
           AND role = 'PARENT'`,
        [parentUserId]
      );
  
      if (parentResult.rows.length === 0) {
        throw new Error("PARENT_NOT_FOUND");
      }
  
      const parent = parentResult.rows[0];
  
      if (Number(parent.wallet_id) !== Number(walletId)) {
        throw new Error("NO_PERMISSION");
      }
  
      // 6. جلب الحساب البنكي الافتراضي للوالد
      const bankResult = await client.query(
        `SELECT
           bank_account_id,
           user_id,
           bank_name,
           masked_card_number,
           is_default,
           balance
         FROM bank_account
         WHERE user_id = $1
           AND is_default = true
         FOR UPDATE`,
        [parentUserId]
      );
  
      if (bankResult.rows.length === 0) {
        throw new Error("PARENT_BANK_ACCOUNT_NOT_FOUND");
      }
  
      const bankAccount = bankResult.rows[0];
  
      if (Number(bankAccount.balance) < amount) {
        throw new Error("PARENT_INSUFFICIENT_FUNDS");
      }
  
      // 7. خصم النقاط من الطفل
      const updatedPointsWalletResult = await client.query(
        `UPDATE child_points_wallet
         SET points_balance = points_balance - $1
         WHERE points_wallet_id = $2
         RETURNING
           points_wallet_id AS "pointsWalletId",
           child_user_id AS "childUserId",
           parent_user_id AS "parentUserId",
           points_balance AS "pointsBalance"`,
        [pointsToSpend, pointsWallet.points_wallet_id]
      );
  
      // 8. إنشاء bill
      const billResult = await client.query(
        `INSERT INTO bill (
           wallet_id,
           created_by,
           category_id,
           title,
           total_amount,
           currency,
           source,
           status,
           bill_date
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'MANUAL', 'PENDING', CURRENT_DATE)
         RETURNING
           bill_id AS "billId",
           wallet_id AS "walletId",
           created_by AS "createdBy",
           category_id AS "categoryId",
           title,
           total_amount AS "totalAmount",
           currency,
           source,
           status,
           bill_date AS "billDate",
           created_at AS "createdAt"`,
        [
          walletId,
          parentUserId,
          approval.category_id,
          approval.title,
          amount,
          approval.currency,
        ]
      );
  
      const bill = billResult.rows[0];
  
      // 9. خصم المال من حساب الوالد
      const updatedBankResult = await client.query(
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
        [amount, bankAccount.bank_account_id]
      );
  
      // 10. إنشاء payment
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
        [bill.billId, parentUserId, amount, "BANK"]
      );
  
      // 11. تحديث approval إلى APPROVED
      const approvedResult = await client.query(
        `UPDATE parental_approval_request
         SET status = 'APPROVED',
             reviewed_by = $1,
             reviewed_at = NOW(),
             decline_reason = NULL
         WHERE approval_id = $2
         RETURNING
           approval_id AS "approvalId",
           wallet_id AS "walletId",
           child_id AS "childId",
           category_id AS "categoryId",
           title,
           amount,
           currency,
           status,
           requested_at AS "requestedAt",
           reviewed_by AS "reviewedBy",
           reviewed_at AS "reviewedAt",
           decline_reason AS "declineReason"`,
        [parentId, approvalId]
      );
  
      await client.query("COMMIT");
  
      return {
        approval: {
          ...approvedResult.rows[0],
          amount: Number(approvedResult.rows[0].amount),
        },
        points: {
          spent: pointsToSpend,
          costPerPoint,
          wallet: updatedPointsWalletResult.rows[0],
        },
        bill: {
          ...bill,
          totalAmount: Number(bill.totalAmount),
        },
        payment: {
          ...paymentResult.rows[0],
          amount: Number(paymentResult.rows[0].amount),
        },
        bankAccount: updatedBankResult.rows[0],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

export const declineApprovalService = async ({
  approvalId,
  walletId,
  parentId,
  reason,
}: {
  approvalId: number;
  walletId: number;
  parentId: number;
  reason: string | null;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const approvalResult = await client.query(
      `SELECT approval_id, status
       FROM parental_approval_request
       WHERE approval_id = $1
         AND wallet_id = $2
       FOR UPDATE`,
      [approvalId, walletId]
    );

    if (approvalResult.rows.length === 0) {
      throw new Error("APPROVAL_NOT_FOUND");
    }

    const approval = approvalResult.rows[0];

    if (approval.status !== "PENDING") {
      throw new Error("APPROVAL_ALREADY_REVIEWED");
    }

    const updateResult = await client.query(
      `UPDATE parental_approval_request
       SET status = 'DECLINED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           decline_reason = $2
       WHERE approval_id = $3
       RETURNING
         approval_id AS "approvalId",
         wallet_id AS "walletId",
         child_id AS "childId",
         category_id AS "categoryId",
         title,
         amount,
         currency,
         status,
         requested_at AS "requestedAt",
         reviewed_by AS "reviewedBy",
         reviewed_at AS "reviewedAt",
         decline_reason AS "declineReason"`,
      [parentId, reason, approvalId]
    );

    await client.query("COMMIT");

    return {
      ...updateResult.rows[0],
      amount: Number(updateResult.rows[0].amount),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getBlockedCategoriesService = async ({
  walletId,
}: {
  walletId: number;
}) => {
  const result = await pool.query(
    `SELECT
       c.category_id AS "categoryId",
       c.name,
       c.is_harmful AS "isHarmful",
       COALESCE(pbc.blocked, false) AS "blocked",
       pbc.updated_at AS "updatedAt"
     FROM category c
     LEFT JOIN parental_blocked_category pbc
       ON pbc.category_id = c.category_id
      AND pbc.wallet_id = $1
     ORDER BY c.category_id ASC`,
    [walletId]
  );

  return result.rows;
};

export const updateBlockedCategoryService = async ({
  walletId,
  categoryId,
  blocked,
}: {
  walletId: number;
  categoryId: number;
  blocked: boolean;
}) => {
  const categoryResult = await pool.query(
    `SELECT category_id, name, is_harmful
     FROM category
     WHERE category_id = $1`,
    [categoryId]
  );

  if (categoryResult.rows.length === 0) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  const result = await pool.query(
    `INSERT INTO parental_blocked_category (
       wallet_id,
       category_id,
       blocked,
       updated_at
     )
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (wallet_id, category_id)
     DO UPDATE SET
       blocked = EXCLUDED.blocked,
       updated_at = NOW()
     RETURNING
       blocked_category_id AS "blockedCategoryId",
       wallet_id AS "walletId",
       category_id AS "categoryId",
       blocked,
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [walletId, categoryId, blocked]
  );

  return {
    ...result.rows[0],
    name: categoryResult.rows[0].name,
    isHarmful: categoryResult.rows[0].is_harmful,
  };
};