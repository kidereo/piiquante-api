require("dotenv").config();
const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const winston = require("winston");
require("winston-mongodb");

const startupDebugger = require("debug")("app:startup");
const exceptionsDebugger = require("debug")("app:exceptions");
const dbDebugger = require("debug")("app:db");

const auth = require("./middleware/auth");
const error = require("./middleware/error");
const homeRoute = require("./routes/home");
const userRoutes = require("./routes/users");
const sauceRoutes = require("./routes/sauces");
const authRoutes = require("./routes/auth");

const dbConnection =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_PATH +
  "/" +
  process.env.DB_NAME +
  "?retryWrites=true&w=majority";

//Handle uncaught exceptions and unhandled rejections outside Express
process.on("uncaughtException", (exception) => {
  exceptionsDebugger({ exception: exception });
  winston.error(exception.message, exception);
});

process.on("unhandledRejection", (exception) => {
  exceptionsDebugger({ exception: exception });
  winston.error(exception.message, exception);
});

//Log errors to the local logfile
winston.add(new winston.transports.File({ filename: "logfile.log" }));

//Log errors to the database
winston.add(
  new winston.transports.MongoDB({
    db: dbConnection,
    level: "info",
    options: { useUnifiedTopology: true },
  })
);

//Test log errors to the database
//throw new Error("Test: Exception logging to the database");

mongoose.set("strictQuery", false);
mongoose
  .connect(dbConnection)
  .then(() => dbDebugger("Database connection sucessfull..."))
  .catch((error) =>
    dbDebugger("Database connection failed with message:", error.message)
  );

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("public/images"));
app.use(helmet());
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled...");
}
//app.use(auth); //Global auth application on all routes.
app.use("/api", homeRoute);
app.use("/api/users", userRoutes);
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", authRoutes);

//Error middleware must be last
app.use(error);

const port = config.get("port") || 3001;
app.listen(port, () => startupDebugger(`Listening on port ${port}...`));
