import { Scene } from "three";

import Debug from "@utils/Debug";
import Sizes from "@utils/Sizes";
import Stats from "@utils/Stats";
import Time from "@utils/Time";
import Resources from "@utils/Loader";
import Mouse from "@utils/Mouse";
import { raycastPlugin } from "@utils/Raycaster";

import World from "@world/World";

import Camera from "@js/Camera";
import Renderer from "@js/Renderer";

import UI from "@ui/UI";

export default class Experience {
	static instance;

	constructor(_canvas) {
		// Singleton
		if (Experience.instance) {
			return Experience.instance;
		}
		Experience.instance = this;

		// Global access
		window.experience = this;

		// Options
		this.canvas = _canvas;

		if (!this.canvas) {
			console.error(`Missing 'canvas' property 🚫`);
			return;
		}

		// Setup
		this.time = new Time();
		this.sizes = new Sizes();

		this.#setResources();
		this.#setConfig();
		this.#setDebug();
		this.#setStats();
		this.#setRaycaster();
		this.#setScene();
		this.#setCamera();
		this.#setMouse();
		this.#setRenderer();
		this.#setWorld();

		this.ui = new UI();

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

	#setConfig() {
		this.config = {};

		// Debug
		this.config.debug = window.location.hash === "#debug";
	}

	#setRaycaster() {
		const api = raycastPlugin();
		api.install(this);
	}

	#setDebug() {
		if (this.config.debug) {
			this.debug = new Debug();
		}
	}

	#setStats() {
		if (this.config.debug) {
			this.stats = new Stats(true);
		}
	}

	#setScene() {
		this.scene = new Scene();
	}

	#setMouse() {
		this.mouse = new Mouse();
	}

	#setResources() {
		this.resources = new Resources();
	}

	#setCamera() {
		this.camera = new Camera();
	}

	#setRenderer() {
		this.renderer = new Renderer();
	}

	#setWorld() {
		this.world = new World();
	}

	resize() {
		this.camera.resize();
		this.world.update();
		this.renderer.resize();
	}

	update() {
		if (this.stats) this.stats.update();

		this.camera.update();

		if (this.world) this.world.update();

		if (this.renderer) this.renderer.update();

		this.$raycast.update(this.camera.instance);
	}

	destroy() {
		delete Experience.instance;
	}
}
