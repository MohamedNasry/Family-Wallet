import pool from "../../config/db";

export const getCategoriesService = async () => {
  const result = await pool.query(
    `SELECT
       category_id AS "categoryId",
       name,
       is_harmful AS "isHarmful"
     FROM category
     ORDER BY category_id ASC`
  );

  return result.rows;
};

export const createCategoryService = async ({
  name,
  isHarmful,
}: {
  name: string;
  isHarmful: boolean;
}) => {
  const cleanName = name.trim();

  const existing = await pool.query(
    `SELECT category_id
     FROM category
     WHERE LOWER(name) = LOWER($1)`,
    [cleanName]
  );

  if (existing.rows.length > 0) {
    throw new Error("CATEGORY_ALREADY_EXISTS");
  }

  const result = await pool.query(
    `INSERT INTO category (name, is_harmful)
     VALUES ($1, $2)
     RETURNING
       category_id AS "categoryId",
       name,
       is_harmful AS "isHarmful"`,
    [cleanName, isHarmful]
  );

  return result.rows[0];
};