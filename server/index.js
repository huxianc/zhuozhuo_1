const express = require("express");

const app = express();

app.use(require("cors")());
app.use(express.json());

require("./routes")(app);

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/uploadStr", express.static(__dirname + "/uploadStr"));

app.listen(3002, () => {
  console.log("App is listening in 3002!");
  console.log("http://localhost:3002");
});
