import { Howler } from "howler";
import toggleFullScreen from "@utils/UI.js";
import Experience from "../Experience/Experience";

let instance = null;

export default class UI {

  constructor() {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.ui = this;

    this.experience = new Experience();

    this.audioVolume = 1;
    
    this.sound_elt = document.querySelector('.ui-elt.sound');
    this.fullscreenElement = document.querySelector('.ui-elt.fullscreen');
    this.vocalElement = document.querySelector('.ui-elt.vocal');
    this.soundElement = document.querySelector('.ui-elt.sound');

    this.setEvents();

  }

  setEvents() {

    this.vocalElement.addEventListener('click', () => {
      this.setRecognition();
    });

    this.fullscreenElement.addEventListener('click', () => {
      this.toggleFullScreen();
    });

    this.soundElement.addEventListener('click', () => {
      this.toggleAudioVolume();
    });

  }

  setRecognition() {

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

      if(_currrentSubtitle.includes('fermer')) {
        this.stopMotion();
      }

      if(_currrentSubtitle.includes('lancer')) {
        this.startMotion(1);
      }

      recognition.start()

    })

    recognition.start()
    
  }

  toggleAudioVolume() {

    switch (this.audioVolume) {
      case 1:
        this.audioVolume = 0;
        Howler.volume(0);
        this.soundElement.querySelector('span').innerHTML = 0;
        break;
      case .5:
        this.audioVolume = 1;
        Howler.volume(1);
        this.soundElement.querySelector('span').innerHTML = 100;
        break;
      case 0:
        this.audioVolume = .5;
        Howler.volume(.5);
        this.soundElement.querySelector('span').innerHTML = 50;
        break;
      default:
        console.log(`audio error`);
    }
    
  }

}
