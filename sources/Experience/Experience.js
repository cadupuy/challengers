import { Scene, Mesh } from "three";
import {Howl, Howler} from 'howler';

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";
import Mouse from "@utils/Mouse.js";
import Parallax from "@utils/Parallax.js";

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
    raycastPlugin(this);
    this.debug = new Debug();
    this.stats = new Stats();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new Scene();
    this.resources = new Resources(sources);
    this.parallax = new Parallax();
    this.mouse = new Mouse();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

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
    this.AUDIO_PLAYING;

    //this.IS_VOICE_MODE = false;
    this.subtitlesElement = document.querySelector('.subtitles-wrapper');
    this.motionWrapperElement = document.querySelector('.motion-wrapper');

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
    this.world.update();
    this.renderer.resize();
  }

  update() {
    if (this.stats.active) this.stats.update();
    this.camera.update();
    this.world.update();
    this.renderer.update();
    this.$raycast.update(this.camera.instance);
  }

  startMotion() {
    this.motionWrapperElement.classList.add('active');
    this.startAudio(1)
  }

  startAudio(index) { 
    this.AUDIO_PLAYING = audios[index-1];
    this.playAudio();
    this.startSubtitles();
  }
  
  playAudio() {
    let audio = new Howl({ src: [this.AUDIO_PLAYING.path] });
    audio.play();
  }

  startSubtitles() {

    let subtitlesLength = this.getSubtitlesLength();

    let timecode = 0;
    let timecodeMS = 0;

    let current_subtitle;

    const interval = setInterval(() => {

      timecode++;
      timecodeMS = timecode / 10;

      current_subtitle = this.AUDIO_PLAYING.subtitles.filter((elt, i) => {
        return this.AUDIO_PLAYING.subtitles[i+1]?.time > timecodeMS
      })[0];

      if(current_subtitle != undefined)
        this.subtitlesElement.innerHTML = current_subtitle.content;

      if(timecodeMS === subtitlesLength) {
        clearInterval(interval);
        console.log('fin');
      }

    }, 100)
  }

  getSubtitlesLength() {
    let subtitles = this.AUDIO_PLAYING.subtitles;
    // Add 2 seconds after the last subtitle timing to get the last sentence
    return subtitles[subtitles.length-1].time;
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
