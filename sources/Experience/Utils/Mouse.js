import { Vector2 } from "three";

import Experience from "@experience/Experience.js";

const tVec2a = new Vector2();
const tVec2b = new Vector2();
const tVec2c = new Vector2();

export default class Mouse {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;

    this.setInstance();
    document.addEventListener("mousemove", this.getMousesPositions);
  }

  setInstance() {
    // Mouse's positions in the DOM
    this.dom = tVec2a;
    // Mouse's positions for fragment shader (x: [0, 1], y:[0, 1])
    this.frag = tVec2b;
    // Mouse's positions in the scene (x: [-1, 1], y:[-1, 1])
    this.scene = tVec2c;
  }

  getMousesPositions = (e) => {
    this.dom.set(e.clientX, e.clientY);
    this.frag.set(this.dom.x / window.innerWidth, this.dom.y / window.innerHeight);
    this.scene.set((this.dom.x / window.innerWidth) * 2 - 1, -(this.dom.y / window.innerHeight) * 2 + 1);
  };

  destroy() {
    document.removeEventListener("mousemove", this.getMousesPositions);
  }
}
