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
			this.debugFolder = this.debug.ui.addFolder("environment");
		}

		this.setSunLight();
	}

	setSunLight() {
		this.sunLight = new AmbientLight("#ffffff", 2);

		this.scene.add(this.sunLight);

		if (this.debug) {
			this.debugFolder.add(this.sunLight, "intensity").name("sunLightIntensity").min(0).max(10).step(0.001);
			this.debugFolder.addColor(this.sunLight, "color").name("sunLightColor");
		}
	}
}
