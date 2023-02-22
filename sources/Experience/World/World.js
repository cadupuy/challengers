import Experience from "@experience/Experience.js";

import Environment from "@world/Environment.js";
import Item from "@world/Item.js";
import Spline from "@world/Spline.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.setEnvironment();
      this.setLocker();
      this.setSpline();
    });
  }

  setSpline() {
    this.spline = new Spline();
  }

  setLocker() {
    this.item = new Item();
  }

  setEnvironment() {
    this.environment = new Environment();
  }

  update() {
    if (this.item) this.item.update();
    if (this.spline) this.spline.update();
  }
}
