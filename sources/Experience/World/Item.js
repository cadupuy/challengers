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

    console.log(this.model);

    this.texture.flipY = false;
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: this.texture });

    this.model.traverse((child) => {
      if (child.name === "Objet_1_Suzanne") {
        child.material = bakedMaterial;
        this.suzanne = child;

        this.experience.$raycast.add(child, {
          onClick: () => {
            this.experience.ui.startMotion(1);
          },
        });
      } else if(child.name === "Objet_2_Lampe") {
        this.experience.$raycast.add(child, {
          onClick: () => {
            this.experience.ui.startMotion(2);
          },
        });
      } else if(child.name === "Objet_3_Cone") {
        this.experience.$raycast.add(child, {
          onClick: () => {
            this.experience.ui.startMotion(3);
          },
        });
      } else if(child.name === "Objet_4_Ballon") {
        this.experience.$raycast.add(child, {
          onClick: () => {
            this.experience.ui.startMotion(4);
          },
        });
      }
    });
  }

  update() {
    this.suzanne.rotation.y += 0.01;
  }
}
