const generateId = () => parseInt(Math.random() * 10000);

class Tips {
  constructor(options) {
    this.defaultOptions = {
      type: "success",
      duration: 2 * 1000,
    };
    this.options = Object.assign({}, this.defaultOptions, options);
    this.tips = document.querySelector("#tips");
  }

  append(msg, type = this.options.type, duration = this.options.duration) {
    const types = ["error", "success", "info"];
    if (types.includes(type)) {
      const id = `tip-item-${generateId()}`;

      const div = document.createElement("div");
      div.classList.add("tips-item", type);
      div.setAttribute("id", id);
      div.innerText = msg;

      this.tips.appendChild(div);

      setTimeout(() => {
        const el = document.querySelector(`#${id}`);
        this.tips.removeChild(el);
      }, duration);
    } else {
      throw new Error("不存在这种类型");
    }
  }
}
