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