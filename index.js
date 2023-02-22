const startupDebugger = require("debug")("app:startup");
const objectDebugger = require("debug")("app:objects");

const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const app = express();

const auth = require("./middleware/auth");
const homeRoute = require("./routes/home");
const sauceRoutes = require("./routes/sauces");

app.use(express.json());
app.use(express.static("public"));
app.use(helmet());
//objectDebugger(helmet);
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled...");
}
app.use(auth);
app.use("/api", homeRoute);
app.use("/api/sauces", sauceRoutes);

const port = config.get("port") || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`));
