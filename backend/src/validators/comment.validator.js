import { body } from "express-validator";

export const commentValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content is required")
      .isLength({ max: 5000 })
      .withMessage("Comment cannot exceed 5000 characters"),
  ];
};
