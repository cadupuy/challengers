import Experience from "@js/Experience.js";
export default class Item {
	constructor() {
		this.experience = new Experience();
		this.camera = this.experience.camera;
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;
		this.time = this.experience.time;
		this.debug = this.experience.debug;

		this.setModel();

		// Debug
		if (this.debug) {
			this.setDebug();
		}
	}

	setModel() {
		this.model = this.resources.models.objects.scene;
		this.model.rotation.y = Math.PI / 2;

		this.scene.add(this.model);

		this.model.traverse((child) => {
			if (child.name === "Objet_1_Suzanne") {
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

	setDebug() {
		this.debug.setFolder("objects");
		this.debugFolder = this.debug.getFolder("objects");
	}

	update() {
		this.suzanne.rotation.x += 0.03;
	}
}
