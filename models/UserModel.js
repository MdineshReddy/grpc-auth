const mongoose = require("mongoose");

// (required for authentification)

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Name is required"],
    },
    email: {
      type: String,
      required: [true, "User Email is required"],
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
