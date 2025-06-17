require("dotenv").config();
require("./config/passport");
const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");
const server = require('http').createServer(app)
const cookieParser = require("cookie-parser");
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: server })  // use for WebSocket 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const db = require('./config/db')
const cors = require("cors");
const { origins, methods } = require("./routes/allowedURLs");
const { usersRoutes } = require("./routes/apiRouter");
const { RegRoutes } = require("./routes/apiRouter");


const PORT = process.env.PORT || 3500;
const swaggerDocument = YAML.load(path.join(__dirname, './swagger/swagger.yaml'));


app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Apply global CORS middleware once
app.use(cors({
  origin: origins,
  methods,
  credentials: true,
}));

// Swagger docs with HTTP-only cookie support
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    withCredentials: true,
     requestInterceptor: req => {
      req.credentials = 'include';
      return req;
    }
  }
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("An error have occurred!");
});

db.connectDB()

app.use("/api/user", usersRoutes);
app.use('/api/user', RegRoutes);
// add other routes here

server.listen(PORT, () => console.log(`Server running on ${PORT}`))
