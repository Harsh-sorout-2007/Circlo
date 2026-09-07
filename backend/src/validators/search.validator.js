import { query } from "express-validator";

export const searchValidator = () => {
  return [
    query("q")
      .trim()
      .notEmpty()
      .withMessage("Search query is required")
      .isLength({ max: 100 })
      .withMessage("Search query is too long"),
  ];
};
