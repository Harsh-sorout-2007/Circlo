import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 4 })
      .withMessage("Minimum length of name must be 4"),

    body("password").trim().notEmpty().withMessage("Password is required"),

    body("displayName")
      .trim()
      .notEmpty()
      .withMessage("Display Name is required"),
  ];
};

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

export { userRegisterValidator, communityValidator };
