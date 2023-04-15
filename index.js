global.rootDir = __dirname;
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
require("./config/env");
const routes = require("./routes");
const { default: mongoose } = require("mongoose");

mongoose
  .connect(
    process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database connected");
  });
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(morgan("tiny"));
app.use("/", routes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
console.log('process.env.PORT', process.env.PORT)
const PORT = process.env.PORT || 5000;
//Start server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
