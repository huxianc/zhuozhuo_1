let c_w = 400;
let c_h = 300;

let uploadImage = false;

const borderColors = {
  default: "#d9d9d9",
  in: "#25b864",
};

/**
 * @description: 拖拽时间绑定
 * @param {HTMLElement} el
 * @return {*}
 */
function dragHandler(el) {
  el.ondragover = e => {
    el.style.borderColor = borderColors.in;
    e.preventDefault();
  };
  el.ondrop = e => {
    e.preventDefault();
    el.style.borderColor = borderColors.default;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileItem = files[0];
      checkFile(fileItem);
    }
  };

  el.ondragleave = e => {
    el.style.borderColor = borderColors.default;
  };

  el.onclick = () => {
    inputClickHandler();
  };
}

/**
 * @description: 上传图片 绘制在canvas上
 * @param {HTMLImageElement} img
 * @return {*}
 */
function loadCanvas(img) {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");
  img.onload = () => {
    c_w = img.width;
    c_h = img.height;
    canvas.width = c_w;
    canvas.height = c_h;
    ctx.drawImage(img, 0, 0, c_w, c_h);
    toGray(ctx);
  };
}

/**
 * @description: 灰阶处理并更新 canvas
 * @param {*} ctx
 * @return {*}
 */
function toGray(ctx) {
  const imgData = ctx.getImageData(0, 0, c_w, c_h);
  const { data } = imgData;
  for (let i = 0; i < data.length; i += 4) {
    const R = data[i];
    const G = data[i + 1];
    const B = data[i + 2];

    const gray = R * 0.299 + G * 0.587 + B * 0.114;

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);
  uploadImage = true;
}

// 按钮事件
function bindBtn() {
  btn1();
  btn2();
  btn3();
  btn4();
}

function btn1() {
  const btn = document.querySelector("#button1");
  btn.onclick = () => {
    if (uploadImage) {
      const canvas = document.querySelector("#canvas");
      const base64 = canvas.toDataURL("image/png");
      const textarea = document.querySelector("#textarea");
      textarea.value = base64;
      textarea.select();
      document.execCommand("copy");
      tips.append("复制成功");
    } else {
      tips.append("还没有上传图片，请先上传图片", "info");
    }
  };
}
function btn2() {
  const btn = document.querySelector("#button2");
  btn.onclick = () => {
    if (uploadImage) {
      const canvas = document.querySelector("#canvas");
      const base64 = canvas.toDataURL("image/png");
      downLoad(base64);
    } else {
      tips.append("还没有上传图片，请先上传图片", "info");
    }
  };
}
function btn3() {
  const btn = document.querySelector("#button3");
  btn.onclick = async () => {
    if (uploadImage) {
      const canvas = document.querySelector("#canvas");
      const base64 = canvas.toDataURL("image/png");
      const args = formateArgs({
        str: base64,
      });
      changeLoading(true);
      const res = await _ajax({
        url: "/baseStr",
        method: "POST",
        dataType: "JSON",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        data: args,
      });

      if (res.code === 0) {
        tips.append(`${res.msg}，文件名：${res.data.filename}`);
      } else {
        tips.append(res.msg, "error");
      }
      changeLoading(false);
    } else {
      tips.append("还没有上传图片，请先上传图片", "info");
    }
  };
}

function btn4() {
  const btn = document.querySelector("#button4");
  btn.onclick = () => {
    if (uploadImage) {
      changeLoading(true);
      const canvas = document.querySelector("#canvas");
      const base64 = canvas.toDataURL("image/png");
      const image = new Image();
      image.src = base64;
      image.onload = async () => {
        const { width, height } = image;
        let startNum = base64.indexOf("base64,");
        startNum += 7;
        const str = base64.slice(startNum);

        const arr = [];

        for (let i = 0; i < str.length; i += 4) {
          const R = str[i].charCodeAt();
          const G = str[i + 1].charCodeAt();
          const B = str[i + 2].charCodeAt();

          arr.push(`rgba(${R},${G},${B},1)`);
        }

        const allLength = 4 * width * height;
        const gap = allLength - arr.length;

        for (let i = 0; i < gap; i++) {
          arr.push("rgba(255,255,200,1)");
        }

        const extraCanvas = document.querySelector("#extraCanvas");
        extraCanvas.width = width;
        extraCanvas.height = height;

        let index = 0;
        const extextraCtx = extraCanvas.getContext("2d");
        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            // extextraCtx.moveTo(j, i);
            extextraCtx.fillStyle = arr[index];
            extextraCtx.fillRect(j, i, 1, 1);
            index++;
          }
        }

        // 上传
        const formData = new FormData();

        const file = base64ToFile(extraCanvas.toDataURL());
        formData.append("file", file, file.filename);

        try {
          const res = await _ajax({
            url: "/uploadImage",
            method: "POST",
            data: formData,
          });
          tips.append(`${res.msg}，文件名：${res.data.name}`);
        } catch (error) {
          console.log(error);
          tips.append(`${error.msg}`, "error");
        }

        changeLoading(false);
      };
    } else {
      tips.append("还没有上传图片，请先上传图片", "info");
    }
  };
}

/**
 * @description: 切换加载遮罩
 * @param {Boolean} flag
 * @return {*}
 */
function changeLoading(flag) {
  const loading = document.querySelector(".mask");
  let scrollTop = 0;
  if (flag) {
    loading.style.display = "block";
    scrollTop = document.documentElement.scrollTop;
    document.documentElement.scrollTop = 0;
    document.body.style.overflow = "hidden";
  } else {
    loading.style.display = "none";
    document.body.style.overflow = "auto";
    document.documentElement.scrollTop = scrollTop;
  }
}

/**
 * @description: input file 触发点击事件
 * @param {*}
 * @return {*}
 */
function inputClickHandler() {
  const uploadFile = document.querySelector("input[type=file]");
  uploadFile.value = null;
  uploadFile.click();
  uploadFile.onchange = () => {
    const fileItem = uploadFile.files[0];
    checkFile(fileItem);
  };
}

/**
 * @description: 检查文件并执行绘制到canvas函数
 * @param {*} fileItem
 * @return {*}
 */
function checkFile(fileItem) {
  const { type } = fileItem;
  if (isImage(type) && isLimitImageType(type)) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(fileItem);
    console.log(fileItem);
    console.log(fileReader);
    fileReader.onload = () => {
      const img = new Image();
      img.src = fileReader.result;
      loadCanvas(img);
    };
  } else {
    tips.append("请上传 png/jpg/jpeg 格式的图片", "error");
  }
}

window.onload = () => {
  const dragger = document.querySelector("#dragger");
  const preview = document.querySelector("#preview");
  dragHandler(dragger, preview);
  bindBtn();
};
