import freezer from "./signalFreezer";
import { Signal } from "./signal";

export class Writable extends Signal {
  constructor(initialValue) {
    super();
    this.previous = null;
    this.value = initialValue;
  }

  get() {
    return this.value;
  }

  set(value, force) {
    if (!force && this.value === value) return;

    this.previous = this.value;
    this.value = value;

    if (freezer.isFrozen) return freezer.stack.add(this);

    this._emit();
  }

  watchImmediate(fn, ctx) {
    const signal = this.watch(fn, ctx, { immediate: true });
    fn.call(ctx, this.value, this.previous);
    return signal;
  }

  _emit() {
    let node = this._first;
    while (node) {
      node.fn.call(node.ctx, this.value, this.previous);
      node.once && this.unwatch(node);
      node = node.next;
    }

    this.previous = null;
  }

  update(cb, force) {
    const value = cb(this.value);
    this.set(value !== undefined ? value : this.value, force);
  }
}

export function writable(v) {
  return new Writable(v);
}
