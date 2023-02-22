import { Scene, Mesh } from "three";
import {Howl, Howler} from 'howler';

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";

import World from "@world/World.js";

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
    this.setDebug();
    this.setStats();
    this.setSizes();
    this.setTime();
    this.setScene();
    this.setResources();
    this.setCamera();
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
    
    /**
     * MOTION :
     * 1 - Chaussure
     * 2 - Micro
     * 3 - Manette
     * 4 - Lunette
     * 5 - Airpods
     * 6 - Lien
     */
    this.MOTION;

    //this.IS_VOICE_MODE = false;
    this.motionWrapper = document.querySelector('.motion-wrapper');

    this.audio1 = new Howl({
      src: ['/audio/extrait-timothee.mp3']
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
    this.MOTION = index;
    this.motionWrapper.classList.add('active');
  }

  startAudio() {
    this.audio1.play();
    this.startSubtitles(1);
  }

  startSubtitles(index) {
    if(audios[index-1] === undefined) return false;
    // Get the total length of all the subtitles
    let dureeTotale = 0;
    for(let subtitle of audios[index-1].subtitles) dureeTotale += subtitle.time;
    console.log('Durée totale : ' + dureeTotale);
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
