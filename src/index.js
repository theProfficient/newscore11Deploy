require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").createServer(app);
const mongoose = require("mongoose");
const route = require("./route/routes");
const socketIO = require("./socket/socket"); // Import your Socket.io module
const corsOptions = {
  origin: "*", 
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/", route);

mongoose.set("strictQuery", false);

// Use 'process.env' to access the MongoDB connection string
//________________for development____________________________
  // const mongooseConnectionString = process.env.mongooseConnectionString;
//________________________for local test____________________________________
const mongooseConnectionString =
// "mongodb+srv://theproficienttech333:gzYGYI5pD4oAUvim@cluster0.gp7jlnb.mongodb.net/game"
 "mongodb+srv://nikita1:7CSKh9nBmgBm27YC@cluster0.suzof1p.mongodb.net/nikita";

mongoose
  .connect(mongooseConnectionString, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("MongoDB is connected for local");

    // Initialize Socket.io with your server
    socketIO(http);

    const port = process.env.PORT || 4001;
    http.listen(port, () => {
      console.log(`Express app running on port ${port}`);
    });

    // let count = 0;
    // setInterval(function(){
    //   io.emit('msg_to_postman','client','test msg'+count);
    //   count++
    // },1000)
  })
  .catch((error) => {
    console.log(error);
    console.log("Not connected");
  });

