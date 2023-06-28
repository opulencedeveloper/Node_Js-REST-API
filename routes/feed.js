const express = require("express");

// see the classic-node-js-server-code-to-know-how-this-works
//this package is for user-input-validation
const { body } = require("express-validator");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);

//body() => see the classic-node-js-server-code-to-know-how-this-works
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

//body() => see the classic-node-js-server-code-to-know-how-this-works
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

//Note that you can't a add a body to a delete request
router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
