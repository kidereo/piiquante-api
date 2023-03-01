require("dotenv").config();
const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const startupDebugger = require("debug")("app:startup");
const objectDebugger = require("debug")("app:objects");
const dbDebugger = require("debug")("app:db");

const auth = require("./middleware/auth");
const homeRoute = require("./routes/home");
const userRoutes = require("./routes/users");
const sauceRoutes = require("./routes/sauces");
const authRoutes = require("./routes/auth");

mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASSWORD +
      "@" +
      process.env.DB_PATH +
      "/" +
      process.env.DB_NAME +
      "?retryWrites=true&w=majority"
  )
  .then(() => dbDebugger("Database connection sucessfull..."))
  .catch((error) =>
    dbDebugger("Database connection failed with message:", error.message)
  );

/**
 * Start Test Ground
 */

/**
 * End Test Ground
 */

app.use(express.json());
app.use(express.static("public"));
app.use(helmet());
//objectDebugger(helmet);
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled...");
}
//app.use(auth);
app.use("/api", homeRoute);
app.use("/api/users", userRoutes);
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", authRoutes);

const port = config.get("port") || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`));
