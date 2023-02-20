import Experience from "@experience/Experience.js";

import Environment from "@world/Environment.js";
import Box from "@world/Box.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.setEnvironment();
    this.setBox();
  }

  setEnvironment() {
    this.environment = new Environment();
  }

  setBox() {
    this.box = new Box();
  }

  update() {
    if (this.box) this.box.update();
  }
}
