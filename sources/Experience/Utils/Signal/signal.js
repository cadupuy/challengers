function SignalListener(owner, fn, ctx, once) {
  this.fn = fn;
  this.ctx = ctx || null;
  this.owner = owner;
  this.once = !!once;
}

function removeNode(node) {
  if (!node || !node.owner) return;

  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
  const owner = node.owner;
  node.ctx = node.fn = node.owner = null;
  if (node === owner._first) owner._first = node.next;
  if (node === owner._last) owner._last = node.prev;
}

export class Signal {
  constructor() {
    this._first = this._last = null;
    this._isStoreSignal = true;
  }

  emit(a0, a1, a2) {
    let node = this._first;
    while (node) {
      node.fn.call(node.ctx, a0, a1, a2);
      node.once && this.unwatch(node);
      node = node.next;
    }
  }

  watch(fn, ctx, { once = false, immediate = false, force = false } = {}) {
    // If the callback is already registered, just return it
    if (!force && this.checkStack(fn, ctx)) return fn;

    const newNode = new SignalListener(this, fn, ctx, once);
    if (!this._first) {
      this._first = newNode;
      this._last = newNode;
    } else {
      this._last.next = newNode;
      newNode.prev = this._last;
      this._last = newNode;
    }

    if (immediate) fn.call(ctx, this.value);

    return newNode;
  }

  watchOnce(fn, ctx) {
    return this.watch(fn, ctx, { once: true });
  }

  watchImmediate(fn, ctx) {
    return this.watch(fn, ctx, { immediate: true });
  }

  unwatch(fn, ctx) {
    if (fn instanceof SignalListener) return removeNode(fn);
    if (!ctx) ctx = null;
    let node = this._first;
    while (node) {
      if (node.fn === fn && node.ctx === ctx) removeNode(node);
      node = node.next;
    }
  }

  unwatchAll() {
    let node = this._first;
    this._first = this._last = null;
    while (node) {
      removeNode(node);
      node = node.next;
    }
  }

  checkStack(fn, ctx) {
    let node = this._first;
    while (node) {
      if (node.fn === fn && node.ctx === ctx) {
        const warn = ctx.warn || console.warn; // Use warn from context if available
        DEBUG && warn("Callback already registered, returning existing callback");
        return node;
      }
      node = node.next;
    }
    return false;
  }
}

Signal.prototype.destroy = Signal.prototype.unwatchAll;

export const unwatchSignal = removeNode;
export function signal() {
  return new Signal();
}
