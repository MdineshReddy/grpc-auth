const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const grpc = require("grpc");
const JWT = require("jsonwebtoken");

// (required for authentification)

function authenticateRequest(call, callback) {
  const token = call.metadata.get("authorization")[0];
  try {
    let id = JWT.verify(token, "JWT_SECRET");
    return id;
  } catch (e) {
    callback({
      code: grpc.status.UNAUTHENTICATED,
      message: "Invalid Token",
    });
  }
}

exports.readOrders = async (call, callback) => {
  authenticateRequest(call, callback);
  try {
    const orders = await Order.find({});
    callback(null, { orders: orders });
  } catch (e) {
    console.log("Error While Reading Orders: " + e);
    callback({
      code: grpc.status.UNAVAILABLE,
      message: "Unable to Read Orders",
      status: grpc.status.INTERNAL,
    });
  }
};

exports.createOrder = async (call, callback) => {
  const id = authenticateRequest(call, callback);
  try {
    const { inventory } = call.request;

    const buyer = await User.findById(id);

    const { name: buyerName, email: buyerEmail } = buyer;

    if (inventory.length == 0) {
      console.log("Empty Inventory");
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Empty Inventory",
      });
    } else {
      const order = await Order.create({ buyerName, buyerEmail, inventory });
      callback(null, { status: "Order Succesfully Created" });
    }
  } catch (e) {
    console.log("Error While Creating Order: " + e);
    callback({
      code: grpc.status.INTERNAL,
      message: "Error While Creating Order",
    });
  }
};

exports.readOrderById = async (call, callback) => {
  try {
    const order = await Order.findById(call.request._id);
    if (order) {
      callback(null, {
        _id: order._id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        inventory: order.inventory,
        message: "Successfully retrieved",
      });
    } else {
      console.log("No Order with the Given ID");
      callback({
        code: grpc.status.NOT_FOUND,
        message: "No Order with the Given ID",
      });
    }
  } catch (e) {
    console.log("Error While Reading Order: " + e);
    callback({
      code: grpc.status.INTERNAL,
      message: "Error While Reading Order",
    });
  }
};

exports.updateOrderById = async (call, callback) => {
  try {
    const { _id } = call.request;
    const order = await Order.findById(_id);
    if (order) {
      const newOrder = await Order.findByIdAndUpdate(_id, call.request, {
        new: true,
        runValidators: true,
      });
      callback(null, { status: "Order Succesfully Updated" });
    } else {
      console.log("No Order with the Given ID");
      callback({
        code: grpc.status.NOT_FOUND,
        message: "No Order with the Given ID",
      });
    }
  } catch (e) {
    console.log("Error While Updating Order: " + e);
    callback({
      code: grpc.status.INTERNAL,
      message: "Error While Updating Order",
    });
  }
};

exports.deleteOrderById = async (call, callback) => {
  try {
    const { _id } = call.request;
    const order = await Order.findByIdAndDelete(_id);
    callback(null, { status: "Order Succesfully Deleted" });
  } catch (e) {
    console.log("Error While Deleting Order: " + e);
    callback({
      code: grpc.status.INTERNAL,
      message: "Error While Deleting Order",
    });
  }
};
