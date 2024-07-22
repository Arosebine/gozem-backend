require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const http = require('http');
const socketIo = require('socket.io');
const errorMiddleware = require("./src/middlewares/errorHandling");
const connectDB = require("./src/database/packageDatabase");
const packageRoutes = require("./src/packages/routes/packages.routes");
const deliveryRoutes = require("./src/delivery/routes/delivery.routes");
const socketRoute = require('./src/websocket/socket');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
connectDB();

const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));


app.get("/", (req, res) => {
  res.send("Hello World, Gozem!");
});

app.use("/api/package", packageRoutes);
app.use("/api/delivery", deliveryRoutes);

socketRoute(io);

app.use(errorMiddleware);


server.listen(port, () => {
  console.log(`Gozem Server is running on port: http://localhost:${port}`);
});
