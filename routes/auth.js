const express = require("express");

// see the classic-node-js-server-code-to-know-how-this-works
//this package is for user-input-validation
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

//body(), withMessage(), custom(), normalizeEmail => see the classic-node-js-server-code-to-know-how-this-works
//normalizeEmail() => converts the email to all lowercase

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;
