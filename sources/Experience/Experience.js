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
    this.CURRENT_AUDIO;
    this.AUDIO_IS_PLAYING = false;
    this.AUDIO_VOLUME = 1;

    this.subtitlesElement = document.querySelector('.subtitles-wrapper');
    this.motionWrapperElement = document.querySelector('.motion-wrapper');
    this.soundElement = document.querySelector('.ui-elt.sound');
    this.fullscreenElement = document.querySelector('.ui-elt.fullscreen');

    this.fullscreenElement.addEventListener('click', () => {
      this.toggleFullScreen();
    })

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
    this.startAudio(2)
  }

  toggleFullScreen() {

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  
  }

  startAudio(index) { 
    this.CURRENT_AUDIO = audios[index-1];
    if(!this.AUDIO_IS_PLAYING) {
      this.playAudio();
      this.startSubtitles();
    }
  }
  
  playAudio() {

    this.AUDIO_IS_PLAYING = true;
    let audio = new Howl({ src: [this.CURRENT_AUDIO.path] });
    audio.play();

    audio.on('end', function() {
      this.AUDIO_IS_PLAYING = false;
    });

    this.soundElement.addEventListener('click', () => {
      if(this.AUDIO_VOLUME === 1) {
        this.AUDIO_VOLUME = .1;
        audio.volume(.1);
        this.soundElement.querySelector('span').innerHTML = 10;
      } else {
        this.AUDIO_VOLUME = 1;
        audio.volume(1);
        this.soundElement.querySelector('span').innerHTML = 100;
      }
    });

  }

  resetSubtitles() {
    this.subtitlesElement.innerHTML = '';
  }

  startSubtitles() {

    let subtitlesLength = this.getSubtitlesLength();
    let timecode = 0, timecodeMS = 0, current_subtitle;

    const interval = setInterval(() => {

      timecode++;
      timecodeMS = timecode / 10;

      current_subtitle = this.CURRENT_AUDIO.subtitles.filter((elt, i) => {
        return this.CURRENT_AUDIO.subtitles[i+1]?.time > timecodeMS
      })[0];

      if(current_subtitle != undefined)
        this.subtitlesElement.innerHTML = `<span>${current_subtitle.content}</span>`;

      if(timecodeMS === subtitlesLength) {
        clearInterval(interval);
        setTimeout(() => {
          this.resetSubtitles();
        }, 1000);
      }

    }, 100)
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
