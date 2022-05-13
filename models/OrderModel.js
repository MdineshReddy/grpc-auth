const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: [true, "Buyer Name is required"],
    },
    buyerEmail: {
      type: String,
      required: [true, "Buyer Email is required"],
    },
    inventory: [
      {
        productName: {
          type: String,
          required: [true, "Product Name is required"],
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
