import pool from "../../config/db";

type UserRole = "PARENT" | "CHILD" | "MEMBER";

const assertChildAccess = async ({
  childId,
  authUserId,
  authWalletId,
  authRole,
}: {
  childId: number;
  authUserId: number;
  authWalletId: number;
  authRole: UserRole;
}) => {
  const childResult = await pool.query(
    `SELECT user_id, wallet_id, full_name, email, role
     FROM app_user
     WHERE user_id = $1
       AND role = 'CHILD'`,
    [childId]
  );

  if (childResult.rows.length === 0) {
    throw new Error("CHILD_NOT_FOUND");
  }

  const child = childResult.rows[0];

  if (Number(child.wallet_id) !== Number(authWalletId)) {
    throw new Error("NO_PERMISSION");
  }

  if (authRole === "CHILD" && Number(authUserId) !== Number(childId)) {
    throw new Error("NO_PERMISSION");
  }

  if (authRole === "MEMBER") {
    throw new Error("NO_PERMISSION");
  }

  return child;
};

export const childPointsData = async ({
  childId,
  authUserId,
  authWalletId,
  authRole,
}: {
  childId: number;
  authUserId: number;
  authWalletId: number;
  authRole: UserRole;
}) => {
  const child = await assertChildAccess({
    childId,
    authUserId,
    authWalletId,
    authRole,
  });

  const result = await pool.query(
    `SELECT
       cpw.points_wallet_id AS "pointsWalletId",
       cpw.child_user_id AS "childUserId",
       cpw.parent_user_id AS "parentUserId",
       cpw.points_balance AS "pointsBalance"
     FROM child_points_wallet cpw
     WHERE cpw.child_user_id = $1`,
    [childId]
  );

  if (result.rows.length === 0) {
    throw new Error("POINTS_WALLET_NOT_FOUND");
  }

  return {
    child: {
      userId: Number(child.user_id),
      walletId: Number(child.wallet_id),
      fullName: child.full_name,
      email: child.email,
      role: child.role,
    },
    wallet: {
      ...result.rows[0],
      pointsBalance: Number(result.rows[0].pointsBalance),
    },
  };
};

