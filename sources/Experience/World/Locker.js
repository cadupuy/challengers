import Experience from "@experience/Experience.js";
import { MeshBasicMaterial, MeshStandardMaterial } from "three";

export default class Locker {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("locker");
    }

    // Resource
    this.resource = this.resources.items.fond;
    this.diffuseMap = this.resources.items.diffuse;
    this.normalTexture = this.resources.items.normal;
    this.roughnessMap = this.resources.items.roughness;

    this.setModel();
  }

  // NOTES :
  //vector3.lerp
  // lerp entre 2 positions
  // ktx loader
  // cocher case compression blender

  setModel() {
    this.model = this.resource.scene;
    this.scene.add(this.model);

    this.diffuseMap.flipY = false;
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.material = new MeshStandardMaterial({
          map: this.diffuseMap,
          normalMap: this.normalTexture,
          roughnessMap: this.roughnessMap,
        });
      }
    });
  }
}
