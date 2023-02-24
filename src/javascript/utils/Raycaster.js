import { Raycaster } from "three";
import { w } from "./Signal";
import { map } from "@utils/math/map.js";

const noop = () => {};

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
	onEnter: noop,
	onLeave: noop,
	onClick: noop,
	onHold: noop,
	onUpdate: noop,
});

const DEFAULT_STATES = () => ({
	isActive: w(false),
	hasClicked: w(false),
	isHolding: w(false),
});

export function raycastPlugin(experience) {
	const list = new Map();
	const rawList = [];

	const mousePos = {
		x: 0,
		y: 0,
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
	};

	experience.$raycast = api;
	experience.$raycaster = api;

	listenMouseEvents(experience.canvas);

	return api;

	function listenMouseEvents(canvas) {
		window.addEventListener("mousedown", onMouseDown, { passive: false });
		window.addEventListener("mouseup", onMouseUp, { passive: false });
		window.addEventListener("mousemove", onMouseMove, { passive: false });
	}

	function onMouseDown(e) {
		if (!canClick(e)) return;

		for (let i = 0; i < rawList.length; i++) {
			const o = list.get(rawList[i].name);
			if (!o) continue;
			o.states.hasClicked.set(true);
		}
	}

	function onMouseUp() {
		for (let i = 0; i < rawList.length; i++) {
			const o = list.get(rawList[i].name);
			if (!o) continue;
			o.states.hasClicked.set(false);
			o.states.isHolding.set(false);
		}
	}

	function onMouseMove(e) {
		mousePos.x = map(e.clientX, 0, window.innerWidth, -1, 1);
		mousePos.y = map(e.clientY, 0, window.innerHeight, 1, -1);
	}

	function createRaycastable(object, callbacks, states) {
		const origCB = { ...callbacks };
		const { isActive, hasClicked, isHolding } = states;

		hasClicked.watch((v) => {
			isHolding.set(v);
			if (!v) return;
			const ray = raycaster.intersectObject(object)[0];
			if (!ray) return;
			callbacks.onClick(ray.object, ray);
		});

		callbacks.onEnter = (...e) => {
			isActive.set(true);
			origCB.onEnter(...e);
		};

		callbacks.onLeave = (e) => {
			isActive.set(false);
			origCB.onLeave(e);
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

		// Unlisten to states
		const o = list.get(object.name);
		const { isActive, hasClicked, isHolding } = o.states;
		isActive.unwatch();
		hasClicked.unwatch();
		isHolding.unwatch();

		// Remove from list
		rawList.splice(rawList.indexOf(object), 1);
		list.delete(object.name);
	}

	function isRaycating(object) {
		return raycaster.intersectObject(object).length > 0;
	}

	function update(camera) {
		if (!rawList.length) return;

		raycaster.setFromCamera(mousePos, camera);
		const intersects = raycaster.intersectObjects(rawList);

		for (let i = 0; i < rawList.length; i++) {
			const o = list.get(rawList[i].name);
			if (!o) continue;
			const { isActive } = o.states;
			if (!isActive.value) continue;
			const { onLeave } = o.callbacks;
			isActive.value && !isRaycating(o.object) && onLeave(rawList[i]);
		}

		for (let i = 0; i < intersects.length; i++) {
			const o = list.get(intersects[i].object.name);
			if (!o) continue;
			const { isActive, isHolding, hasClicked } = o.states;
			const { onEnter, onUpdate, onHold } = o.callbacks;
			!isActive.value && onEnter(intersects[i].object, intersects[i]);
			isActive.value && onUpdate(intersects[i].object, intersects[i]);
			isHolding.value && onHold(intersects[i].object, intersects[i]);
		}
	}
}
