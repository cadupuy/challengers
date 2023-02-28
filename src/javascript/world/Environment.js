import { AmbientLight } from "three";

import Experience from "@javascript/Experience.js";

export default class Environment {
	constructor() {
		this.experience = new Experience();
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;
		this.debug = this.experience.debug;

		// Debug
		if (this.debug) {
			this.debugFolder = this.debug.gui.addFolder({
				title: "environment",
			});
		}

		this.#setSunLight();
	}

	#setSunLight() {
		this.sunLight = new AmbientLight("#b5b5b5", 2);

		this.scene.add(this.sunLight);

		if (this.debug) {
			this.debugFolder.addInput(this.sunLight, "intensity", {
				min: 0,
				max: 10,
				step: 0.001,
			});
			this.debugFolder.addInput(this.sunLight, "color");
		}
	}
}
