import {
	WebGLRenderer,
	sRGBEncoding,
	CineonToneMapping,
	NoToneMapping,
	LinearToneMapping,
	RGBFormat,
	ReinhardToneMapping,
	ACESFilmicToneMapping,
	WebGLRenderTarget,
	LinearFilter,
} from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import Experience from "@javascript/Experience.js";

export default class Renderer {
	constructor() {
		this.experience = new Experience();
		this.canvas = this.experience.canvas;
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.camera = this.experience.camera;
		this.debug = this.experience.debug;
		this.stats = this.experience.stats;

		// Debug
		if (this.debug) {
			this.debugFolder = this.debug.ui.addFolder("renderer");
		}

		this.usePostprocess = false;

		this.setInstance();
		this.setPostProcess();
	}

	setInstance() {
		this.clearColor = "#a3452e";

		this.instance = new WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: false,
		});

		this.instance.setClearColor(this.clearColor, 1);
		this.instance.setSize(this.sizes.width, this.sizes.height);
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
		this.instance.physicallyCorrectLights = true;
		this.instance.outputEncoding = sRGBEncoding;
		this.instance.toneMapping = NoToneMapping;
		this.instance.toneMappingExposure = 1;

		this.context = this.instance.getContext();

		// Add stats panel
		if (this.stats) {
			this.stats.setRenderPanel(this.context);
		}

		// Debug
		if (this.debug) {
			console.log(this.instance.info);

			this.debugFolder.addColor(this, "clearColor").onChange(() => {
				this.instance.setClearColor(this.clearColor);
			});

			this.debugFolder
				.add(this.instance, "toneMapping", {
					NoToneMapping: NoToneMapping,
					LinearToneMapping: LinearToneMapping,
					ReinhardToneMapping: ReinhardToneMapping,
					CineonToneMapping: CineonToneMapping,
					ACESFilmicToneMapping: ACESFilmicToneMapping,
				})
				.onChange(() => {
					this.scene.traverse((_child) => {
						if (_child.isMesh) _child.material.needsUpdate = true;
					});
				});

			this.debugFolder.add(this.instance, "toneMappingExposure").min(0).max(10);
		}
	}

	setPostProcess() {
		this.postProcess = {};

		/**
		 * Render pass
		 */
		this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance);

		/**
		 * Effect composer
		 */
		this.renderTarget = new WebGLRenderTarget(this.sizes.width, this.sizes.height, {
			generateMipmaps: false,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBFormat,
			encoding: sRGBEncoding,
			samples: 2,
		});

		this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget);
		this.postProcess.composer.setSize(this.sizes.width, this.sizes.height);
		this.postProcess.composer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

		this.postProcess.composer.addPass(this.postProcess.renderPass);
	}

	resize() {
		this.instance.setSize(this.sizes.width, this.sizes.height);
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
	}

	update() {
		if (this.stats) {
			this.stats.beforeRender();
		}

		if (this.usePostprocess) {
			this.postProcess.composer.render();
		} else {
			this.instance.render(this.scene, this.camera.instance);
		}

		if (this.stats) {
			this.stats.afterRender();
		}
	}

	destroy() {
		this.instance.renderLists.dispose();
		this.instance.dispose();
		this.renderTarget.dispose();
		this.postProcess.composer.renderTarget1.dispose();
		this.postProcess.composer.renderTarget2.dispose();
	}
}
