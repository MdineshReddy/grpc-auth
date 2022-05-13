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

const {
  registerUser,
  loginUser,
  deleteUser,
} = require("./methods/UserMethods");

// load the product proto file
const orderPackageDefinition = protoLoader.loadSync("./protos/Order.proto", {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load a gRPC package definition as a gRPC object
const orderGrpcObject = grpc.loadPackageDefinition(orderPackageDefinition);

// Get our OrdersPackage from our Order.proto file
const ordersPackage = orderGrpcObject.OrdersPackage;

// load the user proto file
const usersPackageDefinition = protoLoader.loadSync("./protos/User.proto", {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load a gRPC package definition as a gRPC object
const usersGrpcObject = grpc.loadPackageDefinition(usersPackageDefinition);

// Get our UsersPackage from our User.proto file
const usersPackage = usersGrpcObject.UsersPackage;

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

server.addService(usersPackage.User.service, {
  registerUser: registerUser,
  loginUser: loginUser,
  // deleteUser: deleteUser,
});

mongoose
  .connect(
    "mongodb://dinesh:1234@merndb-shard-00-00.gyjzj.mongodb.net:27017,merndb-shard-00-01.gyjzj.mongodb.net:27017,merndb-shard-00-02.gyjzj.mongodb.net:27017/grpc-test?ssl=true&replicaSet=atlas-x21qxe-shard-0&authSource=admin&retryWrites=true&w=majority"
  )
  .then(() => {
    // start the server
    console.log("Starting server on 0.0.0.0:8000:");
    server.start();
  })
  .catch((e) => {
    console.log(e);
  });
