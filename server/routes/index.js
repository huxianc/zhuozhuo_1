const fs = require("fs");
const utils = require("../utils");

module.exports = app => {
  const bodyParser = require("body-parser"); /*post方法*/
  app.use(bodyParser.json()); // 添加json解析
  app.use(bodyParser.urlencoded({ extended: false }));

  const multer = require("multer");
  const storage = multer.diskStorage({
    destination(req, res, cb) {
      cb(null, __dirname + "/../uploads");
    },
    filename(req, file, cb) {
      console.log(file);
      const name = utils.createHash();
      file.hashname = name;
      cb(null, name);
    },
  });
  // const upload = multer({ dest: __dirname + "/../uploads" });

  const upload = multer({ storage });
  app.post("/uploadImage", upload.single("file"), async (req, res) => {
    console.log(req.file);
    const file = req.file;

    res.send({
      code: 0,
      data: {
        name: file.hashname,
        url: `http://localhost:3002/uploads/${file.filename}`,
      },
      msg: "上传成功",
    });
  });

  app.post("/baseStr", async (req, res) => {
    const date = new Date().getTime();

    fs.writeFile(
      __dirname + `/../uploadStr/${date}.txt`,
      req.body.str,
      "utf8",
      error => {
        if (error) {
          console.log("error=>", error);
          res.send({
            code: -1,
            data: null,
            msg: error,
          });
        } else {
          res.send({
            code: 0,
            data: {
              filename: `${date}.txt`,
              fileUrl: `http://localhost:3002/uploadStr/${date}.txt`,
            },
            msg: "上传成功",
          });
        }
      }
    );
  });
};
