const User = require("../models/UserModel");
const grpc = require("grpc");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

exports.registerUser = async (call, callback) => {
  const { name, email, password } = call.request;
  console.log(call.request);
  try {
    const user = await User.findOne({ email });
    if (user) {
      callback({
        code: grpc.status.ALREADY_EXISTS,
        message: "This Email is already registered. Please Login",
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name,
        password: hashedPassword,
        email,
      });
      const token = JWT.sign(String(newUser._id), "JWT_SECRET");
      callback(null, { token: token });
    }
  } catch (e) {
    console.log("Error While Creating User: " + e);
    callback({
      code: grpc.status.UNAVAILABLE,
      message: "Unable to Create User",
    });
  }
};

exports.loginUser = async (call, callback) => {
  const { email, password } = call.request;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: "This Email is not registered. Please Register",
      });
    } else {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        const token = JWT.sign(user._id, "JWT_SECRET");
        callback(null, { token: token });
      } else {
        callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Email or Password is Incorrect.",
        });
      }
    }
  } catch (e) {
    console.log("Error While Logging in: " + e);
    callback({
      code: grpc.status.UNAVAILABLE,
      message: "Unable to Login",
    });
  }
};

// exports.deleteUser = async (call, callback) => {
//   const { email } = call.request;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       callback({
//         code: grpc.status.NOT_FOUND,
//         message: "User Not Found",
//       });
//     } else {
//       await User.findOneAndDelete({ email });
//       callback(null, {
//         status: "User Deleted",
//       });
//     }
//   } catch (e) {
//     console.log("Error While Deleting User: " + e);
//     callback({
//       code: grpc.status.UNAVAILABLE,
//       message: "Unable to delete User",
//     });
//   }
// };
