import { body } from "express-validator";

export const postValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Post title is required"),

    body("type").trim().notEmpty().withMessage("Post type is required"),

    body("content").optional().trim(),

    body("mediaURL").optional().trim(),

    body("linkURL").optional().trim(),
  ];
};
