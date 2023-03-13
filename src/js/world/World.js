import Experience from "@js/Experience";

import Environment from "@world/Environment";
import Item from "@world/Item";
import Locker from "@world/Locker";
import Spline from "@world/Spline";

export default class World {
	#experience;
	#scene;
	#resources;

	constructor() {
		this.#experience = new Experience();
		this.#scene = this.#experience.scene;
		this.#resources = this.#experience.resources;

		this.#resources.on("ressourcesReady", () => {
			// Setup

			this.#setEnvironment();
			this.#setItem();
			this.#setLocker();
			this.#setSpline();
		});
	}

	// create a setter for the spline
	#setSpline() {
		this.spline = new Spline();
	}

	#setItem() {
		this.item = new Item();
	}

	#setLocker() {
		this.locker = new Locker();
	}

	#setEnvironment() {
		this.environment = new Environment();
	}

	update() {
		if (this.item) this.item.update();
		if (this.spline) this.spline.update();
	}

	destroy() {}
}
