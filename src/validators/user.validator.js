import { body } from "express-validator";

export const userValidator = () => {
  return [
    body("displayName")
      .trim()
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage("Display name must be between 3 and 20 characters"),

    body("avatar")
      .optional()
      .trim()
      .isURL()
      .withMessage("Avatar must be a valid URL"),

    body("bio")
      .trim()
      .optional()
      .isLength({ max: 300 })
      .withMessage("Bio cannot exceed 300 characters"),
  ];
};
