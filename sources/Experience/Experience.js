import { Scene, Mesh } from "three";

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";

import World from "@world/World.js";

import Camera from "@experience/Camera.js";
import Renderer from "@experience/Renderer.js";
import sources from "@experience/sources.js";
import { raycastPlugin } from "./Plugin/raycastPlugin";

let instance = null;

export default class Experience {
  constructor(_canvas) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = _canvas;

    // Setup
    this.setRaycaster();
    this.setDebug();
    this.setStats();
    this.setSizes();
    this.setTime();
    this.setScene();
    this.setResources();
    this.setCamera();
    this.setRenderer();
    this.setWorld();

    //this.IS_VOICE_MODE = false;
    this.motionWrapper = document.querySelector('.motion-wrapper');

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    window.experience = this;
  }

  setRaycaster() {
    raycastPlugin(this);
  }

  setDebug() {
    this.debug = new Debug();
  }

  setStats() {
    this.stats = new Stats();
  }

  setSizes() {
    this.sizes = new Sizes();
  }

  setTime() {
    this.time = new Time();
  }

  setScene() {
    this.scene = new Scene();
  }

  setResources() {
    this.resources = new Resources(sources);
  }

  setCamera() {
    this.camera = new Camera();
  }

  setRenderer() {
    this.renderer = new Renderer();
  }

  setWorld() {
    this.world = new World();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    if (this.stats.active) this.stats.update();
    this.camera.update();
    this.world.update();
    this.renderer.update();
    this.$raycast.update(this.camera.instance);
  }

  startMotion(index) {
    this.motionWrapper.classList.add('active');
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof Mesh) {
        child.geometry.dispose();

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.controls.dispose();
    this.renderer.instance.dispose();

    if (this.debug.active) this.debug.ui.destroy();
  }
}
