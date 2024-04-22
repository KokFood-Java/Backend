require("dotenv").config();

const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const middlewareLogRequest = require("./middleware/logs");
const dbConnection = require("./config/dbConnection");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/user");
const customerRoutes = require("./routes/customer");
const courierRoutes = require("./routes/courier");
const adminRoutes = require("./routes/admin");

dbConnection();
app.use(cookieParser());
app.use(middlewareLogRequest.logRequest);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", userRoutes);
app.use("/customer", customerRoutes);
app.use("/courier", courierRoutes);
app.use("/admin", adminRoutes);

var server = app.listen(PORT, () => {
  console.log(`server running in port ${PORT}`);
});

module.exports = server;
