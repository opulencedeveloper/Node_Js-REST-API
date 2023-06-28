const fs = require("fs");
const path = require("path");

// see the classic-node-js-server-code-to-know-how-this-works
//this package is for user-input-validation
const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  //see how i implement pagination in the classic node server to know what this paginationis doing
  const currentPage = req.query.page || 1;
  const contentPerPage = 2;

  try {
  const totalItems = await Post.find().countDocuments();
  //if the total item find() return was 10, and the result of skip was 3,
  //skip will skip the first 3 items returned by find and returns the rest
  //limit(), this limits the total items returned by skip, if skip return 7 items
  //an limit() was given an argumet of 5, limit will only the first 5 items return by skip
  const posts = await Post.find()
    .skip((currentPage - 1) * contentPerPage)
    .limit(contentPerPage);
  res.status(200).json({
    message: "Fetched posts success",
    posts: posts,
    totalItems: totalItems,
  }); }
  catch (err) {
    if (!err.statusCode) {
      //we are creating this value 'statusCode' on the error object on the fly here
      err.statusCode = 500;
    }
    //this error will be handled by the error handling middleware in the app.js file
    next(err);
  };
};

exports.createPost = (req, res, next) => {
  // validationResult() => see the classic-node-js-server-code-to-know-how-this-works
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    //we are creating this value 'statusCode' on the error object on the fly here
    error.statusCode = 422;
    //this error will be handled by the error handling middleware in the app.js file
    //since this code is not async, if it was async, use next(error)
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    //we are creating this value 'statusCode' on the error object on the fly here
    error.statusCode = 422;
    ///we used 'throw error', since this code is not async, which ends up in the catch block
    //where it is handled if it was async, use next(error)
    throw error;
  }
  //.replace(/\\/g, "/") => helps replace this '//'with '/' in the path
  const imageUrl = req.file.path.replace(/\\/g, "/");
  const title = req.body.title;
  const content = req.body.content;
  let theCreator;

  const post = Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    //req.userId => we stored the userId in the token which we extracted in the "is-auth" file in the middleware folder
    //then we now stored it to the req object
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      //req.userId => we stored the userId in the token which we extracted in the "is-auth" file in the middleware folder
      //then we now stored it to the req object
      return User.findById(req.userId);
    })
    .then((user) => {
      theCreator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: theCreator._id, name: theCreator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 500;
      }
      //this error will be handled by the error handling middleware in the app.js file
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Cound not find post.");
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 404;
        //using throw inside an async code won't work because you have to use next() to handle the errors here,
        //but when you throw in a then() block, the catch block will handle it, this is where we now throw the error using next
        throw error;
      }
      res.status(200).json({ messsage: "Post fetched", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 500;
      }
      //this error will be handled by the error handling middleware in the app.js file
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  // validationResult() => see the classic-node-js-server-code-to-know-how-this-works
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    //we are creating this value 'statusCode' on the error object on the fly here
    error.statusCode = 422;
    ///we used 'throw error', since this code is not async, which ends up in the catch block
    //where it is handled if it was async, use next(error)
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    console.log("imageUrl");
    console.log(imageUrl);
    console.log(req.file.path);
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error("No file picked.");
    //we are creating this value 'statusCode' on the error object on the fly here
    error.statusCode = 422;
    ///we used 'throw error', since this code is not async, which ends up in the catch block
    //where it is handled if it was async, use next(error)
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Cound not find post.");
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 404;
        //using throw inside an async code won't work because you have to use next() to handle the errors here,
        //but when you throw in a then() block, the catch block will handle it, this is where we now throw the error using next
        throw error;
      }

      //req.userId => we stored the userId in the token which we extracted in the "is-auth" file in the middleware folder
      if (post.creator.toString() !== req.userId) {
        const error = new Error("No authorized.");
        //we are creating this value 'statusCode' on the error object on the fly here
        error.statusCode = 403;
        ///we used 'throw error', since this code is not async, which ends up in the catch block
        //where it is handled, if it was async, use next(error)
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        //clearImage() is a fn we defined at the buttom of this file
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 500;
      }
      //this error will be handled by the error handling middleware in the app.js file'
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Cound not find post.");
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 404;
        //using throw inside an async code won't work because you have to use next() to handle the errors here,
        //but when you throw in a then() block, the catch block will handle it, this is where we now throw the error using next
        throw error;
      }

      //req.userId => we stored the userId in the token which we extracted in the "is-auth" file in the middleware folder
      //and stored it in the req object
      if (post.creator.toString() !== req.userId) {
        const error = new Error("No authorized.");
        //we are creating this value 'statusCode' on the error object on the fly here
        error.statusCode = 403;
        ///we used 'throw error', since this code is not async, which ends up in the catch block
        //where it is handled, if it was async, use next(error)
        throw error;
      }
      //clearImage() is a fn we defined at the buttom of this file
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      console.log(result);
      //req.userId => we stored the userId in the token which we extracted in the "is-auth" file in the middleware folder
      //and stored it in the req object
      return User.findById(req.userId);
    })
    .then((user) => {
      //we pull out only the post with this id => 'postId',
      user.posts.pull(postId);
      //then save back the post
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        //we are creating this value 'statusCode' on the error object on the fly here
        err.statusCode = 500;
      }
      //this error will be handled by the error handling middleware in the app.js file
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  //unlink() is used to delete a file
  fs.unlink(filePath, (err) => console.log(err));
};
