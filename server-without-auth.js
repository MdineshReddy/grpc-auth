const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const {
  readOrders,
  createOrder,
  readOrderById,
  updateOrderById,
  deleteOrderById,
} = require("./methods/OrderMethods");
require("dotenv").config();

// load the product proto file
const packageDefinition = protoLoader.loadSync("./protos/Order.proto", {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load a gRPC package definition as a gRPC object
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// Get our OrdersPackage from our Order.proto file
const ordersPackage = grpcObject.OrdersPackage;

// Create a gRPC server
const server = new grpc.Server();

// Set the port, our server will be listening on
server.bind("0.0.0.0:8000", grpc.ServerCredentials.createInsecure());

// Map the services with their implementations
server.addService(ordersPackage.Order.service, {
  readOrders: readOrders,
  createOrder: createOrder,
  readOrderById: readOrderById,
  updateOrderById: updateOrderById,
  deleteOrderById: deleteOrderById,
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // start the server
    console.log("Starting server on 0.0.0.0:8000:");
    server.start();
  })
  .catch((e) => {
    console.log(e);
  });
