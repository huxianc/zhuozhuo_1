const express = require("express");

const app = express();

app.use(require("cors")());
app.use(express.json());

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/baseStr", express.static(__dirname + "/uploadStr"));

require("./routes")(app);

app.listen(3002, () => {
  console.log("App is listening in 3002!");
  console.log("http://localhost:3002");
});
