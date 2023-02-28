import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Experience from "@javascript/Experience.js";

export default class Camera {
	constructor() {
		this.experience = new Experience();
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.canvas = this.experience.canvas;
		this.debug = this.experience.debug;

		if (this.debug) {
			this.debugFolder = this.debug.gui.addFolder({
				title: "camera",
			});
		}

		// Set up
		this.mode = "debug"; // defaultCamera \ debugCamera

		this.setInstance();
		this.setModes();
	}

	setInstance() {
		this.instance = new PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 150);
		this.instance.position.set(0, 0, -20);
		this.scene.add(this.instance);
	}

	setModes() {
		this.modes = {};

		// Default
		this.modes.default = {};
		this.modes.default.instance = this.instance.clone();

		// Debug
		this.modes.debug = {};
		this.modes.debug.instance = this.instance.clone();
		this.modes.debug.instance.position.set(0, 0, -20);

		this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.canvas);
		this.modes.debug.orbitControls.enabled = this.modes.debug.active;
		this.modes.debug.orbitControls.screenSpacePanning = true;
		this.modes.debug.orbitControls.enableKeys = false;
		this.modes.debug.orbitControls.zoomSpeed = 0.25;
		this.modes.debug.orbitControls.enableDamping = true;
		this.modes.debug.orbitControls.update();
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height;
		this.instance.updateProjectionMatrix();

		this.modes.default.instance.aspect = this.sizes.width / this.sizes.height;
		this.modes.default.instance.updateProjectionMatrix();

		this.modes.debug.instance.aspect = this.sizes.width / this.sizes.height;
		this.modes.debug.instance.updateProjectionMatrix();
	}

	update() {
		// Update debug orbit controls
		this.modes.debug.orbitControls.update();

		// Apply coordinates
		this.instance.position.copy(this.modes[this.mode].instance.position);
		this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion);
		this.instance.updateMatrixWorld(); // To be used in projection
	}

	destroy() {
		this.modes.debug.orbitControls.destroy();
	}
}
