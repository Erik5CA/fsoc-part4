const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const blogRouter = require("./controllers/blog");
const usersRouter = require("./controllers/user");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");

const { MONGODB_URI } = require("./utils/config");
const logger = require("./utils/logger");

mongoose.set("strictQuery", false);

logger.info("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.tokenExtractor);
// app.use(middleware.requestLogger);

app.use("/api/login", loginRouter);
app.use("/api/blogs", blogRouter);
// app.use("/api/blogs", middleware.userExtractor, blogRouter);
app.use("/api/users", usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
