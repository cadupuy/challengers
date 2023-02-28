import { MeshStandardMaterial } from "three";
import Experience from "@js/Experience.js";

export default class Locker {
	constructor() {
		this.experience = new Experience();
		this.camera = this.experience.camera;
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;
		this.time = this.experience.time;
		this.debug = this.experience.debug;

		// Debug
		if (this.debug) {
			this.debugFolder = this.debug.gui.addFolder({
				title: "locker",
			});
		}

		this.#setModel();
	}

	#setModel() {
		this.model = this.resources.models.onemesh.scene;
		this.texture = this.resources.textures.finaldiff;

		// turn the model half a turn to face the camera
		this.model.rotation.y = Math.PI / 2;

		this.scene.add(this.model);

		this.texture.flipY = false;

		this.model.traverse((child) => {
			child.material = new MeshStandardMaterial({
				map: this.texture,
			});
		});
	}
}
