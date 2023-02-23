import { Howler } from "howler";
import toggleFullScreen from "@utils/UI.js";
import Experience from "@javascript/Experience.js";
import audios from "@json/audios.json";

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

		this.audio;
		this.audioVolume = 1;
		this.audioPlaying = false;

		/**
		 * SCENE :
		 * 1 - Écran d'accueil
		 * 2 - Couloir scroll
		 * 3 - Vestiaire
		 * 4 - Casier (intérieur)
		 * 5 - Motion (peu importe lequel)
		 * 6 - Écran de fin
		 */
		this.scene = 0;
		this.currentMotion;
		this.currentAudio;
		this.subtitles;
		this.audios = audios;

		this.motionWrapperElement = document.querySelector(".motion-wrapper");
		this.theaterElement = this.motionWrapperElement.querySelector(".theater");
		this.closeMotionElement = this.motionWrapperElement.querySelector(".close");
		this.subtitlesElement = document.querySelector(".subtitles-wrapper");

		this.sound_elt = document.querySelector(".ui-elt.sound");
		this.fullscreenElement = document.querySelector(".ui-elt.fullscreen");
		this.vocalElement = document.querySelector(".ui-elt.vocal");
		this.soundElement = document.querySelector(".ui-elt.sound");

		this.setEvents();
	}

	setEvents() {
		this.vocalElement.addEventListener("click", () => {
			this.setRecognition();
		});

		this.fullscreenElement.addEventListener("click", () => {
			toggleFullScreen();
		});

		this.soundElement.addEventListener("click", () => {
			this.toggleAudioVolume();
		});

		this.closeMotionElement.addEventListener("click", () => {
			this.stopMotion();
		});
	}

	startMotion(index) {
		if (index >= 1 && index <= 4) {
			this.currentMotion = index;
			this.motionWrapperElement.classList.add("active");
			this.startMotionAnimation();
			this.startMotionAudio();
		}
	}

	resetMotionsAnimations() {
		for (let motion of this.motionWrapperElement.querySelectorAll(".motion")) {
			motion.classList.remove("active");
		}
	}

	startMotionAnimation() {
		this.resetMotionsAnimations();
		this.theaterElement.querySelector(`.motion-${this.currentMotion}`).classList.add("active");
	}

	stopMotion() {
		this.motionWrapperElement.classList.remove("active");
		if (this.currentAudio == undefined) return false;
		this.stopMotionAudio();
		this.stopSubtitles();
	}

	startMotionAudio() {
		this.currentAudio = audios[this.currentMotion - 1];
		if (this.currentAudio == undefined) {
			console.error("aucun audio renseigné dans les sources");
			return false;
		}
		if (!this.audioPlaying) {
			this.playMotionAudio();
			this.startSubtitles();
		}
	}

	playMotionAudio() {
		this.audioPlaying = true;
		this.audio = new Howl({ src: [this.currentAudio.path] });
		this.audio.play();

		this.audio.on("end", function () {
			this.audioPlaying = false;
		});
	}

	stopMotionAudio() {
		this.audio.stop();
		this.audioPlaying = false;
	}

	resetSubtitles() {
		this.subtitlesElement.innerHTML = "";
	}

	startSubtitles() {
		let subtitlesLength = this.getSubtitlesLength();
		let timecode = 0,
			timecodeMS = 0,
			current_subtitle;

		this.subtitles = setInterval(() => {
			timecode++;
			timecodeMS = timecode / 10;

			current_subtitle = this.currentAudio.subtitles.filter((elt, i) => {
				return this.currentAudio.subtitles[i + 1]?.time > timecodeMS;
			})[0];

			if (current_subtitle != undefined) this.subtitlesElement.innerHTML = `<span>${current_subtitle.content}</span>`;

			if (timecodeMS === subtitlesLength) {
				clearInterval(this.subtitles);
				setTimeout(() => {
					this.resetSubtitles();
				}, 1000);
			}
		}, 100);
	}

	stopSubtitles() {
		this.resetSubtitles();
		clearInterval(this.subtitles);
	}

	getSubtitlesLength() {
		let subtitles = this.currentAudio.subtitles;
		return subtitles[subtitles.length - 1].time;
	}

	setRecognition() {
		window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		const recognition = new SpeechRecognition();
		recognition.interimResults = true;

		let _currrentSubtitle;

		recognition.addEventListener("result", (e) => {
			const transcript = Array.from(e.results)
				.map((result) => result[0])
				.map((result) => result.transcript);

			_currrentSubtitle = transcript[0].toLowerCase();

			//subtitles.innerHTML = transcript
		});

		recognition.addEventListener("end", (e) => {
			if (_currrentSubtitle.includes("plein écran")) {
				toggleFullScreen();
			}

			if (_currrentSubtitle.includes("volume")) {
				this.toggleAudioVolume();
			}

			if (_currrentSubtitle.includes("fermer")) {
				this.stopMotion();
			}

			if (_currrentSubtitle.includes("lancer")) {
				this.startMotion(1);
			}

			recognition.start();
		});

		recognition.start();
	}

	toggleAudioVolume() {
		switch (this.audioVolume) {
			case 1:
				this.audioVolume = 0;
				Howler.volume(0);
				this.soundElement.querySelector("span").innerHTML = 0;
				break;
			case 0.5:
				this.audioVolume = 1;
				Howler.volume(1);
				this.soundElement.querySelector("span").innerHTML = 100;
				break;
			case 0:
				this.audioVolume = 0.5;
				Howler.volume(0.5);
				this.soundElement.querySelector("span").innerHTML = 50;
				break;
			default:
				console.log(`audio error`);
		}
	}
}
