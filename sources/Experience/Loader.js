import { PlaneGeometry, ShaderMaterial, Mesh } from "three";
import anime from "animejs";
import Experience from "@experience/Experience";

import vertex from "@shaders/loader/vert.glsl";
import fragment from "@shaders/loader/frag.glsl";

export default class Loader {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.loaderDiv = document.querySelector(".loader");

    this.resources.on("ready", () => {
      this.animations();
    });

    this.init();
  }

  init() {
    this.overlayGeometry = new PlaneGeometry(30, 30, 1, 1);
    this.overlayMaterial = new ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
        uColor: { value: 0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.overlay = new Mesh(this.overlayGeometry, this.overlayMaterial);
    this.overlay.name = "loader";
    this.scene.add(this.overlay);
  }

  animations() {
    const tl = anime.timeline();

    //set progress bar opacity to 0 with anime.js

    tl.add({
      targets: this.loaderDiv,
      opacity: 0,
      delay: 2000,
    });

    tl.add({
      targets: this.overlayMaterial.uniforms.uAlpha,
      value: 0,
      duration: 2000,
    });
  }
}
