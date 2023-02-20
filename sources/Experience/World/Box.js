import { Mesh, BoxGeometry, MeshStandardMaterial } from "three";
import Experience from "@experience/Experience.js";

export default class Box {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("box");
    }

    this.setBox();
  }

  setBox() {
    this.box = new Mesh(
      new BoxGeometry(3, 3, 3),
      new MeshStandardMaterial({
        color: "red",
      })
    );
    this.scene.add(this.box);

    // Debug
    if (this.debug.active) {
      this.debugFolder.add(this.box.position, "x").name("x").min(-100).max(100).step(0.001);
      this.debugFolder.add(this.box.position, "y").name("y").min(-100).max(100).step(0.001);
      this.debugFolder.add(this.box.position, "z").name("z").min(-100).max(100).step(0.001);
    }
  }

  update() {
    this.box.rotation.z += 0.01;
    this.box.rotation.y += 0.01;
  }
}
