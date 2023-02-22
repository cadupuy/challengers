import Experience from "@experience/Experience.js";

import Environment from "@world/Environment.js";
import Item from "@world/Item.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.setEnvironment();
      this.setLocker();
    });
  }

  setLocker() {
    this.item = new Item();
  }

  setEnvironment() {
    this.environment = new Environment();
  }

  update() {
    if (this.item) this.item.update();
  }
}
