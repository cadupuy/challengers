import { Raycaster } from "three";
import { map } from "@utils/math/map.js";

function getPath(e) {
	let path = [];
	let currentElem = e.target;
	while (currentElem) {
		path.push(currentElem);
		currentElem = currentElem.parentElement;
	}
	if (path.indexOf(window) === -1 && path.indexOf(document) === -1) path.push(document);
	if (path.indexOf(window) === -1) path.push(window);
	return path;
}

function canClick(e) {
	const path = getPath(e);
	for (const el of path) {
		if (!el || !el.classList) break;
		if (el.tagName === "BUTTON") return false;
		if (el.classList.contains("debug") || el.classList.contains("debug-gui")) return false;
	}
	return true;
}

const DEFAULT_CALLBACKS = () => ({
	onEnter: () => {},
	onLeave: () => {},
	onClick: () => {},
	onHold: () => {},
	onUpdate: () => {},
});

const DEFAULT_STATES = () => ({
	isActive: false,
	hasClicked: false,
	isHolding: false,
});

export function raycastPlugin() {
	const list = new Map();
	const rawList = [];

	const mouse = {
		pos: { x: 0, y: 0 },
		click: false,
	};

	const raycaster = new Raycaster();

	const api = {
		list,
		raycaster,

		register,
		add: register,
		unregister,
		remove: unregister,

		update,

		install,
	};

	return api;

	function listenMouseEvents(canvas) {
		window.addEventListener("mousedown", onMouseDown, { passive: false });
		window.addEventListener("mouseup", onMouseUp, { passive: false });
		window.addEventListener("mousemove", onMouseMove, { passive: false });
	}

	function onMouseDown(e) {
		if (!canClick(e)) return;
		mouse.click = true;
	}

	function onMouseUp() {
		mouse.click = false;
		for (let i = 0; i < rawList.length; i++) {
			const o = list.get(rawList[i].name);
			if (!o) continue;
			o.states.hasClicked = false;
			o.states.isHolding = false;
		}
	}

	function onMouseMove(e) {
		mouse.pos.x = map(e.clientX, 0, window.innerWidth, -1, 1);
		mouse.pos.y = map(e.clientY, 0, window.innerHeight, 1, -1);
	}

	function createRaycastable(object, callbacks, states) {
		const origCB = { ...callbacks };
		let { isActive, hasClicked, isHolding } = states;

		callbacks.onEnter = (...e) => {
			states.isActive = true;
			origCB.onEnter(...e);
		};

		callbacks.onLeave = (e) => {
			states.isActive = states.hasClicked = states.isHolding = false;
			origCB.onLeave(e);
		};

		callbacks.onClick = (e) => {
			states.hasClicked = states.isHolding = true;
			origCB.onClick(e);
		};

		return Object.assign(
			{},
			{
				object,
				callbacks,
				states,
			},
		);
	}

	function register(object, callbacks = {}, states = {}) {
		callbacks = { ...DEFAULT_CALLBACKS(), ...callbacks };
		states = { ...DEFAULT_STATES(), ...states };
		const o = createRaycastable(object, callbacks, states);
		if (list.has(object.name)) return;
		list.set(object.name, o);
		rawList.push(object);

		return o;
	}

	function unregister(object) {
		if (!list.has(object.name)) return DEBUG && console.warn("Object not registered");

		// Remove from list
		rawList.splice(rawList.indexOf(object), 1);
		list.delete(object.name);
	}

	function isRaycating(object) {
		return raycaster.intersectObject(object).length > 0;
	}

	function update(camera) {
		if (!rawList.length) return;

		raycaster.setFromCamera(mouse.pos, camera);
		const intersects = raycaster.intersectObjects(rawList);

		for (let i = 0; i < rawList.length; i++) {
			const o = list.get(rawList[i].name);
			if (!o?.states?.isActive) continue;
			const { onLeave } = o.callbacks;
			o.states.isActive && !isRaycating(o.object) && onLeave(rawList[i]);
		}

		for (let i = 0; i < intersects.length; i++) {
			const ray = intersects[i];
			const o = list.get(ray.object.name);
			if (!o) continue;
			const { onEnter, onUpdate, onHold, onClick } = o.callbacks;
			!o.states.isActive && onEnter(ray.object, ray);
			!o.states.hasClicked && mouse.click && onClick(ray.object, ray);
			o.states.isActive && onUpdate(ray.object, ray);
			o.states.isHolding && onHold(ray.object, ray);
		}
	}

	function install(webgl) {
		webgl.$raycast = api;
		webgl.$raycaster = api;

		listenMouseEvents(webgl.canvas);

		const { collection } = webgl;

		if (!collection.raycastables) collection.raycastables = {};

		delete api.install;
	}
}
