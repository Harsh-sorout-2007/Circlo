import { body } from "express-validator";

export const reportValidator = () => {
  return [
    body("target")
      .notEmpty()
      .withMessage("Target is required")
      .isMongoId()
      .withMessage("Invalid target ID"),

    body("targetType")
      .notEmpty()
      .withMessage("Target type is required")
      .isIn(["Post", "Comment"])
      .withMessage("Target type must be Post or Comment"),

    body("reason")
      .notEmpty()
      .withMessage("Reason is required")
      .isIn([
        "SPAM",
        "HARASSMENT",
        "HATE_SPEECH",
        "SEXUAL_CONTENT",
        "VIOLENCE",
        "MISINFORMATION",
        "OTHER",
      ])
      .withMessage("Invalid report reason"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
  ];
};
