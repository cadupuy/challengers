import { BufferGeometry, LineBasicMaterial, Line, CatmullRomCurve3, Vector3 } from "three";
import gsap from "gsap";

import EventEmitter from "@utils/EventEmitter";

import Experience from "@js/Experience";

export default class Spline extends EventEmitter {
	constructor() {
		super();

		this.experience = new Experience();
		this.canvas = this.experience.canvas;
		this.mouse = this.experience.mouse;
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.camera = this.experience.camera;
		this.debug = this.experience.debug;

		this.intensity = 0.00006;
		this.scroll = {
			current: 0,
			target: 0,
			last: 0,
		};

		this.setSpline();

		window.addEventListener("wheel", (e) => {
			this.scrollCanvas(e);
		});
	}

	setSpline() {
		this.curve = new CatmullRomCurve3([
			new Vector3(0, 2, -40),
			new Vector3(0, 2, -30),
			new Vector3(0, 2, -20),
			new Vector3(0, 2, -10),
			new Vector3(0, 2, -2),
		]);

		const points = this.curve.getPoints(50);
		this.curveGeometry = new BufferGeometry().setFromPoints(points);

		this.curveGeometry = new BufferGeometry().setFromPoints(points);
		this.curveMaterial = new LineBasicMaterial({
			color: 0xffffff,
		});

		this.splineObject = new Line(this.curveGeometry, this.curveMaterial);

		this.scene.add(this.splineObject);
	}

	scrollCanvas({ deltaY }) {
		this.scroll.target += deltaY * this.intensity;
	}

	update(percent) {
		this.scroll.target = gsap.utils.clamp(0, this.scroll.limit, this.scroll.target);
		this.scroll.current = gsap.utils.interpolate(this.scroll.current, this.scroll.target, 0.03);

		const camPos = this.curve.getPoint(this.scroll.current);

		this.camera.instance.position.z = camPos.z;
		this.camera.instance.position.x = camPos.x;
		this.camera.instance.position.y = camPos.y + 2;
		this.camera.instance.lookAt(0, 2, 0);
	}
}
