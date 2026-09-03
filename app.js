require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectToDB = require("./src/db/db");

const mainRoutes = require("./src/api/v1/routes");

const errorHanlder = require("./src/middleware/error.middleware");
const notFoundHandler = require("./src/middleware/notFound.middleware");
const { PORT } = require("./src/config/key");
const configCors = require("./src/config/cors");
const { requestLogger } = require("./src/middleware/logger.middleware");
const app = express();

app.use(requestLogger);
app.use(configCors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/", mainRoutes);

app.use(notFoundHandler);
app.use(errorHanlder);
(async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}\nLink: http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
