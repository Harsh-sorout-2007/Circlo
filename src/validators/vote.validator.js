import { body } from "express-validator";
import mongoose from "mongoose";
export const voteValidator = () => {
  return [
    body("targetId")
      .notEmpty()
      .withMessage("Target ID is required")
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid target ID"),

    body("targetType")
      .notEmpty()
      .withMessage("Target type is required")
      .isIn(["Post", "Comment"])
      .withMessage("Target type must be Post or Comment"),

    body("value")
      .notEmpty()
      .withMessage("Vote value is required")
      .isIn([1, -1])
      .withMessage("Vote value must be 1 or -1"),
  ];
};

export const removeVoteValidator = () => {
  return [
    body("targetId")
      .notEmpty()
      .withMessage("Target ID is required")
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage("Invalid target ID"),

    body("targetType")
      .notEmpty()
      .withMessage("Target type is required")
      .isIn(["Post", "Comment"])
      .withMessage("Target type must be Post or Comment"),
  ];
};
