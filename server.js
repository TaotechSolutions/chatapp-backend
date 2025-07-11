require("dotenv").config();
require("./config/passport");
const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const cookieParser = require("cookie-parser");
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server: server }); // use for WebSocket
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const db = require("./config/db");
const cors = require("cors");
const { usersRoutes, authRoutes, profileRoutes } = require("./routes/apiRouter");
const { origins, methods, allowedHeaders } = require("./routes/allowedURLs");
const { errorHandler } = require("./utils/responses");

const PORT = process.env.PORT || 3500;
const swaggerDocument = YAML.load(path.join(__dirname, "./swagger/swagger.yaml"));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Apply global CORS middleware once
app.use(
  cors({
    origin: origins,
    methods,
    credentials: true,
    allowedHeaders,
  })
);

// Swagger docs with HTTP-only cookie support
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      withCredentials: true,
      requestInterceptor: req => {
        req.credentials = "include";
        return req;
      },
    },
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("An error have occurred!");
});

db.connectDB();

app;

app.use("/api/auth", authRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/profile", profileRoutes);
// add other routes here

app.use(errorHandler);
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
