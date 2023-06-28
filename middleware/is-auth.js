const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //get() is used to get the content in the headers
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    //we are creating this value 'statusCode' on the error object on the fly here
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    //"somesupersupersecret" => this has to be the key you used this create this token in the auth.js file in the controllers folder
    decodedToken = jwt.verify(token, "somesupersupersecret");
  } catch (err) {
    //we are creating this value 'statusCode' on the error object on the fly here
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    //we are creating this value 'statusCode' on the error object on the fly here
    err.statusCode = 401;
    throw error;
  }

  //we are storing the userId in the req object to use it globally for this specific connection instance
  //decodedToken.userId => the userId is already store in the token, when we created this token and sent to the user
  req.userId = decodedToken.userId;
  next();
};
