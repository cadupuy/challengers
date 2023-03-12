export default class Maths {
	static clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}
	static lerp(x, y, t) {
		return (1 - t) * x + t * y;
	}

	static map(value, start1, stop1, start2, stop2) {
		return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
	}

	static round(x, d) {
		return Number(x.toFixed(d));
	}
}
