import EventEmitter from "./EventEmitter.js";

export default class Keyboard extends EventEmitter {
  constructor() {
    super();
    document.addEventListener("keydown", this.getKeyDown);
    document.addEventListener("keyup", this.getKeyUp);
  }

  getKeyDown = (e) => {
    const key = (e.key != " " ? e.key : e.code).toUpperCase();

    this.trigger("keydown", [key]);
  };

  getKeyUp = (e) => {
    const key = (e.key != " " ? e.key : e.code).toUpperCase();

    this.trigger("keyup", [key]);
  };

  destroy() {
    document.removeEventListener("keydown", this.getKeyDown);
    document.removeEventListener("keyup", this.getKeyUp);
  }
}
