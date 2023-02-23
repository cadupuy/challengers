import Experience from "@experience/Experience.js";
import { MeshStandardMaterial } from "three";

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
			this.debugFolder = this.debug.ui.addFolder("locker");
		}
		this.resource = this.resources.items.scene;

		// Resource
		this.diff = this.resources.items.diffuse;
		this.normalTexture = this.resources.items.normal;
		this.roughnessMap = this.resources.items.roughness;

		this.diffuseMap = this.resources.items.diff2;
		this.normalTexture = this.resources.items.normal2;
		this.roughnessMap = this.resources.items.roug2;
		this.displacementMap = this.resources.items.disp;

		this.setModel();
	}

	setModel() {
		this.model = this.resource.scene;

		console.log("MODELE ROBIN", this.model);
		this.scene.add(this.model);

		this.diffuseMap.flipY = false;
		this.diff.flipY = false;
		this.model.traverse((child) => {
			if (child.isMesh && child.name === "Floor") {
				child.material = new MeshStandardMaterial({
					map: this.diffuseMap,
					normalMap: this.normalTexture,
					roughnessMap: this.roughnessMap,
				});
			} else {
				child.material = new MeshStandardMaterial({
					map: this.diff,
					// normalMap: this.normalTexture,
					// roughnessMap: this.roughnessMap,
				});
			}
		});
	}
}
