import { Scene, Mesh } from "three";
import { Howl, Howler } from "howler";

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";
import Mouse from "@utils/Mouse.js";
import toggleFullScreen from "@utils/UI.js";

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
    this.CURRENT_AUDIO;
    this.AUDIO_IS_PLAYING = false;
    this.AUDIO_VOLUME = 1;

    this.audio;

    this.subtitlesElement = document.querySelector('.subtitles-wrapper');
    this.motionWrapperElement = document.querySelector('.motion-wrapper');
    this.soundElement = document.querySelector('.ui-elt.sound');
    this.fullscreenElement = document.querySelector('.ui-elt.fullscreen');
    this.vocalElement = document.querySelector('.ui-elt.vocal');

    this.vocalElement.addEventListener('click', () => {
      this.setupRecognition();
    })

    this.fullscreenElement.addEventListener('click', () => {
      toggleFullScreen();
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

  setupRecognition() {

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;

    let _currrentSubtitle;

    recognition.addEventListener('result', e => {
      
      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)

      _currrentSubtitle = transcript[0].toLowerCase();

      //subtitles.innerHTML = transcript
    })
    
    recognition.addEventListener('end', e => {

      if(_currrentSubtitle.includes('plein écran')) {
        toggleFullScreen();
      }

      if(_currrentSubtitle.includes('volume')) {
        this.toggleAudioVolume();
      }

      if(_currrentSubtitle.includes('lancer')) {
        this.startMotion();
      }

      recognition.start()

    })

    recognition.start()
    
  }

  startMotion(index) {
    if(index >= 1 && index < 4) {
      this.motionWrapperElement.classList.add('active');
      this.startAudio(index)
    }
  }

  startAudio(index) { 
    this.CURRENT_AUDIO = audios[index-1];
    if(!this.AUDIO_IS_PLAYING) {
      this.playAudio();
      this.startSubtitles();
    }
  }

  toggleAudioVolume() {

    switch (this.AUDIO_VOLUME) {
      case 1:
        this.AUDIO_VOLUME = 0;
        Howler.volume(0);
        this.soundElement.querySelector('span').innerHTML = 0;
        break;
      case .5:
        this.AUDIO_VOLUME = 1;
        Howler.volume(1);
        this.soundElement.querySelector('span').innerHTML = 100;
        break;
      case 0:
        this.AUDIO_VOLUME = .5;
        Howler.volume(.5);
        this.soundElement.querySelector('span').innerHTML = 50;
        break;
      default:
        console.log(`audio error`);
    }
    
  }
  
  playAudio() {

    this.AUDIO_IS_PLAYING = true;
    this.audio = new Howl({ src: [this.CURRENT_AUDIO.path] });
    this.audio.play();

    this.audio.on('end', function() {
      this.AUDIO_IS_PLAYING = false;
    });

    this.soundElement.addEventListener('click', () => {
      this.toggleAudioVolume();
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
