import { Scene, Mesh } from "three";
import { Howl, Howler } from "howler";

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";
import Mouse from "@utils/Mouse.js";

import World from "@world/World.js";

import Loader from "./Loader";

import Camera from "@experience/Camera.js";
import Renderer from "@experience/Renderer.js";
import sources from "@experience/sources.js";
import audios from "@experience/audios.js";
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
    this.setMouse();
    this.setDebug();
    this.setStats();
    this.setSizes();
    this.setTime();
    this.setScene();
    this.setResources();
    this.setLoader();
    this.setCamera();
    this.setParallax();
    this.setRenderer();
    this.setWorld();

    /**
     * SCENE :
     * 1 - Écran d'accueil
     * 2 - Couloir scroll
     * 3 - Vestiaire
     * 4 - Casier (intérieur)
     * 5 - Motion (peu importe lequel)
     * 6 - Écran de fin
     */
    this.SCENE = 0;
    this.MOTION;
    this.ID_AUDIO_PLAYING;

    //this.IS_VOICE_MODE = false;
    this.motionWrapper = document.querySelector(".motion-wrapper");

    this.audio1 = new Howl({
      src: ["/audio/extrait-timothee.mp3"],
    });

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

  setLoader() {
    this.loader = new Loader();
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

  setMouse() {
    this.mouse = new Mouse();
  }

  setParallax() {
    // this.parallax = new Parallax();
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
    this.world.update();
    this.renderer.resize();
  }

  update() {
    if (this.stats.active) this.stats.update();
    this.camera.update();
    if (this.parallax) this.parallax.update();
    if (this.world) this.world.update();
    if (this.renderer) this.renderer.update();
    this.$raycast.update(this.camera.instance);
  }

  startMotion(index) {
    // Show the motion
    this.motionWrapper.classList.add("active");
    this.ID_AUDIO_PLAYING = index;
    this.startAudio();
  }

  startAudio() {
    this.startSubtitles();
  }

  getSubtitlesLength(subtitles) {
    let length = 0;
    for (let subtitle of subtitles) length += subtitle.time;
    return length;
  }

  startSubtitles() {
    if (audios[this.ID_AUDIO_PLAYING - 1] === undefined) return false;
    let dureeTotale = this.getSubtitlesLength(audios[this.ID_AUDIO_PLAYING - 1].subtitles);
    console.log("Durée totale : " + dureeTotale);
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
