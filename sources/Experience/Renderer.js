import {
  WebGLRenderer,
  Mesh,
  sRGBEncoding,
  CineonToneMapping,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  ACESFilmicToneMapping,
} from "three";

import Experience from "@experience/Experience.js";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("renderer");
    }

    this.setInstance();
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.instance.physicallyCorrectLights = true;
    this.instance.outputEncoding = sRGBEncoding;
    this.instance.setClearColor("#101010", 1);
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

    // Debug
    if (this.debug.active) {
      console.log(this.instance.info);

      this.debugFolder
        .add(this.instance, "toneMapping", {
          NoToneMapping: NoToneMapping,
          LinearToneMapping: LinearToneMapping,
          ReinhardToneMapping: ReinhardToneMapping,
          CineonToneMapping: CineonToneMapping,
          ACESFilmicToneMapping: ACESFilmicToneMapping,
        })
        .onChange(() => {
          this.scene.traverse((_child) => {
            if (_child instanceof Mesh) _child.material.needsUpdate = true;
          });
        });

      this.debugFolder.add(this.instance, "toneMappingExposure").min(0).max(10);
    }
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
