// TODO :
//vector3.lerp
// lerp entre 2 positions
// ktx loader
// cocher case compression blender

import { Scene, Mesh } from "three";

import Debug from "@utils/Debug.js";
import Sizes from "@utils/Sizes.js";
import Stats from "@utils/Stats.js";
import Time from "@utils/Time.js";
import Resources from "@utils/Resources.js";
import Mouse from "@utils/Mouse.js";

import World from "@world/World.js";

import Loader from "./Loader";

import UI from "@ui/UI.js";
import Camera from "@javascript/Camera.js";
import Renderer from "@javascript/Renderer.js";
import sources from "@javascript/sources.js";
import { raycastPlugin } from "@utils/Raycaster.js";

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

		if (!this.canvas) {
			console.warn("Missing 'canvas' property");
			return;
		}

		// Setup
		this.time = new Time();
		this.sizes = new Sizes();
		this.setConfig();
		this.setDebug();
		this.setStats();
		this.setRaycaster();
		this.setMouse();
		this.setScene();
		this.setResources();
		this.setLoader();
		this.setCamera();
		this.setRenderer();
		this.setWorld();
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

	setConfig() {
		this.config = {};

		// Debug
		this.config.debug = window.location.hash === "#debug";
	}

	setRaycaster() {
		raycastPlugin(this);
	}

	setDebug() {
		if (this.config.debug) {
			this.debug = new Debug();
		}
	}

	setStats() {
		if (this.config.debug) {
			this.stats = new Stats(true);
		}
	}

	setLoader() {
		this.loader = new Loader();
	}

	setScene() {
		this.scene = new Scene();
	}

	setMouse() {
		this.mouse = new Mouse();
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
		if (this.stats) this.stats.update();

		this.camera.update();

		if (this.world) this.world.update();

		if (this.renderer) this.renderer.update();

		this.$raycast.update(this.camera.instance);
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

		if (this.debug) this.debug.ui.destroy();
	}
}
