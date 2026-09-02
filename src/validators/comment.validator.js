import { body } from "express-validator";

export const commentValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content is  required"),
  ];
};