export const topUpPoints = async ({
  childId,
  parentUserId,
  parentWalletId,
  points,
}: {
  childId: number;
  parentUserId: number;
  parentWalletId: number;
  points: number;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const childResult = await client.query(
      `SELECT user_id, wallet_id, full_name, role
       FROM app_user
       WHERE user_id = $1
         AND role = 'CHILD'
       FOR UPDATE`,
      [childId]
    );

    if (childResult.rows.length === 0) {
      throw new Error("CHILD_NOT_FOUND");
    }

    const child = childResult.rows[0];

    if (Number(child.wallet_id) !== Number(parentWalletId)) {
      throw new Error("NO_PERMISSION");
    }

    const walletResult = await client.query(
      `SELECT points_wallet_id, child_user_id, parent_user_id, points_balance
       FROM child_points_wallet
       WHERE child_user_id = $1
       FOR UPDATE`,
      [childId]
    );

    if (walletResult.rows.length === 0) {
      throw new Error("POINTS_WALLET_NOT_FOUND");
    }

    const wallet = walletResult.rows[0];

    if (Number(wallet.parent_user_id) !== Number(parentUserId)) {
      throw new Error("UNAUTHORIZED");
    }

    const oldBalance = Number(wallet.points_balance);
    const newBalance = oldBalance + points;

    const updatedWalletResult = await client.query(
      `UPDATE child_points_wallet
       SET points_balance = $1
       WHERE points_wallet_id = $2
       RETURNING
         points_wallet_id AS "pointsWalletId",
         child_user_id AS "childUserId",
         parent_user_id AS "parentUserId",
         points_balance AS "pointsBalance"`,
      [newBalance, wallet.points_wallet_id]
    );

    const transactionResult = await client.query(
      `INSERT INTO point_transaction (
         points_wallet_id,
         child_user_id,
         points_amount,
         type
       )
       VALUES ($1, $2, $3, 'TOP_UP')
       RETURNING
         transaction_id AS "transactionId",
         points_wallet_id AS "pointsWalletId",
         child_user_id AS "childUserId",
         points_amount AS "pointsAmount",
         type,
         created_at AS "createdAt"`,
      [wallet.points_wallet_id, childId, points]
    );

    await client.query("COMMIT");

    return {
      wallet: {
        ...updatedWalletResult.rows[0],
        pointsBalance: Number(updatedWalletResult.rows[0].pointsBalance),
      },
      transaction: {
        ...transactionResult.rows[0],
        pointsAmount: Number(transactionResult.rows[0].pointsAmount),
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createSpendPointsApproval = async ({
  authUserId,
  authWalletId,
  authRole,
  childId,
  points,
  title,
}: {
  authUserId: number;
  authWalletId: number;
  authRole: UserRole;
  childId: number;
  points: number;
  title: string | null;
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (authRole === "MEMBER") {
      throw new Error("NO_PERMISSION");
    }

    if (authRole === "CHILD" && Number(authUserId) !== Number(childId)) {
      throw new Error("NO_PERMISSION");
    }

    const childResult = await client.query(
      `SELECT user_id, wallet_id, full_name, role
       FROM app_user
       WHERE user_id = $1
         AND role = 'CHILD'`,
      [childId]
    );

    if (childResult.rows.length === 0) {
      throw new Error("CHILD_NOT_FOUND");
    }

    const child = childResult.rows[0];

    if (Number(child.wallet_id) !== Number(authWalletId)) {
      throw new Error("NO_PERMISSION");
    }

    const pointsWalletResult = await client.query(
      `SELECT points_wallet_id, child_user_id, parent_user_id, points_balance
       FROM child_points_wallet
       WHERE child_user_id = $1
       FOR UPDATE`,
      [childId]
    );

    if (pointsWalletResult.rows.length === 0) {
      throw new Error("POINTS_WALLET_NOT_FOUND");
    }

    const pointsWallet = pointsWalletResult.rows[0];

    if (Number(pointsWallet.points_balance) < points) {
      throw new Error("INSUFFICIENT_POINTS");
    }

    const parentResult = await client.query(
      `SELECT user_id, wallet_id, full_name, role
       FROM app_user
       WHERE user_id = $1
         AND role = 'PARENT'`,
      [pointsWallet.parent_user_id]
    );

    if (parentResult.rows.length === 0) {
      throw new Error("PARENT_NOT_FOUND");
    }

    const parent = parentResult.rows[0];

    if (Number(parent.wallet_id) !== Number(authWalletId)) {
      throw new Error("NO_PERMISSION");
    }

    const familyWalletResult = await client.query(
      `SELECT wallet_id, currency
       FROM family_wallet
       WHERE wallet_id = $1`,
      [authWalletId]
    );

    if (familyWalletResult.rows.length === 0) {
      throw new Error("FAMILY_WALLET_NOT_FOUND");
    }

    const currency = familyWalletResult.rows[0].currency;

    const costPerPoint = 0.1;
    const totalCost = Number((points * costPerPoint).toFixed(2));

    let categoryId: number;

    const categoryResult = await client.query(
      `SELECT category_id
       FROM category
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      ["POINTS_SPEND"]
    );

    if (categoryResult.rows.length > 0) {
      categoryId = Number(categoryResult.rows[0].category_id);
    } else {
      const insertCategoryResult = await client.query(
        `INSERT INTO category (name, is_harmful)
         VALUES ($1, $2)
         RETURNING category_id`,
        ["POINTS_SPEND", false]
      );

      categoryId = Number(insertCategoryResult.rows[0].category_id);
    }

    const approvalResult = await client.query(
      `INSERT INTO parental_approval_request (
         wallet_id,
         child_id,
         category_id,
         title,
         amount,
         currency,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING
         approval_id AS "approvalId",
         wallet_id AS "walletId",
         child_id AS "childId",
         category_id AS "categoryId",
         title,
         amount,
         currency,
         status,
         requested_at AS "requestedAt"`,
      [
        authWalletId,
        childId,
        categoryId,
        title || `Spend ${points} points`,
        totalCost,
        currency,
      ]
    );

    await client.query("COMMIT");

    return {
      approval: {
        ...approvalResult.rows[0],
        amount: Number(approvalResult.rows[0].amount),
      },
      pointsRequest: {
        childId,
        childName: child.full_name,
        points,
        costPerPoint,
        totalCost,
        currentPointsBalance: Number(pointsWallet.points_balance),
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const transactionHistory = async ({
  childId,
  authUserId,
  authWalletId,
  authRole,
}: {
  childId: number;
  authUserId: number;
  authWalletId: number;
  authRole: UserRole;
}) => {
  await assertChildAccess({
    childId,
    authUserId,
    authWalletId,
    authRole,
  });

  const result = await pool.query(
    `SELECT
       transaction_id AS "transactionId",
       points_wallet_id AS "pointsWalletId",
       child_user_id AS "childUserId",
       points_amount AS "pointsAmount",
       type,
       created_at AS "createdAt"
     FROM point_transaction
     WHERE child_user_id = $1
     ORDER BY created_at DESC`,
    [childId]
  );

  if (result.rows.length === 0) {
    throw new Error("NO_TRANSACTIONS_FOUND");
  }

  return result.rows.map((row) => ({
    ...row,
    pointsAmount: Number(row.pointsAmount),
  }));
};