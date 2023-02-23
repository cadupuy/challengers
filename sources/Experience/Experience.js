import { Scene, Mesh } from "three";
import { Howl } from "howler";

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";
import Mouse from "@utils/Mouse.js";

import World from "@world/World.js";

import Loader from "./Loader";

import UI from "@ui/UI.js";
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
    this.CURRENT_MOTION;
    this.CURRENT_AUDIO;
    this.AUDIO_IS_PLAYING = false;

    this.audio;
    this.subtitles;

    this.audios = audios;

    this.motionWrapperElement = document.querySelector('.motion-wrapper');
    this.theaterElement = this.motionWrapperElement.querySelector('.theater');
    this.closeMotionElement = this.motionWrapperElement.querySelector('.close');
    this.subtitlesElement = document.querySelector('.subtitles-wrapper');

    this.ui = new UI();

    this.closeMotionElement.addEventListener('click', () => {
      this.stopMotion();
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
    if(index >= 1 && index < 4) {
      this.CURRENT_MOTION = index;
      this.motionWrapperElement.classList.add('active');
      this.startMotionAnimation();
      this.startMotionAudio();
    }
  }

  resetMotionsAnimations() {
    for(let motion of this.motionWrapperElement.querySelectorAll('.motion')) {
      motion.classList.remove('active');
    }
  }

  startMotionAnimation() {
    this.resetMotionsAnimations();
    this.theaterElement.querySelector(`.motion-${this.CURRENT_MOTION}`).classList.add('active');
  }

  stopMotion() {
    this.motionWrapperElement.classList.remove('active');
    this.stopMotionAudio();
    this.stopSubtitles();
  }

  startMotionAudio() { 
    this.CURRENT_AUDIO = audios[this.CURRENT_MOTION-1];
    if(!this.AUDIO_IS_PLAYING) {
      this.playMotionAudio();
      this.startSubtitles();
    }
  }
  
  playMotionAudio() {

    this.AUDIO_IS_PLAYING = true;
    this.audio = new Howl({ src: [this.CURRENT_AUDIO.path] });
    this.audio.play();

    this.audio.on('end', function() {
      this.AUDIO_IS_PLAYING = false;
    });

  }

  stopMotionAudio() {

    this.audio.stop();
    this.AUDIO_IS_PLAYING = false;

  }

  resetSubtitles() {
    this.subtitlesElement.innerHTML = '';
  }

  startSubtitles() {

    let subtitlesLength = this.getSubtitlesLength();
    let timecode = 0, timecodeMS = 0, current_subtitle;

    this.subtitles = setInterval(() => {

      timecode++;
      timecodeMS = timecode / 10;

      current_subtitle = this.CURRENT_AUDIO.subtitles.filter((elt, i) => {
        return this.CURRENT_AUDIO.subtitles[i+1]?.time > timecodeMS
      })[0];

      if(current_subtitle != undefined)
        this.subtitlesElement.innerHTML = `<span>${current_subtitle.content}</span>`;

      if(timecodeMS === subtitlesLength) {
        clearInterval(this.subtitles);
        setTimeout(() => {
          this.resetSubtitles();
        }, 1000);
      }

    }, 100)
  }

  stopSubtitles() {
    this.resetSubtitles();
    clearInterval(this.subtitles);
  }

  getSubtitlesLength() {
    let subtitles = this.CURRENT_AUDIO.subtitles;
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
