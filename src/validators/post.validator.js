import { body } from "express-validator";

export const postValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Post title is required")
      .isLength({ max: 300 })
      .withMessage("Post title cannot exceed 300 characters"),

    body("type")
      .trim()
      .notEmpty()
      .withMessage("Post type is required")
      .isIn(["TEXT", "IMAGE", "LINK"])
      .withMessage("Invalid post type"),

    body("content")
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage("Post content cannot exceed 10000 characters"),

    body("mediaURL")
      .optional()
      .trim()
      .isURL()
      .withMessage("Media URL must be a valid URL"),

    body("linkURL")
      .optional()
      .trim()
      .isURL()
      .withMessage("Link URL must be a valid URL"),
  ];
};
