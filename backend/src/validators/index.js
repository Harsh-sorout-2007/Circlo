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

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

const communityValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 4, max: 50 })
      .withMessage("Minimum length of name must be 4"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),

    body("icon").optional().trim(),

    body("banner").optional().trim(),
  ];
};

export { userRegisterValidator, userLoginValidator, communityValidator };
