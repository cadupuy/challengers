import { PlaneGeometry, ShaderMaterial, Mesh } from "three";
import anime from "animejs";
import Experience from "@javascript/Experience";

import vertex from "@shaders/loader/vert.glsl";
import fragment from "@shaders/loader/frag.glsl";

export default class Loader {
	constructor() {
		this.experience = new Experience();
		this.scene = this.experience.scene;
		this.resources = this.experience.resources;
		this.debug = this.experience.debug;

		this.params = {
			active: true,
		};

		this.loaderDiv = document.querySelector(".loader");
		this.percent = document.querySelector(".loader__percent");

		if (this.debug) {
			this.debugFolder = this.debug.gui.addFolder({
				title: "loader",
			});
			this.debugFolder.addInput(this.params, "active");
		}

		if (this.params.active) {
			this.setEvents();
			this.init();
		}
	}

	setEvents() {
		this.resources.on("percent", (percent) => {
			this.percent.innerHTML = `${percent}%`;
		});

		this.resources.on("ready", () => {
			this.setAnimations();
		});
	}

	init() {
		this.overlayGeometry = new PlaneGeometry(30, 30, 1, 1);
		this.overlayMaterial = new ShaderMaterial({
			transparent: true,
			uniforms: {
				uAlpha: { value: 1 },
				uColor: { value: 0 },
			},
			vertexShader: vertex,
			fragmentShader: fragment,
		});
		this.overlay = new Mesh(this.overlayGeometry, this.overlayMaterial);
		this.overlay.name = "loader";
		this.scene.add(this.overlay);
	}

	setAnimations() {
		const tl = anime.timeline();

		tl.add({
			targets: this.loaderDiv,
			opacity: 0,
			delay: 2000,
		});

		tl.add({
			targets: this.overlayMaterial.uniforms.uAlpha,
			value: 0,
			duration: 2000,
		});
	}
}
