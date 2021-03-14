/**
 * @description:
 * @param {String} type
 * @return {Boolean}
 */
const isImage = type => {
  return type.startsWith("image");
};

/**
 * @description:
 * @param {String} type
 * @return {Boolean}
 */
const isLimitImageType = type => {
  const imageTypes = ["png", "jpg", "jpeg"];
  return imageTypes.some(imageTypes => type.endsWith(imageTypes));
};

/**
 * @description: base64 转文件
 * @param {String} data base64 编码
 * @return {File}
 */
function base64ToFile(data) {
  // 将base64 的图片转换成file对象上传 atob将ascii码解析成binary数据
  let binary = atob(data.split(",")[1]);
  let mime = data.split(",")[0].match(/:(.*?);/)[1];
  let array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  let fileData = new Blob([new Uint8Array(array)], {
    type: mime,
  });

  let file = new File([fileData], `${new Date().getTime()}.png`, {
    type: mime,
  });

  return file;
}

/**
 * @description: 简单的浅层格式化
 * @param {Object} obj
 * @return {String}
 */
function formateArgs(obj) {
  const arr = [];
  Object.keys(obj).forEach(key => {
    arr.push(`${key}=${obj[key]}`);
  });

  return arr.join("&");
}

function downLoad(url, name = "下载图片") {
  const oA = document.createElement("a");
  oA.download = name; // 设置下载的文件名，默认是'下载'
  oA.href = url;
  document.body.appendChild(oA);
  oA.click();
  oA.remove(); // 下载之后把创建的元素删除
}
