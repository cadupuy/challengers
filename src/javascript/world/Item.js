import * as THREE from "three";

import Experience from "../Experience.js";

export default class Item {
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
				title: "item",
			});
		}

		// Resource
		this.resource = this.resources.items.objects;
		// this.texture = this.resources.items.texture;

		this.setModel();
	}

	setModel() {
		this.model = this.resource.scene;
		this.model.rotation.y = Math.PI / 2;

		this.scene.add(this.model);

		// this.texture.flipY = false;
		// const bakedMaterial = new THREE.MeshBasicMaterial({ map: this.texture });

		console.log("ITEMS", this.model);

		this.model.traverse((child) => {
			if (child.name === "Objet_1_Suzanne") {
				//	child.material = bakedMaterial;

				this.suzanne = child;

				this.experience.$raycast.add(child, {
					onClick: () => {
						this.experience.ui.startMotion(1);
					},
				});
			} else if (child.name === "Objet_2_Lampe") {
				this.experience.$raycast.add(child, {
					onClick: () => {
						this.experience.ui.startMotion(2);
					},
				});
			} else if (child.name === "Objet_3_Cone") {
				this.experience.$raycast.add(child, {
					onClick: () => {
						this.experience.ui.startMotion(3);
					},
				});
			} else if (child.name === "Objet_4_Ballon") {
				this.experience.$raycast.add(child, {
					onClick: () => {
						this.experience.ui.startMotion(4);
					},
				});
			}
		});
	}

	update() {
		this.suzanne.rotation.x += 0.03;
	}
}
