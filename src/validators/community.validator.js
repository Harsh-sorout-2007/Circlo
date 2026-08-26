import { body } from "express-validator";

const communityValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 4 })
      .withMessage("Minimum length of name must be 4"),

    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .trim(),

    body("icon").optional().trim(),

    body("banner").optional().trim(),
  ];
};

export { communityValidator };
