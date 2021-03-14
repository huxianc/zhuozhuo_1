const baseUrl = "http://localhost:3002";
const tips = new Tips();

// ajax函数默认的参数
const ajaxDefaultOptions = {
  url: "", // 请求地址，默认为空
  method: "GET", // 请求方式，默认为GET请求
  async: true, // 请求同步还是异步，默认异步
  timeout: 0, // 请求的超时时间
  dataType: "application/json", // 请求的数据格式
  data: null, // 请求的参数，默认为空
  headers: {}, // 请求头，默认为空
  onprogress: function () {}, // 从服务器下载数据的回调
  onuploadprogress: function () {}, // 处理上传文件到服务器的回调
  xhr: null, // 允许函数外部创建xhr传入，但是必须不能是使用过的
};

function _ajax(paramOptions) {
  const options = Object.assign({}, ajaxDefaultOptions, paramOptions);

  // 如果外部传入xhr，否则创建一个
  let xhr = options.xhr || new XMLHttpRequest();
  // return promise对象
  return new Promise(function (resolve, reject) {
    const {
      method,
      url,
      async,
      timeout,
      headers,
      dataType,
      onprogress,
      onuploadprogress,
    } = options;
    xhr.open(method, baseUrl + url, async);
    xhr.timeout = timeout;
    // 设置请求头
    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }
    // 注册xhr对象事件
    xhr.responseType = dataType;

    //从服务器上下载数据每50ms触发一次
    xhr.onprogress = onprogress;
    xhr.onuploadprogress = onuploadprogress;
    // 开始注册事件
    // onloadend：请求结束，无论成功或者失败
    xhr.onloadend = function () {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        const { readyState, response } = xhr;
        if (readyState === 4) {
          const res = JSON.parse(response);
          if (res.code === 0) {
            resolve(res);
          } else {
            tips.append(res.msg, "error");
            reject({
              errorType: res.msg,
              xhr: xhr,
            });
          }
        } else {
          reject({
            errorType: "readyState_error",
            xhr: xhr,
          });
        }
      } else {
        reject({
          errorType: "status_error",
          xhr: xhr,
        });
      }
    };
    // 请求超时
    xhr.ontimeout = function () {
      reject({
        errorType: "timeout_error",
        xhr: xhr,
      });
    };

    // 服务器异常，请求错误
    xhr.onerror = function () {
      reject({
        errorType: "onerror",
        xhr: xhr,
      });
    };

    // abort错误(未明白，只知道是三种异常中的一种)
    xhr.onabort = function () {
      reject({
        errorType: "onabort",
        xhr: xhr,
      });
    };

    // 捕获异常
    try {
      xhr.send(options.data);
    } catch (error) {
      reject({
        errorType: "send_error",
        error: error,
      });
    }
  });
}
