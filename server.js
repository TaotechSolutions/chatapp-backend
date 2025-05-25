require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const server = require('http').createServer(app)
const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: server })  // use for WebSocket 
const db = require('./config/db')
const PORT = process.env.PORT || 3500;

const { usersRoutes } = require("./routes/apiRouter");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("An error have occurred!");
});

db.connectDB();


// app.use("/", express.static(path.join(__dirname, "public")));
// app.use("/", require("./routes/root"));

// app.all("/*", (req, res) => {
//   res.status(404);
//   if (req.accepts("html")) {
//     res.sendFile(path.join(__dirname, "views", "404.html"));
//   } else if (req.accepts("json")) {
//     res.json({ message: "404 Not Found" });
//   } else {
//     res.type("txt").send("404 Not Found");
//   }
// });


app.use("/api/user", usersRoutes);
// add other routes here

server.listen(PORT, () => console.log(`Server running on ${PORT}`))
