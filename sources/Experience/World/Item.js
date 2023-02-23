import * as THREE from "three";

import Experience from "@experience/Experience.js";

export default class Item {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("item");
    }

    // Resource
    this.resource = this.resources.items.quatre;
    this.texture = this.resources.items.texture;

    this.setModel();
  }

  // NOTES :
  //vector3.lerp
  // lerp entre 2 positions

  setModel() {
    this.model = this.resource.scene;
    this.scene.add(this.model);

    this.texture.flipY = false;
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: this.texture });

    this.experience.$raycast.add(this.model, {
      onClick: () => {
        this.experience.startMotion();
      },
    });

    this.model.traverse((child) => {
      if (child.name === "Objet_1_Suzanne") {
        child.material = bakedMaterial;
        this.suzanne = child;

        this.experience.$raycast.add(child, {
          onClick: () => {
            this.experience.startMotion();
          },
        });
      }
    });
  }

  update() {
    this.suzanne.rotation.y += 0.01;
  }
}
