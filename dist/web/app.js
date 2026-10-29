var __esm = (fn, res, err) => () => {
  if (fn)
    try {
      res = fn(fn = 0);
    } catch (e) {
      err = [e];
    }
  if (err)
    throw err[0];
  return res;
};

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/flags/index.js
function enable_async_mode_flag() {
  async_mode_flag = true;
}
function enable_custom_renderers_flag() {
  custom_renderers_flag = true;
}
var async_mode_flag = false, legacy_mode_flag = false, tracing_mode_flag = false, custom_renderers_flag = false;

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/flags/custom-renderer.js
var init_custom_renderer = __esm(() => {
  enable_custom_renderers_flag();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/custom-renderer/index.js
function createRenderer(renderer) {
  return renderer;
}

// ../gpuix-fractalsvelte/node_modules/svelte/src/renderer/index.js
var init_renderer = __esm(() => {
  init_custom_renderer();
});

// ../gpuix-fractalsvelte/src/style.ts
function put(out, key, value) {
  const longhands = SUPERSEDES[key];
  if (longhands)
    for (const l of longhands)
      delete out[l];
  out[key] = value;
}
function merge(target, source) {
  for (const key in source)
    put(target, key, source[key]);
  return target;
}
function define_css_vars(vars) {
  let changed = false;
  for (const [key, value] of Object.entries(vars)) {
    const name = key.startsWith("--") ? key.slice(2) : key;
    if (value == null) {
      if (css_vars.delete(name))
        changed = true;
    } else if (css_vars.get(name) !== String(value)) {
      css_vars.set(name, String(value));
      changed = true;
    }
  }
  if (changed)
    vars_generation++;
  return changed;
}
function flush_var_warnings() {
  for (const name of pending_vars) {
    if (css_vars.has(name))
      continue;
    warned_vars.add(name);
    console.warn(`[gpuix-fractalsvelte] \`var(--${name})\` is not defined — set it with set_css_vars() or give it a fallback`);
  }
  pending_vars.clear();
}
function substitute_vars(value) {
  let out = "";
  let at = 0;
  for (;; ) {
    const start = value.indexOf("var(", at);
    if (start === -1)
      return out + value.slice(at);
    let depth = 0;
    let end = -1;
    for (let i = start + 3;i < value.length; i++) {
      if (value[i] === "(")
        depth++;
      else if (value[i] === ")" && --depth === 0) {
        end = i;
        break;
      }
    }
    if (end === -1)
      return out + value.slice(at);
    const inner = value.slice(start + 4, end);
    const comma = inner.indexOf(",");
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim().replace(/^--/, "");
    vars_read = true;
    let resolved = css_vars.get(name);
    if (resolved === undefined) {
      if (comma === -1) {
        if (!warned_vars.has(name))
          pending_vars.add(name);
        return null;
      }
      resolved = substitute_vars(inner.slice(comma + 1).trim());
      if (resolved === null)
        return null;
    }
    out += value.slice(at, start) + resolved;
    at = end + 1;
  }
}
function camel(key) {
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function coerce(value) {
  if (PX.test(value) || NUM.test(value))
    return parseFloat(value);
  if (REM.test(value))
    return parseFloat(value) * 16;
  return value;
}
function accepts(key, value) {
  if (NEVER.has(key))
    return false;
  if (NUMBER_ONLY.has(key))
    return typeof value === "number";
  if (DIMENSION.has(key)) {
    return typeof value === "number" || value === "auto" || PERCENT.test(value);
  }
  return typeof value !== "string" || !NUMERIC_ISH.test(value);
}
function assign(out, key, value) {
  let coerced = coerce(value);
  if (coerced === "auto" && OVERFLOW.has(key))
    coerced = "scroll";
  else if (typeof coerced === "string" && DIMENSION.has(key) && INTRINSIC.test(coerced))
    coerced = "auto";
  if (!accepts(key, coerced)) {
    if (!warned.has(key)) {
      warned.add(key);
      console.warn(`[gpuix-fractalsvelte] dropped unsupported style value \`${key}: ${value}\``);
    }
    return;
  }
  put(out, key, coerced);
}
function expand(out, key, value) {
  const parts = value.split(/\s+/);
  if (key === "gap" && parts.length === 2) {
    assign(out, "rowGap", parts[0]);
    assign(out, "columnGap", parts[1]);
    return true;
  }
  const targets = BOX[key];
  if (!targets || parts.length > 4 || parts.length === 1 && key !== "inset")
    return false;
  const fill = FILL[parts.length - 1];
  for (let i = 0;i < 4; i++)
    assign(out, targets[i], parts[fill[i]]);
  return true;
}
function split_declarations(css) {
  const out = [];
  let quote = "";
  let depth = 0;
  let comment = false;
  let start = 0;
  for (let i = 0;i < css.length; i++) {
    const c = css[i];
    if (comment) {
      if (c === "/" && css[i - 1] === "*")
        comment = false;
    } else if (c === "\\") {
      i++;
    } else if (quote) {
      if (c === quote)
        quote = "";
    } else if (c === "/" && css[i + 1] === "*") {
      comment = true;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === "(") {
      depth++;
    } else if (c === ")") {
      if (depth > 0)
        depth--;
    } else if (c === ";" && depth === 0) {
      out.push(css.slice(start, i));
      start = i + 1;
    }
  }
  out.push(css.slice(start));
  return out;
}
function parse_css_text(css) {
  const out = {};
  if (!css)
    return out;
  for (const decl of split_declarations(css)) {
    const colon = decl.indexOf(":");
    if (colon === -1)
      continue;
    const key = camel(decl.slice(0, colon).trim());
    const raw = decl.slice(colon + 1).trim();
    if (key === "" || raw === "")
      continue;
    const value = raw.includes("var(") ? substitute_vars(raw) : raw;
    if (value === null)
      continue;
    if (!expand(out, key, value))
      assign(out, key, value);
  }
  return out;
}
function rule_style(rule) {
  if (rule.css === undefined)
    return rule.style;
  if (rule.generation !== vars_generation) {
    rule.generation = vars_generation;
    rule.resolved = parse_css_text(rule.css);
  }
  vars_read = true;
  return rule.resolved;
}
function build_style(attrs, rules = []) {
  vars_read = false;
  const style = {};
  let hover = null;
  let active = null;
  for (const rule of rules) {
    const declared = rule_style(rule);
    if (rule.pseudo === "hover")
      hover = merge(hover ?? {}, declared);
    else if (rule.pseudo === "active")
      active = merge(active ?? {}, declared);
    else
      merge(style, declared);
  }
  merge(style, parse_css_text(attrs.style));
  if (hover || attrs.hover)
    style.hover = merge(hover ?? {}, parse_css_text(attrs.hover));
  if (active || attrs.active)
    style.active = merge(active ?? {}, parse_css_text(attrs.active));
  return style;
}
var PX, NUM, PERCENT, REM, NUMERIC_ISH, INTRINSIC, OVERFLOW, NUMBER_ONLY, DIMENSION, NEVER, BOX, SUPERSEDES, FILL, warned, css_vars, vars_generation = 0, vars_read = false, warned_vars, pending_vars, used_css_vars = () => vars_read;
var init_style = __esm(() => {
  PX = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)px$/i;
  NUM = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
  PERCENT = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)%$/;
  REM = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)rem$/i;
  NUMERIC_ISH = /^[-+.\d]/;
  INTRINSIC = /^(?:max-content|min-content|fit-content)(?:\(.*\))?$/;
  OVERFLOW = new Set(["overflow", "overflowX", "overflowY"]);
  NUMBER_ONLY = new Set([
    "flexGrow",
    "flexShrink",
    "flexBasis",
    "gap",
    "rowGap",
    "columnGap",
    "gridTemplateColumns",
    "gridTemplateRows",
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "margin",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "top",
    "right",
    "bottom",
    "left",
    "opacity",
    "borderWidth",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
    "fontSize",
    "lineHeight",
    "lineClamp"
  ]);
  DIMENSION = new Set(["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"]);
  NEVER = new Set(["boxShadow"]);
  BOX = {
    padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
    margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
    borderWidth: ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
    borderRadius: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomRightRadius",
      "borderBottomLeftRadius"
    ],
    inset: ["top", "right", "bottom", "left"]
  };
  SUPERSEDES = { ...BOX, gap: ["rowGap", "columnGap"] };
  FILL = [
    [0, 0, 0, 0],
    [0, 1, 0, 1],
    [0, 1, 2, 1],
    [0, 1, 2, 3]
  ];
  warned = new Set;
  css_vars = new Map;
  warned_vars = new Set;
  pending_vars = new Set;
});

// ../gpuix-fractalsvelte/src/events.ts
function to_gpui_event(type) {
  return BY_LOWERCASE.get(type.toLowerCase()) ?? null;
}
var GPUI_EVENTS, WINDOW_KEY_EVENTS, BY_LOWERCASE;
var init_events = __esm(() => {
  GPUI_EVENTS = [
    "toggleFile",
    "showMore",
    "lineClick",
    "linkClick",
    "change",
    "submit",
    "click",
    "auxClick",
    "mouseDown",
    "mouseUp",
    "mouseEnter",
    "mouseLeave",
    "mouseMove",
    "mouseDownOutside",
    "keyDown",
    "keyUp",
    "focus",
    "blur",
    "scroll",
    "fileDrop",
    "motionComplete",
    "highlight",
    "visibleRange"
  ];
  WINDOW_KEY_EVENTS = {
    keydown: "windowKeyDown",
    keyup: "windowKeyUp"
  };
  BY_LOWERCASE = new Map(GPUI_EVENTS.map((name) => [name.toLowerCase(), name]));
});

// ../gpuix-fractalsvelte/src/renderer.ts
function mark_dirty() {
  dirty = true;
  if (!auto_commit || commit_scheduled)
    return;
  commit_scheduled = true;
  queueMicrotask(() => {
    commit_scheduled = false;
    try {
      if (dirty)
        commit();
    } catch (error) {
      console.error("[gpuix-fractalsvelte] commit failed:", error);
    }
  });
}
function emit(op) {
  queue.push(op);
  mark_dirty();
}
function node(kind, name, data) {
  return {
    kind,
    name,
    data,
    attrs: {},
    listeners: new Map,
    nativeId: null,
    uses_vars: false,
    live: false,
    attached: false,
    parent: null,
    first: null,
    last: null,
    prev: null,
    next: null
  };
}
function link(parent, child, anchor) {
  child.parent = parent;
  if (anchor == null) {
    child.prev = parent.last;
    child.next = null;
    if (parent.last)
      parent.last.next = child;
    else
      parent.first = child;
    parent.last = child;
  } else {
    child.prev = anchor.prev;
    child.next = anchor;
    if (anchor.prev)
      anchor.prev.next = child;
    else
      parent.first = child;
    anchor.prev = child;
  }
}
function unlink(child) {
  const parent = child.parent;
  if (!parent)
    return;
  if (child.prev)
    child.prev.next = child.next;
  else
    parent.first = child.next;
  if (child.next)
    child.next.prev = child.prev;
  else
    parent.last = child.prev;
  child.parent = null;
  child.prev = null;
  child.next = null;
}
function first_native_after(cursor) {
  for (let n = cursor;n !== null; n = n.next) {
    if (n.nativeId !== null && n.attached && !is_portal(n))
      return n;
  }
  return null;
}
function map_tag(name) {
  if (GPUI_TAGS.has(name))
    return name;
  if (!warned_tags.has(name)) {
    warned_tags.add(name);
    console.warn(`[gpuix-fractalsvelte] <${name}> has no GPUI equivalent — rendering it as <div>.`);
  }
  return "div";
}
function class_rules(el) {
  const value = el.attrs.class;
  if (typeof value !== "string" || value === "")
    return NO_RULES;
  const names = value.split(/\s+/);
  let matched = null;
  for (const name of names) {
    const sheet = stylesheets.get(name);
    if (!sheet)
      continue;
    for (const rule of sheet) {
      if (rule.tag !== null && rule.tag !== el.name)
        continue;
      if (rule.classes.every((c) => names.includes(c)))
        (matched ??= []).push(rule);
    }
  }
  return matched ?? NO_RULES;
}
function hitbox_root(el) {
  for (let p = el.parent;p; p = p.parent) {
    if (p.kind === "element" && p.attrs.hitbox === "self")
      return p;
  }
  return null;
}
function descends(n, ancestor) {
  for (let p = n.parent;p; p = p.parent)
    if (p === ancestor)
      return true;
  return false;
}
function shielded(el, style) {
  if (el.listeners.size > 0 || INTERACTIVE_TAGS.has(el.name))
    return false;
  if ("tabIndex" in el.attrs || "tabindex" in el.attrs || "autoFocus" in el.attrs || "autofocus" in el.attrs)
    return false;
  if (style.overflow === "scroll" || style.overflowY === "scroll" || style.overflowX === "scroll")
    return false;
  return hitbox_root(el) !== null;
}
function inherit_color(el, style) {
  for (let p = el.parent;p; p = p.parent) {
    if (p.kind !== "element")
      continue;
    const color = build_style(p.attrs, class_rules(p)).color;
    if (used_css_vars())
      el.uses_vars = true;
    if (color !== undefined) {
      style.color = color;
      return;
    }
  }
}
function apply_style(el) {
  if (el.nativeId === null)
    return;
  const style = build_style(el.attrs, class_rules(el));
  el.uses_vars = used_css_vars();
  if (style.pointerEvents === undefined && shielded(el, style))
    style.pointerEvents = "none";
  if (el.name === "svg") {
    if (style.color === undefined) {
      inherit_color(el, style);
      inheriting_svgs.add(el);
    } else {
      inheriting_svgs.delete(el);
    }
  } else if (inheriting_svgs.size > 0) {
    for (const svg of inheriting_svgs) {
      if (svg.nativeId !== null && descends(svg, el))
        apply_style(svg);
    }
  }
  const side = (long, short) => num(style[long] ?? style[short]);
  const box = [
    side("paddingLeft", "padding"),
    side("paddingTop", "padding"),
    side("borderLeftWidth", "borderWidth"),
    side("borderTopWidth", "borderWidth"),
    side("borderRightWidth", "borderWidth"),
    side("borderBottomWidth", "borderWidth")
  ];
  if (box.some((v) => v !== 0))
    insets.set(el.nativeId, box);
  else
    insets.delete(el.nativeId);
  emit(["setStyle", el.nativeId, style]);
}
function restyle_subtree(el) {
  for (let c = el.first;c; c = c.next) {
    if (c.kind === "element" && c.nativeId !== null)
      apply_style(c);
    restyle_subtree(c);
  }
}
function reparent(el) {
  if (el.nativeId === null || !el.attached || !el.live)
    return;
  attach(el);
  attach_portals();
}
function normalize_prop(name, value) {
  if (name === "autoFocus" || name === "aria-expanded" || name === "aria-selected")
    return value !== false && value !== "false";
  if (name === "tabIndex" || name === "aria-level")
    return Number(value);
  return value;
}
function apply_prop(el, key, value) {
  const name = prop_name(key);
  if (BUILT_IN_TAGS.has(map_tag(el.name)) && !UNIVERSAL_PROPS.has(name))
    return;
  if (el.nativeId === null)
    return;
  emit(["setCustomProp", el.nativeId, name, value === null ? null : normalize_prop(name, value)]);
}
function materialize(n) {
  if (n.kind === "comment" || n.kind === "fragment")
    return;
  if (n.nativeId === null) {
    if (n.kind === "text") {
      if (is_blank(n.data))
        return;
      n.nativeId = ++next_id;
      by_id.set(n.nativeId, n);
      emit(["createElement", n.nativeId, "text"]);
      emit(["setText", n.nativeId, n.data]);
      return;
    }
    n.nativeId = ++next_id;
    by_id.set(n.nativeId, n);
    emit(["createElement", n.nativeId, map_tag(n.name)]);
    if (Object.keys(n.attrs).length > 0 || hitbox_root(n) !== null)
      apply_style(n);
    for (const key of Object.keys(n.attrs)) {
      if (STYLE_ATTRS.has(key) || RENDERER_ATTRS.has(key))
        continue;
      apply_prop(n, key, n.attrs[key]);
    }
    for (const type of n.listeners.keys()) {
      emit(["setEventListener", n.nativeId, type, true]);
    }
    if (TEXT_INPUTS.has(n.name)) {
      for (const type of ["focus", "blur"]) {
        if (!n.listeners.has(type))
          emit(["setEventListener", n.nativeId, type, true]);
      }
    }
  }
  for (let c = n.first;c; c = c.next) {
    materialize(c);
    if (c.nativeId !== null && !c.attached)
      attach(c);
  }
}
function attach(n) {
  if (n.nativeId === null)
    return;
  if (is_portal(n)) {
    pending_portals.push(n);
    return;
  }
  const np = native_parent_of(n.parent);
  if (np === null || np.nativeId === null)
    return;
  const before = first_native_after(n.next);
  emit(before ? ["insertBefore", np.nativeId, n.nativeId, before.nativeId] : ["appendChild", np.nativeId, n.nativeId]);
  n.attached = true;
}
function attach_portals() {
  for (const n of pending_portals) {
    if (n.nativeId === null || root_node === null || root_node.nativeId === null)
      continue;
    emit(["appendChild", root_node.nativeId, n.nativeId]);
    n.attached = true;
    portals.add(n);
  }
  pending_portals = [];
}
function set_live(n, value) {
  if (n.live === value)
    return;
  n.live = value;
  for (let c = n.first;c; c = c.next)
    set_live(c, value);
}
function define_styles(scope, rules) {
  stylesheets.set(scope, rules);
}
function set_css_vars(vars) {
  if (!define_css_vars(vars))
    return;
  for (const n of by_id.values()) {
    if (n.uses_vars)
      apply_style(n);
  }
}
function set_native(instance) {
  native = instance;
  insets = new Map;
  corrected = null;
  queue = [];
  by_id = new Map;
  pending_destroy = new Set;
  inheriting_svgs = new Set;
  focused_input = null;
  root_node = null;
  portals = new Set;
  pending_portals = [];
  after_commit = [];
  dirty = false;
  commit_scheduled = false;
  window_node.nativeId = null;
  if (window_node.listeners.size > 0)
    sync_window_events();
}
function sync_window_events() {
  if (window_node.nativeId === null)
    window_node.nativeId = ++next_id;
  by_id.set(window_node.nativeId, window_node);
  native?.setWindowKeyEvents?.(window_node.listeners.has("windowKeyDown"), window_node.listeners.has("windowKeyUp"), window_node.nativeId);
  native?.setWindowSelectionChange?.(window_node.listeners.has("selectionChange"), window_node.nativeId);
}
function on_window_event(event, handler) {
  let handlers = window_node.listeners.get(event);
  if (!handlers) {
    handlers = [];
    window_node.listeners.set(event, handlers);
  }
  handlers.push(handler);
  sync_window_events();
  return () => {
    const index = handlers.indexOf(handler);
    if (index !== -1)
      handlers.splice(index, 1);
    if (handlers.length === 0)
      window_node.listeners.delete(event);
    sync_window_events();
  };
}
function on_window_key(type, handler) {
  const event = WINDOW_KEY_EVENTS[type.toLowerCase()];
  if (!event)
    throw new Error(`[gpuix-fractalsvelte] on_window_key: unknown type "${type}" (keydown or keyup)`);
  return on_window_event(event, handler);
}
function fix_bounds(id, b) {
  const box = b && insets.get(id);
  if (!b || !box)
    return b;
  const [pl, pt, bl, bt, br, bb] = box;
  return { x: b.x - pl - bl, y: b.y - pt - bt, width: b.width + bl + br, height: b.height + bt + bb };
}
function fix_tree(node) {
  if (node.bounds)
    node.bounds = fix_bounds(node.id, node.bounds) ?? node.bounds;
  node.children?.forEach(fix_tree);
}
function create_root(style = { display: "flex", width: "100%", height: "100%", position: "relative" }) {
  const root = node("element", "div", "");
  root.nativeId = ++next_id;
  root.live = true;
  root.attached = true;
  by_id.set(root.nativeId, root);
  root_node = root;
  emit(["createElement", root.nativeId, "div"]);
  emit(["setStyle", root.nativeId, style]);
  emit(["setRoot", root.nativeId]);
  return root;
}
function queue_destroy(nativeId) {
  emit(["destroyElement", nativeId]);
}
function set_auto_commit(enabled) {
  auto_commit = enabled;
}
function commit() {
  flush_var_warnings();
  for (const n of pending_destroy) {
    if (!n.live && n.nativeId !== null)
      emit(["destroyElement", n.nativeId]);
  }
  for (const p of portals) {
    if (!p.live && p.nativeId !== null && !pending_destroy.has(p))
      emit(["destroyElement", p.nativeId]);
  }
  pending_destroy.clear();
  if (queue.length === 0) {
    dirty = false;
    run_after_commit();
    return;
  }
  const json = JSON.stringify(queue);
  queue = [];
  dirty = false;
  const destroyed = native.applyBatch(json);
  for (const id of destroyed) {
    const n = by_id.get(id);
    if (n) {
      n.nativeId = null;
      n.attached = false;
      if (n.name === "svg")
        inheriting_svgs.delete(n);
      if (n === focused_input)
        focused_input = null;
      portals.delete(n);
    }
    by_id.delete(id);
  }
  native.commitMutations?.();
  run_after_commit();
}
function run_after_commit() {
  const calls = after_commit;
  after_commit = [];
  for (const call of calls)
    call();
}
function dispatch(payload) {
  const target = by_id.get(payload.elementId);
  if (!target)
    return;
  if (TEXT_INPUTS.has(target.name)) {
    if (payload.eventType === "focus")
      focused_input = target;
    else if (payload.eventType === "blur" && focused_input === target)
      focused_input = null;
  }
  const handlers = target.listeners.get(payload.eventType);
  if (!handlers || handlers.length === 0)
    return;
  const event = {
    ...payload,
    type: payload.eventType,
    target,
    currentTarget: target,
    editing: focused_input !== null,
    defaultPrevented: false,
    cancelBubble: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.cancelBubble = true;
    },
    stopImmediatePropagation() {
      this.cancelBubble = true;
    },
    composedPath: () => []
  };
  for (const handler of handlers.slice())
    handler.call(target, event);
}
var GPUI_TAGS, BUILT_IN_TAGS, UNIVERSAL_PROPS, STYLE_ATTRS, RENDERER_ATTRS, FOCUS_ATTRS, INTERACTIVE_TAGS, TEXT_INPUTS, PROP_ALIASES, native = null, insets, num = (v) => typeof v === "number" ? v : 0, queue, by_id, pending_destroy, inheriting_svgs, focused_input = null, root_node = null, portals, pending_portals, after_commit, is_portal = (n) => ("portal" in n.attrs), next_id = 0, dirty = false, auto_commit = false, commit_scheduled = false, warned_tags, window_node, stylesheets, NO_RULES, is_blank = (s) => s == null || s.trim() === "", native_parent_of = (parent) => parent && parent.kind === "element" ? parent : null, prop_name = (key) => PROP_ALIASES.get(key.toLowerCase()) ?? key, renderer, renderer_default, on_selection_change = (handler) => on_window_event("selectionChange", handler), corrected = null, get_native = () => {
  if (!native)
    return null;
  corrected ??= new Proxy(native, {
    get(target, key) {
      const t = target;
      if (key === "getElementBounds")
        return (id) => fix_bounds(id, target.getElementBounds(id));
      if (key === "getAutomationTree")
        return () => {
          const json = t.getAutomationTree.call(target);
          if (!json || insets.size === 0)
            return json;
          const tree = JSON.parse(json);
          if (tree)
            fix_tree(tree);
          return JSON.stringify(tree);
        };
      const v = t[key];
      return typeof v === "function" ? v.bind(target) : v;
    }
  });
  return corrected;
}, is_dirty = () => dirty;
var init_renderer2 = __esm(() => {
  init_renderer();
  init_style();
  init_events();
  GPUI_TAGS = new Set([
    "div",
    "text",
    "img",
    "svg",
    "canvas",
    "input",
    "textarea",
    "anchored",
    "code",
    "diff",
    "markdown",
    "virtual-list"
  ]);
  BUILT_IN_TAGS = new Set(["div", "text"]);
  UNIVERSAL_PROPS = new Set([
    "autoFocus",
    "tabIndex",
    "testId",
    "motion",
    "highlight",
    "role",
    "aria-label",
    "aria-description",
    "aria-id",
    "aria-expanded",
    "aria-selected",
    "aria-valuetext",
    "aria-level"
  ]);
  STYLE_ATTRS = new Set(["style", "hover", "active", "class"]);
  RENDERER_ATTRS = new Set(["hitbox", "portal"]);
  FOCUS_ATTRS = new Set(["tabIndex", "tabindex", "autoFocus", "autofocus"]);
  INTERACTIVE_TAGS = new Set(["input", "textarea", "code", "diff", "markdown", "virtual-list", "anchored", "canvas"]);
  TEXT_INPUTS = new Set(["input", "textarea"]);
  PROP_ALIASES = new Map([
    ["autofocus", "autoFocus"],
    ["tabindex", "tabIndex"],
    ["testid", "testId"]
  ]);
  insets = new Map;
  queue = [];
  by_id = new Map;
  pending_destroy = new Set;
  inheriting_svgs = new Set;
  portals = new Set;
  pending_portals = [];
  after_commit = [];
  warned_tags = new Set;
  window_node = node("window", "window", "");
  stylesheets = new Map;
  NO_RULES = [];
  renderer = createRenderer({
    createFragment: () => node("fragment", "", ""),
    createElement: (name) => node("element", name, ""),
    createTextNode: (data) => node("text", "", data),
    createComment: (data) => node("comment", "", data),
    nodeType: (n) => n.kind,
    getNodeValue(n) {
      if (n.kind === "text" || n.kind === "comment")
        return n.data;
      return null;
    },
    getAttribute(el, name) {
      const value = el.attrs[name];
      if (value == null)
        return null;
      return typeof value === "string" ? value : String(value);
    },
    setAttribute(el, key, value) {
      if (value == null) {
        renderer.removeAttribute(el, key);
        return;
      }
      el.attrs[key] = value;
      if (STYLE_ATTRS.has(key))
        apply_style(el);
      else if (key === "portal")
        reparent(el);
      else if (RENDERER_ATTRS.has(key))
        restyle_subtree(el);
      else {
        apply_prop(el, key, value);
        if (FOCUS_ATTRS.has(key) && hitbox_root(el) !== null)
          apply_style(el);
      }
    },
    removeAttribute(el, name) {
      if (!(name in el.attrs))
        return;
      delete el.attrs[name];
      if (STYLE_ATTRS.has(name))
        apply_style(el);
      else if (name === "portal") {
        portals.delete(el);
        reparent(el);
      } else if (RENDERER_ATTRS.has(name))
        restyle_subtree(el);
      else {
        apply_prop(el, name, null);
        if (FOCUS_ATTRS.has(name) && hitbox_root(el) !== null)
          apply_style(el);
      }
    },
    hasAttribute: (el, name) => (name in el.attrs),
    setText(n, text) {
      if (n.kind === "comment") {
        n.data = text;
        return;
      }
      n.data = text;
      if (n.nativeId !== null) {
        if (n.kind === "text" && is_blank(text)) {
          emit(["destroyElement", n.nativeId]);
          by_id.delete(n.nativeId);
          n.nativeId = null;
          n.attached = false;
          return;
        }
        emit(["setText", n.nativeId, text]);
        return;
      }
      if (n.kind !== "text" || is_blank(text) || !n.live)
        return;
      materialize(n);
      attach(n);
    },
    getFirstChild: (n) => n.first,
    getLastChild: (n) => n.last,
    getNextSibling: (n) => n.next,
    getParent: (n) => n.parent,
    insert(parent, n, anchor) {
      if (n.kind === "fragment") {
        for (let c = n.first, next;c; c = next) {
          next = c.next;
          renderer.insert(parent, c, anchor);
        }
        return;
      }
      if (n.parent)
        unlink(n);
      link(parent, n, anchor);
      set_live(n, parent.live === true);
      if (n.live) {
        pending_destroy.delete(n);
        materialize(n);
        attach(n);
        attach_portals();
      } else if (n.nativeId !== null && n.attached) {
        pending_destroy.add(n);
        mark_dirty();
      }
    },
    remove(n) {
      if (n.parent === null)
        return;
      unlink(n);
      set_live(n, false);
      pending_destroy.add(n);
      mark_dirty();
    },
    addEventListener(target, type, handler) {
      const event = to_gpui_event(type);
      if (event === null)
        return;
      let handlers = target.listeners.get(event);
      if (!handlers) {
        handlers = [];
        target.listeners.set(event, handlers);
      }
      handlers.push(handler);
      if (handlers.length === 1 && target.nativeId !== null) {
        emit(["setEventListener", target.nativeId, event, true]);
        if (hitbox_root(target) !== null)
          apply_style(target);
      }
    },
    removeEventListener(target, type, handler) {
      const event = to_gpui_event(type);
      if (event === null)
        return;
      const handlers = target.listeners.get(event);
      if (!handlers)
        return;
      const index = handlers.indexOf(handler);
      if (index !== -1)
        handlers.splice(index, 1);
      if (handlers.length === 0) {
        target.listeners.delete(event);
        const tracked = TEXT_INPUTS.has(target.name) && (event === "focus" || event === "blur");
        if (target.nativeId !== null) {
          if (!tracked)
            emit(["setEventListener", target.nativeId, event, false]);
          if (hitbox_root(target) !== null)
            apply_style(target);
        }
      }
    }
  });
  renderer_default = renderer;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/constants.js
var EACH_ITEM_REACTIVE = 1, EACH_INDEX_REACTIVE, EACH_IS_CONTROLLED, EACH_IS_ANIMATED, EACH_ITEM_IMMUTABLE, PROPS_IS_IMMUTABLE = 1, PROPS_IS_RUNES, PROPS_IS_UPDATED, PROPS_IS_BINDABLE, PROPS_IS_LAZY_INITIAL, TRANSITION_OUT, TRANSITION_GLOBAL, TEMPLATE_FRAGMENT = 1, TEMPLATE_USE_IMPORT_NODE, TEMPLATE_USE_SVG, TEMPLATE_USE_MATHML, HYDRATION_START = "[", HYDRATION_START_ELSE = "[!", HYDRATION_START_FAILED = "[?", HYDRATION_END = "]", HYDRATION_ERROR, ELEMENT_PRESERVE_ATTRIBUTE_CASE, ELEMENT_IS_INPUT, UNINITIALIZED, FILENAME, HMR, NAMESPACE_HTML = "http://www.w3.org/1999/xhtml", NAMESPACE_SVG = "http://www.w3.org/2000/svg", NAMESPACE_MATHML = "http://www.w3.org/1998/Math/MathML", ATTACHMENT_KEY = "@attach";
var init_constants = __esm(() => {
  EACH_INDEX_REACTIVE = 1 << 1;
  EACH_IS_CONTROLLED = 1 << 2;
  EACH_IS_ANIMATED = 1 << 3;
  EACH_ITEM_IMMUTABLE = 1 << 4;
  PROPS_IS_RUNES = 1 << 1;
  PROPS_IS_UPDATED = 1 << 2;
  PROPS_IS_BINDABLE = 1 << 3;
  PROPS_IS_LAZY_INITIAL = 1 << 4;
  TRANSITION_OUT = 1 << 1;
  TRANSITION_GLOBAL = 1 << 2;
  TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  TEMPLATE_USE_SVG = 1 << 2;
  TEMPLATE_USE_MATHML = 1 << 3;
  HYDRATION_ERROR = {};
  ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
  ELEMENT_IS_INPUT = 1 << 2;
  UNINITIALIZED = Symbol("uninitialized");
  FILENAME = Symbol("filename");
  HMR = Symbol("hmr");
});

// ../gpuix-fractalsvelte/node_modules/esm-env/true.js
var true_default = true;
// ../gpuix-fractalsvelte/node_modules/esm-env/index.js
var init_esm_env = () => {};

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/utils.js
function run_all(arr) {
  for (var i = 0;i < arr.length; i++) {
    arr[i]();
  }
}
function deferred() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function to_array(value, n) {
  if (Array.isArray(value)) {
    return value;
  }
  if (n === undefined || !(Symbol.iterator in value)) {
    return Array.from(value);
  }
  const array = [];
  for (const element of value) {
    array.push(element);
    if (array.length === n)
      break;
  }
  return array;
}
var is_array, index_of, includes, array_from, object_keys, define_property, get_descriptor, get_descriptors, object_prototype, array_prototype, get_prototype_of, has_own_property, noop = () => {};
var init_utils = __esm(() => {
  is_array = Array.isArray;
  index_of = Array.prototype.indexOf;
  includes = Array.prototype.includes;
  array_from = Array.from;
  object_keys = Object.keys;
  define_property = Object.defineProperty;
  get_descriptor = Object.getOwnPropertyDescriptor;
  get_descriptors = Object.getOwnPropertyDescriptors;
  object_prototype = Object.prototype;
  array_prototype = Array.prototype;
  get_prototype_of = Object.getPrototypeOf;
  has_own_property = Object.prototype.hasOwnProperty;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/constants.js
var DERIVED, EFFECT, RENDER_EFFECT, MANAGED_EFFECT, BLOCK_EFFECT, BRANCH_EFFECT, ROOT_EFFECT, BOUNDARY_EFFECT, PAUSED, CONNECTED, CLEAN, DIRTY, MAYBE_DIRTY, INERT, DESTROYED, REACTION_RAN, DESTROYING, EFFECT_TRANSPARENT, EAGER_EFFECT, HEAD_EFFECT, EFFECT_PRESERVED, USER_EFFECT, EFFECT_OFFSCREEN, REACTION_IS_UPDATING, ASYNC, ERROR_VALUE, STATE_SYMBOL, COMPONENT_SYMBOL, LEGACY_PROPS, LOADING_ATTR_SYMBOL, PROXY_PATH_SYMBOL, ATTRIBUTES_CACHE, CLASS_CACHE, STYLE_CACHE, TEXT_CACHE, FORM_RESET_HANDLER, HMR_ANCHOR, STALE_REACTION, IS_XHTML, ELEMENT_NODE = 1, TEXT_NODE = 3, COMMENT_NODE = 8, DOCUMENT_FRAGMENT_NODE = 11, CUSTOM_RENDERER_NODE_TYPE_MAP;
var init_constants2 = __esm(() => {
  DERIVED = 1 << 1;
  EFFECT = 1 << 2;
  RENDER_EFFECT = 1 << 3;
  MANAGED_EFFECT = 1 << 24;
  BLOCK_EFFECT = 1 << 4;
  BRANCH_EFFECT = 1 << 5;
  ROOT_EFFECT = 1 << 6;
  BOUNDARY_EFFECT = 1 << 7;
  PAUSED = 1 << 8;
  CONNECTED = 1 << 9;
  CLEAN = 1 << 10;
  DIRTY = 1 << 11;
  MAYBE_DIRTY = 1 << 12;
  INERT = 1 << 13;
  DESTROYED = 1 << 14;
  REACTION_RAN = 1 << 15;
  DESTROYING = 1 << 25;
  EFFECT_TRANSPARENT = 1 << 16;
  EAGER_EFFECT = 1 << 17;
  HEAD_EFFECT = 1 << 18;
  EFFECT_PRESERVED = 1 << 19;
  USER_EFFECT = 1 << 20;
  EFFECT_OFFSCREEN = 1 << 25;
  REACTION_IS_UPDATING = 1 << 21;
  ASYNC = 1 << 22;
  ERROR_VALUE = 1 << 23;
  STATE_SYMBOL = Symbol("$state");
  COMPONENT_SYMBOL = Symbol("component");
  LEGACY_PROPS = Symbol("legacy props");
  LOADING_ATTR_SYMBOL = Symbol("");
  PROXY_PATH_SYMBOL = Symbol("proxy path");
  ATTRIBUTES_CACHE = Symbol("attributes");
  CLASS_CACHE = Symbol("class");
  STYLE_CACHE = Symbol("style");
  TEXT_CACHE = Symbol("text");
  FORM_RESET_HANDLER = Symbol("form reset");
  HMR_ANCHOR = Symbol("hmr anchor");
  STALE_REACTION = new class StaleReactionError extends Error {
    name = "StaleReactionError";
    message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
  };
  IS_XHTML = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
  CUSTOM_RENDERER_NODE_TYPE_MAP = {
    fragment: DOCUMENT_FRAGMENT_NODE,
    element: ELEMENT_NODE,
    text: TEXT_NODE,
    comment: COMMENT_NODE
  };
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/warnings.js
function await_reactivity_loss(name) {
  if (true_default) {
    console.warn(`%c[svelte] await_reactivity_loss
%cDetected reactivity loss when reading \`${name}\`. This happens when state is read in an async function after an earlier \`await\`
https://svelte.dev/e/await_reactivity_loss`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/await_reactivity_loss`);
  }
}
function await_waterfall(name, location) {
  if (true_default) {
    console.warn(`%c[svelte] await_waterfall
%cAn async derived, \`${name}\` (${location}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app
https://svelte.dev/e/await_waterfall`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/await_waterfall`);
  }
}
function derived_inert() {
  if (true_default) {
    console.warn(`%c[svelte] derived_inert
%cReading a derived belonging to a now-destroyed effect may result in stale values
https://svelte.dev/e/derived_inert`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/derived_inert`);
  }
}
function hydration_attribute_changed(attribute, html, value) {
  if (true_default) {
    console.warn(`%c[svelte] hydration_attribute_changed
%cThe \`${attribute}\` attribute on \`${html}\` changed its value between server and client renders. The client value, \`${value}\`, will be ignored in favour of the server value
https://svelte.dev/e/hydration_attribute_changed`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/hydration_attribute_changed`);
  }
}
function hydration_mismatch(location) {
  if (true_default) {
    console.warn(`%c[svelte] hydration_mismatch
%c${location ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${location}` : "Hydration failed because the initial UI does not match what was rendered on the server"}
https://svelte.dev/e/hydration_mismatch`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/hydration_mismatch`);
  }
}
function lifecycle_double_unmount() {
  if (true_default) {
    console.warn(`%c[svelte] lifecycle_double_unmount
%cTried to unmount a component that was not mounted
https://svelte.dev/e/lifecycle_double_unmount`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/lifecycle_double_unmount`);
  }
}
function select_multiple_invalid_value() {
  if (true_default) {
    console.warn(`%c[svelte] select_multiple_invalid_value
%cThe \`value\` property of a \`<select multiple>\` element should be an array, but it received a non-array value. The selection will be kept as is.
https://svelte.dev/e/select_multiple_invalid_value`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
  }
}
function svelte_boundary_reset_noop() {
  if (true_default) {
    console.warn(`%c[svelte] svelte_boundary_reset_noop
%cA \`<svelte:boundary>\` \`reset\` function only resets the boundary the first time it is called
https://svelte.dev/e/svelte_boundary_reset_noop`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
  }
}
var bold = "font-weight: bold", normal = "font-weight: normal";
var init_warnings = __esm(() => {
  init_esm_env();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/hydration.js
function set_hydrating(value) {
  hydrating = value;
}
function set_hydrate_node(node) {
  if (node === null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return hydrate_node = node;
}
function hydrate_next() {
  return set_hydrate_node(get_next_sibling(hydrate_node));
}
function reset(node) {
  if (!hydrating)
    return;
  if (get_next_sibling(hydrate_node) !== null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  hydrate_node = node;
}
function next(count = 1) {
  if (hydrating) {
    var i = count;
    var node = hydrate_node;
    while (i--) {
      node = get_next_sibling(node);
    }
    hydrate_node = node;
  }
}
function skip_nodes(remove = true) {
  var depth = 0;
  var node = hydrate_node;
  while (true) {
    if (node_type(node) === COMMENT_NODE) {
      var data = get_node_value(node) ?? "";
      if (data === HYDRATION_END) {
        if (depth === 0)
          return node;
        depth -= 1;
      } else if (data === HYDRATION_START || data === HYDRATION_START_ELSE || data[0] === "[" && !isNaN(Number(data.slice(1)))) {
        depth += 1;
      }
    }
    var next = get_next_sibling(node);
    if (remove)
      remove_node(node);
    node = next;
  }
}
function read_hydration_instruction(node) {
  if (!node || node_type(node) !== COMMENT_NODE) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return get_node_value(node) ?? "";
}
var hydrating = false, hydrate_node;
var init_hydration = __esm(() => {
  init_constants2();
  init_constants();
  init_warnings();
  init_operations();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/equality.js
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/errors.js
function invariant_violation(message) {
  if (true_default) {
    const error = new Error(`invariant_violation
An invariant violation occurred, meaning Svelte's internal assumptions were flawed. This is a bug in Svelte, not your app — please open an issue at https://github.com/sveltejs/svelte, citing the following message: "${message}"
https://svelte.dev/e/invariant_violation`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/invariant_violation`);
  }
}
function lifecycle_outside_component(name) {
  if (true_default) {
    const error = new Error(`lifecycle_outside_component
\`${name}(...)\` can only be used during component initialisation
https://svelte.dev/e/lifecycle_outside_component`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}
function set_context_after_init() {
  if (true_default) {
    const error = new Error(`set_context_after_init
\`setContext\` must be called when a component first initializes, not in a subsequent effect or after an \`await\` expression
https://svelte.dev/e/set_context_after_init`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/set_context_after_init`);
  }
}
var init_errors = __esm(() => {
  init_esm_env();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/errors.js
function async_derived_orphan() {
  if (true_default) {
    const error = new Error(`async_derived_orphan
Cannot create a \`$derived(...)\` with an \`await\` expression outside of an effect tree
https://svelte.dev/e/async_derived_orphan`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/async_derived_orphan`);
  }
}
function derived_references_self() {
  if (true_default) {
    const error = new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/derived_references_self`);
  }
}
function each_key_duplicate(a, b, value) {
  if (true_default) {
    const error = new Error(`each_key_duplicate
${value ? `Keyed each block has duplicate key \`${value}\` at indexes ${a} and ${b}` : `Keyed each block has duplicate key at indexes ${a} and ${b}`}
https://svelte.dev/e/each_key_duplicate`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/each_key_duplicate`);
  }
}
function each_key_volatile(index, a, b) {
  if (true_default) {
    const error = new Error(`each_key_volatile
Keyed each block has key that is not idempotent — the key for item at index ${index} was \`${a}\` but is now \`${b}\`. Keys must be the same each time for a given item
https://svelte.dev/e/each_key_volatile`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/each_key_volatile`);
  }
}
function effect_in_teardown(rune) {
  if (true_default) {
    const error = new Error(`effect_in_teardown
\`${rune}\` cannot be used inside an effect cleanup function
https://svelte.dev/e/effect_in_teardown`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_in_teardown`);
  }
}
function effect_in_unowned_derived() {
  if (true_default) {
    const error = new Error(`effect_in_unowned_derived
Effect cannot be created inside a \`$derived\` value that was not itself created inside an effect
https://svelte.dev/e/effect_in_unowned_derived`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
  }
}
function effect_orphan(rune) {
  if (true_default) {
    const error = new Error(`effect_orphan
\`${rune}\` can only be used inside an effect (e.g. during component initialisation)
https://svelte.dev/e/effect_orphan`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_orphan`);
  }
}
function effect_update_depth_exceeded() {
  if (true_default) {
    const error = new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
https://svelte.dev/e/effect_update_depth_exceeded`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function hydration_failed() {
  if (true_default) {
    const error = new Error(`hydration_failed
Failed to hydrate the application
https://svelte.dev/e/hydration_failed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/hydration_failed`);
  }
}
function invalid_snippet() {
  if (true_default) {
    const error = new Error(`invalid_snippet
Could not \`{@render}\` snippet due to the expression being \`null\` or \`undefined\`. Consider using optional chaining \`{@render snippet?.()}\`
https://svelte.dev/e/invalid_snippet`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/invalid_snippet`);
  }
}
function props_invalid_value(key) {
  if (true_default) {
    const error = new Error(`props_invalid_value
Cannot do \`bind:${key}={undefined}\` when \`${key}\` has a fallback value
https://svelte.dev/e/props_invalid_value`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/props_invalid_value`);
  }
}
function renderer_missing_foreign() {
  if (true_default) {
    const error = new Error(`renderer_missing_foreign
A custom renderer must define \`foreign\` to interleave with DOM or another custom renderer
https://svelte.dev/e/renderer_missing_foreign`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/renderer_missing_foreign`);
  }
}
function rune_outside_svelte(rune) {
  if (true_default) {
    const error = new Error(`rune_outside_svelte
The \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
  }
}
function snippet_renderer_mismatch() {
  if (true_default) {
    const error = new Error(`snippet_renderer_mismatch
A snippet created in a component with a custom renderer cannot be rendered by a different renderer
https://svelte.dev/e/snippet_renderer_mismatch`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/snippet_renderer_mismatch`);
  }
}
function state_descriptors_fixed() {
  if (true_default) {
    const error = new Error(`state_descriptors_fixed
Property descriptors defined on \`$state\` objects must contain \`value\` and always be \`enumerable\`, \`configurable\` and \`writable\`.
https://svelte.dev/e/state_descriptors_fixed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  if (true_default) {
    const error = new Error(`state_prototype_fixed
Cannot set prototype of \`$state\` object
https://svelte.dev/e/state_prototype_fixed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_mutation() {
  if (true_default) {
    const error = new Error(`state_unsafe_mutation
Updating state inside \`$derived(...)\`, \`$inspect(...)\` or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`
https://svelte.dev/e/state_unsafe_mutation`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
function svelte_boundary_reset_onerror() {
  if (true_default) {
    const error = new Error(`svelte_boundary_reset_onerror
A \`<svelte:boundary>\` \`reset\` function cannot be called while an error is still being handled
https://svelte.dev/e/svelte_boundary_reset_onerror`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
  }
}
var init_errors2 = __esm(() => {
  init_esm_env();
  init_errors();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/warnings.js
var init_warnings2 = __esm(() => {
  init_esm_env();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/clone.js
var init_clone = __esm(() => {
  init_esm_env();
  init_warnings2();
  init_utils();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/tracing.js
function tag(source, label) {
  source.label = label;
  tag_proxy(source.v, label);
  return source;
}
function tag_proxy(value, label) {
  value?.[PROXY_PATH_SYMBOL]?.(label);
  return value;
}
var tracing_expressions = null;
var init_tracing = __esm(() => {
  init_constants();
  init_clone();
  init_constants2();
  init_effects();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/dev.js
function get_error(label) {
  const error = new Error;
  const stack = get_stack();
  if (stack.length === 0) {
    return null;
  }
  stack.unshift(`
`);
  define_property(error, "stack", {
    value: stack.join(`
`)
  });
  define_property(error, "name", {
    value: label
  });
  return error;
}
function get_stack() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack = new Error().stack;
  Error.stackTraceLimit = limit;
  if (!stack)
    return [];
  const lines = stack.split(`
`);
  const new_lines = [];
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    const posixified = line.replaceAll("\\", "/");
    if (line.trim() === "Error") {
      continue;
    }
    if (line.includes("validate_each_keys")) {
      return [];
    }
    if (posixified.includes("svelte/src/internal") || posixified.includes("node_modules/.vite")) {
      continue;
    }
    new_lines.push(line);
  }
  return new_lines;
}
function invariant(condition, message) {
  if (!true_default) {
    throw new Error("invariant(...) was not guarded by if (DEV)");
  }
  if (!condition)
    invariant_violation(message);
}
var init_dev = __esm(() => {
  init_esm_env();
  init_utils();
  init_errors();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/context.js
function get_parent_context(context) {
  let parent = context.p;
  while (parent !== null && parent.c === null) {
    parent = parent.p;
  }
  return parent?.c ?? null;
}
function get_or_init_context_map(context, name) {
  if (context === null) {
    lifecycle_outside_component(name);
  }
  return context.c ??= new Map(get_parent_context(context) || undefined);
}
var init_context = __esm(() => {
  init_errors();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/context.js
function set_component_context(context) {
  component_context = context;
}
function set_dev_stack(stack) {
  dev_stack = stack;
}
function set_dev_current_component_function(fn) {
  dev_current_component_function = fn;
}
function getContext(key) {
  const context_map = get_or_init_context_map(component_context, "getContext");
  const result = context_map.get(key);
  return result;
}
function setContext(key, context) {
  const context_map = get_or_init_context_map(component_context, "setContext");
  if (async_mode_flag) {
    var flags = active_effect.f;
    var valid = !active_reaction && (flags & BRANCH_EFFECT) !== 0 && !component_context.i;
    if (!valid) {
      set_context_after_init();
    }
  }
  context_map.set(key, context);
  return context;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    i: false,
    c: null,
    e: null,
    s: props,
    x: null,
    r: active_effect,
    l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
  };
  if (true_default) {
    component_context.function = fn;
    dev_current_component_function = fn;
  }
}
function pop(component) {
  var context = component_context;
  var effects = context.e;
  if (effects !== null) {
    context.e = null;
    for (var fn of effects) {
      create_user_effect(fn);
    }
  }
  if (component !== undefined) {
    context.x = component;
  }
  context.i = true;
  component_context = context.p;
  if (true_default) {
    dev_current_component_function = component_context?.function ?? null;
  }
  return mark_as_component(component);
}
function mark_as_component(component = {}) {
  define_property(component, COMPONENT_SYMBOL, { value: true });
  return component;
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
var component_context = null, dev_stack = null, dev_current_component_function = null;
var init_context2 = __esm(() => {
  init_esm_env();
  init_errors2();
  init_runtime();
  init_effects();
  init_constants();
  init_constants2();
  init_utils();
  init_context();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/task.js
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var tasks = micro_tasks;
    queueMicrotask(() => {
      if (tasks === micro_tasks)
        run_micro_tasks();
    });
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  while (micro_tasks.length > 0) {
    run_micro_tasks();
  }
}
var micro_tasks;
var init_task = __esm(() => {
  init_utils();
  init_batch();
  micro_tasks = [];
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/status.js
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived) {
  if ((derived.f & CONNECTED) !== 0 || derived.deps === null) {
    set_signal_status(derived, CLEAN);
  } else {
    set_signal_status(derived, MAYBE_DIRTY);
  }
}
var STATUS_MASK;
var init_status = __esm(() => {
  init_constants2();
  STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/utils.js
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
  if ((effect.f & DIRTY) !== 0) {
    dirty_effects.add(effect);
  } else if ((effect.f & MAYBE_DIRTY) !== 0) {
    maybe_dirty_effects.add(effect);
  }
  set_signal_status(effect, CLEAN);
}
var init_utils2 = __esm(() => {
  init_constants2();
  init_status();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/debug.js
var init_debug = __esm(() => {
  init_constants2();
  init_clone();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/misc.js
function autofocus(dom, value) {
  if (value) {
    const body = document.body;
    dom.autofocus = true;
    queue_micro_task(() => {
      if (document.activeElement === body) {
        dom.focus();
      }
    });
  }
}
function remove_textarea_child(dom) {
  if (hydrating && get_first_child(dom) !== null) {
    clear_text_content(dom);
  }
}
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    add_event_listener(document, "reset", (evt) => {
      Promise.resolve().then(() => {
        if (!evt.defaultPrevented) {
          for (const e of evt.target.elements) {
            e[FORM_RESET_HANDLER]?.();
          }
        }
      });
    }, { capture: true });
  }
}
var listening_to_form_reset = false;
var init_misc = __esm(() => {
  init_hydration();
  init_operations();
  init_task();
  init_constants2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
var init_shared = __esm(() => {
  init_effects();
  init_runtime();
  init_constants2();
  init_misc();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/custom-renderer/state.js
function set_renderer(value) {
  current_renderer = value;
}
function set_parent_renderer(value) {
  parent_renderer = value;
}
function push_renderer(value, parent = current_renderer) {
  var previous_hydrating = hydrating;
  var should_disable_hydration = hydrating && value != null;
  if (should_disable_hydration) {
    set_hydrating(false);
  }
  var previous_renderer = current_renderer;
  var previous_parent_renderer = parent_renderer;
  parent_renderer = parent;
  current_renderer = value;
  return () => {
    current_renderer = previous_renderer;
    parent_renderer = previous_parent_renderer;
    if (should_disable_hydration) {
      set_hydrating(previous_hydrating);
    }
  };
}
var current_renderer = null, parent_renderer = null;
var init_state = __esm(() => {
  init_hydration();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/async.js
function flatten(blockers, sync, async, fn) {
  const d = is_runes() ? derived : derived_safe_equal;
  var pending = blockers.filter((b) => !b.settled);
  var deriveds = sync.map(d);
  if (true_default) {
    deriveds.forEach((d, i) => {
      d.label = sync[i].toString().replace("() => ", "").replaceAll("$.eager(() => ", "$state.eager(").replace(/\$\.get\((.+?)\)/g, (_, id) => id);
    });
  }
  if (async.length === 0 && pending.length === 0) {
    fn(deriveds);
    return;
  }
  var parent = active_effect;
  var restore = capture();
  var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
  function finish(async) {
    if ((parent.f & DESTROYED) !== 0) {
      return;
    }
    restore();
    try {
      fn([...deriveds, ...async]);
    } catch (error) {
      invoke_error_boundary(error, parent);
    }
    unset_context();
  }
  var decrement_pending = increment_pending();
  if (async.length === 0) {
    blocker_promise.then(() => finish([])).finally(decrement_pending);
    return;
  }
  function run() {
    Promise.all(async.map((expression) => async_derived(expression))).then(finish).catch((error) => invoke_error_boundary(error, parent)).finally(decrement_pending);
  }
  if (blocker_promise) {
    blocker_promise.then(() => {
      if ((parent.f & DESTROYED) !== 0) {
        decrement_pending();
        return;
      }
      restore();
      run();
      unset_context();
    });
  } else {
    run();
  }
}
function capture() {
  var previous_effect = active_effect;
  var previous_reaction = active_reaction;
  var previous_component_context = component_context;
  var previous_batch = current_batch;
  var previous_renderer = custom_renderers_flag ? current_renderer : null;
  var previous_parent_renderer = custom_renderers_flag ? parent_renderer : null;
  if (true_default) {
    var previous_dev_stack = dev_stack;
  }
  return function restore(activate_batch = true) {
    set_active_effect(previous_effect);
    set_active_reaction(previous_reaction);
    set_component_context(previous_component_context);
    if (custom_renderers_flag) {
      set_renderer(previous_renderer);
      set_parent_renderer(previous_parent_renderer);
    }
    if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
      previous_batch?.activate();
      previous_batch?.apply();
    }
    if (true_default) {
      set_reactivity_loss_tracker(null);
      set_dev_stack(previous_dev_stack);
    }
  };
}
function unset_context(deactivate_batch = true) {
  restored = false;
  set_active_effect(null);
  set_active_reaction(null);
  set_component_context(null);
  if (custom_renderers_flag) {
    set_renderer(null);
    set_parent_renderer(null);
  }
  if (deactivate_batch)
    current_batch?.deactivate();
  if (true_default) {
    set_reactivity_loss_tracker(null);
    set_dev_stack(null);
  }
}
function increment_pending() {
  var effect = active_effect;
  var boundary = effect.b;
  var batch = current_batch;
  var blocking = !!boundary?.is_rendered();
  boundary?.update_pending_count(1, batch);
  batch.increment(blocking, effect);
  return () => {
    boundary?.update_pending_count(-1, batch);
    batch.decrement(blocking, effect);
  };
}
var restored = false;
var init_async = __esm(() => {
  init_constants2();
  init_esm_env();
  init_context2();
  init_state();
  init_error_handling();
  init_runtime();
  init_batch();
  init_deriveds();
  init_effects();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/deriveds.js
function set_reactivity_loss_tracker(v) {
  reactivity_loss_tracker = v;
}
function derived(fn) {
  var flags = DERIVED | DIRTY;
  if (active_effect !== null) {
    active_effect.f |= EFFECT_PRESERVED;
  }
  const signal = {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: flags,
    fn,
    reactions: null,
    rv: 0,
    v: UNINITIALIZED,
    wv: 0,
    parent: active_effect,
    ac: null
  };
  if (true_default && tracing_mode_flag) {
    signal.created = get_error("created at");
  }
  return signal;
}
function async_derived(fn, label, location) {
  let parent = active_effect;
  if (parent === null) {
    async_derived_orphan();
  }
  var promise = undefined;
  var signal = source(UNINITIALIZED);
  if (true_default)
    signal.label = label ?? fn.toString();
  var should_suspend = !active_reaction;
  var deferreds = new Set;
  async_effect(() => {
    var effect = active_effect;
    if (true_default) {
      reactivity_loss_tracker = { effect, effect_deps: new Set, warned: false };
    }
    var d = deferred();
    promise = d.promise;
    try {
      Promise.resolve(fn()).then(d.resolve, (e) => {
        if (e !== STALE_REACTION)
          d.reject(e);
      }).finally(unset_context);
    } catch (error) {
      d.reject(error);
      unset_context();
    }
    if (true_default) {
      if (reactivity_loss_tracker) {
        if (effect.deps !== null) {
          for (let i = 0;i < skipped_deps; i += 1) {
            reactivity_loss_tracker.effect_deps.add(effect.deps[i]);
          }
        }
        if (new_deps !== null) {
          for (let i = 0;i < new_deps.length; i += 1) {
            reactivity_loss_tracker.effect_deps.add(new_deps[i]);
          }
        }
      }
      reactivity_loss_tracker = null;
    }
    var batch = current_batch;
    if (should_suspend) {
      if ((effect.f & REACTION_RAN) !== 0) {
        var decrement_pending = increment_pending();
      }
      if (parent.b?.is_rendered()) {
        batch.async_deriveds.get(effect)?.reject(OBSOLETE);
      } else {
        for (const d of deferreds.values()) {
          d.reject(OBSOLETE);
        }
      }
      deferreds.add(d);
      batch.async_deriveds.set(effect, d);
    }
    const handler = (value, error = undefined) => {
      if (true_default) {
        reactivity_loss_tracker = null;
      }
      decrement_pending?.();
      deferreds.delete(d);
      if (error === OBSOLETE)
        return;
      batch.activate();
      if (error) {
        signal.f |= ERROR_VALUE;
        internal_set(signal, error);
      } else {
        if ((signal.f & ERROR_VALUE) !== 0) {
          signal.f ^= ERROR_VALUE;
        }
        if (true_default && location !== undefined && !signal.equals(value)) {
          recent_async_deriveds.add(signal);
          setTimeout(() => {
            if (recent_async_deriveds.has(signal) && (effect.f & DESTROYED) === 0) {
              await_waterfall(signal.label, location);
              recent_async_deriveds.delete(signal);
            }
          });
        }
        internal_set(signal, value);
      }
      batch.deactivate();
    };
    d.promise.then(handler, (e) => handler(null, e || "unknown"));
  });
  teardown(() => {
    for (const d of deferreds) {
      d.reject(OBSOLETE);
    }
  });
  if (true_default) {
    signal.f |= ASYNC;
  }
  return new Promise((fulfil) => {
    function next(p) {
      function go() {
        if (p === promise) {
          fulfil(signal);
        } else {
          next(promise);
        }
      }
      p.then(go, go);
    }
    next(promise);
  });
}
function user_derived(fn) {
  const d = derived(fn);
  if (!async_mode_flag)
    push_reaction_value(d);
  return d;
}
function derived_safe_equal(fn) {
  const signal = derived(fn);
  signal.equals = safe_equals;
  return signal;
}
function destroy_derived_effects(derived) {
  var effects = derived.effects;
  if (effects !== null) {
    derived.effects = null;
    for (var i = 0;i < effects.length; i += 1) {
      destroy_effect(effects[i]);
    }
  }
}
function execute_derived(derived) {
  var value;
  var prev_active_effect = active_effect;
  var parent = derived.parent;
  if (!is_destroying_effect && parent !== null && derived.v !== UNINITIALIZED && (parent.f & (DESTROYED | INERT)) !== 0) {
    derived_inert();
    return derived.v;
  }
  set_active_effect(parent);
  if (true_default) {
    let prev_eager_effects = eager_effects;
    set_eager_effects(new Set);
    try {
      if (includes.call(stack, derived)) {
        derived_references_self();
      }
      stack.push(derived);
      destroy_derived_effects(derived);
      value = update_reaction(derived);
    } finally {
      set_active_effect(prev_active_effect);
      set_eager_effects(prev_eager_effects);
      stack.pop();
    }
  } else {
    try {
      destroy_derived_effects(derived);
      value = update_reaction(derived);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived) {
  var value = execute_derived(derived);
  if (!derived.equals(value)) {
    derived.wv = increment_write_version();
    if (!current_batch?.is_fork || derived.deps === null) {
      if (current_batch !== null) {
        current_batch.capture(derived, value, true);
        previous_batch?.capture(derived, value, true);
      } else {
        derived.v = value;
      }
      if (derived.deps === null) {
        set_signal_status(derived, CLEAN);
        return;
      }
    }
  }
  if (is_destroying_effect) {
    return;
  }
  if (batch_values !== null) {
    if (effect_tracking() || current_batch?.is_fork) {
      batch_values.set(derived, value);
    }
  } else {
    update_derived_status(derived);
  }
}
function freeze_derived_effects(derived) {
  if (derived.effects === null)
    return;
  for (const e of derived.effects) {
    if (e.teardown || e.ac) {
      e.teardown?.();
      if (e.ac !== null) {
        without_reactive_context(() => {
          e.ac.abort(STALE_REACTION);
          e.ac = null;
        });
      }
      if (e.fn !== null)
        e.teardown = noop;
      remove_reactions(e, 0);
      destroy_effect_children(e);
    }
  }
}
function unfreeze_derived_effects(derived) {
  if (derived.effects === null)
    return;
  for (const e of derived.effects) {
    if (e.teardown && e.fn !== null) {
      update_effect(e);
    }
  }
}
var reactivity_loss_tracker = null, recent_async_deriveds, OBSOLETE, stack;
var init_deriveds = __esm(() => {
  init_esm_env();
  init_constants2();
  init_runtime();
  init_shared();
  init_errors2();
  init_warnings();
  init_effects();
  init_sources();
  init_dev();
  init_context2();
  init_constants();
  init_batch();
  init_async();
  init_utils();
  init_status();
  recent_async_deriveds = new Set;
  OBSOLETE = Symbol("obsolete");
  stack = [];
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/batch.js
class Batch {
  id = uid++;
  #started = false;
  linked = true;
  #prev = null;
  #next = null;
  async_deriveds = new Map;
  current = new Map;
  previous = new Map;
  #commit_callbacks = new Set;
  #discard_callbacks = new Set;
  #pending = 0;
  #blocking_pending = new Map;
  #deferred = null;
  #scheduled = [];
  #new_effects = [];
  #dirty_effects = new Set;
  #maybe_dirty_effects = new Set;
  #skipped_branches = new Map;
  #unskipped_branches = new Set;
  is_fork = false;
  #decrement_queued = false;
  constructor() {
    if (last_batch === null) {
      first_batch = last_batch = this;
    } else {
      last_batch.#next = this;
      this.#prev = last_batch;
    }
    last_batch = this;
  }
  #is_deferred() {
    if (this.is_fork)
      return true;
    for (const effect of this.#blocking_pending.keys()) {
      var e = effect;
      var skipped = false;
      while (e.parent !== null) {
        if (this.#skipped_branches.has(e)) {
          skipped = true;
          break;
        }
        e = e.parent;
      }
      if (!skipped) {
        return true;
      }
    }
    return false;
  }
  skip_effect(effect) {
    if (!this.#skipped_branches.has(effect)) {
      this.#skipped_branches.set(effect, { d: [], m: [] });
    }
    this.#unskipped_branches.delete(effect);
  }
  unskip_effect(effect, callback = (e) => this.schedule(e)) {
    var tracked = this.#skipped_branches.get(effect);
    if (tracked) {
      this.#skipped_branches.delete(effect);
      for (var e of tracked.d) {
        set_signal_status(e, DIRTY);
        callback(e);
      }
      for (e of tracked.m) {
        set_signal_status(e, MAYBE_DIRTY);
        callback(e);
      }
    }
    this.#unskipped_branches.add(effect);
  }
  #resolve() {
    var roots = [];
    for (const effect of this.#scheduled) {
      if ((effect.f & DESTROYED) !== 0 || (effect.f & (DIRTY | MAYBE_DIRTY)) === 0)
        continue;
      var e = effect;
      var covered = false;
      while (e.parent !== null) {
        e = e.parent;
        var flags = e.f;
        if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
          if ((flags & CLEAN) === 0) {
            covered = true;
            break;
          }
          e.f ^= CLEAN;
        }
      }
      if (!covered) {
        roots.push(e);
      }
    }
    this.#scheduled = [];
    return roots;
  }
  #process() {
    this.#started = true;
    if (true_default) {
      for (const value of this.current.keys()) {
        source_stacks.add(value);
      }
    }
    for (const e of this.#dirty_effects) {
      this.#maybe_dirty_effects.delete(e);
      set_signal_status(e, DIRTY);
      this.schedule(e);
    }
    for (const e of this.#maybe_dirty_effects) {
      set_signal_status(e, MAYBE_DIRTY);
      this.schedule(e);
    }
    this.apply();
    var effects = collected_effects = [];
    var render_effects = [];
    var updates = legacy_updates = [];
    while (this.#scheduled.length > 0) {
      if (flush_count++ > 1000) {
        this.#unlink();
        infinite_loop_guard();
      }
      for (const root of this.#resolve()) {
        try {
          this.#traverse(root, effects, render_effects);
        } catch (e) {
          reset_all(root);
          if (!this.#is_deferred())
            this.discard();
          throw e;
        }
      }
    }
    current_batch = null;
    if (updates.length > 0) {
      var batch = Batch.ensure();
      for (const e of updates) {
        batch.schedule(e);
      }
    }
    collected_effects = null;
    legacy_updates = null;
    if (this.#is_deferred()) {
      this.#defer_effects(render_effects);
      this.#defer_effects(effects);
      for (const [e, t] of this.#skipped_branches) {
        reset_branch(e, t);
      }
      if (updates.length > 0) {
        current_batch.#process();
      }
      return;
    }
    const earlier_batch = this.#find_earlier_batch();
    if (earlier_batch) {
      this.#defer_effects(render_effects);
      this.#defer_effects(effects);
      earlier_batch.#merge(this);
      return;
    }
    this.#dirty_effects.clear();
    this.#maybe_dirty_effects.clear();
    for (const fn of this.#commit_callbacks)
      fn(this);
    this.#commit_callbacks.clear();
    previous_batch = this;
    flush_queued_effects(render_effects);
    flush_queued_effects(effects);
    previous_batch = null;
    this.#deferred?.resolve();
    var next_batch = current_batch;
    if (this.#pending === 0 && (this.#scheduled.length === 0 || next_batch !== null)) {
      this.#unlink();
      if (async_mode_flag) {
        this.#commit();
        current_batch = next_batch;
      }
    }
    if (this.#scheduled.length > 0) {
      if (next_batch !== null) {
        for (const e of this.#scheduled) {
          next_batch.#scheduled.push(e);
        }
        this.#scheduled = [];
      } else {
        next_batch = this;
      }
    }
    if (next_batch !== null) {
      old_values.clear();
      next_batch.#process();
    }
  }
  #traverse(root, effects, render_effects) {
    root.f ^= CLEAN;
    var effect = root.first;
    while (effect !== null) {
      var flags = effect.f;
      var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
      var skip = is_skippable_branch || (flags & INERT) !== 0 || this.#skipped_branches.has(effect);
      if (!skip && effect.fn !== null) {
        if (is_branch) {
          effect.f ^= CLEAN;
        } else if ((flags & EFFECT) !== 0) {
          effects.push(effect);
        } else if (async_mode_flag && (flags & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
          render_effects.push(effect);
        } else if (is_dirty2(effect)) {
          if ((flags & BLOCK_EFFECT) !== 0)
            this.#maybe_dirty_effects.add(effect);
          update_effect(effect);
        }
        var child = effect.first;
        if (child !== null) {
          effect = child;
          continue;
        }
      }
      while (effect !== null) {
        var next = effect.next;
        if (next !== null) {
          effect = next;
          break;
        }
        effect = effect.parent;
      }
    }
  }
  #find_earlier_batch() {
    var batch = this.#prev;
    while (batch !== null) {
      if (!batch.is_fork) {
        for (const [value, [, is_derived]] of this.current) {
          if (batch.current.has(value) && !is_derived) {
            return batch;
          }
        }
      }
      batch = batch.#prev;
    }
    return null;
  }
  #merge(batch) {
    for (const [source, value] of batch.current) {
      if (!this.previous.has(source) && batch.previous.has(source)) {
        this.previous.set(source, batch.previous.get(source));
      }
      this.current.set(source, value);
    }
    for (const [effect, deferred] of batch.async_deriveds) {
      const d = this.async_deriveds.get(effect);
      if (d)
        deferred.promise.then(d.resolve).catch(d.reject);
    }
    batch.async_deriveds.clear();
    this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);
    const mark = (value) => {
      var reactions = value.reactions;
      if (reactions === null)
        return;
      if ((value.f & DERIVED) !== 0 && (value.f & (DIRTY | MAYBE_DIRTY)) === 0) {
        return;
      }
      for (const reaction of reactions) {
        var flags = reaction.f;
        if ((flags & DERIVED) !== 0) {
          mark(reaction);
        } else {
          var effect = reaction;
          if (flags & (ASYNC | BLOCK_EFFECT) && !this.async_deriveds.has(effect)) {
            this.#maybe_dirty_effects.delete(effect);
            set_signal_status(effect, DIRTY);
            this.schedule(effect);
          }
        }
      }
    };
    for (const source of this.current.keys()) {
      mark(source);
    }
    this.oncommit(() => batch.discard());
    batch.#unlink();
    current_batch = this;
    this.#process();
  }
  #defer_effects(effects) {
    for (var i = 0;i < effects.length; i += 1) {
      defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
    }
  }
  capture(source, value, is_derived = false) {
    if (source.v !== UNINITIALIZED && !this.previous.has(source)) {
      this.previous.set(source, source.v);
    }
    if ((source.f & ERROR_VALUE) === 0) {
      this.current.set(source, [value, is_derived]);
      batch_values?.set(source, value);
    }
    if (!this.is_fork) {
      source.v = value;
    }
  }
  activate() {
    current_batch = this;
  }
  deactivate() {
    current_batch = null;
    batch_values = null;
  }
  flush() {
    try {
      if (true_default) {
        source_stacks.clear();
      }
      is_processing = true;
      current_batch = this;
      this.#process();
    } finally {
      flush_count = 0;
      last_scheduled_effect = null;
      collected_effects = null;
      legacy_updates = null;
      is_processing = false;
      current_batch = null;
      batch_values = null;
      old_values.clear();
      if (true_default) {
        for (const source of source_stacks) {
          source.updated = null;
        }
      }
    }
  }
  discard() {
    for (const fn of this.#discard_callbacks)
      fn(this);
    this.#discard_callbacks.clear();
    for (const deferred of this.async_deriveds.values()) {
      deferred.reject(OBSOLETE);
    }
    this.#unlink();
    this.#deferred?.resolve();
  }
  register_created_effect(effect) {
    this.#new_effects.push(effect);
  }
  #commit() {
    for (let batch = first_batch;batch !== null; batch = batch.#next) {
      var is_earlier = batch.id < this.id;
      var sources = [];
      for (const [source, [value, is_derived]] of this.current) {
        if (batch.current.has(source)) {
          var batch_value = batch.current.get(source)[0];
          if (is_earlier && value !== batch_value) {
            batch.current.set(source, [value, is_derived]);
          } else {
            continue;
          }
        }
        sources.push(source);
      }
      if (is_earlier) {
        for (const [effect, deferred] of this.async_deriveds) {
          const d = batch.async_deriveds.get(effect);
          if (d)
            deferred.promise.then(d.resolve).catch(d.reject);
        }
      }
      var current = [...batch.current.keys()].filter((source) => !batch.current.get(source)[1]);
      if (!batch.#started || current.length === 0)
        continue;
      var others = current.filter((source) => !this.current.has(source));
      if (others.length === 0) {
        if (is_earlier) {
          batch.discard();
        }
      } else if (sources.length > 0) {
        if (true_default && !batch.#decrement_queued) {
          invariant(batch.#scheduled.length === 0, "Batch has scheduled effects");
        }
        if (is_earlier) {
          for (const unskipped of this.#unskipped_branches) {
            batch.unskip_effect(unskipped, (e) => {
              if ((e.f & (BLOCK_EFFECT | ASYNC)) !== 0) {
                batch.schedule(e);
              } else {
                batch.#defer_effects([e]);
              }
            });
          }
        }
        batch.activate();
        var marked = new Set;
        var checked = new Map;
        for (var source of sources) {
          mark_effects(source, others, marked, checked);
        }
        checked = new Map;
        var current_unequal = [...batch.current].filter(([c, v1]) => {
          const v2 = this.current.get(c);
          if (!v2)
            return true;
          return v2[0] !== v1[0] || v2[1] !== v1[1];
        }).map(([c]) => c);
        if (current_unequal.length > 0) {
          for (const effect of this.#new_effects) {
            if ((effect.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 && depends_on(effect, current_unequal, checked)) {
              if ((effect.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
                set_signal_status(effect, DIRTY);
                batch.schedule(effect);
              } else {
                batch.#dirty_effects.add(effect);
              }
            }
          }
        }
        if (batch.#scheduled.length > 0 && !batch.#decrement_queued) {
          batch.apply();
          for (var root of batch.#resolve()) {
            batch.#traverse(root, [], []);
          }
        }
        batch.deactivate();
      }
    }
  }
  increment(blocking, effect) {
    this.#pending += 1;
    if (blocking) {
      let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
      this.#blocking_pending.set(effect, blocking_pending_count + 1);
    }
  }
  decrement(blocking, effect) {
    this.#pending -= 1;
    if (blocking) {
      let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
      if (blocking_pending_count === 1) {
        this.#blocking_pending.delete(effect);
      } else {
        this.#blocking_pending.set(effect, blocking_pending_count - 1);
      }
    }
    if (this.#decrement_queued)
      return;
    this.#decrement_queued = true;
    queue_micro_task(() => {
      this.#decrement_queued = false;
      if (this.linked) {
        this.flush();
      }
    });
  }
  transfer_effects(dirty_effects, maybe_dirty_effects) {
    for (const e of dirty_effects) {
      this.#dirty_effects.add(e);
    }
    for (const e of maybe_dirty_effects) {
      this.#maybe_dirty_effects.add(e);
    }
    dirty_effects.clear();
    maybe_dirty_effects.clear();
  }
  oncommit(fn) {
    this.#commit_callbacks.add(fn);
  }
  ondiscard(fn) {
    this.#discard_callbacks.add(fn);
  }
  settled() {
    return (this.#deferred ??= deferred()).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const batch = current_batch = new Batch;
      if (!is_processing && !is_flushing_sync) {
        queue_micro_task(() => {
          if (!batch.#started) {
            batch.flush();
          }
        });
      }
    }
    return current_batch;
  }
  apply() {
    if (!async_mode_flag || !this.is_fork && this.#prev === null && this.#next === null) {
      batch_values = null;
      return;
    }
    batch_values = new Map;
    for (const [source, [value]] of this.current) {
      batch_values.set(source, value);
    }
    for (let batch = first_batch;batch !== null; batch = batch.#next) {
      if (batch === this || batch.is_fork)
        continue;
      var intersects = false;
      if (batch.id < this.id) {
        for (const [source, [, is_derived]] of batch.current) {
          if (is_derived)
            continue;
          if (this.current.has(source)) {
            intersects = true;
            break;
          }
        }
      }
      if (!intersects) {
        for (const [source, previous] of batch.previous) {
          if (!batch_values.has(source)) {
            batch_values.set(source, previous);
          }
        }
      }
    }
  }
  schedule(effect) {
    last_scheduled_effect = effect;
    if (effect.b?.is_pending && (effect.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 && (effect.f & REACTION_RAN) === 0) {
      effect.b.defer_effect(effect);
      return;
    }
    this.#scheduled.push(effect);
  }
  #unlink() {
    if (!this.linked)
      return;
    var prev = this.#prev;
    var next = this.#next;
    if (prev === null) {
      first_batch = next;
    } else {
      prev.#next = next;
    }
    if (next === null) {
      last_batch = prev;
    } else {
      next.#prev = prev;
    }
    this.linked = false;
  }
}
function flushSync(fn) {
  var was_flushing_sync = is_flushing_sync;
  var prev_previous_batch = previous_batch;
  previous_batch = null;
  is_flushing_sync = true;
  try {
    var result;
    if (fn) {
      flushSync();
      result = fn();
    }
    while (true) {
      flush_tasks();
      if (current_batch === null) {
        return result;
      }
      current_batch.flush();
    }
  } finally {
    is_flushing_sync = was_flushing_sync;
    previous_batch = prev_previous_batch;
  }
}
function infinite_loop_guard() {
  if (true_default) {
    var updates = new Map;
    for (const source of current_batch.current.keys()) {
      for (const [stack, update] of source.updated ?? []) {
        var entry = updates.get(stack);
        if (!entry) {
          entry = { error: update.error, count: 0 };
          updates.set(stack, entry);
        }
        entry.count += update.count;
      }
    }
    for (const update of updates.values()) {
      if (update.error) {
        console.error(update.error);
      }
    }
  }
  try {
    effect_update_depth_exceeded();
  } catch (error) {
    if (true_default) {
      define_property(error, "stack", { value: "" });
    }
    invoke_error_boundary(error, last_scheduled_effect);
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0)
    return;
  var i = 0;
  while (i < length) {
    var effect = effects[i++];
    if ((effect.f & (DESTROYED | INERT)) === 0 && is_dirty2(effect)) {
      eager_block_effects = new Set;
      update_effect(effect);
      if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) {
        unlink_effect(effect);
      }
      if (eager_block_effects?.size > 0) {
        old_values.clear();
        for (const e of eager_block_effects) {
          if ((e.f & (DESTROYED | INERT)) !== 0)
            continue;
          const ordered_effects = [e];
          let ancestor = e.parent;
          while (ancestor !== null) {
            if (eager_block_effects.has(ancestor)) {
              eager_block_effects.delete(ancestor);
              ordered_effects.push(ancestor);
            }
            ancestor = ancestor.parent;
          }
          for (let j = ordered_effects.length - 1;j >= 0; j--) {
            const e = ordered_effects[j];
            if ((e.f & (DESTROYED | INERT)) !== 0)
              continue;
            update_effect(e);
          }
        }
        eager_block_effects.clear();
      }
    }
  }
  eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
  if (marked.has(value))
    return;
  marked.add(value);
  if (value.reactions !== null) {
    for (const reaction of value.reactions) {
      const flags = reaction.f;
      if ((flags & DERIVED) !== 0) {
        mark_effects(reaction, sources, marked, checked);
      } else if ((flags & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
        set_signal_status(reaction, DIRTY);
        schedule_effect(reaction);
      }
    }
  }
}
function depends_on(reaction, sources, checked) {
  const depends = checked.get(reaction);
  if (depends !== undefined)
    return depends;
  if (reaction.deps !== null) {
    for (const dep of reaction.deps) {
      if (includes.call(sources, dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on(dep, sources, checked)) {
        checked.set(dep, true);
        return true;
      }
    }
  }
  checked.set(reaction, false);
  return false;
}
function schedule_effect(effect) {
  current_batch.schedule(effect);
}
function reset_branch(effect, tracked) {
  if ((effect.f & BRANCH_EFFECT) !== 0 && (effect.f & CLEAN) !== 0) {
    return;
  }
  if ((effect.f & DIRTY) !== 0) {
    tracked.d.push(effect);
  } else if ((effect.f & MAYBE_DIRTY) !== 0) {
    tracked.m.push(effect);
  }
  set_signal_status(effect, CLEAN);
  var e = effect.first;
  while (e !== null) {
    reset_branch(e, tracked);
    e = e.next;
  }
}
function reset_all(effect) {
  set_signal_status(effect, CLEAN);
  var e = effect.first;
  while (e !== null) {
    reset_all(e);
    e = e.next;
  }
}
var first_batch = null, last_batch = null, current_batch = null, previous_batch = null, batch_values = null, last_scheduled_effect = null, is_flushing_sync = false, is_processing = false, collected_effects = null, legacy_updates = null, flush_count = 0, source_stacks, uid = 1, eager_block_effects = null, version_map;
var init_batch = __esm(() => {
  init_constants2();
  init_utils();
  init_runtime();
  init_errors2();
  init_task();
  init_esm_env();
  init_error_handling();
  init_sources();
  init_effects();
  init_utils2();
  init_constants();
  init_status();
  init_dev();
  init_debug();
  init_deriveds();
  source_stacks = new Set;
  version_map = new Map;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/sources.js
function set_eager_effects(v) {
  eager_effects = v;
}
function set_eager_effects_deferred() {
  eager_effects_deferred = true;
}
function source(v, stack) {
  var signal = {
    f: 0,
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  if (true_default && tracing_mode_flag) {
    signal.created = stack ?? get_error("created at");
    signal.updated = null;
    signal.set_during_effect = false;
    signal.trace = null;
  }
  return signal;
}
function state(v, stack) {
  const s = source(v, stack);
  push_reaction_value(s);
  return s;
}
function mutable_source(initial_value, immutable = false, trackable = true) {
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
    (component_context.l.s ??= []).push(s);
  }
  return s;
}
function set(source, value, should_proxy = false) {
  if (active_reaction !== null && (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !current_sources.has(source))) {
    state_unsafe_mutation();
  }
  let new_value = should_proxy ? proxy(value) : value;
  if (true_default) {
    tag_proxy(new_value, source.label);
  }
  return internal_set(source, new_value, legacy_updates);
}
function internal_set(source, value, updated_during_traversal = null) {
  if (!source.equals(value)) {
    if (is_destroying_effect) {
      old_values.set(source, value);
    } else if (!old_values.has(source)) {
      old_values.set(source, source.v);
    }
    var batch = Batch.ensure();
    batch.capture(source, value);
    if (true_default) {
      if (tracing_mode_flag || active_effect !== null) {
        source.updated ??= new Map;
        const count = (source.updated.get("")?.count ?? 0) + 1;
        source.updated.set("", { error: null, count });
        if (tracing_mode_flag || count > 5) {
          const error = get_error("updated at");
          if (error !== null) {
            let entry = source.updated.get(error.stack);
            if (!entry) {
              entry = { error, count: 0 };
              source.updated.set(error.stack, entry);
            }
            entry.count++;
          }
        }
      }
      if (active_effect !== null) {
        source.set_during_effect = true;
      }
    }
    if ((source.f & DERIVED) !== 0) {
      const derived = source;
      if ((source.f & DIRTY) !== 0) {
        execute_derived(derived);
      }
      if (batch_values === null) {
        update_derived_status(derived);
      }
    }
    source.wv = increment_write_version();
    seen = null;
    count_deps = 0;
    mark_reactions(source, DIRTY, updated_during_traversal);
    seen = null;
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([source]);
      } else {
        untracked_writes.push(source);
      }
    }
    if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
      flush_eager_effects();
    }
  }
  return value;
}
function flush_eager_effects() {
  eager_effects_deferred = false;
  for (const effect of eager_effects) {
    if ((effect.f & CLEAN) !== 0) {
      set_signal_status(effect, MAYBE_DIRTY);
    }
    let dirty;
    try {
      dirty = is_dirty2(effect);
    } catch {
      dirty = true;
    }
    if (dirty) {
      update_effect(effect);
    }
  }
  eager_effects.clear();
}
function update(source, d = 1) {
  var value = get(source);
  var result = d === 1 ? value++ : value--;
  set(source, value);
  return result;
}
function increment(source) {
  set(source, source.v + 1);
}
function mark_reactions(signal, status, updated_during_traversal) {
  var reactions = signal.reactions;
  if (reactions === null)
    return;
  var runes = is_runes();
  var length = reactions.length;
  count_deps += length;
  if (count_deps > 1e5 && seen === null)
    seen = new Set;
  if (seen !== null) {
    if (seen.has(signal))
      return;
    seen.add(signal);
  }
  for (var i = 0;i < length; i++) {
    var reaction = reactions[i];
    var flags = reaction.f;
    if (!runes && reaction === active_effect)
      continue;
    var not_dirty = (flags & DIRTY) === 0;
    if (not_dirty) {
      set_signal_status(reaction, status);
    }
    if ((flags & EAGER_EFFECT) !== 0) {
      eager_effects.add(reaction);
    } else if ((flags & DERIVED) !== 0) {
      var derived = reaction;
      batch_values?.delete(derived);
      mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
    } else if (not_dirty) {
      var effect = reaction;
      if ((flags & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
        eager_block_effects.add(effect);
      }
      if (updated_during_traversal !== null) {
        updated_during_traversal.push(effect);
      } else {
        schedule_effect(effect);
      }
    }
  }
}
var eager_effects, old_values, eager_effects_deferred = false, seen = null, count_deps = 0;
var init_sources = __esm(() => {
  init_esm_env();
  init_runtime();
  init_constants2();
  init_errors2();
  init_tracing();
  init_dev();
  init_context2();
  init_batch();
  init_proxy();
  init_deriveds();
  init_status();
  eager_effects = new Set;
  old_values = new Map;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/proxy.js
function proxy(value) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value || COMPONENT_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = new Map;
  var is_proxied_array = is_array(value);
  var version = state(0);
  var stack = true_default && tracing_mode_flag ? get_error("created at") : null;
  var parent_version = update_version;
  var with_parent = (fn) => {
    if (update_version === parent_version) {
      return fn();
    }
    var reaction = active_reaction;
    var version = update_version;
    set_active_reaction(null);
    set_update_version(parent_version);
    var result = fn();
    set_active_reaction(reaction);
    set_update_version(version);
    return result;
  };
  if (is_proxied_array) {
    sources.set("length", state(value.length, stack));
    if (true_default) {
      value = inspectable_array(value);
    }
  }
  var path = "";
  let updating = false;
  function update_path(new_path) {
    if (updating)
      return;
    updating = true;
    path = new_path;
    tag(version, `${path} version`);
    for (const [prop, source] of sources) {
      tag(source, get_label(path, prop));
    }
    updating = false;
  }
  return new Proxy(value, {
    defineProperty(_, prop, descriptor) {
      if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
        state_descriptors_fixed();
      }
      var s = sources.get(prop);
      if (s === undefined) {
        with_parent(() => {
          var s = state(descriptor.value, stack);
          sources.set(prop, s);
          if (true_default && typeof prop === "string") {
            tag(s, get_label(path, prop));
          }
          return s;
        });
      } else {
        set(s, descriptor.value, true);
      }
      return true;
    },
    deleteProperty(target, prop) {
      var s = sources.get(prop);
      if (s === undefined) {
        if (prop in target) {
          const s = with_parent(() => state(UNINITIALIZED, stack));
          sources.set(prop, s);
          increment(version);
          if (true_default) {
            tag(s, get_label(path, prop));
          }
        }
      } else {
        set(s, UNINITIALIZED);
        increment(version);
      }
      return true;
    },
    get(target, prop, receiver) {
      if (prop === STATE_SYMBOL) {
        return value;
      }
      if (true_default && prop === PROXY_PATH_SYMBOL) {
        return update_path;
      }
      var s = sources.get(prop);
      var exists = prop in target;
      if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
        s = with_parent(() => {
          var p = proxy(exists ? target[prop] : UNINITIALIZED);
          var s = state(p, stack);
          if (true_default) {
            tag(s, get_label(path, prop));
          }
          return s;
        });
        sources.set(prop, s);
      }
      if (s !== undefined) {
        var v = get(s);
        return v === UNINITIALIZED ? undefined : v;
      }
      return Reflect.get(target, prop, receiver);
    },
    getOwnPropertyDescriptor(target, prop) {
      this.has?.(target, prop);
      var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      var s = sources.get(prop);
      if (s !== undefined) {
        var value = get(s);
        if (value === UNINITIALIZED) {
          return;
        }
        if (descriptor && "value" in descriptor) {
          descriptor.value = value;
        } else {
          return {
            enumerable: true,
            configurable: true,
            value,
            writable: true
          };
        }
      }
      return descriptor;
    },
    has(target, prop) {
      if (prop === STATE_SYMBOL) {
        return true;
      }
      var s = sources.get(prop);
      var has = s !== undefined && s.v !== UNINITIALIZED || Reflect.has(target, prop);
      if (s !== undefined || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
        if (s === undefined) {
          s = with_parent(() => {
            var p = has ? proxy(target[prop]) : UNINITIALIZED;
            var s = state(p, stack);
            if (true_default) {
              tag(s, get_label(path, prop));
            }
            return s;
          });
          sources.set(prop, s);
        }
        var value = get(s);
        if (value === UNINITIALIZED) {
          return false;
        }
      }
      return has;
    },
    set(target, prop, value, receiver) {
      var s = sources.get(prop);
      var has = prop in target;
      if (is_proxied_array && prop === "length") {
        for (var i = value;i < s.v; i += 1) {
          var other_s = sources.get(i + "");
          if (other_s !== undefined) {
            set(other_s, UNINITIALIZED);
          } else if (i in target) {
            other_s = with_parent(() => state(UNINITIALIZED, stack));
            sources.set(i + "", other_s);
            if (true_default) {
              tag(other_s, get_label(path, i));
            }
          }
        }
      }
      if (s === undefined) {
        if (!has || get_descriptor(target, prop)?.writable) {
          s = with_parent(() => state(undefined, stack));
          if (true_default) {
            tag(s, get_label(path, prop));
          }
          set(s, proxy(value));
          sources.set(prop, s);
        }
      } else {
        has = s.v !== UNINITIALIZED;
        var p = with_parent(() => proxy(value));
        set(s, p);
      }
      var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (descriptor?.set) {
        descriptor.set.call(receiver, value);
      }
      if (!has) {
        if (is_proxied_array && typeof prop === "string") {
          var ls = sources.get("length");
          var n = Number(prop);
          if (Number.isInteger(n) && n >= ls.v) {
            set(ls, n + 1);
          }
        }
        increment(version);
      }
      return true;
    },
    ownKeys(target) {
      get(version);
      var own_keys = Reflect.ownKeys(target).filter((key) => {
        var source = sources.get(key);
        return source === undefined || source.v !== UNINITIALIZED;
      });
      for (var [key, source] of sources) {
        if (source.v !== UNINITIALIZED && !(key in target)) {
          own_keys.push(key);
        }
      }
      return own_keys;
    },
    setPrototypeOf() {
      state_prototype_fixed();
    }
  });
}
function get_label(path, prop) {
  if (typeof prop === "symbol")
    return `${path}[Symbol(${prop.description ?? ""})]`;
  if (regex_is_valid_identifier.test(prop))
    return `${path}.${prop}`;
  return /^\d+$/.test(prop) ? `${path}[${prop}]` : `${path}['${prop}']`;
}
function get_proxied_value(value) {
  try {
    if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
      return value[STATE_SYMBOL];
    }
  } catch {}
  return value;
}
function is(a, b) {
  return Object.is(get_proxied_value(a), get_proxied_value(b));
}
function inspectable_array(array) {
  return new Proxy(array, {
    get(target, prop, receiver) {
      var value = Reflect.get(target, prop, receiver);
      if (!ARRAY_MUTATING_METHODS.has(prop)) {
        return value;
      }
      return function(...args) {
        set_eager_effects_deferred();
        var result = value.apply(this, args);
        flush_eager_effects();
        return result;
      };
    }
  });
}
var regex_is_valid_identifier, ARRAY_MUTATING_METHODS;
var init_proxy = __esm(() => {
  init_esm_env();
  init_runtime();
  init_utils();
  init_sources();
  init_constants2();
  init_constants();
  init_errors2();
  init_tracing();
  init_dev();
  regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
  ARRAY_MUTATING_METHODS = new Set([
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift"
  ]);
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/equality.js
var init_equality = __esm(() => {
  init_warnings();
  init_proxy();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/operations.js
function create_text(value = "") {
  if (current_renderer)
    return current_renderer.createTextNode(value);
  return document.createTextNode(value);
}
function get_first_child(node) {
  if (current_renderer)
    return current_renderer.getFirstChild(node);
  return first_child_getter.call(node);
}
function get_next_sibling(node) {
  if (current_renderer)
    return current_renderer.getNextSibling(node);
  return next_sibling_getter.call(node);
}
function child(node, is_text) {
  if (!hydrating) {
    return get_first_child(node);
  }
  var child = get_first_child(hydrate_node);
  if (child === null) {
    child = append_child(hydrate_node, create_text());
  } else if (is_text && node_type(child) !== TEXT_NODE) {
    var text = create_text();
    insert_before(child, text);
    set_hydrate_node(text);
    return text;
  }
  if (is_text) {
    merge_text_nodes(child);
  }
  set_hydrate_node(child);
  return child;
}
function first_child(node, is_text = false) {
  if (!hydrating) {
    var first = get_first_child(node);
    if (is_comment(first) && get_node_value(first) === "")
      return get_next_sibling(first);
    return first;
  }
  if (is_text) {
    if (node_type(hydrate_node) !== TEXT_NODE) {
      var text = create_text();
      if (hydrate_node)
        insert_before(hydrate_node, text);
      set_hydrate_node(text);
      return text;
    }
    merge_text_nodes(hydrate_node);
  }
  return hydrate_node;
}
function only_child(node, is_text = false) {
  if (!hydrating) {
    return get_first_child(node);
  }
  var first = child(node, is_text);
  reset(node);
  return first;
}
function sibling(node, count = 1, is_text = false) {
  let next_sibling = hydrating ? hydrate_node : node;
  var last_sibling;
  while (count--) {
    last_sibling = next_sibling;
    next_sibling = get_next_sibling(next_sibling);
  }
  if (!hydrating) {
    return next_sibling;
  }
  if (is_text) {
    if (node_type(next_sibling) !== TEXT_NODE) {
      var text = create_text();
      if (next_sibling === null) {
        if (last_sibling)
          insert_after(last_sibling, text);
      } else {
        insert_before(next_sibling, text);
      }
      set_hydrate_node(text);
      return text;
    }
    merge_text_nodes(next_sibling);
  }
  set_hydrate_node(next_sibling);
  return next_sibling;
}
function clear_text_content(node) {
  if (current_renderer) {
    var child = current_renderer.getFirstChild(node);
    while (child !== null) {
      var next = current_renderer.getNextSibling(child);
      current_renderer.remove(child);
      child = next;
    }
    return;
  }
  node.textContent = "";
}
function should_defer_append() {
  if (!async_mode_flag)
    return false;
  if (eager_block_effects !== null)
    return false;
  var flags = active_effect.f;
  return (flags & REACTION_RAN) !== 0;
}
function create_element(tag, namespace, is) {
  if (current_renderer) {
    return current_renderer.createElement(tag);
  }
  if (namespace == null || namespace === NAMESPACE_HTML) {
    return is ? document.createElement(tag, { is }) : document.createElement(tag);
  }
  return is ? document.createElementNS(namespace, tag, { is }) : document.createElementNS(namespace, tag);
}
function create_fragment() {
  if (current_renderer)
    return current_renderer.createFragment();
  return document.createDocumentFragment();
}
function create_comment(data = "") {
  if (current_renderer)
    return current_renderer.createComment(data);
  return document.createComment(data);
}
function set_attribute(element, key, value = "") {
  if (current_renderer) {
    current_renderer.setAttribute(element, key, value);
    return;
  }
  if (key.startsWith("xlink:")) {
    element.setAttributeNS("http://www.w3.org/1999/xlink", key, value);
    return;
  }
  return element.setAttribute(key, value);
}
function merge_text_nodes(text) {
  if (current_renderer)
    return;
  if (text.nodeValue.length < 65536) {
    return;
  }
  let next = text.nextSibling;
  while (next !== null && node_type(next) === TEXT_NODE) {
    next.remove();
    text.nodeValue += next.nodeValue;
    next = text.nextSibling;
  }
}
function is_comment(node) {
  if (current_renderer)
    return !!node && node_type(node) === COMMENT_NODE;
  return node instanceof Comment;
}
function node_type(node) {
  if (node == null)
    return;
  if (current_renderer) {
    const type = current_renderer.nodeType(node);
    return CUSTOM_RENDERER_NODE_TYPE_MAP[type];
  }
  return node?.nodeType;
}
function node_name(node) {
  if (node == null)
    return;
  if (current_renderer) {
    return "";
  }
  return node?.nodeName;
}
function get_last_child(node) {
  if (current_renderer)
    return current_renderer.getLastChild(node);
  return node.lastChild;
}
function get_parent_node(node) {
  if (current_renderer)
    return current_renderer.getParent(node);
  return node.parentNode;
}
function append_child(parent, child) {
  if (current_renderer) {
    current_renderer.insert(parent, child, null);
    return child;
  }
  return parent.appendChild(child);
}
function insert_before(ref_node, new_node) {
  var renderer = current_renderer;
  var parent = parent_renderer;
  if (renderer === null && parent === null) {
    ref_node.before(new_node);
    return;
  }
  if (renderer === parent) {
    var same_parent = renderer.getParent(ref_node);
    renderer.insert(same_parent, new_node, ref_node);
    return;
  }
  if (parent === null) {
    var dom_parent = ref_node.parentNode;
    get_foreign(renderer).insertIntoForeign(dom_parent, new_node, ref_node);
    return;
  }
  if (renderer === null) {
    var custom_parent = parent.getParent(ref_node);
    get_foreign(parent).insertForeign(custom_parent, new_node, ref_node);
    return;
  }
  var foreign_parent = parent.getParent(ref_node);
  get_foreign(parent).insertForeign(foreign_parent, new_node, ref_node);
  return;
}
function insert_after(ref_node, new_node) {
  if (current_renderer) {
    var parent = current_renderer.getParent(ref_node);
    var next = current_renderer.getNextSibling(ref_node);
    current_renderer.insert(parent, new_node, next);
    return;
  }
  ref_node.after(new_node);
}
function remove_node(node) {
  var renderer = current_renderer;
  var parent = parent_renderer;
  if (renderer === null && parent === null) {
    node.remove();
    return;
  }
  if (renderer === parent) {
    renderer.remove(node);
    return;
  }
  if (parent === null) {
    get_foreign(renderer).removeFromForeign(node);
    return;
  }
  if (renderer === null) {
    get_foreign(parent).removeForeign(node);
    return;
  }
  get_foreign(parent).removeForeign(node);
}
function get_foreign(renderer) {
  var foreign = renderer.foreign;
  if (foreign == null) {
    renderer_missing_foreign();
  }
  return foreign;
}
function remove_child(parent, child) {
  if (current_renderer) {
    current_renderer.remove(child);
    return child;
  }
  return parent.removeChild(child);
}
function set_node_value(node, value) {
  if (current_renderer) {
    current_renderer.setText(node, value);
    return;
  }
  node.nodeValue = value;
}
function split_style_declarations(style_string) {
  var declarations = [];
  var in_str = false;
  var depth = 0;
  var in_comment = false;
  var start = 0;
  for (var i = 0;i < style_string.length; i++) {
    var c = style_string[i];
    if (in_comment) {
      if (c === "/" && style_string[i - 1] === "*") {
        in_comment = false;
      }
      continue;
    }
    if (c === "\\") {
      i++;
      continue;
    }
    if (in_str) {
      if (c === in_str) {
        in_str = false;
      }
      continue;
    }
    if (c === "/" && style_string[i + 1] === "*") {
      in_comment = true;
    } else if (c === '"' || c === "'") {
      in_str = c;
    } else if (c === "(") {
      depth++;
    } else if (c === ")") {
      if (depth > 0)
        depth--;
    } else if (c === ";" && depth === 0) {
      var declaration = style_string.slice(start, i).trim();
      if (declaration)
        declarations.push(declaration);
      start = i + 1;
    }
  }
  var last = style_string.slice(start).trim();
  if (last)
    declarations.push(last);
  return declarations;
}
function declaration_property(declaration) {
  var colon_index = declaration.indexOf(":");
  if (colon_index === -1)
    return null;
  return declaration.slice(0, colon_index).trim();
}
function set_style_property_in_string(style_string, property, value, priority) {
  var declaration = property + ": " + value + (priority ? " !" + priority : "");
  var parts = split_style_declarations(style_string);
  var found = false;
  for (var i = 0;i < parts.length; i++) {
    if (declaration_property(parts[i]) === property) {
      parts[i] = declaration;
      found = true;
      break;
    }
  }
  if (!found) {
    parts.push(declaration);
  }
  return parts.join("; ");
}
function remove_style_property_in_string(style_string, property) {
  return split_style_declarations(style_string).filter((part) => declaration_property(part) !== property).join("; ");
}
function get_node_value(node) {
  if (current_renderer)
    return current_renderer.getNodeValue(node);
  return node.nodeValue;
}
function set_element_value(element, value) {
  if (current_renderer) {
    current_renderer.setAttribute(element, "value", value ?? "");
    return;
  }
  element.value = value ?? "";
}
function set_element_checked(element, checked) {
  if (current_renderer) {
    if (checked) {
      current_renderer.setAttribute(element, "checked", "");
    } else {
      current_renderer.removeAttribute(element, "checked");
    }
    return;
  }
  element.checked = checked;
}
function set_element_default_value(element, value) {
  if (current_renderer) {
    current_renderer.setAttribute(element, "defaultValue", value);
    return;
  }
  const existing_value = element.value;
  element.defaultValue = value;
  element.value = existing_value;
}
function set_element_default_checked(element, checked) {
  if (current_renderer) {
    if (checked) {
      current_renderer.setAttribute(element, "defaultChecked", "");
    } else {
      current_renderer.removeAttribute(element, "defaultChecked");
    }
    return;
  }
  const existing_value = element.checked;
  element.defaultChecked = checked;
  element.checked = existing_value;
}
function get_attribute(element, name) {
  if (current_renderer)
    return current_renderer.getAttribute(element, name);
  return element.getAttribute(name);
}
function remove_attribute(element, name) {
  if (current_renderer) {
    current_renderer.removeAttribute(element, name);
    return;
  }
  element.removeAttribute(name);
}
function has_attribute(element, name) {
  if (current_renderer)
    return current_renderer.hasAttribute(element, name);
  return element.hasAttribute(name);
}
function clone_node(node, deep) {
  if (current_renderer) {
    throw new Error("cloneNode is not supported with custom renderers");
  }
  return node.cloneNode(deep);
}
function import_node2(node, deep) {
  if (current_renderer) {
    throw new Error("importNode is not supported with custom renderers");
  }
  return document.importNode(node, deep);
}
function add_event_listener(target, type, handler, options) {
  if (current_renderer) {
    current_renderer.addEventListener(target, type, handler, options);
    return;
  }
  target.addEventListener(type, handler, options);
}
function remove_event_listener(target, type, handler, options) {
  if (current_renderer) {
    current_renderer.removeEventListener(target, type, handler, options);
    return;
  }
  target.removeEventListener(type, handler, options);
}
function style_set_property(element, property, value, priority) {
  if (current_renderer) {
    var style = current_renderer.getAttribute(element, "style") || "";
    var updated = set_style_property_in_string(style, property, value, priority);
    current_renderer.setAttribute(element, "style", updated);
    return;
  }
  element.style.setProperty(property, value, priority);
}
function style_remove_property(element, property) {
  if (current_renderer) {
    var style = current_renderer.getAttribute(element, "style") || "";
    var updated = remove_style_property_in_string(style, property);
    current_renderer.setAttribute(element, "style", updated);
    return;
  }
  element.style.removeProperty(property);
}
function set_css_text(element, value) {
  if (current_renderer) {
    current_renderer.setAttribute(element, "style", value);
    return;
  }
  element.style.cssText = value;
}
function class_list_toggle(element, name, force) {
  if (current_renderer) {
    const classes = current_renderer.getAttribute(element, "class")?.split(/\s+/) ?? [];
    const has_class = classes.includes(name);
    if (force === has_class) {
      return;
    }
    if (force) {
      classes.push(name);
    } else {
      const index = classes.indexOf(name);
      if (index !== -1) {
        classes.splice(index, 1);
      }
    }
    current_renderer.setAttribute(element, "class", classes.join(" "));
    return;
  }
  element.classList.toggle(name, force);
}
var is_firefox, first_child_getter, next_sibling_getter;
var init_operations = __esm(() => {
  init_hydration();
  init_esm_env();
  init_equality();
  init_utils();
  init_runtime();
  init_constants2();
  init_batch();
  init_constants();
  init_state();
  init_errors2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/error-handling.js
function handle_error(error) {
  var effect = active_effect;
  if (effect === null) {
    active_reaction.f |= ERROR_VALUE;
    return error;
  }
  if (true_default && error instanceof Error && !adjustments.has(error)) {
    adjustments.set(error, get_adjustments(error, effect));
  }
  if ((effect.f & REACTION_RAN) === 0 && (effect.f & EFFECT) === 0) {
    if (true_default && !effect.parent && error instanceof Error) {
      apply_adjustments(error);
    }
    throw error;
  }
  invoke_error_boundary(error, effect);
}
function invoke_error_boundary(error, effect) {
  if (error === HYDRATION_ERROR) {
    throw error;
  }
  if (effect !== null && (effect.f & DESTROYED) !== 0) {
    return;
  }
  while (effect !== null) {
    if ((effect.f & BOUNDARY_EFFECT) !== 0 && (effect.f & (DESTROYED | DESTROYING)) === 0) {
      if ((effect.f & REACTION_RAN) === 0) {
        throw error;
      }
      try {
        effect.b.error(error);
        return;
      } catch (e) {
        error = e;
      }
    }
    effect = effect.parent;
  }
  if (true_default && error instanceof Error) {
    apply_adjustments(error);
  }
  throw error;
}
function get_adjustments(error, effect) {
  const message_descriptor = get_descriptor(error, "message");
  if (message_descriptor && !message_descriptor.configurable)
    return;
  var indent = is_firefox ? "  " : "\t";
  var component_stack = `
${indent}in ${effect.fn?.name || "<unknown>"}`;
  var context = effect.ctx;
  while (context !== null) {
    component_stack += `
${indent}in ${context.function?.[FILENAME].split("/").pop()}`;
    context = context.p;
  }
  return {
    message: error.message + `
${component_stack}
`,
    stack: error.stack?.split(`
`).filter((line) => !line.includes("svelte/src/internal")).join(`
`)
  };
}
function apply_adjustments(error) {
  const adjusted = adjustments.get(error);
  if (adjusted) {
    define_property(error, "message", {
      value: adjusted.message
    });
    define_property(error, "stack", {
      value: adjusted.stack
    });
  }
}
var adjustments;
var init_error_handling = __esm(() => {
  init_esm_env();
  init_constants();
  init_operations();
  init_constants2();
  init_utils();
  init_runtime();
  adjustments = new WeakMap;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/effects.js
function validate_effect(rune) {
  if (active_effect === null) {
    if (active_reaction === null) {
      effect_orphan(rune);
    }
    effect_in_unowned_derived();
  }
  if (is_destroying_effect) {
    effect_in_teardown(rune);
  }
}
function push_effect(effect, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect;
  } else {
    parent_last.next = effect;
    effect.prev = parent_last;
    parent_effect.last = effect;
  }
}
function create_effect(type, fn) {
  var parent = active_effect;
  if (true_default) {
    while (parent !== null && (parent.f & EAGER_EFFECT) !== 0) {
      parent = parent.parent;
    }
  }
  if (parent !== null && (parent.f & INERT) !== 0) {
    type |= INERT;
  }
  var effect = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: type | DIRTY | CONNECTED,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    b: parent && parent.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null,
    r: current_renderer,
    pr: parent_renderer
  };
  if (true_default) {
    effect.component_function = dev_current_component_function;
  }
  current_batch?.register_created_effect(effect);
  var e = effect;
  if ((type & EFFECT) !== 0) {
    if (collected_effects !== null) {
      collected_effects.push(effect);
    } else {
      Batch.ensure().schedule(effect);
    }
  } else if (fn !== null) {
    try {
      update_effect(effect);
    } catch (e) {
      destroy_effect(effect);
      throw e;
    }
    if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & EFFECT_PRESERVED) === 0) {
      e = e.first;
      if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
        e.f |= EFFECT_TRANSPARENT;
      }
    }
  }
  if (e !== null) {
    e.parent = parent;
    if (parent !== null) {
      push_effect(e, parent);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
      var derived = active_reaction;
      (derived.effects ??= []).push(e);
    }
  }
  return effect;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(fn) {
  const effect = create_effect(RENDER_EFFECT, null);
  set_signal_status(effect, CLEAN);
  effect.teardown = fn;
  return effect;
}
function user_effect(fn) {
  validate_effect("$effect");
  if (true_default) {
    define_property(fn, "name", {
      value: "$effect"
    });
  }
  var flags = active_effect.f;
  var defer = !active_reaction && (flags & BRANCH_EFFECT) !== 0 && component_context !== null && !component_context.i;
  if (defer) {
    var context = component_context;
    (context.e ??= []).push(fn);
  } else {
    return create_user_effect(fn);
  }
}
function create_user_effect(fn) {
  return create_effect(EFFECT | USER_EFFECT, fn);
}
function effect_root(fn) {
  Batch.ensure();
  const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
  return () => {
    destroy_effect(effect);
  };
}
function component_root(fn) {
  Batch.ensure();
  const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect, () => {
          destroy_effect(effect);
          fulfil(undefined);
        });
      } else {
        destroy_effect(effect);
        fulfil(undefined);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn);
}
function async_effect(fn) {
  return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
function render_effect(fn, flags = 0) {
  return create_effect(RENDER_EFFECT | flags, fn);
}
function template_effect(fn, sync = [], async = [], blockers = []) {
  flatten(blockers, sync, async, (values) => {
    create_effect(RENDER_EFFECT, () => {
      fn(...values.map(get));
    });
  });
}
function block(fn, flags = 0) {
  var effect = create_effect(BLOCK_EFFECT | flags, fn);
  if (true_default) {
    effect.dev_stack = dev_stack;
  }
  return effect;
}
function managed(fn, flags = 0) {
  var effect = create_effect(MANAGED_EFFECT | flags, fn);
  if (true_default) {
    effect.dev_stack = dev_stack;
  }
  return effect;
}
function branch(fn) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
}
function execute_effect_teardown(effect) {
  var teardown = effect.teardown;
  if (teardown !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown.call(null);
    } catch (error) {
      invoke_error_boundary(error, effect.parent);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect = signal.first;
  signal.first = signal.last = null;
  while (effect !== null) {
    const controller = effect.ac;
    if (controller !== null) {
      without_reactive_context(() => {
        controller.abort(STALE_REACTION);
      });
    }
    var next = effect.next;
    if ((effect.f & ROOT_EFFECT) !== 0) {
      effect.parent = null;
    } else {
      destroy_effect(effect, remove_dom);
    }
    effect = next;
  }
}
function destroy_block_effect_children(signal) {
  var effect = signal.first;
  while (effect !== null) {
    var next = effect.next;
    if ((effect.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect);
    }
    effect = next;
  }
}
function destroy_effect(effect, remove_dom = true) {
  var removed = false;
  var pop_renderer = custom_renderers_flag ? push_renderer(effect.r, effect.pr) : undefined;
  try {
    if ((remove_dom || (effect.f & HEAD_EFFECT) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
      remove_effect_nodes(effect);
      removed = true;
    }
    effect.f |= DESTROYING;
    destroy_effect_children(effect, remove_dom && !removed);
    remove_reactions(effect, 0);
    var transitions = effect.nodes && effect.nodes.t;
    if (transitions !== null) {
      for (const transition of transitions) {
        transition.stop();
      }
    }
    execute_effect_teardown(effect);
    effect.f ^= DESTROYING;
    effect.f |= DESTROYED;
    var parent = effect.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect);
    }
    if (true_default) {
      effect.component_function = null;
    }
    effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = effect.r = effect.pr = null;
  } finally {
    pop_renderer?.();
  }
}
function remove_effect_dom(node, end) {
  while (node !== null) {
    var next = node === end ? null : get_next_sibling(node);
    remove_node(node);
    node = next;
  }
}
function remove_effect_nodes(effect) {
  var nodes = effect.nodes;
  var segments = nodes.segments;
  if (segments === null) {
    remove_effect_dom(nodes.start, nodes.end);
    return;
  }
  for (var i = segments.length - 1;i >= 0; i--) {
    var segment = segments[i];
    var pop_renderer = custom_renderers_flag ? push_renderer(segment.r, segment.pr) : undefined;
    remove_effect_dom(segment.start, segment.end);
    pop_renderer?.();
  }
}
function unlink_effect(effect) {
  var parent = effect.parent;
  var prev = effect.prev;
  var next = effect.next;
  if (prev !== null)
    prev.next = next;
  if (next !== null)
    next.prev = prev;
  if (parent !== null) {
    if (parent.first === effect)
      parent.first = next;
    if (parent.last === effect)
      parent.last = prev;
  }
}
function pause_effect(effect, callback, destroy = true) {
  var transitions = [];
  effect.f |= PAUSED;
  pause_children(effect, transitions, true);
  var fn = () => {
    if (destroy)
      destroy_effect(effect);
    if (callback)
      callback();
  };
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition of transitions) {
      transition.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect, transitions, local) {
  if ((effect.f & INERT) !== 0)
    return;
  effect.f ^= INERT;
  var t = effect.nodes && effect.nodes.t;
  if (t !== null) {
    for (const transition of t) {
      if (transition.is_global || local) {
        transitions.push(transition);
      }
    }
  }
  var child = effect.first;
  while (child !== null) {
    var sibling = child.next;
    if ((child.f & ROOT_EFFECT) === 0) {
      var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0 && (effect.f & BLOCK_EFFECT) !== 0;
      pause_children(child, transitions, transparent ? local : false);
    }
    child = sibling;
  }
}
function resume_effect(effect) {
  effect.f &= ~PAUSED;
  resume_children(effect, true);
}
function resume_children(effect, local) {
  if ((effect.f & PAUSED) !== 0)
    return;
  if ((effect.f & INERT) === 0)
    return;
  effect.f ^= INERT;
  if ((effect.f & CLEAN) === 0) {
    set_signal_status(effect, DIRTY);
    Batch.ensure().schedule(effect);
  }
  var child = effect.first;
  while (child !== null) {
    var sibling = child.next;
    var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
    resume_children(child, transparent ? local : false);
    child = sibling;
  }
  var t = effect.nodes && effect.nodes.t;
  if (t !== null) {
    for (const transition of t) {
      if (transition.is_global || local) {
        transition.in();
      }
    }
  }
}
function move_effect(effect, fragment) {
  if (!effect.nodes)
    return;
  var pop_renderer = custom_renderers_flag ? push_renderer(effect.r, effect.pr) : undefined;
  try {
    var node = effect.nodes.start;
    var end = effect.nodes.end;
    while (node !== null) {
      var next = node === end ? null : get_next_sibling(node);
      append_child(fragment, node);
      node = next;
    }
  } finally {
    pop_renderer?.();
  }
}
var init_effects = __esm(() => {
  init_runtime();
  init_constants2();
  init_error_handling();
  init_errors2();
  init_esm_env();
  init_utils();
  init_operations();
  init_context2();
  init_batch();
  init_async();
  init_shared();
  init_status();
  init_state();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/legacy.js
var captured_signals = null;
var init_legacy = __esm(() => {
  init_sources();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/runtime.js
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
function set_active_effect(effect) {
  active_effect = effect;
}
function push_reaction_value(value) {
  if (active_reaction !== null && (!async_mode_flag && (active_reaction.f & REACTION_IS_UPDATING) !== 0 || (active_reaction.f & DERIVED) !== 0)) {
    (current_sources ??= new Set).add(value);
  }
}
function set_untracked_writes(value) {
  untracked_writes = value;
}
function set_update_version(value) {
  update_version = value;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty2(reaction) {
  var flags = reaction.f;
  if ((flags & DIRTY) !== 0) {
    return true;
  }
  if ((flags & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    var length = dependencies.length;
    for (var i = 0;i < length; i++) {
      var dependency = dependencies[i];
      if (is_dirty2(dependency)) {
        update_derived(dependency);
      }
      if (dependency.wv > reaction.wv) {
        return true;
      }
    }
    if ((flags & CONNECTED) !== 0 && batch_values === null) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
  var reactions = signal.reactions;
  if (reactions === null)
    return;
  if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) {
    return;
  }
  for (var i = 0;i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & DERIVED) !== 0) {
      schedule_possible_effect_self_invalidation(reaction, effect, false);
    } else if (effect === reaction) {
      if (root) {
        set_signal_status(reaction, DIRTY);
      } else if ((reaction.f & CLEAN) !== 0) {
        set_signal_status(reaction, MAYBE_DIRTY);
      }
      schedule_effect(reaction);
    }
  }
}
function update_reaction(reaction) {
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_sources = current_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var previous_update_version = update_version;
  var flags = reaction.f;
  new_deps = null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  current_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  update_version = ++read_version;
  if (reaction.ac !== null) {
    without_reactive_context(() => {
      reaction.ac.abort(STALE_REACTION);
    });
    reaction.ac = null;
  }
  try {
    reaction.f |= REACTION_IS_UPDATING;
    var fn = reaction.fn;
    var result = fn();
    reaction.f |= REACTION_RAN;
    var deps = update_dependencies(reaction);
    if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
      for (var i = 0;i < untracked_writes.length; i++) {
        schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
      }
    }
    if (previous_reaction !== null && previous_reaction !== reaction) {
      read_version++;
      if (previous_reaction.deps !== null) {
        for (let i = 0;i < previous_skipped_deps; i += 1) {
          previous_reaction.deps[i].rv = read_version;
        }
      }
      if (previous_deps !== null) {
        for (const dep of previous_deps) {
          dep.rv = read_version;
        }
      }
      if (untracked_writes !== null) {
        if (previous_untracked_writes === null) {
          previous_untracked_writes = untracked_writes;
        } else {
          previous_untracked_writes.push(...untracked_writes);
        }
      }
    }
    if ((reaction.f & ERROR_VALUE) !== 0) {
      reaction.f ^= ERROR_VALUE;
    }
    return result;
  } catch (error) {
    update_dependencies(reaction);
    return handle_error(error);
  } finally {
    reaction.f ^= REACTION_IS_UPDATING;
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    current_sources = previous_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    update_version = previous_update_version;
  }
}
function update_dependencies(reaction) {
  var deps = reaction.deps;
  var is_fork = current_batch?.is_fork;
  if (new_deps !== null) {
    var i;
    if (!is_fork) {
      remove_reactions(reaction, skipped_deps);
    }
    if (deps !== null && skipped_deps > 0) {
      deps.length = skipped_deps + new_deps.length;
      for (i = 0;i < new_deps.length; i++) {
        deps[skipped_deps + i] = new_deps[i];
      }
    } else {
      reaction.deps = deps = new_deps;
    }
    if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
      for (i = skipped_deps;i < deps.length; i++) {
        (deps[i].reactions ??= []).push(reaction);
      }
    }
  } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
    remove_reactions(reaction, skipped_deps);
    deps.length = skipped_deps;
  }
  return deps;
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index = index_of.call(reactions, signal);
    if (index !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
    var derived = dependency;
    if ((derived.f & CONNECTED) !== 0) {
      derived.f ^= CONNECTED;
    }
    if (derived.v !== UNINITIALIZED) {
      update_derived_status(derived);
    }
    if (derived.ac !== null) {
      without_reactive_context(() => {
        derived.ac.abort(STALE_REACTION);
        derived.ac = null;
        set_signal_status(derived, DIRTY);
      });
    }
    freeze_derived_effects(derived);
    remove_reactions(derived, 0);
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null)
    return;
  for (var i = start_index;i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect) {
  var flags = effect.f;
  if ((flags & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect, CLEAN);
  var previous_effect = active_effect;
  active_effect = effect;
  var pop_renderer = custom_renderers_flag ? push_renderer(effect.r, effect.pr) : undefined;
  if (true_default) {
    var previous_component_fn = dev_current_component_function;
    set_dev_current_component_function(effect.component_function);
    var previous_stack = dev_stack;
    set_dev_stack(effect.dev_stack ?? dev_stack);
  }
  try {
    if ((flags & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
      destroy_block_effect_children(effect);
    } else {
      destroy_effect_children(effect);
    }
    execute_effect_teardown(effect);
    var teardown = update_reaction(effect);
    effect.teardown = typeof teardown === "function" ? teardown : null;
    effect.wv = write_version;
    if (true_default && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) {
      for (var dep of effect.deps) {
        if (dep.set_during_effect) {
          dep.wv = increment_write_version();
          dep.set_during_effect = false;
        }
      }
    }
  } finally {
    active_effect = previous_effect;
    pop_renderer?.();
    if (true_default) {
      set_dev_current_component_function(previous_component_fn);
      set_dev_stack(previous_stack);
    }
  }
}
function get(signal) {
  var flags = signal.f;
  var is_derived = (flags & DERIVED) !== 0;
  captured_signals?.add(signal);
  if (active_reaction !== null && !untracking) {
    var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!destroyed && (current_sources === null || !current_sources.has(signal))) {
      var deps = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
            skipped_deps++;
          } else if (new_deps === null) {
            new_deps = [signal];
          } else {
            new_deps.push(signal);
          }
        }
      } else {
        active_reaction.deps ??= [];
        if (!includes.call(active_reaction.deps, signal)) {
          active_reaction.deps.push(signal);
        }
        var reactions = signal.reactions;
        if (reactions === null) {
          signal.reactions = [active_reaction];
        } else if (!includes.call(reactions, active_reaction)) {
          reactions.push(active_reaction);
        }
      }
    }
  }
  if (true_default) {
    if (!untracking && reactivity_loss_tracker && current_batch === null && previous_batch === null && !reactivity_loss_tracker.warned && (reactivity_loss_tracker.effect.f & REACTION_IS_UPDATING) === 0 && !reactivity_loss_tracker.effect_deps.has(signal)) {
      reactivity_loss_tracker.warned = true;
      await_reactivity_loss(signal.label);
      var trace = get_error("traced at");
      if (trace)
        console.warn(trace);
    }
    recent_async_deriveds.delete(signal);
    if (tracing_mode_flag && !untracking && tracing_expressions !== null && active_reaction !== null && tracing_expressions.reaction === active_reaction) {
      if (signal.trace) {
        signal.trace();
      } else {
        trace = get_error("traced at");
        if (trace) {
          var entry = tracing_expressions.entries.get(signal);
          if (entry === undefined) {
            entry = { traces: [] };
            tracing_expressions.entries.set(signal, entry);
          }
          var last = entry.traces[entry.traces.length - 1];
          if (trace.stack !== last?.stack) {
            entry.traces.push(trace);
          }
        }
      }
    }
  }
  if (is_destroying_effect && old_values.has(signal)) {
    return old_values.get(signal);
  }
  if (is_derived) {
    var derived = signal;
    if (is_destroying_effect) {
      var value = derived.v;
      if ((derived.f & CLEAN) === 0 && derived.reactions !== null || depends_on_old_values(derived)) {
        value = execute_derived(derived);
      }
      old_values.set(derived, value);
      return value;
    }
    var should_connect = (derived.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (active_reaction.f & CONNECTED) !== 0;
    var is_new = (derived.f & REACTION_RAN) === 0;
    if (is_dirty2(derived)) {
      if (should_connect) {
        derived.f |= CONNECTED;
      }
      update_derived(derived);
    }
    if (should_connect && !is_new) {
      unfreeze_derived_effects(derived);
      reconnect(derived);
    }
  }
  if (batch_values?.has(signal)) {
    return batch_values.get(signal);
  }
  if ((signal.f & ERROR_VALUE) !== 0) {
    throw signal.v;
  }
  return signal.v;
}
function reconnect(derived) {
  derived.f |= CONNECTED;
  if (derived.deps === null)
    return;
  for (const dep of derived.deps) {
    var reactions = dep.reactions;
    if (reactions === null) {
      dep.reactions = [derived];
    } else if (!includes.call(reactions, derived)) {
      reactions.push(derived);
    }
    if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
      unfreeze_derived_effects(dep);
      reconnect(dep);
    }
  }
}
function depends_on_old_values(derived) {
  if (derived.v === UNINITIALIZED)
    return true;
  if (derived.deps === null)
    return false;
  for (const dep of derived.deps) {
    if (old_values.has(dep)) {
      return true;
    }
    if ((dep.f & DERIVED) !== 0 && depends_on_old_values(dep)) {
      return true;
    }
  }
  return false;
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}
var is_destroying_effect = false, active_reaction = null, untracking = false, active_effect = null, current_sources = null, new_deps = null, skipped_deps = 0, untracked_writes = null, write_version = 1, read_version = 0, update_version;
var init_runtime = __esm(() => {
  init_esm_env();
  init_utils();
  init_effects();
  init_constants2();
  init_sources();
  init_deriveds();
  init_tracing();
  init_dev();
  init_context2();
  init_batch();
  init_error_handling();
  init_constants();
  init_legacy();
  init_shared();
  init_status();
  init_warnings();
  init_state();
  update_version = read_version;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/hydratable.js
var init_hydratable = __esm(() => {
  init_hydration();
  init_warnings();
  init_errors2();
  init_esm_env();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/events.js
function create_event(event_name, dom, handler, options = {}) {
  var is_custom_renderer = current_renderer != null;
  function target_handler(...args) {
    if (is_custom_renderer) {
      return without_reactive_context(() => {
        return handler?.apply(this, args);
      });
    }
    var event = args[0];
    if (!options.capture) {
      handle_event_propagation.call(dom, event);
    }
    if (!event.cancelBubble) {
      return without_reactive_context(() => {
        return handler?.call(this, event);
      });
    }
  }
  if (!is_custom_renderer && (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel")) {
    target_handler.__removed = false;
    queue_micro_task(() => {
      if (!target_handler.__removed) {
        add_event_listener(dom, event_name, target_handler, options);
      }
    });
  } else {
    add_event_listener(dom, event_name, target_handler, options);
  }
  return target_handler;
}
function event(event_name, dom, handler, capture, passive) {
  var options = { capture, passive };
  var target_handler = create_event(event_name, dom, handler, options);
  if (current_renderer == null && (dom === document.body || dom === window || dom === document || dom instanceof HTMLMediaElement)) {
    teardown(() => {
      target_handler.__removed = true;
      remove_event_listener(dom, event_name, target_handler, options);
    });
  }
}
function delegated(event_name, element, handler) {
  (element[event_symbol] ??= {})[event_name] = handler;
}
function delegate(events) {
  for (var i = 0;i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
function handle_event_propagation(event) {
  var handler_element = this;
  var owner_document = handler_element.ownerDocument;
  var event_name = event.type;
  var path = event.composedPath?.() || [];
  var current_target = path[0] || event.target;
  last_propagated_event = event;
  if (!last_propagated_event_clear_scheduled) {
    last_propagated_event_clear_scheduled = true;
    setTimeout(() => {
      last_propagated_event_clear_scheduled = false;
      last_propagated_event = null;
    });
  }
  var path_idx = 0;
  var handled_at = last_propagated_event === event && event[event_symbol];
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
      event[event_symbol] = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = path[path_idx] || event.target;
  if (current_target === handler_element)
    return;
  define_property(event, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      if (current_target === handler_element)
        break;
      try {
        var delegated = current_target[event_symbol]?.[event_name];
        if (delegated != null && (!current_target.disabled || event.target === current_target)) {
          delegated.call(current_target, event);
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event.cancelBubble)
        break;
      path_idx++;
      current_target = path_idx < path.length ? path[path_idx] : null;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event[event_symbol] = handler_element;
    delete event.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
var event_symbol, all_registered_events, root_event_handles, last_propagated_event = null, last_propagated_event_clear_scheduled = false;
var init_events2 = __esm(() => {
  init_effects();
  init_utils();
  init_hydration();
  init_task();
  init_constants();
  init_warnings();
  init_runtime();
  init_shared();
  init_operations();
  init_state();
  event_symbol = Symbol("events");
  all_registered_events = new Set;
  root_event_handles = new Set;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/reconciler.js
var policy;
var init_reconciler = __esm(() => {
  init_operations();
  policy = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    createHTML: (html) => {
      return html;
    }
  });
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/template.js
function assign_nodes(start, end) {
  var effect = active_effect;
  if (effect.nodes === null) {
    effect.nodes = {
      start,
      end,
      segments: should_segment_nodes(effect) ? [{ start, end, r: current_renderer, pr: parent_renderer }] : null,
      a: null,
      t: null
    };
  } else if (should_segment_nodes(effect)) {
    var nodes = effect.nodes;
    (nodes.segments ??= [{ start: nodes.start, end: nodes.end, r: effect.r, pr: effect.pr }]).push({
      start,
      end,
      r: current_renderer,
      pr: parent_renderer
    });
  }
}
function should_segment_nodes(effect) {
  return custom_renderers_flag && (current_renderer !== effect.r || parent_renderer !== effect.pr) && (current_renderer?.foreign != null || parent_renderer?.foreign != null);
}
function fragment_from_tree(structure, ns) {
  var fragment = create_fragment();
  for (var item of structure) {
    if (typeof item === "string") {
      append_child(fragment, create_text(item));
      continue;
    }
    if (item === undefined || item[0][0] === "/") {
      append_child(fragment, create_comment(item ? item[0].slice(3) : ""));
      continue;
    }
    const [name, attributes, ...children] = item;
    const namespace = name === "svg" ? NAMESPACE_SVG : name === "math" ? NAMESPACE_MATHML : ns;
    var element = create_element(name, namespace, attributes?.is);
    for (var key in attributes) {
      set_attribute(element, key, attributes[key]);
    }
    if (children.length > 0) {
      var target = node_name(element) === TEMPLATE_TAG ? element.content : element;
      append_child(target, fragment_from_tree(children, node_name(element) === "foreignObject" ? undefined : namespace));
    }
    append_child(fragment, element);
  }
  return fragment;
}
function from_tree(structure, flags) {
  var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  return () => {
    if (hydrating) {
      assign_nodes(hydrate_node, null);
      return hydrate_node;
    }
    if (node === undefined || current_renderer != null) {
      const ns = (flags & TEMPLATE_USE_SVG) !== 0 ? NAMESPACE_SVG : (flags & TEMPLATE_USE_MATHML) !== 0 ? NAMESPACE_MATHML : undefined;
      node = fragment_from_tree(structure, ns);
      if (!is_fragment)
        node = get_first_child(node);
    }
    var clone = current_renderer != null ? node : use_import_node || is_firefox ? import_node2(node, true) : clone_node(node, true);
    if (is_fragment) {
      var start = get_first_child(clone);
      var end = get_last_child(clone);
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function text(value = "") {
  if (!hydrating) {
    var t = create_text(value + "");
    assign_nodes(t, t);
    return t;
  }
  var node = hydrate_node;
  if (node_type(node) !== TEXT_NODE) {
    insert_before(node, node = create_text());
    set_hydrate_node(node);
  } else {
    merge_text_nodes(node);
  }
  assign_nodes(node, node);
  return node;
}
function comment() {
  if (hydrating) {
    assign_nodes(hydrate_node, null);
    return hydrate_node;
  }
  var frag = create_fragment();
  var start = create_comment("");
  var anchor = create_text();
  append_child(frag, start);
  append_child(frag, anchor);
  assign_nodes(start, anchor);
  return frag;
}
function append(anchor, dom) {
  if (hydrating) {
    var effect = active_effect;
    if ((effect.f & REACTION_RAN) === 0 || effect.nodes.end === null) {
      effect.nodes.end = hydrate_node;
      if (effect.nodes.segments !== null) {
        effect.nodes.segments[0].end = hydrate_node;
      }
    }
    hydrate_next();
    return;
  }
  if (anchor === null) {
    return;
  }
  insert_before(anchor, dom);
}
var TEMPLATE_TAG;
var init_template = __esm(() => {
  init_constants2();
  init_constants();
  init_state();
  init_runtime();
  init_hydration();
  init_operations();
  init_reconciler();
  TEMPLATE_TAG = IS_XHTML ? "template" : "TEMPLATE";
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/utils.js
function is_capture_event(name) {
  return name.endsWith("capture") && name !== "gotpointercapture" && name !== "lostpointercapture";
}
function can_delegate_event(event_name) {
  return DELEGATED_EVENTS.includes(event_name);
}
function normalize_attribute(name) {
  name = name.toLowerCase();
  return ATTRIBUTE_ALIASES[name] ?? name;
}
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
var DELEGATED_EVENTS, DOM_BOOLEAN_ATTRIBUTES, ATTRIBUTE_ALIASES, DOM_PROPERTIES, PASSIVE_EVENTS, STATE_CREATION_RUNES, RUNES;
var init_utils3 = __esm(() => {
  DELEGATED_EVENTS = [
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart"
  ];
  DOM_BOOLEAN_ATTRIBUTES = [
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "disabled",
    "formnovalidate",
    "indeterminate",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "seamless",
    "selected",
    "webkitdirectory",
    "defer",
    "disablepictureinpicture",
    "disableremoteplayback"
  ];
  ATTRIBUTE_ALIASES = {
    formnovalidate: "formNoValidate",
    ismap: "isMap",
    nomodule: "noModule",
    playsinline: "playsInline",
    readonly: "readOnly",
    defaultvalue: "defaultValue",
    defaultchecked: "defaultChecked",
    srcobject: "srcObject",
    novalidate: "noValidate",
    allowfullscreen: "allowFullscreen",
    disablepictureinpicture: "disablePictureInPicture",
    disableremoteplayback: "disableRemotePlayback"
  };
  DOM_PROPERTIES = [
    ...DOM_BOOLEAN_ATTRIBUTES,
    "formNoValidate",
    "isMap",
    "noModule",
    "playsInline",
    "readOnly",
    "value",
    "volume",
    "defaultValue",
    "defaultChecked",
    "srcObject",
    "noValidate",
    "allowFullscreen",
    "disablePictureInPicture",
    "disableRemotePlayback"
  ];
  PASSIVE_EVENTS = ["touchstart", "touchmove"];
  STATE_CREATION_RUNES = [
    "$state",
    "$state.raw",
    "$derived",
    "$derived.by"
  ];
  RUNES = [
    ...STATE_CREATION_RUNES,
    "$state.eager",
    "$state.snapshot",
    "$props",
    "$props.id",
    "$bindable",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$effect.pending",
    "$inspect",
    "$inspect().with",
    "$inspect.trace",
    "$host"
  ];
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/create-subscriber.js
function createSubscriber(start) {
  let subscribers = 0;
  let version = source(0);
  let stop;
  if (true_default) {
    tag(version, "createSubscriber version");
  }
  return () => {
    if (effect_tracking()) {
      get(version);
      render_effect(() => {
        if (subscribers === 0) {
          stop = untrack(() => start(() => increment(version)));
        }
        subscribers += 1;
        return () => {
          queue_micro_task(() => {
            subscribers -= 1;
            if (subscribers === 0) {
              stop?.();
              stop = undefined;
              increment(version);
            }
          });
        };
      });
    }
  };
}
var init_create_subscriber = __esm(() => {
  init_runtime();
  init_effects();
  init_sources();
  init_tracing();
  init_esm_env();
  init_task();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
function boundary(node, props, children, transform_error) {
  new Boundary(node, props, children, transform_error);
}

class Boundary {
  parent;
  is_pending = false;
  transform_error;
  #anchor;
  #hydrate_open = hydrating ? hydrate_node : null;
  #props;
  #children;
  #effect;
  #main_effect = null;
  #pending_effect = null;
  #failed_effect = null;
  #offscreen_fragment = null;
  #local_pending_count = 0;
  #pending_count = 0;
  #pending_count_update_queued = false;
  #dirty_effects = new Set;
  #maybe_dirty_effects = new Set;
  #effect_pending = null;
  #effect_pending_subscriber = createSubscriber(() => {
    this.#effect_pending = source(this.#local_pending_count);
    if (true_default) {
      tag(this.#effect_pending, "$effect.pending()");
    }
    return () => {
      this.#effect_pending = null;
    };
  });
  constructor(node, props, children, transform_error) {
    this.#anchor = node;
    this.#props = props;
    this.#children = (anchor) => {
      var effect = active_effect;
      effect.b = this;
      effect.f |= BOUNDARY_EFFECT;
      children(anchor);
    };
    this.parent = active_effect.b;
    this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
    this.#effect = block(() => {
      if (hydrating) {
        const comment_data = read_hydration_instruction(this.#hydrate_open);
        hydrate_next();
        const server_rendered_pending = comment_data === HYDRATION_START_ELSE;
        const server_rendered_failed = comment_data.startsWith(HYDRATION_START_FAILED);
        if (server_rendered_failed) {
          const serialized_error = JSON.parse(comment_data.slice(HYDRATION_START_FAILED.length));
          this.#hydrate_failed_content(serialized_error);
        } else if (server_rendered_pending) {
          this.#hydrate_pending_content();
        } else {
          this.#hydrate_resolved_content();
        }
      } else {
        this.#render();
      }
    }, flags);
    if (hydrating) {
      this.#anchor = hydrate_node;
    }
  }
  #hydrate_resolved_content() {
    try {
      this.#main_effect = branch(() => this.#children(this.#anchor));
    } catch (error) {
      this.error(error);
    }
  }
  #hydrate_failed_content(error) {
    const failed = this.#props.failed;
    const { reset, invoke_onerror } = this.#create_reset(error);
    queue_micro_task(invoke_onerror);
    if (!failed)
      return;
    this.#failed_effect = branch(() => {
      failed(this.#anchor, () => error, () => reset);
    });
  }
  #create_reset(error) {
    var did_reset = false;
    var calling_on_error = false;
    const reset = () => {
      if (this.#is_destroyed())
        return;
      if (did_reset) {
        svelte_boundary_reset_noop();
        return;
      }
      did_reset = true;
      if (calling_on_error) {
        svelte_boundary_reset_onerror();
      }
      if (this.#failed_effect !== null) {
        pause_effect(this.#failed_effect, () => {
          this.#failed_effect = null;
        });
      }
      this.#run(() => {
        this.#render();
      });
    };
    const invoke_onerror = () => {
      if (this.#is_destroyed())
        return;
      try {
        calling_on_error = true;
        this.#props.onerror?.(error, reset);
        calling_on_error = false;
      } catch (err) {
        invoke_error_boundary(err, this.#effect && this.#effect.parent);
      }
    };
    return { reset, invoke_onerror };
  }
  #is_destroyed() {
    return (this.#effect.f & (DESTROYED | DESTROYING)) !== 0;
  }
  #hydrate_pending_content() {
    const pending = this.#props.pending;
    if (!pending)
      return;
    this.is_pending = true;
    this.#pending_effect = branch(() => pending(this.#anchor));
    queue_micro_task(() => {
      if (this.#is_destroyed())
        return;
      var pop_renderer = custom_renderers_flag ? push_renderer(this.#effect.r, this.#effect.pr) : undefined;
      try {
        var fragment = this.#offscreen_fragment = create_fragment();
        var anchor = create_text();
        var handled = false;
        append_child(fragment, anchor);
        this.#main_effect = this.#run(() => {
          try {
            return branch(() => this.#children(anchor));
          } catch (error) {
            try {
              this.error(error);
              handled = true;
            } catch (error) {
              invoke_error_boundary(error, this.#effect.parent);
            }
            return null;
          }
        });
        if (this.#main_effect === null) {
          this.#offscreen_fragment = null;
          if (handled)
            this.#resolve(current_batch);
          return;
        }
        if (this.#pending_count === 0) {
          insert_before(this.#anchor, fragment);
          this.#offscreen_fragment = null;
          pause_effect(this.#pending_effect, () => {
            this.#pending_effect = null;
          });
          this.#resolve(current_batch);
        }
      } finally {
        pop_renderer?.();
      }
    });
  }
  #render() {
    try {
      this.is_pending = this.has_pending_snippet();
      this.#pending_count = 0;
      this.#local_pending_count = 0;
      this.#main_effect = branch(() => {
        this.#children(this.#anchor);
      });
      if (this.#pending_count > 0) {
        var fragment = this.#offscreen_fragment = create_fragment();
        move_effect(this.#main_effect, fragment);
        const pending = this.#props.pending;
        this.#pending_effect = branch(() => pending(this.#anchor));
      } else {
        this.#resolve(current_batch);
      }
    } catch (error) {
      this.error(error);
    }
  }
  #resolve(batch) {
    this.is_pending = false;
    batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
  }
  defer_effect(effect) {
    defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#props.pending;
  }
  #run(fn) {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_ctx = component_context;
    set_active_effect(this.#effect);
    set_active_reaction(this.#effect);
    set_component_context(this.#effect.ctx);
    var pop_renderer = custom_renderers_flag ? push_renderer(this.#effect.r, this.#effect.pr) : undefined;
    try {
      Batch.ensure();
      return fn();
    } finally {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_ctx);
      pop_renderer?.();
    }
  }
  #update_pending_count(d, batch) {
    if (!this.has_pending_snippet()) {
      if (this.parent) {
        this.parent.#update_pending_count(d, batch);
      }
      return;
    }
    this.#pending_count += d;
    if (this.#pending_count === 0) {
      this.#resolve(batch);
      if (this.#pending_effect) {
        pause_effect(this.#pending_effect, () => {
          this.#pending_effect = null;
        });
      }
      if (this.#offscreen_fragment) {
        var pop_renderer = custom_renderers_flag ? push_renderer(this.#effect.r, this.#effect.pr) : undefined;
        try {
          insert_before(this.#anchor, this.#offscreen_fragment);
          this.#offscreen_fragment = null;
        } finally {
          pop_renderer?.();
        }
      }
    }
  }
  update_pending_count(d, batch) {
    this.#update_pending_count(d, batch);
    this.#local_pending_count += d;
    if (!this.#effect_pending || this.#pending_count_update_queued)
      return;
    this.#pending_count_update_queued = true;
    queue_micro_task(() => {
      this.#pending_count_update_queued = false;
      if (this.#effect_pending) {
        internal_set(this.#effect_pending, this.#local_pending_count);
      }
    });
  }
  get_effect_pending() {
    this.#effect_pending_subscriber();
    return get(this.#effect_pending);
  }
  error(error) {
    if (error === HYDRATION_ERROR) {
      throw error;
    }
    if (!this.#props.onerror && !this.#props.failed) {
      throw error;
    }
    if (current_batch?.is_fork) {
      if (this.#main_effect)
        current_batch.skip_effect(this.#main_effect);
      if (this.#pending_effect)
        current_batch.skip_effect(this.#pending_effect);
      if (this.#failed_effect)
        current_batch.skip_effect(this.#failed_effect);
      current_batch.oncommit(() => {
        if (!this.#is_destroyed())
          this.#handle_error(error);
      });
    } else {
      this.#handle_error(error);
    }
  }
  #handle_error(error) {
    if (this.#main_effect) {
      destroy_effect(this.#main_effect);
      this.#main_effect = null;
    }
    if (this.#pending_effect) {
      destroy_effect(this.#pending_effect);
      this.#pending_effect = null;
    }
    if (this.#failed_effect) {
      destroy_effect(this.#failed_effect);
      this.#failed_effect = null;
    }
    if (hydrating) {
      set_hydrate_node(this.#hydrate_open);
      next();
      set_hydrate_node(skip_nodes());
    }
    let failed = this.#props.failed;
    const handle_error_result = (transformed_error) => {
      if (this.#is_destroyed())
        return;
      const { reset, invoke_onerror } = this.#create_reset(transformed_error);
      invoke_onerror();
      if (failed && !this.#is_destroyed()) {
        this.#failed_effect = this.#run(() => {
          try {
            return branch(() => {
              var effect = active_effect;
              effect.b = this;
              effect.f |= BOUNDARY_EFFECT;
              failed(this.#anchor, () => transformed_error, () => reset);
            });
          } catch (error) {
            invoke_error_boundary(error, this.#effect.parent);
            return null;
          }
        });
      }
    };
    queue_micro_task(() => {
      if (this.#is_destroyed())
        return;
      var result;
      try {
        result = this.transform_error(error);
      } catch (e) {
        invoke_error_boundary(e, this.#effect && this.#effect.parent);
        return;
      }
      if (result !== null && typeof result === "object" && typeof result.then === "function") {
        result.then(handle_error_result, (e) => invoke_error_boundary(e, this.#effect && this.#effect.parent));
      } else {
        handle_error_result(result);
      }
    });
  }
}
var flags;
var init_boundary = __esm(() => {
  init_constants2();
  init_constants();
  init_context2();
  init_error_handling();
  init_effects();
  init_runtime();
  init_hydration();
  init_task();
  init_errors2();
  init_warnings();
  init_esm_env();
  init_batch();
  init_sources();
  init_tracing();
  init_create_subscriber();
  init_operations();
  init_utils2();
  init_status();
  init_state();
  flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/render.js
function set_text(text, value) {
  var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
  if (str !== (text[TEXT_CACHE] ??= get_node_value(text))) {
    text[TEXT_CACHE] = str;
    set_node_value(text, `${str}`);
  }
}
function mount(component, options) {
  return _mount(component, options);
}
function hydrate(component, options) {
  options.intro = options.intro ?? false;
  const target = options.target;
  const was_hydrating = hydrating;
  const previous_hydrate_node = hydrate_node;
  try {
    var anchor = get_first_child(target);
    while (anchor && (node_type(anchor) !== COMMENT_NODE || get_node_value(anchor) !== HYDRATION_START)) {
      anchor = get_next_sibling(anchor);
    }
    if (!anchor) {
      throw HYDRATION_ERROR;
    }
    set_hydrating(true);
    set_hydrate_node(anchor);
    const instance = _mount(component, { ...options, anchor });
    set_hydrating(false);
    return instance;
  } catch (error) {
    if (error instanceof Error && error.message.split(`
`).some((line) => line.startsWith("https://svelte.dev/e/"))) {
      throw error;
    }
    if (error !== HYDRATION_ERROR) {
      console.warn("Failed to hydrate: ", error);
    }
    if (options.recover === false) {
      hydration_failed();
    }
    clear_text_content(target);
    set_hydrating(false);
    return mount(component, options);
  } finally {
    set_hydrating(was_hydrating);
    set_hydrate_node(previous_hydrate_node);
  }
}
function _mount(Component, options) {
  if (custom_renderers_flag && options.renderer) {
    var pop_renderer = push_renderer(options.renderer, options.renderer);
    try {
      return _mount_inner(Component, options);
    } finally {
      pop_renderer();
    }
  }
  return _mount_inner(Component, options);
}
function _mount_inner(Component, { target, anchor, props = {}, events, context, intro = true, transformError, renderer }) {
  var component = undefined;
  var unmount = component_root(() => {
    var anchor_node = anchor ?? append_child(target, create_text());
    boundary(anchor_node, {
      pending: () => {}
    }, (anchor_node) => {
      push({});
      var ctx = component_context;
      if (context)
        ctx.c = context;
      if (events) {
        props.$$events = events;
      }
      if (hydrating) {
        assign_nodes(anchor_node, null);
      }
      should_intro = intro;
      component = Component(anchor_node, props) || mark_as_component();
      should_intro = true;
      if (hydrating) {
        active_effect.nodes.end = hydrate_node;
        if (hydrate_node === null || node_type(hydrate_node) !== COMMENT_NODE || get_node_value(hydrate_node) !== HYDRATION_END) {
          hydration_mismatch();
          throw HYDRATION_ERROR;
        }
      }
      pop();
    }, transformError);
    var registered_events = new Set;
    var event_handle = null;
    if (!renderer) {
      var dom_target = target;
      event_handle = (events) => {
        for (var i = 0;i < events.length; i++) {
          var event_name = events[i];
          if (registered_events.has(event_name))
            continue;
          registered_events.add(event_name);
          var passive = is_passive_event(event_name);
          for (const node of [dom_target, document]) {
            var counts = listeners.get(node);
            if (counts === undefined) {
              counts = new Map;
              listeners.set(node, counts);
            }
            var count = counts.get(event_name);
            if (count === undefined) {
              add_event_listener(node, event_name, handle_event_propagation, { passive });
              counts.set(event_name, 1);
            } else {
              counts.set(event_name, count + 1);
            }
          }
        }
      };
      event_handle(array_from(all_registered_events));
      root_event_handles.add(event_handle);
    }
    return () => {
      if (event_handle !== null) {
        for (var event_name of registered_events) {
          for (const node of [target, document]) {
            var counts = listeners.get(node);
            var count = counts.get(event_name);
            if (--count == 0) {
              remove_event_listener(node, event_name, handle_event_propagation);
              counts.delete(event_name);
              if (counts.size === 0) {
                listeners.delete(node);
              }
            } else {
              counts.set(event_name, count);
            }
          }
        }
        root_event_handles.delete(event_handle);
      }
      if (anchor_node !== anchor) {
        var parent = get_parent_node(anchor_node);
        if (parent)
          remove_child(parent, anchor_node);
      }
    };
  });
  mounted_components.set(component, unmount);
  return component;
}
function unmount(component, options) {
  const fn = mounted_components.get(component);
  if (fn) {
    mounted_components.delete(component);
    return fn(options);
  }
  if (true_default) {
    lifecycle_double_unmount();
  }
  return Promise.resolve();
}
var should_intro = true, listeners, mounted_components;
var init_render = __esm(() => {
  init_esm_env();
  init_operations();
  init_constants();
  init_runtime();
  init_context2();
  init_effects();
  init_hydration();
  init_utils();
  init_events2();
  init_warnings();
  init_errors2();
  init_template();
  init_utils3();
  init_constants2();
  init_boundary();
  init_state();
  listeners = new Map;
  mounted_components = new WeakMap;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/validate.js
var init_validate = __esm(() => {
  init_utils3();
  init_warnings2();
  init_errors();
  init_errors();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/branches.js
class BranchManager {
  anchor;
  #batches = new Map;
  #onscreen = new Map;
  #offscreen = new Map;
  #outroing = new Set;
  #transition = true;
  #renderer = null;
  #parent_renderer = null;
  constructor(anchor, transition = true) {
    this.anchor = anchor;
    this.#transition = transition;
    this.#renderer = current_renderer;
    this.#parent_renderer = parent_renderer;
  }
  #create_branch(fn) {
    var pop_renderer = custom_renderers_flag ? push_renderer(this.#renderer, this.#renderer) : undefined;
    try {
      return branch(fn);
    } finally {
      pop_renderer?.();
      if (custom_renderers_flag) {
        set_parent_renderer(this.#parent_renderer);
      }
    }
  }
  #commit = (batch) => {
    if (!this.#batches.has(batch))
      return;
    var pop_renderer = custom_renderers_flag ? push_renderer(this.#renderer, this.#parent_renderer) : undefined;
    try {
      var key = this.#batches.get(batch);
      var onscreen = this.#onscreen.get(key);
      if (onscreen) {
        resume_effect(onscreen);
        this.#outroing.delete(key);
      } else {
        var offscreen = this.#offscreen.get(key);
        if (offscreen) {
          resume_effect(offscreen.effect);
          this.#onscreen.set(key, offscreen.effect);
          this.#offscreen.delete(key);
          if (true_default) {
            get_last_child(offscreen.fragment)[HMR_ANCHOR] = this.anchor;
          }
          remove_node(get_last_child(offscreen.fragment));
          insert_before(this.anchor, offscreen.fragment);
          onscreen = offscreen.effect;
        }
      }
      for (const [b, k] of this.#batches) {
        this.#batches.delete(b);
        if (b === batch) {
          break;
        }
        const offscreen2 = this.#offscreen.get(k);
        if (offscreen2) {
          destroy_effect(offscreen2.effect);
          this.#offscreen.delete(k);
        }
      }
      for (const [k, effect] of this.#onscreen) {
        if (k === key || this.#outroing.has(k))
          continue;
        const on_destroy = () => {
          const keys = Array.from(this.#batches.values());
          if (keys.includes(k)) {
            var fragment = create_fragment();
            move_effect(effect, fragment);
            append_child(fragment, create_text());
            this.#offscreen.set(k, { effect, fragment });
          } else {
            destroy_effect(effect);
          }
          this.#outroing.delete(k);
          this.#onscreen.delete(k);
        };
        if (this.#transition || !onscreen) {
          this.#outroing.add(k);
          pause_effect(effect, on_destroy, false);
        } else {
          on_destroy();
        }
      }
    } finally {
      pop_renderer?.();
    }
  };
  #discard = (batch) => {
    this.#batches.delete(batch);
    const keys = Array.from(this.#batches.values());
    for (const [k, branch] of this.#offscreen) {
      if (!keys.includes(k)) {
        destroy_effect(branch.effect);
        this.#offscreen.delete(k);
      }
    }
  };
  ensure(key, fn) {
    var batch = current_batch;
    var defer = should_defer_append();
    if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
      if (defer) {
        var fragment = create_fragment();
        var target = create_text();
        append_child(fragment, target);
        this.#offscreen.set(key, {
          effect: this.#create_branch(() => fn(target)),
          fragment
        });
      } else {
        this.#onscreen.set(key, this.#create_branch(() => fn(this.anchor)));
      }
    }
    this.#batches.set(batch, key);
    if (defer) {
      for (const [k, effect] of this.#onscreen) {
        if (k === key) {
          batch.unskip_effect(effect);
        } else {
          batch.skip_effect(effect);
        }
      }
      for (const [k, branch] of this.#offscreen) {
        if (k === key) {
          batch.unskip_effect(branch.effect);
        } else {
          batch.skip_effect(branch.effect);
        }
      }
      batch.oncommit(this.#commit);
      batch.ondiscard(this.#discard);
    } else {
      if (hydrating) {
        this.anchor = hydrate_node;
      }
      this.#commit(batch);
    }
  }
}
var init_branches = __esm(() => {
  init_batch();
  init_effects();
  init_constants2();
  init_hydration();
  init_operations();
  init_esm_env();
  init_state();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function snippet(node, get_snippet, ...args) {
  var branches = new BranchManager(node);
  block(() => {
    const snippet = get_snippet() ?? null;
    if (true_default && snippet == null) {
      invalid_snippet();
    }
    branches.ensure(snippet, snippet && ((anchor) => {
      if (custom_renderers_flag) {
        var renderer = snippet.__renderer;
        var has_renderer = has_own_property.call(snippet, "__renderer");
        if (has_renderer) {
          var pop_renderer = push_renderer(renderer, renderer);
          try {
            return snippet(anchor, ...args);
          } finally {
            pop_renderer();
          }
        }
      }
      return snippet(anchor, ...args);
    }));
  }, EFFECT_TRANSPARENT);
}
function renderer_snippet(expected_renderer, fn) {
  var wrapped = (...args) => {
    if (current_renderer !== expected_renderer) {
      snippet_renderer_mismatch();
    }
    return fn(...args);
  };
  wrapped.__renderer = expected_renderer;
  return wrapped;
}
function validate_snippet_renderer(expected_renderer, fn) {
  if (fn == null)
    return fn;
  var has_renderer = has_own_property.call(fn, "__renderer");
  if (expected_renderer === null && has_renderer && fn.__renderer !== expected_renderer || expected_renderer !== null && fn.__renderer !== expected_renderer) {
    snippet_renderer_mismatch();
  }
  return fn;
}
var init_snippet = __esm(() => {
  init_constants2();
  init_effects();
  init_context2();
  init_hydration();
  init_reconciler();
  init_template();
  init_warnings();
  init_errors2();
  init_esm_env();
  init_operations();
  init_validate();
  init_utils();
  init_branches();
  init_state();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/index-client.js
function onMount(fn) {
  if (component_context === null) {
    lifecycle_outside_component("onMount");
  }
  if (legacy_mode_flag && component_context.l !== null) {
    init_update_callbacks(component_context).m.push(fn);
  } else {
    user_effect(() => {
      const cleanup = untrack(fn);
      if (typeof cleanup === "function")
        return cleanup;
    });
  }
}
function onDestroy(fn) {
  if (component_context === null) {
    lifecycle_outside_component("onDestroy");
  }
  onMount(() => () => untrack(fn));
}
function init_update_callbacks(context) {
  var l = context.l;
  return l.u ??= { a: [], b: [], m: [] };
}
var init_index_client = __esm(() => {
  init_runtime();
  init_utils();
  init_client();
  init_errors2();
  init_context2();
  init_esm_env();
  init_batch();
  init_context2();
  init_hydratable();
  init_render();
  init_runtime();
  init_snippet();
  if (true_default) {
    let throw_rune_error = function(rune) {
      if (!(rune in globalThis)) {
        let value;
        Object.defineProperty(globalThis, rune, {
          configurable: true,
          get: () => {
            if (value !== undefined) {
              return value;
            }
            rune_outside_svelte(rune);
          },
          set: (v) => {
            value = v;
          }
        });
      }
    };
    throw_rune_error("$state");
    throw_rune_error("$effect");
    throw_rune_error("$derived");
    throw_rune_error("$inspect");
    throw_rune_error("$props");
    throw_rune_error("$bindable");
  }
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/attachments/index.js
var init_attachments = __esm(() => {
  init_client();
  init_constants();
  init_index_client();
  init_effects();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/assign.js
var init_assign = __esm(() => {
  init_constants2();
  init_utils3();
  init_runtime();
  init_warnings();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/css.js
var all_styles;
var init_css = __esm(() => {
  init_operations();
  all_styles = new Map;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/elements.js
var init_elements = __esm(() => {
  init_constants2();
  init_constants();
  init_hydration();
  init_context2();
  init_operations();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/hmr.js
var init_hmr = __esm(() => {
  init_constants();
  init_constants2();
  init_hydration();
  init_effects();
  init_sources();
  init_render();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/ownership.js
var init_ownership = __esm(() => {
  init_utils();
  init_constants2();
  init_constants();
  init_context2();
  init_warnings();
  init_utils3();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/legacy.js
var init_legacy2 = __esm(() => {
  init_errors2();
  init_context2();
  init_constants();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/inspect.js
var init_inspect = __esm(() => {
  init_constants();
  init_clone();
  init_effects();
  init_runtime();
  init_dev();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/async.js
var init_async2 = __esm(() => {
  init_async();
  init_runtime();
  init_hydration();
  init_template();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/validation.js
var init_validation = __esm(() => {
  init_state();
  init_errors2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/await.js
var init_await = __esm(() => {
  init_utils();
  init_effects();
  init_sources();
  init_hydration();
  init_task();
  init_constants();
  init_context2();
  init_batch();
  init_branches();
  init_async();
  init_operations();
  init_esm_env();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/if.js
function if_block(node, fn, elseif = false) {
  var marker;
  if (hydrating) {
    marker = hydrate_node;
    hydrate_next();
  }
  var branches = new BranchManager(node);
  var flags = elseif ? EFFECT_TRANSPARENT : 0;
  function update_branch(key, fn) {
    if (hydrating) {
      var data = read_hydration_instruction(marker);
      if (key !== parseInt(data.substring(1))) {
        var anchor = skip_nodes();
        set_hydrate_node(anchor);
        branches.anchor = anchor;
        set_hydrating(false);
        branches.ensure(key, fn);
        set_hydrating(true);
        return;
      }
    }
    branches.ensure(key, fn);
  }
  block(() => {
    var has_branch = false;
    fn((fn, key = 0) => {
      has_branch = true;
      update_branch(key, fn);
    });
    if (!has_branch) {
      update_branch(-1, null);
    }
  }, flags);
}
var init_if = __esm(() => {
  init_constants2();
  init_hydration();
  init_effects();
  init_branches();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/key.js
function key(node, get_key, render_fn) {
  if (hydrating) {
    hydrate_next();
  }
  var branches = new BranchManager(node);
  var legacy = !is_runes();
  block(() => {
    var key = get_key();
    if (key !== key) {
      key = NAN;
    }
    if (legacy && key !== null && typeof key === "object") {
      key = {};
    }
    branches.ensure(key, render_fn);
  });
}
var NAN;
var init_key = __esm(() => {
  init_context2();
  init_effects();
  init_hydration();
  init_branches();
  NAN = Symbol("NaN");
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/css-props.js
var init_css_props = __esm(() => {
  init_effects();
  init_hydration();
  init_operations();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/each.js
function index(_, i) {
  return i;
}
function pause_effects(state, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  var group;
  var remaining = to_destroy.length;
  for (var i = 0;i < length; i++) {
    let effect = to_destroy[i];
    pause_effect(effect, () => {
      if (group) {
        group.pending.delete(effect);
        group.done.add(effect);
        if (group.pending.size === 0) {
          var groups = state.outrogroups;
          destroy_effects(state, array_from(group.done));
          groups.delete(group);
          if (groups.size === 0) {
            state.outrogroups = null;
          }
        }
      } else {
        remaining -= 1;
      }
    }, false);
  }
  if (remaining === 0) {
    var fast_path = transitions.length === 0 && controlled_anchor !== null && state.pending.size === 0;
    if (fast_path) {
      var anchor = controlled_anchor;
      var parent_node = get_parent_node(anchor);
      clear_text_content(parent_node);
      append_child(parent_node, anchor);
      state.items.clear();
    }
    destroy_effects(state, to_destroy, !fast_path);
  } else {
    group = {
      pending: new Set(to_destroy),
      done: new Set
    };
    (state.outrogroups ??= new Set).add(group);
  }
}
function destroy_effects(state, to_destroy, remove_dom = true) {
  var preserved_effects;
  if (state.pending.size > 0) {
    preserved_effects = new Set;
    for (const keys of state.pending.values()) {
      for (const key of keys) {
        preserved_effects.add(state.items.get(key).e);
      }
    }
  }
  for (var i = 0;i < to_destroy.length; i++) {
    var e = to_destroy[i];
    if (preserved_effects?.has(e)) {
      e.f |= EFFECT_OFFSCREEN;
      const fragment = create_fragment();
      move_effect(e, fragment);
    } else {
      destroy_effect(to_destroy[i], remove_dom);
    }
  }
}
function get_offscreen_anchor() {
  var cached = offscreen_anchors.get(current_renderer ?? dom_weak_key);
  if (cached)
    return cached;
  var offscreen_anchor = create_text();
  if (current_renderer) {
    var fragment = create_fragment();
    append_child(fragment, offscreen_anchor);
  }
  offscreen_anchors.set(current_renderer ?? dom_weak_key, offscreen_anchor);
  return offscreen_anchor;
}
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var items = new Map;
  var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = node;
    anchor = hydrating ? set_hydrate_node(get_first_child(parent_node)) : append_child(parent_node, create_text());
  }
  var renderer = current_renderer;
  var parent = parent_renderer;
  if (hydrating) {
    hydrate_next();
  }
  var fallback = null;
  var each_array = derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  if (true_default) {
    tag(each_array, "{#each ...}");
  }
  var pending = new Map;
  var first_run = true;
  function commit(batch) {
    if ((state.effect.f & DESTROYED) !== 0) {
      return;
    }
    var pop_renderer = custom_renderers_flag ? push_renderer(renderer, parent) : undefined;
    try {
      state.pending.delete(batch);
      var array = get(each_array);
      state.fallback = fallback;
      reconcile(state, array, anchor, flags, get_key);
      if (fallback !== null) {
        if (array.length === 0) {
          if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
            resume_effect(fallback);
          } else {
            fallback.f ^= EFFECT_OFFSCREEN;
            move(fallback, null, anchor);
          }
        } else {
          pause_effect(fallback, () => {
            fallback = null;
          });
        }
      }
    } finally {
      pop_renderer?.();
    }
  }
  function discard(batch) {
    state.pending.delete(batch);
  }
  var pop_renderer = custom_renderers_flag ? push_renderer(renderer, renderer) : undefined;
  var effect = block(() => {
    var array = get(each_array);
    var length = array.length;
    let mismatch = false;
    if (hydrating) {
      var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;
      if (is_else !== (length === 0)) {
        anchor = skip_nodes();
        set_hydrate_node(anchor);
        set_hydrating(false);
        mismatch = true;
      }
    }
    var keys = new Set;
    var batch = current_batch;
    var defer = should_defer_append();
    for (var index = 0;index < length; index += 1) {
      if (hydrating && node_type(hydrate_node) === COMMENT_NODE && get_node_value(hydrate_node) === HYDRATION_END) {
        anchor = hydrate_node;
        mismatch = true;
        set_hydrating(false);
      }
      var value = array[index];
      var key = get_key(value, index);
      if (true_default) {
        var key_again = get_key(value, index);
        if (key !== key_again) {
          each_key_volatile(String(index), String(key), String(key_again));
        }
      }
      var item = first_run ? null : items.get(key);
      if (item) {
        if (item.v)
          internal_set(item.v, value);
        if (item.i)
          internal_set(item.i, index);
        if (defer) {
          batch.unskip_effect(item.e);
        }
      } else {
        item = create_item(items, first_run ? anchor : get_offscreen_anchor(), value, key, index, render_fn, flags, get_collection);
        if (!first_run) {
          item.e.f |= EFFECT_OFFSCREEN;
        }
        items.set(key, item);
      }
      keys.add(key);
    }
    if (length === 0 && fallback_fn && !fallback) {
      if (first_run) {
        fallback = branch(() => fallback_fn(anchor));
      } else {
        fallback = branch(() => fallback_fn(get_offscreen_anchor()));
        fallback.f |= EFFECT_OFFSCREEN;
      }
    }
    if (length > keys.size) {
      if (true_default) {
        validate_each_keys(array, get_key);
      } else {
        each_key_duplicate("", "", "");
      }
    }
    if (hydrating && length > 0) {
      set_hydrate_node(skip_nodes());
    }
    if (!first_run) {
      pending.set(batch, keys);
      if (defer) {
        for (const [key, item] of items) {
          if (!keys.has(key)) {
            batch.skip_effect(item.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(discard);
      } else {
        commit(batch);
      }
    }
    if (mismatch) {
      set_hydrating(true);
    }
    get(each_array);
  });
  pop_renderer?.();
  if (custom_renderers_flag) {
    set_parent_renderer(parent);
  }
  var state = { effect, flags, items, pending, outrogroups: null, fallback };
  first_run = false;
  if (hydrating) {
    anchor = hydrate_node;
  }
}
function skip_to_branch(effect) {
  while (effect !== null && (effect.f & BRANCH_EFFECT) === 0) {
    effect = effect.next;
  }
  return effect;
}
function reconcile(state, array, anchor, flags, get_key) {
  var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
  var length = array.length;
  var items = state.items;
  var current = skip_to_branch(state.effect.first);
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var effect;
  var i;
  if (is_animated) {
    for (i = 0;i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      effect = items.get(key).e;
      if ((effect.f & EFFECT_OFFSCREEN) === 0) {
        effect.nodes?.a?.measure();
        (to_animate ??= new Set).add(effect);
      }
    }
  }
  for (i = 0;i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    effect = items.get(key).e;
    if (state.outrogroups !== null) {
      for (const group of state.outrogroups) {
        group.pending.delete(effect);
        group.done.delete(effect);
      }
    }
    if ((effect.f & INERT) !== 0) {
      resume_effect(effect);
      if (is_animated) {
        effect.nodes?.a?.unfix();
        (to_animate ??= new Set).delete(effect);
      }
    }
    if ((effect.f & EFFECT_OFFSCREEN) !== 0) {
      effect.f ^= EFFECT_OFFSCREEN;
      if (effect === current) {
        move(effect, null, anchor);
      } else {
        var next = prev ? prev.next : current;
        if (effect === state.effect.last) {
          state.effect.last = effect.prev;
        }
        if (effect.prev)
          effect.prev.next = effect.next;
        if (effect.next)
          effect.next.prev = effect.prev;
        link2(state, prev, effect);
        link2(state, effect, next);
        move(effect, next, anchor);
        prev = effect;
        matched = [];
        stashed = [];
        current = skip_to_branch(prev.next);
        continue;
      }
    }
    if (effect !== current) {
      if (seen !== undefined && seen.has(effect)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0;j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0;j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link2(state, a.prev, b.next);
          link2(state, prev, a);
          link2(state, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(effect);
          move(effect, current, anchor);
          link2(state, effect.prev, effect.next);
          link2(state, effect, prev === null ? state.effect.first : prev.next);
          link2(state, prev, effect);
          prev = effect;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== effect) {
        (seen ??= new Set).add(current);
        stashed.push(current);
        current = skip_to_branch(current.next);
      }
      if (current === null) {
        continue;
      }
    }
    if ((effect.f & EFFECT_OFFSCREEN) === 0) {
      matched.push(effect);
    }
    prev = effect;
    current = skip_to_branch(effect.next);
  }
  if (state.outrogroups !== null) {
    for (const group of state.outrogroups) {
      if (group.pending.size === 0) {
        destroy_effects(state, array_from(group.done));
        state.outrogroups?.delete(group);
      }
    }
    if (state.outrogroups.size === 0) {
      state.outrogroups = null;
    }
  }
  if (current !== null || seen !== undefined) {
    var to_destroy = [];
    if (seen !== undefined) {
      for (effect of seen) {
        if ((effect.f & INERT) === 0) {
          to_destroy.push(effect);
        }
      }
    }
    while (current !== null) {
      if ((current.f & INERT) === 0 && current !== state.fallback) {
        to_destroy.push(current);
      }
      current = skip_to_branch(current.next);
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0;i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.measure();
        }
        for (i = 0;i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.fix();
        }
      }
      pause_effects(state, to_destroy, controlled_anchor);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      if (to_animate === undefined)
        return;
      for (effect of to_animate) {
        effect.nodes?.a?.apply();
      }
    });
  }
}
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
  var v = (flags & EACH_ITEM_REACTIVE) !== 0 ? (flags & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
  var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index) : null;
  if (true_default && v) {
    v.trace = () => {
      get_collection()[i?.v ?? index];
    };
  }
  return {
    v,
    i,
    e: branch(() => {
      render_fn(anchor, v ?? value, i ?? index, get_collection);
      return () => {
        items.delete(key);
      };
    })
  };
}
function move(effect, next, anchor) {
  if (!effect.nodes)
    return;
  var node = effect.nodes.start;
  var end = effect.nodes.end;
  var dest = next && (next.f & EFFECT_OFFSCREEN) === 0 ? next.nodes.start : anchor;
  while (node !== null) {
    var next_node = get_next_sibling(node);
    insert_before(dest, node);
    if (node === end) {
      return;
    }
    node = next_node;
  }
}
function link2(state, prev, next) {
  if (prev === null) {
    state.effect.first = next;
  } else {
    prev.next = next;
  }
  if (next === null) {
    state.effect.last = prev;
  } else {
    next.prev = prev;
  }
}
function validate_each_keys(array, key_fn) {
  const keys = new Map;
  const length = array.length;
  for (let i = 0;i < length; i++) {
    const key = key_fn(array[i], i);
    if (keys.has(key)) {
      const a = String(keys.get(key));
      const b = String(i);
      let k = String(key);
      if (k.startsWith("[object "))
        k = null;
      each_key_duplicate(a, b, k);
    }
    keys.set(key, i);
  }
}
var offscreen_anchors, dom_weak_key;
var init_each = __esm(() => {
  init_constants();
  init_hydration();
  init_operations();
  init_effects();
  init_sources();
  init_utils();
  init_constants2();
  init_task();
  init_runtime();
  init_esm_env();
  init_deriveds();
  init_batch();
  init_errors2();
  init_tracing();
  init_state();
  offscreen_anchors = new WeakMap;
  dom_weak_key = {};
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/html.js
var init_html = __esm(() => {
  init_constants();
  init_effects();
  init_hydration();
  init_template();
  init_warnings();
  init_utils3();
  init_esm_env();
  init_context2();
  init_operations();
  init_runtime();
  init_constants2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/slot.js
var init_slot = __esm(() => {
  init_hydration();
  init_operations();
  init_template();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/svelte-component.js
function component(node, get_component, render_fn) {
  var hydration_start_node;
  if (hydrating) {
    hydration_start_node = hydrate_node;
    hydrate_next();
  }
  var branches = new BranchManager(node);
  block(() => {
    var component = get_component() ?? null;
    if (hydrating) {
      var data = read_hydration_instruction(hydration_start_node);
      var server_had_component = data === HYDRATION_START;
      var client_has_component = component !== null;
      if (server_had_component !== client_has_component) {
        var anchor = skip_nodes();
        set_hydrate_node(anchor);
        branches.anchor = anchor;
        set_hydrating(false);
        branches.ensure(component, component && ((target) => render_fn(target, component)));
        set_hydrating(true);
        return;
      }
    }
    branches.ensure(component, component && ((target) => render_fn(target, component)));
  }, EFFECT_TRANSPARENT);
}
var init_svelte_component = __esm(() => {
  init_constants2();
  init_effects();
  init_hydration();
  init_branches();
  init_constants();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/timing.js
var now, raf;
var init_timing = __esm(() => {
  init_utils();
  init_esm_env();
  now = true_default ? () => performance.now() : () => Date.now();
  raf = {
    tick: (_) => (true_default ? requestAnimationFrame : noop)(_),
    now: () => now(),
    tasks: new Set
  };
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/loop.js
var init_loop = __esm(() => {
  init_timing();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/transitions.js
var init_transitions = __esm(() => {
  init_utils();
  init_effects();
  init_runtime();
  init_loop();
  init_render();
  init_constants();
  init_constants2();
  init_task();
  init_shared();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/svelte-element.js
var init_svelte_element = __esm(() => {
  init_constants();
  init_hydration();
  init_operations();
  init_effects();
  init_render();
  init_runtime();
  init_context2();
  init_esm_env();
  init_constants2();
  init_template();
  init_utils3();
  init_branches();
  init_transitions();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/blocks/svelte-head.js
var init_svelte_head = __esm(() => {
  init_hydration();
  init_operations();
  init_effects();
  init_constants2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/css.js
var init_css2 = __esm(() => {
  init_esm_env();
  init_css();
  init_effects();
  init_operations();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/actions.js
var init_actions = __esm(() => {
  init_effects();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function attach2(node, get_fn) {
  var fn = undefined;
  var e;
  managed(() => {
    if (fn !== (fn = get_fn())) {
      if (e) {
        destroy_effect(e);
        e = null;
      }
      if (fn) {
        e = branch(() => {
          effect(() => fn(node));
        });
      }
    }
  });
}
var init_attachments2 = __esm(() => {
  init_effects();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/escaping.js
var init_escaping = () => {};

// ../gpuix-fractalsvelte/node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if (typeof e == "string" || typeof e == "number")
    n += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0;t < o; t++)
        e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else
      for (f in e)
        e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length;f < o; f++)
    (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var init_clsx = () => {};

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/shared/attributes.js
function clsx2(value) {
  if (typeof value === "object") {
    return clsx(value);
  } else {
    return value ?? "";
  }
}
function to_class(value, hash, directives) {
  var classname = value == null ? "" : "" + value;
  if (hash) {
    classname = classname ? classname + " " + hash : hash;
  }
  if (directives) {
    for (var key of Object.keys(directives)) {
      if (directives[key]) {
        classname = classname ? classname + " " + key : key;
      } else if (classname.length) {
        var len = key.length;
        var a = 0;
        while ((a = classname.indexOf(key, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function append_styles(styles, important = false) {
  var separator = important ? " !important;" : ";";
  var css = "";
  for (var key of Object.keys(styles)) {
    var value = styles[key];
    if (value != null && value !== "") {
      css += " " + key + ": " + value + separator;
    }
  }
  return css;
}
function to_css_name(name) {
  if (name[0] !== "-" || name[1] !== "-") {
    return name.toLowerCase();
  }
  return name;
}
function to_style(value, styles) {
  if (styles) {
    var new_style = "";
    var normal_styles;
    var important_styles;
    if (Array.isArray(styles)) {
      normal_styles = styles[0];
      important_styles = styles[1];
    } else {
      normal_styles = styles;
    }
    if (value) {
      value = String(value).replaceAll(/\/\*.*?\*\//g, "").trim();
      var in_str = false;
      var in_apo = 0;
      var in_comment = false;
      var reserved_names = [];
      if (normal_styles) {
        reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
      }
      if (important_styles) {
        reserved_names.push(...Object.keys(important_styles).map(to_css_name));
      }
      var start_index = 0;
      var name_index = -1;
      const len = value.length;
      for (var i = 0;i < len; i++) {
        var c = value[i];
        if (in_comment) {
          if (c === "/" && value[i - 1] === "*") {
            in_comment = false;
          }
        } else if (in_str) {
          if (in_str === c) {
            in_str = false;
          }
        } else if (c === "/" && value[i + 1] === "*") {
          in_comment = true;
        } else if (c === '"' || c === "'") {
          in_str = c;
        } else if (c === "(") {
          in_apo++;
        } else if (c === ")") {
          in_apo--;
        }
        if (!in_comment && in_str === false && in_apo === 0) {
          if (c === ":" && name_index === -1) {
            name_index = i;
          } else if (c === ";" || i === len - 1) {
            if (name_index !== -1) {
              var name = to_css_name(value.substring(start_index, name_index).trim());
              if (!reserved_names.includes(name)) {
                if (c !== ";") {
                  i++;
                }
                var property = value.substring(start_index, i).trim();
                new_style += " " + property + ";";
              }
            }
            start_index = i + 1;
            name_index = -1;
          }
        }
      }
    }
    if (normal_styles) {
      new_style += append_styles(normal_styles);
    }
    if (important_styles) {
      new_style += append_styles(important_styles, true);
    }
    new_style = new_style.trim();
    return new_style === "" ? null : new_style;
  }
  return value == null ? null : String(value);
}
var replacements, whitespace;
var init_attributes = __esm(() => {
  init_escaping();
  init_clsx();
  init_utils();
  replacements = {
    translate: new Map([
      [true, "yes"],
      [false, "no"]
    ])
  };
  whitespace = [...` 	
\r\f \v\uFEFF`];
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/class.js
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
  var prev = dom[CLASS_CACHE];
  if (hydrating || prev !== value || prev === undefined) {
    var next_class_name = to_class(value, hash, next_classes);
    if (!hydrating || next_class_name !== get_attribute(dom, "class")) {
      if (next_class_name == null) {
        remove_attribute(dom, "class");
      } else if (is_html) {
        dom.className = next_class_name;
      } else {
        set_attribute(dom, "class", next_class_name);
      }
    }
    dom[CLASS_CACHE] = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key in next_classes) {
      var is_present = !!next_classes[key];
      if (prev_classes == null || is_present !== !!prev_classes[key]) {
        class_list_toggle(dom, key, is_present);
      }
    }
  }
  return next_classes;
}
var init_class = __esm(() => {
  init_attributes();
  init_constants2();
  init_hydration();
  init_operations();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/style.js
function update_styles(dom, prev = {}, next, priority) {
  for (var key in next) {
    var value = next[key];
    if (prev[key] !== value) {
      if (next[key] == null) {
        style_remove_property(dom, key);
      } else {
        style_set_property(dom, key, value, priority);
      }
    }
  }
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = dom[STYLE_CACHE];
  if (hydrating || prev !== value) {
    var next_style_attr = to_style(value, next_styles);
    if (!hydrating || next_style_attr !== get_attribute(dom, "style")) {
      if (next_style_attr == null) {
        remove_attribute(dom, "style");
      } else {
        set_css_text(dom, next_style_attr);
      }
    }
    dom[STYLE_CACHE] = value;
  } else if (next_styles) {
    if (Array.isArray(next_styles)) {
      update_styles(dom, prev_styles?.[0], next_styles[0]);
      update_styles(dom, prev_styles?.[1], next_styles[1], "important");
    } else {
      update_styles(dom, prev_styles, next_styles);
    }
  }
  return next_styles;
}
var init_style2 = __esm(() => {
  init_attributes();
  init_constants2();
  init_hydration();
  init_operations();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function set_selected(option, selected) {
  if (selected) {
    if (!has_attribute(option, "selected")) {
      set_attribute(option, "selected", "");
    }
  } else {
    remove_attribute(option, "selected");
  }
}
function set_default_select_value(select, value) {
  var mounting = !("__defaultValue" in select);
  if (!mounting && select.__defaultValue === value)
    return;
  select.__defaultValue = value;
  apply_default_select_value(select, !mounting || "__value" in select);
}
function apply_default_select_value(select, preserve) {
  var value = select.__defaultValue;
  var multiple = select.multiple;
  var values = multiple ? value ?? [] : null;
  if (multiple && !is_array(values))
    return;
  var index = select.selectedIndex;
  var selected = preserve && multiple ? new Set(select.selectedOptions) : null;
  for (var option of select.options) {
    var option_value = get_option_value(option);
    set_selected(option, multiple ? values.includes(option_value) : is(option_value, value));
  }
  if (!preserve)
    return;
  if (selected !== null) {
    for (option of select.options) {
      var was_selected = selected.has(option);
      if (option.selected !== was_selected)
        option.selected = was_selected;
    }
  } else if (select.selectedIndex !== index) {
    select.selectedIndex = index;
  }
}
function select_option(select, value, mounting = false) {
  if (select.multiple) {
    if (value == undefined) {
      return;
    }
    if (!is_array(value)) {
      return select_multiple_invalid_value();
    }
    for (var option of select.options) {
      option.selected = value.includes(get_option_value(option));
    }
    return;
  }
  for (option of select.options) {
    var option_value = get_option_value(option);
    if (is(option_value, value)) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== undefined) {
    select.selectedIndex = -1;
  }
}
function init_select2(select) {
  var observer = new MutationObserver((entries) => {
    if (entries.every(is_selectedcontent_mutation))
      return;
    if ("__defaultValue" in select) {
      apply_default_select_value(select, false);
    }
    if ("__value" in select) {
      select_option(select, select.__value);
    }
  });
  observer.observe(select, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["value"]
  });
  teardown(() => {
    observer.disconnect();
  });
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}
function is_selectedcontent_mutation(entry) {
  if (entry.target.closest("selectedcontent") !== null) {
    return true;
  }
  if (entry.type === "childList") {
    var nodes = [...entry.addedNodes, ...entry.removedNodes];
    return nodes.length > 0 && nodes.every((node) => node.nodeName === "SELECTEDCONTENT");
  }
  return false;
}
var init_select = __esm(() => {
  init_effects();
  init_shared();
  init_proxy();
  init_utils();
  init_warnings();
  init_batch();
  init_operations();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/attributes.js
function remove_input_defaults(input) {
  if (!hydrating)
    return;
  var already_removed = false;
  var remove_defaults = () => {
    if (already_removed)
      return;
    already_removed = true;
    if (has_attribute(input, "value")) {
      var value = input.value;
      set_attribute2(input, "value", null);
      input.value = value;
    }
    if (has_attribute(input, "checked")) {
      var checked = input.checked;
      set_attribute2(input, "checked", null);
      input.checked = checked;
    }
  };
  input[FORM_RESET_HANDLER] = remove_defaults;
  queue_micro_task(remove_defaults);
  add_form_reset_listener();
}
function set_value(element, value) {
  var attributes = get_attributes(element);
  if (attributes.value === (attributes.value = value ?? undefined) || current_renderer == null && element.value === value && (value !== 0 || node_name(element) !== PROGRESS_TAG)) {
    return;
  }
  set_element_value(element, value);
}
function set_attribute2(element, attribute, value, skip_warning) {
  var attributes = get_attributes(element);
  if (hydrating) {
    attributes[attribute] = get_attribute(element, attribute);
    if (attribute === "src" || attribute === "srcset" || attribute === "href" && node_name(element) === LINK_TAG) {
      if (!skip_warning) {
        check_src_in_dev_hydration(element, attribute, value ?? "");
      }
      return;
    }
  }
  if (attributes[attribute] === (attributes[attribute] = value))
    return;
  if (attribute === "loading") {
    element[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    remove_attribute(element, attribute);
  } else if (typeof value !== "string" && get_setters(element).has(attribute)) {
    element[attribute] = value;
  } else {
    set_attribute(element, attribute, value);
  }
}
function set_attributes(element, prev, next, css_hash, should_remove_defaults = false, skip_warning = false) {
  if (hydrating && should_remove_defaults && node_name(element) === INPUT_TAG) {
    if (!(("defaultValue" in next) || ("defaultChecked" in next))) {
      remove_input_defaults(element);
    }
  }
  var attributes = get_attributes(element);
  var is_custom_element = attributes[IS_CUSTOM_ELEMENT];
  var preserve_attribute_case = !attributes[IS_HTML];
  let is_hydrating_custom_element = hydrating && is_custom_element;
  if (is_hydrating_custom_element) {
    set_hydrating(false);
  }
  var current = prev || {};
  var is_option_element = node_name(element) === OPTION_TAG;
  var is_select_element = node_name(element) === SELECT_TAG;
  try {
    for (var key in prev) {
      if (!(key in next) && key[0] + key[1] !== "$$") {
        next[key] = null;
      }
    }
    if (next.class) {
      next.class = clsx2(next.class);
    } else if (css_hash || next[CLASS]) {
      next.class = null;
    }
    if (next[STYLE]) {
      next.style ??= null;
    }
    var setters = get_setters(element);
    if (current_renderer == null && node_name(element) === INPUT_TAG && "type" in next && (("value" in next) || ("__value" in next))) {
      var type = next.type;
      if (type !== current.type || type === undefined && element.hasAttribute("type")) {
        current.type = type;
        set_attribute2(element, "type", type, skip_warning);
      }
    }
    for (const key in next) {
      let value = next[key];
      if (is_option_element && key === "value" && value == null) {
        element.value = element.__value = "";
        current[key] = value;
        continue;
      }
      if (key === "class") {
        var is_html = current_renderer == null && element.namespaceURI === NAMESPACE_HTML;
        set_class(element, is_html, value, css_hash, prev?.[CLASS], next[CLASS]);
        current[key] = value;
        current[CLASS] = next[CLASS];
        continue;
      }
      if (key === "style") {
        set_style(element, value, prev?.[STYLE], next[STYLE]);
        current[key] = value;
        current[STYLE] = next[STYLE];
        continue;
      }
      var prev_value = current[key];
      if (value === prev_value && !(value === undefined && has_attribute(element, key))) {
        continue;
      }
      current[key] = value;
      var prefix = key[0] + key[1];
      if (prefix === "$$")
        continue;
      if (prefix === "on") {
        const opts = {};
        const event_handle_key = "$$" + key;
        let event_name = key.slice(2);
        var is_delegated = current_renderer == null && can_delegate_event(event_name);
        if (is_capture_event(event_name)) {
          event_name = event_name.slice(0, -7);
          opts.capture = true;
        }
        if (!is_delegated && prev_value) {
          if (value != null)
            continue;
          remove_event_listener(element, event_name, current[event_handle_key], opts);
          current[event_handle_key] = null;
        }
        if (is_delegated) {
          delegated(event_name, element, value);
          delegate([event_name]);
        } else if (value != null) {
          let handle = function(...args) {
            current[key].apply(this, args);
          };
          current[event_handle_key] = create_event(event_name, element, handle, opts);
        }
      } else if (key === "style") {
        set_attribute2(element, key, value);
      } else if (key === "autofocus") {
        if (current_renderer == null) {
          autofocus(element, Boolean(value));
        } else {
          if (value) {
            set_attribute(element, key, value);
          } else {
            remove_attribute(element, key);
          }
        }
      } else if (!is_custom_element && (key === "__value" || key === "value" && value != null)) {
        element.__value = value;
        if (prev_value == null || element.value !== value || value === 0 && element.nodeName === PROGRESS_TAG) {
          set_element_value(element, value);
        }
      } else if (key === "selected" && is_option_element) {
        set_selected(element, value);
      } else {
        var name = key;
        if (!preserve_attribute_case) {
          name = normalize_attribute(name);
        }
        var is_default = name === "defaultValue" || name === "defaultChecked";
        if (is_select_element && name === "defaultValue")
          continue;
        if (value == null && !is_custom_element && !is_default) {
          attributes[key] = null;
          if ((name === "value" || name === "checked") && current_renderer == null) {
            let input = element;
            const use_default = prev === undefined;
            if (name === "value") {
              let previous = input.defaultValue;
              remove_attribute(input, name);
              set_element_default_value(input, previous);
              set_element_value(input, input.__value = use_default ? previous : null);
            } else {
              let previous = input.defaultChecked;
              remove_attribute(input, name);
              set_element_default_checked(input, previous);
              set_element_checked(input, use_default ? previous : false);
            }
          } else {
            remove_attribute(element, key);
            if (name === "value") {
              element.__value = null;
            }
          }
        } else if (is_default && current_renderer != null) {
          if (name === "defaultValue") {
            set_element_default_value(element, value);
          } else {
            set_element_default_checked(element, value);
          }
          if (name in attributes)
            attributes[name] = UNINITIALIZED;
        } else if (is_default || (is_custom_element || typeof value !== "string") && setters.has(name)) {
          element[name] = value;
          if (name in attributes)
            attributes[name] = UNINITIALIZED;
        } else if (typeof value !== "function") {
          set_attribute2(element, name, value, skip_warning);
        }
      }
    }
  } finally {
    if (is_hydrating_custom_element) {
      set_hydrating(true);
    }
  }
  return current;
}
function attribute_effect(element, fn, sync = [], async = [], blockers = [], css_hash, should_remove_defaults = false, skip_warning = false) {
  flatten(blockers, sync, async, (values) => {
    var prev = undefined;
    var effects = {};
    var is_select = node_name(element) === SELECT_TAG;
    var inited = false;
    managed(() => {
      var next = fn(...values.map(get));
      var current = set_attributes(element, prev, next, css_hash, should_remove_defaults, skip_warning);
      if (inited && is_select) {
        var select = element;
        if ("defaultValue" in next) {
          set_default_select_value(select, next.defaultValue);
        }
        if ("value" in next) {
          select_option(select, next.value);
        }
      }
      for (let symbol of Object.getOwnPropertySymbols(effects)) {
        if (!next[symbol])
          destroy_effect(effects[symbol]);
      }
      for (let symbol of Object.getOwnPropertySymbols(next)) {
        var n = next[symbol];
        if (symbol.description === ATTACHMENT_KEY && (!prev || n !== prev[symbol])) {
          if (effects[symbol])
            destroy_effect(effects[symbol]);
          effects[symbol] = branch(() => attach2(element, () => n));
        }
        current[symbol] = n;
      }
      prev = current;
    });
    if (is_select) {
      var select = element;
      effect(() => {
        var attrs = prev;
        if ("defaultValue" in attrs) {
          set_default_select_value(select, attrs.defaultValue);
        }
        select_option(select, attrs.value, true);
        init_select2(select);
      });
    }
    inited = true;
  });
}
function get_attributes(element) {
  return element[ATTRIBUTES_CACHE] ??= {
    [IS_CUSTOM_ELEMENT]: (node_name(element) ?? "").includes("-"),
    [IS_HTML]: current_renderer == null && element.namespaceURI === NAMESPACE_HTML
  };
}
function get_setters(element) {
  if (current_renderer)
    return empty_setters;
  var cache_key = get_attribute(element, "is") || (node_name(element) ?? "");
  var setters = setters_cache.get(cache_key);
  if (setters)
    return setters;
  setters_cache.set(cache_key, setters = new Set);
  var descriptors;
  var proto = element;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key in descriptors) {
      if (descriptors[key].set && key !== "innerHTML" && key !== "textContent" && key !== "innerText") {
        setters.add(key);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
function check_src_in_dev_hydration(element, attribute, value) {
  if (!true_default || current_renderer != null)
    return;
  if (attribute === "srcset" && srcset_url_equal(element, value))
    return;
  if (src_url_equal(get_attribute(element, attribute) ?? "", value))
    return;
  hydration_attribute_changed(attribute, element.outerHTML.replace(element.innerHTML, element.innerHTML && "..."), String(value));
}
function src_url_equal(element_src, url) {
  if (element_src === url || current_renderer != null)
    return true;
  return new URL(element_src, document.baseURI).href === new URL(url, document.baseURI).href;
}
function split_srcset(srcset) {
  return srcset.split(",").map((src) => src.trim().split(" ").filter(Boolean));
}
function srcset_url_equal(element, srcset) {
  if (current_renderer != null)
    return true;
  var element_urls = split_srcset(element.srcset);
  var urls = split_srcset(srcset);
  return urls.length === element_urls.length && urls.every(([url, width], i) => width === element_urls[i][1] && (src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0])));
}
var CLASS, STYLE, IS_CUSTOM_ELEMENT, IS_HTML, LINK_TAG, INPUT_TAG, OPTION_TAG, SELECT_TAG, PROGRESS_TAG, setters_cache, empty_setters;
var init_attributes2 = __esm(() => {
  init_esm_env();
  init_hydration();
  init_utils();
  init_events2();
  init_misc();
  init_warnings();
  init_constants2();
  init_task();
  init_utils3();
  init_runtime();
  init_attachments2();
  init_attributes();
  init_class();
  init_style2();
  init_constants();
  init_effects();
  init_select();
  init_async();
  init_operations();
  init_state();
  CLASS = Symbol("class");
  STYLE = Symbol("style");
  IS_CUSTOM_ELEMENT = Symbol("is custom element");
  IS_HTML = Symbol("is html");
  LINK_TAG = IS_XHTML ? "link" : "LINK";
  INPUT_TAG = IS_XHTML ? "input" : "INPUT";
  OPTION_TAG = IS_XHTML ? "option" : "OPTION";
  SELECT_TAG = IS_XHTML ? "select" : "SELECT";
  PROGRESS_TAG = IS_XHTML ? "progress" : "PROGRESS";
  setters_cache = new Map;
  empty_setters = new Set;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/customizable-select.js
var init_customizable_select = __esm(() => {
  init_hydration();
  init_operations();
  init_reconciler();
  init_attachments2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/document.js
var init_document = __esm(() => {
  init_shared();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
var pending;
var init_input = __esm(() => {
  init_esm_env();
  init_effects();
  init_shared();
  init_errors2();
  init_proxy();
  init_task();
  init_hydration();
  init_runtime();
  init_batch();
  pending = new Set;
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/media.js
var init_media = __esm(() => {
  init_effects();
  init_shared();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/navigator.js
var init_navigator = __esm(() => {
  init_shared();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/props.js
var init_props = __esm(() => {
  init_effects();
  init_utils();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/size.js
var ResizeObserverSingleton;
var init_size = __esm(() => {
  init_effects();
  init_runtime();
  ResizeObserverSingleton = class ResizeObserverSingleton {
    #listeners = new WeakMap;
    #observer;
    #options;
    static entries = new WeakMap;
    constructor(options) {
      this.#options = options;
    }
    observe(element, listener) {
      var listeners = this.#listeners.get(element) || new Set;
      listeners.add(listener);
      this.#listeners.set(element, listeners);
      this.#getObserver().observe(element, this.#options);
      return () => {
        var listeners = this.#listeners.get(element);
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.#listeners.delete(element);
          this.#observer.unobserve(element);
        }
      };
    }
    #getObserver() {
      return this.#observer ?? (this.#observer = new ResizeObserver((entries) => {
        for (var entry of entries) {
          ResizeObserverSingleton.entries.set(entry.target, entry);
          for (var listener of this.#listeners.get(entry.target) || []) {
            listener(entry);
          }
        }
      }));
    }
  };
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
var init_this = __esm(() => {
  init_constants2();
  init_context2();
  init_effects();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/universal.js
var init_universal = __esm(() => {
  init_effects();
  init_shared();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/bindings/window.js
var init_window = __esm(() => {
  init_effects();
  init_shared();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/legacy/event-modifiers.js
var init_event_modifiers = __esm(() => {
  init_utils();
  init_effects();
  init_events2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/legacy/lifecycle.js
var init_lifecycle = __esm(() => {
  init_utils();
  init_context2();
  init_deriveds();
  init_effects();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/legacy/misc.js
var init_misc2 = __esm(() => {
  init_sources();
  init_runtime();
  init_utils();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/store/utils.js
var init_utils4 = __esm(() => {
  init_runtime();
  init_utils();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/store/shared/index.js
var init_shared2 = __esm(() => {
  init_utils();
  init_utils4();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/store.js
function capture_store_binding(fn) {
  var previous_is_store_binding = is_store_binding;
  try {
    is_store_binding = false;
    return [fn(), is_store_binding];
  } finally {
    is_store_binding = previous_is_store_binding;
  }
}
var is_store_binding = false, IS_UNMOUNTED;
var init_store = __esm(() => {
  init_utils4();
  init_shared2();
  init_utils();
  init_runtime();
  init_effects();
  init_sources();
  init_esm_env();
  IS_UNMOUNTED = Symbol("unmounted");
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/reactivity/props.js
function prop(props, key, flags, fallback) {
  var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
  var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
  var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;
  var fallback_value = fallback;
  var fallback_dirty = true;
  var fallback_signal = undefined;
  var get_fallback = () => {
    if (lazy && runes) {
      fallback_signal ??= derived(fallback);
      return get(fallback_signal);
    }
    if (fallback_dirty) {
      fallback_dirty = false;
      fallback_value = lazy ? untrack(fallback) : fallback;
    }
    return fallback_value;
  };
  let setter;
  if (bindable) {
    var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
    setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : undefined);
  }
  var initial_value;
  var is_store_sub = false;
  if (bindable) {
    [initial_value, is_store_sub] = capture_store_binding(() => props[key]);
  } else {
    initial_value = props[key];
  }
  if (initial_value === undefined && fallback !== undefined) {
    initial_value = get_fallback();
    if (setter) {
      if (runes)
        props_invalid_value(key);
      setter(initial_value);
    }
  }
  var getter;
  if (runes) {
    getter = () => {
      var value = props[key];
      if (value === undefined)
        return get_fallback();
      fallback_dirty = true;
      return value;
    };
  } else {
    getter = () => {
      var value = props[key];
      if (value !== undefined) {
        fallback_value = undefined;
      }
      return value === undefined ? fallback_value : value;
    };
  }
  if (runes && (flags & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return function(value, mutation) {
      if (arguments.length > 0) {
        if (!runes || !mutation || legacy_parent || is_store_sub) {
          setter(mutation ? getter() : value);
        }
        return value;
      }
      return getter();
    };
  }
  var overridden = false;
  var d = ((flags & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
    overridden = false;
    return getter();
  });
  if (true_default) {
    d.label = key;
  }
  if (bindable)
    get(d);
  var parent_effect = active_effect;
  return function(value, mutation) {
    if (arguments.length > 0) {
      const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
      set(d, new_value);
      overridden = true;
      if (fallback_value !== undefined) {
        fallback_value = new_value;
      }
      return value;
    }
    if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
      return d.v;
    }
    return get(d);
  };
}
var init_props2 = __esm(() => {
  init_esm_env();
  init_constants();
  init_utils();
  init_sources();
  init_deriveds();
  init_runtime();
  init_errors2();
  init_constants2();
  init_proxy();
  init_store();
  init_effects();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/validate.js
var init_validate2 = __esm(() => {
  init_context2();
  init_constants();
  init_effects();
  init_warnings();
  init_store();
  init_async();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/legacy/legacy-client.js
function createClassComponent(options) {
  return new Svelte4Component(options);
}

class Svelte4Component {
  #events;
  #instance;
  constructor(options) {
    var sources = new Map;
    var add_source = (key, value) => {
      var s = mutable_source(value, false, false);
      sources.set(key, s);
      return s;
    };
    const props = new Proxy({ ...options.props || {}, $$events: {} }, {
      get(target, prop) {
        return get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
      },
      has(target, prop) {
        if (prop === LEGACY_PROPS)
          return true;
        get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
        return Reflect.has(target, prop);
      },
      set(target, prop, value) {
        set(sources.get(prop) ?? add_source(prop, value), value);
        return Reflect.set(target, prop, value);
      }
    });
    const render_options = {
      target: options.target,
      anchor: options.anchor,
      props,
      context: options.context,
      intro: options.intro ?? false,
      recover: options.recover,
      transformError: options.transformError
    };
    this.#instance = options.hydrate ? hydrate(options.component, render_options) : mount(options.component, render_options);
    if (!async_mode_flag && (!options?.props?.$$host || options.sync === false)) {
      flushSync();
    }
    this.#events = props.$$events;
    for (const key of Object.keys(this.#instance)) {
      if (key === "$set" || key === "$destroy" || key === "$on")
        continue;
      define_property(this, key, {
        get() {
          return this.#instance[key];
        },
        set(value) {
          this.#instance[key] = value;
        },
        enumerable: true
      });
    }
    this.#instance.$set = (next) => {
      Object.assign(props, next);
    };
    this.#instance.$destroy = () => {
      unmount(this.#instance);
    };
  }
  $set(props) {
    this.#instance.$set(props);
  }
  $on(event, callback) {
    this.#events[event] = this.#events[event] || [];
    const cb = (...args) => callback.call(this, ...args);
    this.#events[event].push(cb);
    return () => {
      this.#events[event] = this.#events[event].filter((fn) => fn !== cb);
    };
  }
  $destroy() {
    this.#instance.$destroy();
  }
}
var init_legacy_client = __esm(() => {
  init_constants2();
  init_effects();
  init_sources();
  init_render();
  init_runtime();
  init_batch();
  init_utils();
  init_errors2();
  init_warnings();
  init_esm_env();
  init_constants();
  init_context2();
  init_status();
  init_event_modifiers();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dom/elements/custom-element.js
function get_custom_element_value(prop, value, props_definition, transform) {
  const type = props_definition[prop]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}
function get_custom_elements_slots(element) {
  const result = {};
  element.childNodes.forEach((node) => {
    result[node.slot || "default"] = true;
  });
  return result;
}
var SvelteElement;
var init_custom_element = __esm(() => {
  init_legacy_client();
  init_effects();
  init_template();
  init_utils();
  init_operations();
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      $$ctor;
      $$s;
      $$c;
      $$cn = false;
      $$d = {};
      $$r = false;
      $$p_d = {};
      $$l = {};
      $$l_u = new Map;
      $$me;
      $$shadowRoot = null;
      constructor($$componentCtor, $$slots, shadow_root_init) {
        super();
        this.$$ctor = $$componentCtor;
        this.$$s = $$slots;
        if (shadow_root_init) {
          this.$$shadowRoot = this.attachShadow(shadow_root_init);
        }
      }
      addEventListener(type, listener, options) {
        this.$$l[type] = this.$$l[type] || [];
        this.$$l[type].push(listener);
        if (this.$$c) {
          const unsub = this.$$c.$on(type, listener);
          this.$$l_u.set(listener, unsub);
        }
        super.addEventListener(type, listener, options);
      }
      removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
        if (this.$$c) {
          const unsub = this.$$l_u.get(listener);
          if (unsub) {
            unsub();
            this.$$l_u.delete(listener);
          }
        }
      }
      async connectedCallback() {
        this.$$cn = true;
        if (!this.$$c) {
          let create_slot = function(name) {
            return (anchor) => {
              const slot = create_element("slot");
              if (name !== "default")
                slot.name = name;
              append(anchor, slot);
            };
          };
          await Promise.resolve();
          if (!this.$$cn || this.$$c) {
            return;
          }
          const $$slots = {};
          const existing_slots = get_custom_elements_slots(this);
          for (const name of this.$$s) {
            if (name in existing_slots) {
              if (name === "default" && !this.$$d.children) {
                this.$$d.children = create_slot(name);
                $$slots.default = true;
              } else {
                $$slots[name] = create_slot(name);
              }
            }
          }
          for (const attribute of this.attributes) {
            const name = this.$$g_p(attribute.name);
            if (!(name in this.$$d)) {
              this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
            }
          }
          for (const key in this.$$p_d) {
            if (!(key in this.$$d) && this[key] !== undefined) {
              this.$$d[key] = this[key];
              delete this[key];
            }
          }
          this.$$c = createClassComponent({
            component: this.$$ctor,
            target: this.$$shadowRoot || this,
            props: {
              ...this.$$d,
              $$slots,
              $$host: this
            }
          });
          this.$$me = effect_root(() => {
            render_effect(() => {
              this.$$r = true;
              for (const key of object_keys(this.$$c)) {
                if (!this.$$p_d[key]?.reflect)
                  continue;
                this.$$d[key] = this.$$c[key];
                const attribute_value = get_custom_element_value(key, this.$$d[key], this.$$p_d, "toAttribute");
                if (attribute_value == null) {
                  this.removeAttribute(this.$$p_d[key].attribute || key);
                } else {
                  this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
                }
              }
              this.$$r = false;
            });
          });
          for (const type in this.$$l) {
            for (const listener of this.$$l[type]) {
              const unsub = this.$$c.$on(type, listener);
              this.$$l_u.set(listener, unsub);
            }
          }
          this.$$l = {};
        }
      }
      attributeChangedCallback(attr, _oldValue, newValue) {
        if (this.$$r)
          return;
        attr = this.$$g_p(attr);
        this.$$d[attr] = get_custom_element_value(attr, newValue, this.$$p_d, "toProp");
        this.$$c?.$set({ [attr]: this.$$d[attr] });
      }
      disconnectedCallback() {
        this.$$cn = false;
        Promise.resolve().then(() => {
          if (!this.$$cn && this.$$c) {
            this.$$c.$destroy();
            this.$$me();
            this.$$c = undefined;
          }
        });
      }
      $$g_p(attribute_name) {
        return object_keys(this.$$p_d).find((key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name) || attribute_name;
      }
    };
  }
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/dev/console-log.js
var init_console_log = __esm(() => {
  init_constants2();
  init_clone();
  init_warnings();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/client/index.js
var init_client = __esm(() => {
  init_attachments();
  init_constants();
  init_context2();
  init_assign();
  init_css();
  init_elements();
  init_hmr();
  init_ownership();
  init_legacy2();
  init_tracing();
  init_inspect();
  init_async2();
  init_validation();
  init_await();
  init_if();
  init_key();
  init_css_props();
  init_each();
  init_html();
  init_slot();
  init_snippet();
  init_svelte_component();
  init_svelte_element();
  init_svelte_head();
  init_css2();
  init_actions();
  init_attachments2();
  init_attributes2();
  init_class();
  init_events2();
  init_misc();
  init_customizable_select();
  init_style2();
  init_transitions();
  init_document();
  init_input();
  init_media();
  init_navigator();
  init_props();
  init_select();
  init_size();
  init_this();
  init_universal();
  init_window();
  init_hydration();
  init_event_modifiers();
  init_lifecycle();
  init_misc2();
  init_template();
  init_async();
  init_batch();
  init_deriveds();
  init_effects();
  init_sources();
  init_props2();
  init_store();
  init_boundary();
  init_legacy();
  init_render();
  init_runtime();
  init_validate2();
  init_timing();
  init_proxy();
  init_custom_element();
  init_operations();
  init_attributes();
  init_clone();
  init_utils();
  init_validate();
  init_equality();
  init_console_log();
  init_state();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/date.js
var init_date = __esm(() => {
  init_client();
  init_sources();
  init_tracing();
  init_runtime();
  init_esm_env();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/set.js
var init_set = __esm(() => {
  init_esm_env();
  init_sources();
  init_tracing();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/map.js
var init_map = __esm(() => {
  init_esm_env();
  init_sources();
  init_tracing();
  init_runtime();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/url-search-params.js
var REPLACE;
var init_url_search_params = __esm(() => {
  init_esm_env();
  init_sources();
  init_tracing();
  init_runtime();
  init_url();
  REPLACE = Symbol("replace");
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/url.js
var init_url = __esm(() => {
  init_esm_env();
  init_sources();
  init_tracing();
  init_runtime();
  init_url_search_params();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/events/index.js
var init_events3 = __esm(() => {
  init_events2();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/reactive-value.js
var init_reactive_value = __esm(() => {
  init_create_subscriber();
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/media-query.js
var non_parenthesized_keywords;
var init_media_query = __esm(() => {
  init_events3();
  init_reactive_value();
  non_parenthesized_keywords = new Set(["all", "print", "screen", "and", "or", "not", "only"]);
});

// ../gpuix-fractalsvelte/node_modules/svelte/src/reactivity/index-client.js
var init_index_client2 = __esm(() => {
  init_date();
  init_set();
  init_map();
  init_url();
  init_url_search_params();
  init_media_query();
  init_create_subscriber();
});

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/dist/host-runtime.js
function readWindowSize(renderer) {
  try {
    const size = renderer?.getWindowSize?.();
    if (size && size.width > 0 && size.height > 0)
      return { ...size };
  } catch {}
  return DEFAULT_WINDOW_SIZE;
}
function readWindowInsets(renderer) {
  let size = DEFAULT_WINDOW_SIZE;
  let insets = {
    safeArea: ZERO_EDGES,
    ime: ZERO_EDGES,
    effective: ZERO_EDGES
  };
  try {
    size = renderer?.getWindowSize?.() ?? size;
    insets = renderer?.getWindowInsets?.() ?? insets;
  } catch {}
  return {
    ...insets,
    keyboardTop: size.height - insets.ime.bottom,
    keyboardVisible: insets.ime.bottom > 0,
    visibleHeight: size.height - insets.effective.top - insets.effective.bottom
  };
}
function sameWindowSize(left, right) {
  return left.width === right.width && left.height === right.height;
}
function sameEdges(left, right) {
  return left.top === right.top && left.right === right.right && left.bottom === right.bottom && left.left === right.left;
}
function sameWindowInsets(left, right) {
  return left.keyboardTop === right.keyboardTop && left.keyboardVisible === right.keyboardVisible && left.visibleHeight === right.visibleHeight && sameEdges(left.safeArea, right.safeArea) && sameEdges(left.ime, right.ime) && sameEdges(left.effective, right.effective);
}
function observe(read, same, callback, options) {
  let current = read();
  callback(current);
  if (options.intervalMs === false)
    return () => {};
  const timer = setInterval(() => {
    const next = read();
    if (same(current, next))
      return;
    current = next;
    callback(next);
  }, Math.max(16, options.intervalMs ?? 100));
  return () => clearInterval(timer);
}
function observeWindowSize(renderer, callback, options = {}) {
  return observe(() => readWindowSize(renderer), sameWindowSize, callback, options);
}
function observeWindowInsets(renderer, callback, options = {}) {
  return observe(() => readWindowInsets(renderer), sameWindowInsets, callback, options);
}
var DEFAULT_WINDOW_SIZE, ZERO_EDGES;
var init_host_runtime = __esm(() => {
  DEFAULT_WINDOW_SIZE = { width: 800, height: 600 };
  ZERO_EDGES = { top: 0, right: 0, bottom: 0, left: 0 };
});

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/dist/mutations.js
var EVENT_PROPS, EVENT_PROP_NAMES, RESERVED_PROPS, BUILT_IN_TYPES, UNIVERSAL_PROPS2;
var init_mutations = __esm(() => {
  EVENT_PROPS = [
    ["onToggleFile", "toggleFile"],
    ["onShowMore", "showMore"],
    ["onLineClick", "lineClick"],
    ["onLinkClick", "linkClick"],
    ["onVisibleRange", "visibleRange"],
    ["onHighlight", "highlight"],
    ["onMotionComplete", "motionComplete"],
    ["onChange", "change"],
    ["onSubmit", "submit"],
    ["onClick", "click"],
    ["onAuxClick", "auxClick"],
    ["onMouseDown", "mouseDown"],
    ["onMouseUp", "mouseUp"],
    ["onMouseEnter", "mouseEnter"],
    ["onMouseLeave", "mouseLeave"],
    ["onMouseMove", "mouseMove"],
    ["onMouseDownOutside", "mouseDownOutside"],
    ["onKeyDown", "keyDown"],
    ["onKeyUp", "keyUp"],
    ["onFocus", "focus"],
    ["onBlur", "blur"],
    ["onScroll", "scroll"],
    ["onFileDrop", "fileDrop"]
  ];
  EVENT_PROP_NAMES = new Set(EVENT_PROPS.map(([name]) => name));
  RESERVED_PROPS = new Set([
    "style",
    "className",
    "children",
    "key",
    "ref"
  ]);
  BUILT_IN_TYPES = new Set(["div", "text"]);
  UNIVERSAL_PROPS2 = new Set([
    "autoFocus",
    "tabIndex",
    "motion",
    "testId",
    "highlight",
    "role",
    "aria-label",
    "aria-description",
    "aria-id",
    "aria-expanded",
    "aria-selected",
    "aria-valuetext",
    "aria-level"
  ]);
});

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/dist/renderer-state.js
var STATE_KEY;
var init_renderer_state = __esm(() => {
  STATE_KEY = Symbol.for("@gpuix/native/renderer-states");
});

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/dist/host.js
var init_host = __esm(() => {
  init_host_runtime();
  init_mutations();
  init_renderer_state();
});

// ../gpuix-fractalsvelte/src/window.ts
function with_native_id(node, call) {
  if (node == null)
    return;
  const id = typeof node === "object" && "nativeId" in node ? node.nativeId : null;
  if (id != null)
    call(id);
}
function focus_element(node) {
  with_native_id(node, (id) => win()?.focusElement?.(id));
}
function set_debug_overlay(mode) {
  if (!OVERLAY_MODES.has(mode)) {
    if (!warned_overlays.has(mode)) {
      warned_overlays.add(mode);
      console.warn(`[gpuix-fractalsvelte] unknown debug frame overlay "${mode}", expected hidden, minimal or full`);
    }
    return;
  }
  return win()?.setDebugFrameOverlay?.(mode);
}
function polled(read, observe) {
  let value;
  let live = false;
  const subscribe = createSubscriber((update) => {
    const stop = observe(geometry, (next) => {
      value = next;
      if (live)
        update();
    });
    live = true;
    return () => {
      stop();
      live = false;
    };
  });
  return () => {
    subscribe();
    return live ? value : read(geometry);
  };
}
var rendererMod = null, win = () => globalThis.__gpui_native ?? globalThis.__gpui_renderer ?? rendererMod?.get_native?.(), OVERLAY_MODES, warned_overlays, geometry, size, insets2;
var init_window2 = __esm(() => {
  init_index_client2();
  init_host();
  OVERLAY_MODES = new Set(["hidden", "minimal", "full"]);
  warned_overlays = new Set;
  geometry = {
    getWindowSize: () => win()?.getWindowSize?.(),
    getWindowInsets: () => win()?.getWindowInsets?.()
  };
  size = polled(readWindowSize, observeWindowSize);
  insets2 = polled(readWindowInsets, observeWindowInsets);
});

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/wasm/gpuix-web.js
class GpuixRenderer {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    GpuixRendererFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_gpuixrenderer_free(ptr, 0);
  }
  applyBatch(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_applyBatch(this.__wbg_ptr, ptr0, len0);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  blur() {
    const ret2 = wasm.gpuixrenderer_blur(this.__wbg_ptr);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  clearSelection() {
    wasm.gpuixrenderer_clearSelection(this.__wbg_ptr);
  }
  clockFastForward(delta_ms) {
    const ret2 = wasm.gpuixrenderer_clockFastForward(this.__wbg_ptr, delta_ms);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return ret2[0];
  }
  clockPause() {
    const ret2 = wasm.gpuixrenderer_clockPause(this.__wbg_ptr);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return ret2[0];
  }
  clockResume() {
    const ret2 = wasm.gpuixrenderer_clockResume(this.__wbg_ptr);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return ret2[0];
  }
  clockSet(now_ms) {
    const ret2 = wasm.gpuixrenderer_clockSet(this.__wbg_ptr, now_ms);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return ret2[0];
  }
  focusElement(element_id) {
    const ret2 = wasm.gpuixrenderer_focusElement(this.__wbg_ptr, element_id);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  focusNext() {
    const ret2 = wasm.gpuixrenderer_focusNext(this.__wbg_ptr);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  focusNextWithin(element_id) {
    const ret2 = wasm.gpuixrenderer_focusNextWithin(this.__wbg_ptr, element_id);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  focusPrevious() {
    const ret2 = wasm.gpuixrenderer_focusPrevious(this.__wbg_ptr);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  focusPreviousWithin(element_id) {
    const ret2 = wasm.gpuixrenderer_focusPreviousWithin(this.__wbg_ptr, element_id);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  getAllText() {
    const ret2 = wasm.gpuixrenderer_getAllText(this.__wbg_ptr);
    return ret2;
  }
  getAutomationTree() {
    let deferred2_0;
    let deferred2_1;
    try {
      const ret2 = wasm.gpuixrenderer_getAutomationTree(this.__wbg_ptr);
      var ptr1 = ret2[0];
      var len1 = ret2[1];
      if (ret2[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret2[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free_command_export(deferred2_0, deferred2_1, 1);
    }
  }
  getDebugFrameOverlay() {
    let deferred2_0;
    let deferred2_1;
    try {
      const ret2 = wasm.gpuixrenderer_getDebugFrameOverlay(this.__wbg_ptr);
      var ptr1 = ret2[0];
      var len1 = ret2[1];
      if (ret2[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret2[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free_command_export(deferred2_0, deferred2_1, 1);
    }
  }
  getElementBounds(element_id) {
    const ret2 = wasm.gpuixrenderer_getElementBounds(this.__wbg_ptr, element_id);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  getFocusedElementId() {
    const ret2 = wasm.gpuixrenderer_getFocusedElementId(this.__wbg_ptr);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  getListScrollTop(element_id) {
    const ret2 = wasm.gpuixrenderer_getListScrollTop(this.__wbg_ptr, element_id);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  getPaintedHighlights() {
    const ret2 = wasm.gpuixrenderer_getPaintedHighlights(this.__wbg_ptr);
    return ret2;
  }
  getPaintedText() {
    const ret2 = wasm.gpuixrenderer_getPaintedText(this.__wbg_ptr);
    return ret2;
  }
  getScrollOffset(element_id) {
    const ret2 = wasm.gpuixrenderer_getScrollOffset(this.__wbg_ptr, element_id);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  getSelectedText() {
    const ret2 = wasm.gpuixrenderer_getSelectedText(this.__wbg_ptr);
    return ret2;
  }
  getWindowInsets() {
    const ret2 = wasm.gpuixrenderer_getWindowInsets(this.__wbg_ptr);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  getWindowSize() {
    const ret2 = wasm.gpuixrenderer_getWindowSize(this.__wbg_ptr);
    if (ret2[2]) {
      throw takeFromExternrefTable0(ret2[1]);
    }
    return takeFromExternrefTable0(ret2[0]);
  }
  init(_options) {
    const ret2 = wasm.gpuixrenderer_init(this.__wbg_ptr, _options);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  isInitialized() {
    const ret2 = wasm.gpuixrenderer_isInitialized(this.__wbg_ptr);
    return ret2 !== 0;
  }
  constructor(event_callback) {
    const ret2 = wasm.gpuixrenderer_new(event_callback);
    this.__wbg_ptr = ret2;
    GpuixRendererFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  promptForPaths(_options) {
    const ret2 = wasm.gpuixrenderer_promptForPaths(this.__wbg_ptr, _options);
    return ret2;
  }
  requiresTick() {
    const ret2 = wasm.gpuixrenderer_requiresTick(this.__wbg_ptr);
    return ret2 !== 0;
  }
  scrollIntoView(element_id) {
    const ret2 = wasm.gpuixrenderer_scrollIntoView(this.__wbg_ptr, element_id);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  scrollTo(element_id, x, y) {
    const ret2 = wasm.gpuixrenderer_scrollTo(this.__wbg_ptr, element_id, x, y);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  scrollToItem(element_id, index, offset_in_item) {
    const ret2 = wasm.gpuixrenderer_scrollToItem(this.__wbg_ptr, element_id, index, !isLikeNone(offset_in_item), isLikeNone(offset_in_item) ? 0 : offset_in_item);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  setDebugFrameOverlay(mode) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(mode, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len0 = WASM_VECTOR_LEN;
      const ret2 = wasm.gpuixrenderer_setDebugFrameOverlay(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret2[0];
      var len2 = ret2[1];
      if (ret2[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret2[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free_command_export(deferred3_0, deferred3_1, 1);
    }
  }
  setImage(element_id, bytes) {
    const ret2 = wasm.gpuixrenderer_setImage(this.__wbg_ptr, element_id, bytes);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  setImagePixels(element_id, width, height, pixels) {
    const ret2 = wasm.gpuixrenderer_setImagePixels(this.__wbg_ptr, element_id, width, height, pixels);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  setWindowKeyEvents(key_down, key_up, event_id) {
    const ret2 = wasm.gpuixrenderer_setWindowKeyEvents(this.__wbg_ptr, key_down, key_up, event_id);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  setWindowSelectionChange(enabled, event_id) {
    const ret2 = wasm.gpuixrenderer_setWindowSelectionChange(this.__wbg_ptr, enabled, event_id);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  setWindowTitle(title) {
    const ptr0 = passStringToWasm0(title, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_setWindowTitle(this.__wbg_ptr, ptr0, len0);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  simulateClick(x, y, button, modifiers) {
    var ptr0 = isLikeNone(modifiers) ? 0 : passStringToWasm0(modifiers, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_simulateClick(this.__wbg_ptr, x, y, isLikeNone(button) ? Number.MAX_SAFE_INTEGER : button >>> 0, ptr0, len0);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  simulateMouseDown(x, y, button, modifiers) {
    var ptr0 = isLikeNone(modifiers) ? 0 : passStringToWasm0(modifiers, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_simulateMouseDown(this.__wbg_ptr, x, y, isLikeNone(button) ? Number.MAX_SAFE_INTEGER : button >>> 0, ptr0, len0);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  simulateMouseMove(x, y, pressed_button, modifiers) {
    var ptr0 = isLikeNone(modifiers) ? 0 : passStringToWasm0(modifiers, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_simulateMouseMove(this.__wbg_ptr, x, y, isLikeNone(pressed_button) ? Number.MAX_SAFE_INTEGER : pressed_button >>> 0, ptr0, len0);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  simulateMouseUp(x, y, button, modifiers) {
    var ptr0 = isLikeNone(modifiers) ? 0 : passStringToWasm0(modifiers, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_simulateMouseUp(this.__wbg_ptr, x, y, isLikeNone(button) ? Number.MAX_SAFE_INTEGER : button >>> 0, ptr0, len0);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  simulateScrollWheel(x, y, delta_x, delta_y, modifiers) {
    var ptr0 = isLikeNone(modifiers) ? 0 : passStringToWasm0(modifiers, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len0 = WASM_VECTOR_LEN;
    const ret2 = wasm.gpuixrenderer_simulateScrollWheel(this.__wbg_ptr, x, y, delta_x, delta_y, ptr0, len0);
    if (ret2[1]) {
      throw takeFromExternrefTable0(ret2[0]);
    }
  }
  tick() {
    wasm.gpuixrenderer_tick(this.__wbg_ptr);
  }
}
function wasm_thread_entry_point(ptr) {
  wasm.wasm_thread_entry_point(ptr);
}
function __wbg_get_imports(memory) {
  const import0 = {
    __proto__: null,
    __wbg_Window_a07901001eb4269f: function(arg02) {
      const ret2 = arg02.Window;
      return ret2;
    },
    __wbg_WorkerGlobalScope_d1b9459d53a39f3d: function(arg02) {
      const ret2 = arg02.WorkerGlobalScope;
      return ret2;
    },
    __wbg___wbindgen_boolean_get_c9c83ebd41b34df3: function(arg02) {
      const v = arg02;
      const ret2 = typeof v === "boolean" ? v : undefined;
      return isLikeNone(ret2) ? 16777215 : ret2 ? 1 : 0;
    },
    __wbg___wbindgen_debug_string_a57024b9c6e4a48b: function(arg02, arg12) {
      const ret2 = debugString(arg12);
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_is_function_5e4570eb24ffa122: function(arg02) {
      const ret2 = typeof arg02 === "function";
      return ret2;
    },
    __wbg___wbindgen_is_null_7d13f41e1a2d5140: function(arg02) {
      const ret2 = arg02 === null;
      return ret2;
    },
    __wbg___wbindgen_is_undefined_6cff064c44e0d823: function(arg02) {
      const ret2 = arg02 === undefined;
      return ret2;
    },
    __wbg___wbindgen_memory_5dc2a138835b0f8e: function() {
      const ret2 = wasm.memory;
      return ret2;
    },
    __wbg___wbindgen_module_d70c256490b5f616: function() {
      const ret2 = wasmModule;
      return ret2;
    },
    __wbg___wbindgen_number_get_136b9679cab35cfb: function(arg02, arg12) {
      const obj = arg12;
      const ret2 = typeof obj === "number" ? obj : undefined;
      getDataViewMemory0().setFloat64(arg02 + 8 * 1, isLikeNone(ret2) ? 0 : ret2, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, !isLikeNone(ret2), true);
    },
    __wbg___wbindgen_rethrow_fbd2dcd7d2b9ac5f: function(arg02) {
      throw arg02;
    },
    __wbg___wbindgen_string_get_d154f1e671052120: function(arg02, arg12) {
      const obj = arg12;
      const ret2 = typeof obj === "string" ? obj : undefined;
      var ptr1 = isLikeNone(ret2) ? 0 : passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg02, arg12) {
      throw new Error(getStringFromWasm0(arg02, arg12));
    },
    __wbg__wbg_cb_unref_be22cc64ae6946a0: function(arg02) {
      arg02._wbg_cb_unref();
    },
    __wbg_activeTexture_8e65ac2e8d488478: function(arg02, arg12) {
      arg02.activeTexture(arg12 >>> 0);
    },
    __wbg_activeTexture_fd6262686afdbe2f: function(arg02, arg12) {
      arg02.activeTexture(arg12 >>> 0);
    },
    __wbg_addEventListener_3b8edc02c33d9f77: function() {
      return handleError(function(arg02, arg12, arg2, arg3) {
        arg02.addEventListener(getStringFromWasm0(arg12, arg2), arg3);
      }, arguments);
    },
    __wbg_altKey_753fdbc251308d47: function(arg02) {
      const ret2 = arg02.altKey;
      return ret2;
    },
    __wbg_altKey_755975127b4ad2c8: function(arg02) {
      const ret2 = arg02.altKey;
      return ret2;
    },
    __wbg_appendChild_d5cbce3d5fa81471: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.appendChild(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_arrayBuffer_393639d72165e90f: function(arg02) {
      const ret2 = arg02.arrayBuffer();
      return ret2;
    },
    __wbg_async_a8daea0f547e8eaa: function(arg02) {
      const ret2 = arg02.async;
      return ret2;
    },
    __wbg_attachShader_26751604f00d1f1b: function(arg02, arg12, arg2) {
      arg02.attachShader(arg12, arg2);
    },
    __wbg_attachShader_61baa58641ea664a: function(arg02, arg12, arg2) {
      arg02.attachShader(arg12, arg2);
    },
    __wbg_beginQuery_444a51812fdbf958: function(arg02, arg12, arg2) {
      arg02.beginQuery(arg12 >>> 0, arg2);
    },
    __wbg_beginRenderPass_10e1d8bb36f2f74e: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.beginRenderPass(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_bindAttribLocation_1e182a50e1556784: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.bindAttribLocation(arg12, arg2 >>> 0, getStringFromWasm0(arg3, arg4));
    },
    __wbg_bindAttribLocation_9cc5ab15df1d042d: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.bindAttribLocation(arg12, arg2 >>> 0, getStringFromWasm0(arg3, arg4));
    },
    __wbg_bindBufferRange_5a8d28ef662d8746: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.bindBufferRange(arg12 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
    },
    __wbg_bindBuffer_1fb12d083d2a22af: function(arg02, arg12, arg2) {
      arg02.bindBuffer(arg12 >>> 0, arg2);
    },
    __wbg_bindBuffer_31cb159ab5dc5ba7: function(arg02, arg12, arg2) {
      arg02.bindBuffer(arg12 >>> 0, arg2);
    },
    __wbg_bindFramebuffer_32ce672324ce8a16: function(arg02, arg12, arg2) {
      arg02.bindFramebuffer(arg12 >>> 0, arg2);
    },
    __wbg_bindFramebuffer_e620067056f9316f: function(arg02, arg12, arg2) {
      arg02.bindFramebuffer(arg12 >>> 0, arg2);
    },
    __wbg_bindRenderbuffer_765cffe23b9c36f7: function(arg02, arg12, arg2) {
      arg02.bindRenderbuffer(arg12 >>> 0, arg2);
    },
    __wbg_bindRenderbuffer_9b313332bd7aa049: function(arg02, arg12, arg2) {
      arg02.bindRenderbuffer(arg12 >>> 0, arg2);
    },
    __wbg_bindSampler_28b0a4c34c6f96d4: function(arg02, arg12, arg2) {
      arg02.bindSampler(arg12 >>> 0, arg2);
    },
    __wbg_bindTexture_4c54ffb64c33564f: function(arg02, arg12, arg2) {
      arg02.bindTexture(arg12 >>> 0, arg2);
    },
    __wbg_bindTexture_6fe86367f6be8f59: function(arg02, arg12, arg2) {
      arg02.bindTexture(arg12 >>> 0, arg2);
    },
    __wbg_bindVertexArrayOES_96a4898652eac0d8: function(arg02, arg12) {
      arg02.bindVertexArrayOES(arg12);
    },
    __wbg_bindVertexArray_0185d931d681d806: function(arg02, arg12) {
      arg02.bindVertexArray(arg12);
    },
    __wbg_blendColor_402572bc445d3ac3: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.blendColor(arg12, arg2, arg3, arg4);
    },
    __wbg_blendColor_af92968fedc595b1: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.blendColor(arg12, arg2, arg3, arg4);
    },
    __wbg_blendEquationSeparate_5ab35e46e7f48717: function(arg02, arg12, arg2) {
      arg02.blendEquationSeparate(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_blendEquationSeparate_9ad084e8266b8e3c: function(arg02, arg12, arg2) {
      arg02.blendEquationSeparate(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_blendEquation_4bab539169e7e865: function(arg02, arg12) {
      arg02.blendEquation(arg12 >>> 0);
    },
    __wbg_blendEquation_502ed4c6af5bf8ee: function(arg02, arg12) {
      arg02.blendEquation(arg12 >>> 0);
    },
    __wbg_blendFuncSeparate_2e4d259caaba517e: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.blendFuncSeparate(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    },
    __wbg_blendFuncSeparate_66688b15ecc6529c: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.blendFuncSeparate(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    },
    __wbg_blendFunc_b7f382e97db2fd5b: function(arg02, arg12, arg2) {
      arg02.blendFunc(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_blendFunc_d908118bbb181928: function(arg02, arg12, arg2) {
      arg02.blendFunc(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_blitFramebuffer_20b32de88a3097b1: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
      arg02.blitFramebuffer(arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
    },
    __wbg_blockSize_7fad8bcc48860290: function(arg02) {
      const ret2 = arg02.blockSize;
      return ret2;
    },
    __wbg_blur_3f0715f311929c30: function() {
      return handleError(function(arg02) {
        arg02.blur();
      }, arguments);
    },
    __wbg_body_d6eca0586d628e3c: function(arg02) {
      const ret2 = arg02.body;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_body_eb2e7e7701fa47ae: function(arg02) {
      const ret2 = arg02.body;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_bufferData_1dd2939db2d88d82: function(arg02, arg12, arg2, arg3) {
      arg02.bufferData(arg12 >>> 0, arg2, arg3 >>> 0);
    },
    __wbg_bufferData_69a44ade0864ba2b: function(arg02, arg12, arg2, arg3) {
      arg02.bufferData(arg12 >>> 0, arg2, arg3 >>> 0);
    },
    __wbg_bufferData_6c10d3e07ec9a2a9: function(arg02, arg12, arg2, arg3) {
      arg02.bufferData(arg12 >>> 0, arg2, arg3 >>> 0);
    },
    __wbg_bufferData_d359d1c797b8e8b7: function(arg02, arg12, arg2, arg3) {
      arg02.bufferData(arg12 >>> 0, arg2, arg3 >>> 0);
    },
    __wbg_bufferSubData_4f6063d50303b61d: function(arg02, arg12, arg2, arg3) {
      arg02.bufferSubData(arg12 >>> 0, arg2, arg3);
    },
    __wbg_bufferSubData_64b69f468a0d3048: function(arg02, arg12, arg2, arg3) {
      arg02.bufferSubData(arg12 >>> 0, arg2, arg3);
    },
    __wbg_buffer_8117fe4dab119813: function(arg02) {
      const ret2 = arg02.buffer;
      return ret2;
    },
    __wbg_button_3963e81aec2b2f60: function(arg02) {
      const ret2 = arg02.button;
      return ret2;
    },
    __wbg_call_0f2a9af232c18fd2: function() {
      return handleError(function(arg02, arg12, arg2, arg3) {
        const ret2 = arg02.call(arg12, arg2, arg3);
        return ret2;
      }, arguments);
    },
    __wbg_call_35dba3c747ad7521: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.call(arg12, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_call_39f824e18d9d2414: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4) {
        const ret2 = arg02.call(arg12, arg2, arg3, arg4);
        return ret2;
      }, arguments);
    },
    __wbg_cancelAnimationFrame_58acec8573d45a99: function() {
      return handleError(function(arg02, arg12) {
        arg02.cancelAnimationFrame(arg12);
      }, arguments);
    },
    __wbg_cancel_9610ed0dbe990e64: function(arg02) {
      const ret2 = arg02.cancel();
      return ret2;
    },
    __wbg_clearBufferfv_ccbb43fb098f1912: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.clearBufferfv(arg12 >>> 0, arg2, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_clearBufferiv_8b1c68299632478f: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.clearBufferiv(arg12 >>> 0, arg2, getArrayI32FromWasm0(arg3, arg4));
    },
    __wbg_clearBufferuiv_cd72147d09d432e8: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.clearBufferuiv(arg12 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4));
    },
    __wbg_clearDepth_887000180cc9eb2e: function(arg02, arg12) {
      arg02.clearDepth(arg12);
    },
    __wbg_clearDepth_c4897278afd894a9: function(arg02, arg12) {
      arg02.clearDepth(arg12);
    },
    __wbg_clearStencil_3d39149452a2f872: function(arg02, arg12) {
      arg02.clearStencil(arg12);
    },
    __wbg_clearStencil_96978923f9c6fb1f: function(arg02, arg12) {
      arg02.clearStencil(arg12);
    },
    __wbg_clearTimeout_4e61cface6c91ad9: function(arg02, arg12) {
      arg02.clearTimeout(arg12);
    },
    __wbg_clear_20f7614cd20df101: function(arg02, arg12) {
      arg02.clear(arg12 >>> 0);
    },
    __wbg_clear_332f205d7e52df87: function(arg02, arg12) {
      arg02.clear(arg12 >>> 0);
    },
    __wbg_clientWaitSync_8800b42d1c534e00: function(arg02, arg12, arg2, arg3) {
      const ret2 = arg02.clientWaitSync(arg12, arg2 >>> 0, arg3 >>> 0);
      return ret2;
    },
    __wbg_clipboardData_05651f46357b67bc: function(arg02) {
      const ret2 = arg02.clipboardData;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_clipboard_4fea7f044e5b8637: function(arg02) {
      const ret2 = arg02.clipboard;
      return ret2;
    },
    __wbg_colorMask_5646450fe1f1b723: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.colorMask(arg12 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    },
    __wbg_colorMask_8fca508f44773327: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.colorMask(arg12 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    },
    __wbg_compileShader_4ede19e4fc1bebce: function(arg02, arg12) {
      arg02.compileShader(arg12);
    },
    __wbg_compileShader_ac457ada9042f08e: function(arg02, arg12) {
      arg02.compileShader(arg12);
    },
    __wbg_compressedTexSubImage2D_0968a85385b7c463: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
      arg02.compressedTexSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8, arg9);
    },
    __wbg_compressedTexSubImage2D_45987d7f0210d36f: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
      arg02.compressedTexSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8);
    },
    __wbg_compressedTexSubImage2D_a39446fce0a68ad9: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
      arg02.compressedTexSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8);
    },
    __wbg_compressedTexSubImage3D_3da84908295b8ec3: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
      arg02.compressedTexSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10, arg11);
    },
    __wbg_compressedTexSubImage3D_c0bc017057e3942a: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
      arg02.compressedTexSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10);
    },
    __wbg_configure_3d64c677c7d68a15: function() {
      return handleError(function(arg02, arg12) {
        arg02.configure(arg12);
      }, arguments);
    },
    __wbg_contentRect_6779e57cdd2e9e83: function(arg02) {
      const ret2 = arg02.contentRect;
      return ret2;
    },
    __wbg_copyBufferSubData_e5dc2aab90456f99: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.copyBufferSubData(arg12 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
    },
    __wbg_copyTexSubImage2D_188da734d1c8aa07: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
      arg02.copyTexSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    },
    __wbg_copyTexSubImage2D_84d99fa40fabace0: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
      arg02.copyTexSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    },
    __wbg_copyTexSubImage3D_89064e67340a38b3: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
      arg02.copyTexSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    },
    __wbg_createBindGroupLayout_9ea1a44942aaf13e: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.createBindGroupLayout(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_createBindGroup_2320df4db188406c: function(arg02, arg12) {
      const ret2 = arg02.createBindGroup(arg12);
      return ret2;
    },
    __wbg_createBuffer_2f08c0205e04efca: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.createBuffer(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_createBuffer_44b37c222efbd326: function(arg02) {
      const ret2 = arg02.createBuffer();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createBuffer_af6c411fe2b091f8: function(arg02) {
      const ret2 = arg02.createBuffer();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createCommandEncoder_cd88faca35d9ed68: function(arg02, arg12) {
      const ret2 = arg02.createCommandEncoder(arg12);
      return ret2;
    },
    __wbg_createElement_7f42344eee7bb810: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.createElement(getStringFromWasm0(arg12, arg2));
        return ret2;
      }, arguments);
    },
    __wbg_createFramebuffer_4dc2fb6bd93463a5: function(arg02) {
      const ret2 = arg02.createFramebuffer();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createFramebuffer_e6d8917bf9291c65: function(arg02) {
      const ret2 = arg02.createFramebuffer();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createObjectURL_da379bd6bf9a91c6: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = URL.createObjectURL(arg12);
        const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
      }, arguments);
    },
    __wbg_createPipelineLayout_7a186f2e9bf0d605: function(arg02, arg12) {
      const ret2 = arg02.createPipelineLayout(arg12);
      return ret2;
    },
    __wbg_createProgram_2ebbd17565e0ede7: function(arg02) {
      const ret2 = arg02.createProgram();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createProgram_81b37242eadef893: function(arg02) {
      const ret2 = arg02.createProgram();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createQuery_5ef5edffbd3a678d: function(arg02) {
      const ret2 = arg02.createQuery();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createRenderPipeline_f48187ba9f7701e8: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.createRenderPipeline(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_createRenderbuffer_be624f81e06a0cfd: function(arg02) {
      const ret2 = arg02.createRenderbuffer();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createRenderbuffer_cd2638d5dda9c277: function(arg02) {
      const ret2 = arg02.createRenderbuffer();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createSampler_248bd67c920af37d: function(arg02, arg12) {
      const ret2 = arg02.createSampler(arg12);
      return ret2;
    },
    __wbg_createSampler_f1aedbf47c21745a: function(arg02) {
      const ret2 = arg02.createSampler();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createShaderModule_53701de4fb271c90: function(arg02, arg12) {
      const ret2 = arg02.createShaderModule(arg12);
      return ret2;
    },
    __wbg_createShader_9a8e5f335caac850: function(arg02, arg12) {
      const ret2 = arg02.createShader(arg12 >>> 0);
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createShader_f8638cf4c19a1d2d: function(arg02, arg12) {
      const ret2 = arg02.createShader(arg12 >>> 0);
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createTexture_42c791197006c64a: function(arg02) {
      const ret2 = arg02.createTexture();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createTexture_9e76b80a2dc0d12e: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.createTexture(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_createTexture_c74740f68b5c2a93: function(arg02) {
      const ret2 = arg02.createTexture();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createVertexArrayOES_f7e8c94194c4e075: function(arg02) {
      const ret2 = arg02.createVertexArrayOES();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createVertexArray_abd18ded26b75653: function(arg02) {
      const ret2 = arg02.createVertexArray();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_createView_cc96b5bdd3d5bf5e: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.createView(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_ctrlKey_8f6cb44d63052c81: function(arg02) {
      const ret2 = arg02.ctrlKey;
      return ret2;
    },
    __wbg_ctrlKey_9490b716a4845258: function(arg02) {
      const ret2 = arg02.ctrlKey;
      return ret2;
    },
    __wbg_cullFace_053fc24c214cae86: function(arg02, arg12) {
      arg02.cullFace(arg12 >>> 0);
    },
    __wbg_cullFace_94e1cd382e8b654f: function(arg02, arg12) {
      arg02.cullFace(arg12 >>> 0);
    },
    __wbg_data_57d8ce4eb5f0a433: function(arg02) {
      const ret2 = arg02.data;
      return ret2;
    },
    __wbg_data_875f40a485a142fe: function(arg02, arg12) {
      const ret2 = arg12.data;
      var ptr1 = isLikeNone(ret2) ? 0 : passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_data_e8364fec9b39caa4: function(arg02) {
      const ret2 = arg02.data;
      return ret2;
    },
    __wbg_deleteBuffer_42bd497a20b76d88: function(arg02, arg12) {
      arg02.deleteBuffer(arg12);
    },
    __wbg_deleteBuffer_50f20219abee4d05: function(arg02, arg12) {
      arg02.deleteBuffer(arg12);
    },
    __wbg_deleteFramebuffer_073235a01c2a0a28: function(arg02, arg12) {
      arg02.deleteFramebuffer(arg12);
    },
    __wbg_deleteFramebuffer_07fcc16563d17920: function(arg02, arg12) {
      arg02.deleteFramebuffer(arg12);
    },
    __wbg_deleteProgram_0191056307686073: function(arg02, arg12) {
      arg02.deleteProgram(arg12);
    },
    __wbg_deleteProgram_ee7f1925cb856dc2: function(arg02, arg12) {
      arg02.deleteProgram(arg12);
    },
    __wbg_deleteQuery_4624acbf9cbfc6e2: function(arg02, arg12) {
      arg02.deleteQuery(arg12);
    },
    __wbg_deleteRenderbuffer_570117534d9608a1: function(arg02, arg12) {
      arg02.deleteRenderbuffer(arg12);
    },
    __wbg_deleteRenderbuffer_ba4a805dfac20358: function(arg02, arg12) {
      arg02.deleteRenderbuffer(arg12);
    },
    __wbg_deleteSampler_527e8d31f81669d9: function(arg02, arg12) {
      arg02.deleteSampler(arg12);
    },
    __wbg_deleteShader_2558228a4ef7373e: function(arg02, arg12) {
      arg02.deleteShader(arg12);
    },
    __wbg_deleteShader_413961eb94f5c67c: function(arg02, arg12) {
      arg02.deleteShader(arg12);
    },
    __wbg_deleteSync_11f80510355180d6: function(arg02, arg12) {
      arg02.deleteSync(arg12);
    },
    __wbg_deleteTexture_0ccd278d6db819ff: function(arg02, arg12) {
      arg02.deleteTexture(arg12);
    },
    __wbg_deleteTexture_aadf9716c394d7be: function(arg02, arg12) {
      arg02.deleteTexture(arg12);
    },
    __wbg_deleteVertexArrayOES_e43a9a425587d52b: function(arg02, arg12) {
      arg02.deleteVertexArrayOES(arg12);
    },
    __wbg_deleteVertexArray_106030034355d246: function(arg02, arg12) {
      arg02.deleteVertexArray(arg12);
    },
    __wbg_deltaMode_1eedd4132dd540ba: function(arg02) {
      const ret2 = arg02.deltaMode;
      return ret2;
    },
    __wbg_deltaX_9df7ccb6bdd1b836: function(arg02) {
      const ret2 = arg02.deltaX;
      return ret2;
    },
    __wbg_deltaY_13780a1f1e6d6f8c: function(arg02) {
      const ret2 = arg02.deltaY;
      return ret2;
    },
    __wbg_depthFunc_6c6f948417f5bde4: function(arg02, arg12) {
      arg02.depthFunc(arg12 >>> 0);
    },
    __wbg_depthFunc_bb3152f635a60ff2: function(arg02, arg12) {
      arg02.depthFunc(arg12 >>> 0);
    },
    __wbg_depthMask_4e0075e07739355b: function(arg02, arg12) {
      arg02.depthMask(arg12 !== 0);
    },
    __wbg_depthMask_bdc57b9e64c6b4d8: function(arg02, arg12) {
      arg02.depthMask(arg12 !== 0);
    },
    __wbg_depthRange_0acaf3031a92d51d: function(arg02, arg12, arg2) {
      arg02.depthRange(arg12, arg2);
    },
    __wbg_depthRange_e2d0a59942d33efd: function(arg02, arg12, arg2) {
      arg02.depthRange(arg12, arg2);
    },
    __wbg_description_18d0a6d4077fec8e: function(arg02, arg12) {
      const ret2 = arg12.description;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_destroy_6601bc024448d3c7: function(arg02) {
      arg02.destroy();
    },
    __wbg_destroy_b5b39f25f0799295: function(arg02) {
      arg02.destroy();
    },
    __wbg_devicePixelContentBoxSize_95d643903e292efa: function(arg02) {
      const ret2 = arg02.devicePixelContentBoxSize;
      return ret2;
    },
    __wbg_devicePixelRatio_e60a2d12bfd01f78: function(arg02) {
      const ret2 = arg02.devicePixelRatio;
      return ret2;
    },
    __wbg_disableVertexAttribArray_98752beca840c3da: function(arg02, arg12) {
      arg02.disableVertexAttribArray(arg12 >>> 0);
    },
    __wbg_disableVertexAttribArray_aee51b7f1a8ef4cc: function(arg02, arg12) {
      arg02.disableVertexAttribArray(arg12 >>> 0);
    },
    __wbg_disable_2ad210ba5315372a: function(arg02, arg12) {
      arg02.disable(arg12 >>> 0);
    },
    __wbg_disable_bb1df5a6c75eaecd: function(arg02, arg12) {
      arg02.disable(arg12 >>> 0);
    },
    __wbg_disconnect_0f608ec00c13c91e: function(arg02) {
      arg02.disconnect();
    },
    __wbg_document_ac38448dbfd31a57: function(arg02) {
      const ret2 = arg02.document;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_drawArraysInstancedANGLE_cb3b87925641d5b9: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.drawArraysInstancedANGLE(arg12 >>> 0, arg2, arg3, arg4);
    },
    __wbg_drawArraysInstanced_45317b22bbf7ffe8: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.drawArraysInstanced(arg12 >>> 0, arg2, arg3, arg4);
    },
    __wbg_drawArrays_02c354e377984441: function(arg02, arg12, arg2, arg3) {
      arg02.drawArrays(arg12 >>> 0, arg2, arg3);
    },
    __wbg_drawArrays_b2004a40c212065c: function(arg02, arg12, arg2, arg3) {
      arg02.drawArrays(arg12 >>> 0, arg2, arg3);
    },
    __wbg_drawBuffersWEBGL_0b4935290cba977e: function(arg02, arg12) {
      arg02.drawBuffersWEBGL(arg12);
    },
    __wbg_drawBuffers_f07f796e50bb0077: function(arg02, arg12) {
      arg02.drawBuffers(arg12);
    },
    __wbg_drawElementsInstancedANGLE_8179cb41f5862831: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.drawElementsInstancedANGLE(arg12 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    },
    __wbg_drawElementsInstanced_07717eeb890435e9: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.drawElementsInstanced(arg12 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    },
    __wbg_draw_ad0811de56a2d768: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.draw(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    },
    __wbg_enableVertexAttribArray_90f1a9f570379c36: function(arg02, arg12) {
      arg02.enableVertexAttribArray(arg12 >>> 0);
    },
    __wbg_enableVertexAttribArray_b072ffcbe4f26e2b: function(arg02, arg12) {
      arg02.enableVertexAttribArray(arg12 >>> 0);
    },
    __wbg_enable_17346ff3b2257cae: function(arg02, arg12) {
      arg02.enable(arg12 >>> 0);
    },
    __wbg_enable_db1e433ea267f29b: function(arg02, arg12) {
      arg02.enable(arg12 >>> 0);
    },
    __wbg_endQuery_0434371d408e59b7: function(arg02, arg12) {
      arg02.endQuery(arg12 >>> 0);
    },
    __wbg_end_414453a89205612c: function(arg02) {
      arg02.end();
    },
    __wbg_error_287b079609b734b7: function(arg02) {
      const ret2 = arg02.error;
      return ret2;
    },
    __wbg_error_757e9472f8410341: function(arg02, arg12) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg02;
        deferred0_1 = arg12;
        console.error(getStringFromWasm0(arg02, arg12));
      } finally {
        wasm.__wbindgen_free_command_export(deferred0_0, deferred0_1, 1);
      }
    },
    __wbg_error_dd408a7b3cb542dd: function(arg02) {
      console.error(arg02);
    },
    __wbg_eval_62d1ea2ebeca53ad: function() {
      return handleError(function(arg0, arg1) {
        const ret = eval(getStringFromWasm0(arg0, arg1));
        return ret;
      }, arguments);
    },
    __wbg_exitFullscreen_9a16e3653416dc0b: function(arg02) {
      arg02.exitFullscreen();
    },
    __wbg_features_4ce861c12227aa47: function(arg02) {
      const ret2 = arg02.features;
      return ret2;
    },
    __wbg_features_614e8836a2aaf39a: function(arg02) {
      const ret2 = arg02.features;
      return ret2;
    },
    __wbg_fenceSync_57ab30f550e5a5a2: function(arg02, arg12, arg2) {
      const ret2 = arg02.fenceSync(arg12 >>> 0, arg2 >>> 0);
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_fetch_9365a9a9426d4d09: function() {
      return handleError(function(arg02) {
        const ret2 = fetch(arg02);
        return ret2;
      }, arguments);
    },
    __wbg_finish_087cb89c65c06eb1: function(arg02) {
      const ret2 = arg02.finish();
      return ret2;
    },
    __wbg_finish_cfaeede3baf55be1: function(arg02, arg12) {
      const ret2 = arg02.finish(arg12);
      return ret2;
    },
    __wbg_flush_2a8fa6766a4f3ada: function(arg02) {
      arg02.flush();
    },
    __wbg_flush_918ffb9cfebcbaab: function(arg02) {
      arg02.flush();
    },
    __wbg_focus_77d7483c7b2b9f30: function() {
      return handleError(function(arg02) {
        arg02.focus();
      }, arguments);
    },
    __wbg_framebufferRenderbuffer_5736a8553be94035: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.framebufferRenderbuffer(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4);
    },
    __wbg_framebufferRenderbuffer_e0c873b9f296443d: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.framebufferRenderbuffer(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4);
    },
    __wbg_framebufferTexture2D_8584b49a205ffe5b: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.framebufferTexture2D(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5);
    },
    __wbg_framebufferTexture2D_9abab99d6209666a: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.framebufferTexture2D(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5);
    },
    __wbg_framebufferTextureLayer_e236352620170c5a: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.framebufferTextureLayer(arg12 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
    },
    __wbg_framebufferTextureMultiviewOVR_9b89dd83134856d3: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
      arg02.framebufferTextureMultiviewOVR(arg12 >>> 0, arg2 >>> 0, arg3, arg4, arg5, arg6);
    },
    __wbg_from_74f3d90e0ff11240: function(arg02) {
      const ret2 = Array.from(arg02);
      return ret2;
    },
    __wbg_frontFace_188579d7bba462b1: function(arg02, arg12) {
      arg02.frontFace(arg12 >>> 0);
    },
    __wbg_frontFace_19294c82ae89fa71: function(arg02, arg12) {
      arg02.frontFace(arg12 >>> 0);
    },
    __wbg_fullscreenElement_f225b88d410fadc1: function(arg02) {
      const ret2 = arg02.fullscreenElement;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_getAsFile_d83c2fce0fba8d88: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.getAsFile();
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_getBufferSubData_d1d7ad69c40ea085: function(arg02, arg12, arg2, arg3) {
      arg02.getBufferSubData(arg12 >>> 0, arg2, arg3);
    },
    __wbg_getContext_123ddade3a0fb2f5: function() {
      return handleError(function(arg02, arg12, arg2, arg3) {
        const ret2 = arg02.getContext(getStringFromWasm0(arg12, arg2), arg3);
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_getContext_53c8c42beb820370: function() {
      return handleError(function(arg02, arg12, arg2, arg3) {
        const ret2 = arg02.getContext(getStringFromWasm0(arg12, arg2), arg3);
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_getContext_71c33f14b63da593: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.getContext(getStringFromWasm0(arg12, arg2));
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_getContext_c5236e0057b35024: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.getContext(getStringFromWasm0(arg12, arg2));
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_getCurrentTexture_51975ae7185fd15f: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.getCurrentTexture();
        return ret2;
      }, arguments);
    },
    __wbg_getData_7b73a3e658ca866b: function() {
      return handleError(function(arg02, arg12, arg2, arg3) {
        const ret2 = arg12.getData(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
      }, arguments);
    },
    __wbg_getExtension_8e8c3be603d4f5ce: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.getExtension(getStringFromWasm0(arg12, arg2));
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_getIndexedParameter_fa6cca29d50de787: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.getIndexedParameter(arg12 >>> 0, arg2 >>> 0);
        return ret2;
      }, arguments);
    },
    __wbg_getMappedRange_5ed22727c9679168: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.getMappedRange(arg12, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_getModifierState_d313bf284c1996c7: function(arg02, arg12, arg2) {
      const ret2 = arg02.getModifierState(getStringFromWasm0(arg12, arg2));
      return ret2;
    },
    __wbg_getOwnPropertyDescriptor_e43dd1d4f19c6423: function(arg02, arg12) {
      const ret2 = Object.getOwnPropertyDescriptor(arg02, arg12);
      return ret2;
    },
    __wbg_getParameter_19325d4aa1b66856: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.getParameter(arg12 >>> 0);
        return ret2;
      }, arguments);
    },
    __wbg_getParameter_7ddbe9f9606f6a80: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.getParameter(arg12 >>> 0);
        return ret2;
      }, arguments);
    },
    __wbg_getPreferredCanvasFormat_1b8495aeb1d11ab1: function(arg02) {
      const ret2 = arg02.getPreferredCanvasFormat();
      return (__wbindgen_enum_GpuTextureFormat.indexOf(ret2) + 1 || 96) - 1;
    },
    __wbg_getProgramInfoLog_50a07d12dddd0da6: function(arg02, arg12, arg2) {
      const ret2 = arg12.getProgramInfoLog(arg2);
      var ptr1 = isLikeNone(ret2) ? 0 : passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_getProgramInfoLog_72665662cf78b5a2: function(arg02, arg12, arg2) {
      const ret2 = arg12.getProgramInfoLog(arg2);
      var ptr1 = isLikeNone(ret2) ? 0 : passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_getProgramParameter_1f5cceb73030e823: function(arg02, arg12, arg2) {
      const ret2 = arg02.getProgramParameter(arg12, arg2 >>> 0);
      return ret2;
    },
    __wbg_getProgramParameter_41e1ea6f52a71ba5: function(arg02, arg12, arg2) {
      const ret2 = arg02.getProgramParameter(arg12, arg2 >>> 0);
      return ret2;
    },
    __wbg_getQueryParameter_fa2ce36cfdedc862: function(arg02, arg12, arg2) {
      const ret2 = arg02.getQueryParameter(arg12, arg2 >>> 0);
      return ret2;
    },
    __wbg_getRandomValues_423a4f048ecbb8a5: function() {
      return handleError(function(arg02) {
        globalThis.crypto.getRandomValues(arg02);
      }, arguments);
    },
    __wbg_getReader_533994892cd607f7: function(arg02) {
      const ret2 = arg02.getReader();
      return ret2;
    },
    __wbg_getShaderInfoLog_337a0567e83283d1: function(arg02, arg12, arg2) {
      const ret2 = arg12.getShaderInfoLog(arg2);
      var ptr1 = isLikeNone(ret2) ? 0 : passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_getShaderInfoLog_663a9b136ab42b32: function(arg02, arg12, arg2) {
      const ret2 = arg12.getShaderInfoLog(arg2);
      var ptr1 = isLikeNone(ret2) ? 0 : passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_getShaderParameter_95d4ad40668ee798: function(arg02, arg12, arg2) {
      const ret2 = arg02.getShaderParameter(arg12, arg2 >>> 0);
      return ret2;
    },
    __wbg_getShaderParameter_9e9aa18598294f3b: function(arg02, arg12, arg2) {
      const ret2 = arg02.getShaderParameter(arg12, arg2 >>> 0);
      return ret2;
    },
    __wbg_getSupportedExtensions_63e3eaba880055c5: function(arg02) {
      const ret2 = arg02.getSupportedExtensions();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_getSupportedProfiles_7cd826b4eff5e8fc: function(arg02) {
      const ret2 = arg02.getSupportedProfiles();
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_getSyncParameter_3eb3ecefa061c5ee: function(arg02, arg12, arg2) {
      const ret2 = arg02.getSyncParameter(arg12, arg2 >>> 0);
      return ret2;
    },
    __wbg_getTime_63fb0332e6c4ec17: function(arg02) {
      const ret2 = arg02.getTime();
      return ret2;
    },
    __wbg_getTimezoneOffset_4baa793e0d3962a8: function(arg02) {
      const ret2 = arg02.getTimezoneOffset();
      return ret2;
    },
    __wbg_getType_08fd5cb026e83485: function(arg02, arg12, arg2) {
      const ret2 = arg02.getType(getStringFromWasm0(arg12, arg2));
      return ret2;
    },
    __wbg_getUniformBlockIndex_78264d4d94f8252d: function(arg02, arg12, arg2, arg3) {
      const ret2 = arg02.getUniformBlockIndex(arg12, getStringFromWasm0(arg2, arg3));
      return ret2;
    },
    __wbg_getUniformLocation_11fd99fee70965dc: function(arg02, arg12, arg2, arg3) {
      const ret2 = arg02.getUniformLocation(arg12, getStringFromWasm0(arg2, arg3));
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_getUniformLocation_c493d2f5f1a6213d: function(arg02, arg12, arg2, arg3) {
      const ret2 = arg02.getUniformLocation(arg12, getStringFromWasm0(arg2, arg3));
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_get_36debceb6d43d7a1: function(arg02, arg12) {
      const ret2 = arg02[arg12 >>> 0];
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_get_46b096a8e041ddcc: function(arg02, arg12) {
      const ret2 = arg02[arg12 >>> 0];
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_get_971a0c45d172643f: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = Reflect.get(arg02, arg12);
        return ret2;
      }, arguments);
    },
    __wbg_get_c0c8f8d7da0c03dd: function(arg02, arg12) {
      const ret2 = arg02[arg12 >>> 0];
      return ret2;
    },
    __wbg_get_done_ce5b5691b59c07f2: function(arg02) {
      const ret2 = arg02.done;
      return isLikeNone(ret2) ? 16777215 : ret2 ? 1 : 0;
    },
    __wbg_get_unchecked_e20b893aeafc3fca: function(arg02, arg12) {
      const ret2 = arg02[arg12 >>> 0];
      return ret2;
    },
    __wbg_get_value_58309ba057b715e1: function(arg02) {
      const ret2 = arg02.value;
      return ret2;
    },
    __wbg_gpu_a7c12045c25d009a: function(arg02) {
      const ret2 = arg02.gpu;
      return ret2;
    },
    __wbg_hardwareConcurrency_240216fba40dbafa: function(arg02) {
      const ret2 = arg02.hardwareConcurrency;
      return ret2;
    },
    __wbg_has_b3a6e6d0d28295fa: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = Reflect.has(arg02, arg12);
        return ret2;
      }, arguments);
    },
    __wbg_has_b5a46804dc5e62bd: function(arg02, arg12, arg2) {
      const ret2 = arg02.has(getStringFromWasm0(arg12, arg2));
      return ret2;
    },
    __wbg_headers_6dedf39f001ae99d: function(arg02) {
      const ret2 = arg02.headers;
      return ret2;
    },
    __wbg_headers_92567b07014384b9: function(arg02) {
      const ret2 = arg02.headers;
      return ret2;
    },
    __wbg_height_c25c887c11a170f2: function(arg02) {
      const ret2 = arg02.height;
      return ret2;
    },
    __wbg_height_e56f6fb197710e09: function(arg02) {
      const ret2 = arg02.height;
      return ret2;
    },
    __wbg_height_ed5457cbec112c70: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.height;
        return ret2;
      }, arguments);
    },
    __wbg_height_f9570f7786f9a01f: function(arg02) {
      const ret2 = arg02.height;
      return ret2;
    },
    __wbg_includes_a4b83ade703cb80b: function(arg02, arg12, arg2) {
      const ret2 = arg02.includes(arg12, arg2);
      return ret2;
    },
    __wbg_info_22dcf1fd1b12bc7d: function(arg02) {
      const ret2 = arg02.info;
      return ret2;
    },
    __wbg_info_726982aff9befe16: function(arg02) {
      console.info(arg02);
    },
    __wbg_inlineSize_cbd06e91714e38d0: function(arg02) {
      const ret2 = arg02.inlineSize;
      return ret2;
    },
    __wbg_innerHeight_047a04fc237d09df: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.innerHeight;
        return ret2;
      }, arguments);
    },
    __wbg_innerWidth_4a973110eeb5f463: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.innerWidth;
        return ret2;
      }, arguments);
    },
    __wbg_inputType_d69098d986812abc: function(arg02, arg12) {
      const ret2 = arg12.inputType;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_instanceof_DedicatedWorkerGlobalScope_bd193eb4ec0d4971: function(arg02) {
      let result;
      try {
        result = arg02 instanceof DedicatedWorkerGlobalScope;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_GpuAdapter_fc7b89fc546de0bc: function(arg02) {
      let result;
      try {
        result = arg02 instanceof GPUAdapter;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_GpuCanvasContext_1a39fd0621603553: function(arg02) {
      let result;
      try {
        result = arg02 instanceof GPUCanvasContext;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_GpuDeviceLostInfo_c0ebce29b32e81e8: function(arg02) {
      let result;
      try {
        result = arg02 instanceof GPUDeviceLostInfo;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_GpuOutOfMemoryError_5ac5c50ce9ee21d2: function(arg02) {
      let result;
      try {
        result = arg02 instanceof GPUOutOfMemoryError;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_GpuValidationError_77b97d666afabac1: function(arg02) {
      let result;
      try {
        result = arg02 instanceof GPUValidationError;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_HtmlCanvasElement_327e7f7530c72bbd: function(arg02) {
      let result;
      try {
        result = arg02 instanceof HTMLCanvasElement;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_HtmlTextAreaElement_6d5fbbcef108f57a: function(arg02) {
      let result;
      try {
        result = arg02 instanceof HTMLTextAreaElement;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_ReadableStreamDefaultReader_3c65e085533e1ae7: function(arg02) {
      let result;
      try {
        result = arg02 instanceof ReadableStreamDefaultReader;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_ResizeObserverEntry_efc5b62591e937ec: function(arg02) {
      let result;
      try {
        result = arg02 instanceof ResizeObserverEntry;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_Response_8f49efbd4bfd76d6: function(arg02) {
      let result;
      try {
        result = arg02 instanceof Response;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_SharedArrayBuffer_c734e76df6d827cb: function(arg02) {
      let result;
      try {
        result = arg02 instanceof SharedArrayBuffer;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_Uint8Array_f935dbb0aa7cdeed: function(arg02) {
      let result;
      try {
        result = arg02 instanceof Uint8Array;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_WebGl2RenderingContext_e27143c72f888655: function(arg02) {
      let result;
      try {
        result = arg02 instanceof WebGL2RenderingContext;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_Window_5625ff9937037a38: function(arg02) {
      let result;
      try {
        result = arg02 instanceof Window;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_instanceof_WorkerGlobalScope_8c58a6d74926b578: function(arg02) {
      let result;
      try {
        result = arg02 instanceof WorkerGlobalScope;
      } catch (_) {
        result = false;
      }
      const ret2 = result;
      return ret2;
    },
    __wbg_invalidateFramebuffer_9a711eeb3940aba0: function() {
      return handleError(function(arg02, arg12, arg2) {
        arg02.invalidateFramebuffer(arg12 >>> 0, arg2);
      }, arguments);
    },
    __wbg_isArray_6339f732981044bf: function(arg02) {
      const ret2 = Array.isArray(arg02);
      return ret2;
    },
    __wbg_isComposing_33d4d04c1349b4c0: function(arg02) {
      const ret2 = arg02.isComposing;
      return ret2;
    },
    __wbg_isComposing_e79501578268b326: function(arg02) {
      const ret2 = arg02.isComposing;
      return ret2;
    },
    __wbg_is_86be747e88e872fb: function(arg02, arg12) {
      const ret2 = Object.is(arg02, arg12);
      return ret2;
    },
    __wbg_items_a35cb18496760505: function(arg02) {
      const ret2 = arg02.items;
      return ret2;
    },
    __wbg_key_d1b2fd5ee42567c0: function(arg02, arg12) {
      const ret2 = arg12.key;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_kind_19a1b3bfb51a6cc1: function(arg02, arg12) {
      const ret2 = arg12.kind;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_label_47480289cc2bce71: function(arg02, arg12) {
      const ret2 = arg12.label;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_length_36bd29c6848c2144: function(arg02) {
      const ret2 = arg02.length;
      return ret2;
    },
    __wbg_length_a7beabda2cca47d5: function(arg02) {
      const ret2 = arg02.length;
      return ret2;
    },
    __wbg_length_ecfa2c63d3d0d82c: function(arg02) {
      const ret2 = arg02.length;
      return ret2;
    },
    __wbg_limits_1c25cb4f379a4418: function(arg02) {
      const ret2 = arg02.limits;
      return ret2;
    },
    __wbg_limits_50a8c5e629dbfe40: function(arg02) {
      const ret2 = arg02.limits;
      return ret2;
    },
    __wbg_linkProgram_124252d16ea0ef40: function(arg02, arg12) {
      arg02.linkProgram(arg12);
    },
    __wbg_linkProgram_dd3cfc19950a354c: function(arg02, arg12) {
      arg02.linkProgram(arg12);
    },
    __wbg_log_e6372b4fbfc9f81e: function(arg02) {
      console.log(arg02);
    },
    __wbg_lost_7b1065bddc80e8ac: function(arg02) {
      const ret2 = arg02.lost;
      return ret2;
    },
    __wbg_mapAsync_bb0029907dd91181: function(arg02, arg12, arg2, arg3) {
      const ret2 = arg02.mapAsync(arg12 >>> 0, arg2, arg3);
      return ret2;
    },
    __wbg_matchMedia_0e2963d34f3ddd40: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.matchMedia(getStringFromWasm0(arg12, arg2));
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_matches_72427e51457a4411: function(arg02) {
      const ret2 = arg02.matches;
      return ret2;
    },
    __wbg_maxBindGroups_14611ac9ed1c6b56: function(arg02) {
      const ret2 = arg02.maxBindGroups;
      return ret2;
    },
    __wbg_maxBindingsPerBindGroup_dd3f66044d2a9bfb: function(arg02) {
      const ret2 = arg02.maxBindingsPerBindGroup;
      return ret2;
    },
    __wbg_maxBufferSize_f7ce3e1856349d2f: function(arg02) {
      const ret2 = arg02.maxBufferSize;
      return ret2;
    },
    __wbg_maxColorAttachmentBytesPerSample_55e64194645ea041: function(arg02) {
      const ret2 = arg02.maxColorAttachmentBytesPerSample;
      return ret2;
    },
    __wbg_maxColorAttachments_fd9187f9f786da18: function(arg02) {
      const ret2 = arg02.maxColorAttachments;
      return ret2;
    },
    __wbg_maxComputeInvocationsPerWorkgroup_9b3b1fc261129782: function(arg02) {
      const ret2 = arg02.maxComputeInvocationsPerWorkgroup;
      return ret2;
    },
    __wbg_maxComputeWorkgroupSizeX_c55bbbcc02b75241: function(arg02) {
      const ret2 = arg02.maxComputeWorkgroupSizeX;
      return ret2;
    },
    __wbg_maxComputeWorkgroupSizeY_96f40b1ec3102a3a: function(arg02) {
      const ret2 = arg02.maxComputeWorkgroupSizeY;
      return ret2;
    },
    __wbg_maxComputeWorkgroupSizeZ_c2b1061d521561bb: function(arg02) {
      const ret2 = arg02.maxComputeWorkgroupSizeZ;
      return ret2;
    },
    __wbg_maxComputeWorkgroupStorageSize_fac26e89d99e08f9: function(arg02) {
      const ret2 = arg02.maxComputeWorkgroupStorageSize;
      return ret2;
    },
    __wbg_maxComputeWorkgroupsPerDimension_cd001f910e9b4d70: function(arg02) {
      const ret2 = arg02.maxComputeWorkgroupsPerDimension;
      return ret2;
    },
    __wbg_maxDynamicStorageBuffersPerPipelineLayout_29399b82af020d86: function(arg02) {
      const ret2 = arg02.maxDynamicStorageBuffersPerPipelineLayout;
      return ret2;
    },
    __wbg_maxDynamicUniformBuffersPerPipelineLayout_6d6cf80f3bd08e52: function(arg02) {
      const ret2 = arg02.maxDynamicUniformBuffersPerPipelineLayout;
      return ret2;
    },
    __wbg_maxInterStageShaderVariables_8b000f47a166b1d5: function(arg02) {
      const ret2 = arg02.maxInterStageShaderVariables;
      return ret2;
    },
    __wbg_maxSampledTexturesPerShaderStage_618a49f33217dde2: function(arg02) {
      const ret2 = arg02.maxSampledTexturesPerShaderStage;
      return ret2;
    },
    __wbg_maxSamplersPerShaderStage_aa09fa0311712a1a: function(arg02) {
      const ret2 = arg02.maxSamplersPerShaderStage;
      return ret2;
    },
    __wbg_maxStorageBufferBindingSize_0ec83ae10ad73180: function(arg02) {
      const ret2 = arg02.maxStorageBufferBindingSize;
      return ret2;
    },
    __wbg_maxStorageBuffersPerShaderStage_0cca5b468fcf10b6: function(arg02) {
      const ret2 = arg02.maxStorageBuffersPerShaderStage;
      return ret2;
    },
    __wbg_maxStorageTexturesPerShaderStage_9d6c35770f37866c: function(arg02) {
      const ret2 = arg02.maxStorageTexturesPerShaderStage;
      return ret2;
    },
    __wbg_maxTextureArrayLayers_c2bf9c85285832d4: function(arg02) {
      const ret2 = arg02.maxTextureArrayLayers;
      return ret2;
    },
    __wbg_maxTextureDimension1D_e09f86e22ea6bac9: function(arg02) {
      const ret2 = arg02.maxTextureDimension1D;
      return ret2;
    },
    __wbg_maxTextureDimension2D_2631916ef9a3efa8: function(arg02) {
      const ret2 = arg02.maxTextureDimension2D;
      return ret2;
    },
    __wbg_maxTextureDimension3D_06ee54121b37d431: function(arg02) {
      const ret2 = arg02.maxTextureDimension3D;
      return ret2;
    },
    __wbg_maxUniformBufferBindingSize_af9e8a077907ed64: function(arg02) {
      const ret2 = arg02.maxUniformBufferBindingSize;
      return ret2;
    },
    __wbg_maxUniformBuffersPerShaderStage_f871b70865df8c11: function(arg02) {
      const ret2 = arg02.maxUniformBuffersPerShaderStage;
      return ret2;
    },
    __wbg_maxVertexAttributes_e72dabb2714f5cf5: function(arg02) {
      const ret2 = arg02.maxVertexAttributes;
      return ret2;
    },
    __wbg_maxVertexBufferArrayStride_6a1cd814386082ce: function(arg02) {
      const ret2 = arg02.maxVertexBufferArrayStride;
      return ret2;
    },
    __wbg_maxVertexBuffers_9c61c5fd286ebcc6: function(arg02) {
      const ret2 = arg02.maxVertexBuffers;
      return ret2;
    },
    __wbg_message_09714b1dbee17e65: function(arg02, arg12) {
      const ret2 = arg12.message;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_message_6769962f0009c864: function(arg02, arg12) {
      const ret2 = arg12.message;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_metaKey_917f037461143e51: function(arg02) {
      const ret2 = arg02.metaKey;
      return ret2;
    },
    __wbg_metaKey_f282cd52fbd7cb27: function(arg02) {
      const ret2 = arg02.metaKey;
      return ret2;
    },
    __wbg_minStorageBufferOffsetAlignment_e214f59628fb3558: function(arg02) {
      const ret2 = arg02.minStorageBufferOffsetAlignment;
      return ret2;
    },
    __wbg_minUniformBufferOffsetAlignment_58b69e1c3924f6a4: function(arg02) {
      const ret2 = arg02.minUniformBufferOffsetAlignment;
      return ret2;
    },
    __wbg_navigator_6cfdd5fa246d910f: function(arg02) {
      const ret2 = arg02.navigator;
      return ret2;
    },
    __wbg_navigator_e5c345298a9609cd: function(arg02) {
      const ret2 = arg02.navigator;
      return ret2;
    },
    __wbg_new_0_f117d868b403dc07: function() {
      const ret2 = new Date;
      return ret2;
    },
    __wbg_new_116be93542d39019: function() {
      const ret2 = new Array;
      return ret2;
    },
    __wbg_new_227d7c05414eb861: function() {
      const ret2 = new Error;
      return ret2;
    },
    __wbg_new_358857d90afd5a2d: function(arg02, arg12) {
      const ret2 = new Error(getStringFromWasm0(arg02, arg12));
      return ret2;
    },
    __wbg_new_418fb92a013d5930: function(arg02, arg12) {
      try {
        var state0 = { a: arg02, b: arg12 };
        var cb0 = (arg02, arg12) => {
          const a = state0.a;
          state0.a = 0;
          try {
            return wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Function_fn_wasm_bindgen_623195cf354c3f6b___JsValue_____wasm_bindgen_623195cf354c3f6b___sys__Undefined___js_sys_9477c292bafbf79f___Function_fn_wasm_bindgen_623195cf354c3f6b___JsValue_____wasm_bindgen_623195cf354c3f6b___sys__Undefined_______true_(a, state0.b, arg02, arg12);
          } finally {
            state0.a = a;
          }
        };
        const ret2 = new Promise(cb0);
        return ret2;
      } finally {
        state0.a = 0;
      }
    },
    __wbg_new_4c27d8e40bf066b2: function() {
      return handleError(function(arg02) {
        const ret2 = new ResizeObserver(arg02);
        return ret2;
      }, arguments);
    },
    __wbg_new_77cc4f4f472aeb81: function(arg02) {
      const ret2 = new Uint8Array(arg02);
      return ret2;
    },
    __wbg_new_ebe3e0f6837f0879: function() {
      const ret2 = new Object;
      return ret2;
    },
    __wbg_new_f545e2e1ea609f29: function(arg02) {
      const ret2 = new Int32Array(arg02);
      return ret2;
    },
    __wbg_new_f9d6489212f3b2b3: function(arg02) {
      const ret2 = new Date(arg02);
      return ret2;
    },
    __wbg_new_from_slice_3eea173078478cfe: function(arg02, arg12) {
      const ret2 = new Uint8Array(getArrayU8FromWasm0(arg02, arg12));
      return ret2;
    },
    __wbg_new_with_byte_offset_and_length_7fcc1893b668846c: function(arg02, arg12, arg2) {
      const ret2 = new Int32Array(arg02, arg12 >>> 0, arg2 >>> 0);
      return ret2;
    },
    __wbg_new_with_byte_offset_and_length_ff6e927f8d72f0c3: function(arg02, arg12, arg2) {
      const ret2 = new Uint8Array(arg02, arg12 >>> 0, arg2 >>> 0);
      return ret2;
    },
    __wbg_new_with_length_3ffc1c56427c525c: function(arg02) {
      const ret2 = new Uint8Array(arg02 >>> 0);
      return ret2;
    },
    __wbg_new_with_options_ceb29d27c7c6cc6f: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = new Worker(getStringFromWasm0(arg02, arg12), arg2);
        return ret2;
      }, arguments);
    },
    __wbg_new_with_str_and_init_5a37d576dec75a86: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = new Request(getStringFromWasm0(arg02, arg12), arg2);
        return ret2;
      }, arguments);
    },
    __wbg_new_with_str_sequence_4916aa40615983fe: function() {
      return handleError(function(arg02) {
        const ret2 = new Blob(arg02);
        return ret2;
      }, arguments);
    },
    __wbg_new_worker_b0d92a7c5ee3d84d: function(arg02, arg12) {
      const ret2 = new Worker(getStringFromWasm0(arg02, arg12));
      return ret2;
    },
    __wbg_notify_5f5e34143c548cc7: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = Atomics.notify(arg02, arg12 >>> 0);
        return ret2;
      }, arguments);
    },
    __wbg_now_8b265300afd5f2b9: function() {
      const ret2 = Date.now();
      return ret2;
    },
    __wbg_now_e7c6795a7f81e10f: function(arg02) {
      const ret2 = arg02.now();
      return ret2;
    },
    __wbg_observe_2c9948097e57bf5d: function(arg02, arg12, arg2) {
      arg02.observe(arg12, arg2);
    },
    __wbg_observe_77ac29d55bfbcc1c: function(arg02, arg12) {
      arg02.observe(arg12);
    },
    __wbg_of_0c6464fa8d2aa86d: function(arg02) {
      const ret2 = Array.of(arg02);
      return ret2;
    },
    __wbg_of_79747c3f25a53502: function(arg02, arg12, arg2) {
      const ret2 = Array.of(arg02, arg12, arg2);
      return ret2;
    },
    __wbg_offsetX_2db1c144fa76228b: function(arg02) {
      const ret2 = arg02.offsetX;
      return ret2;
    },
    __wbg_offsetY_b32f2328bb79e445: function(arg02) {
      const ret2 = arg02.offsetY;
      return ret2;
    },
    __wbg_onSubmittedWorkDone_1460145eecea40ef: function(arg02) {
      const ret2 = arg02.onSubmittedWorkDone();
      return ret2;
    },
    __wbg_open_1255cb947c0ece98: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.open(getStringFromWasm0(arg12, arg2));
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_parse_1cc93481b0865939: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = JSON.parse(getStringFromWasm0(arg02, arg12));
        return ret2;
      }, arguments);
    },
    __wbg_performance_3fcf6e32a7e1ed0a: function(arg02) {
      const ret2 = arg02.performance;
      return ret2;
    },
    __wbg_pixelStorei_11bdfb5bc6a39d28: function(arg02, arg12, arg2) {
      arg02.pixelStorei(arg12 >>> 0, arg2);
    },
    __wbg_pixelStorei_86481a168d6e225e: function(arg02, arg12, arg2) {
      arg02.pixelStorei(arg12 >>> 0, arg2);
    },
    __wbg_platform_723fb7833ed963df: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg12.platform;
        const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
      }, arguments);
    },
    __wbg_pointerId_c1e1cd6b32d6d017: function(arg02) {
      const ret2 = arg02.pointerId;
      return ret2;
    },
    __wbg_pointerType_b3dafa8fb9c97016: function(arg02, arg12) {
      const ret2 = arg12.pointerType;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_polygonOffset_2b8b141e8cc17c10: function(arg02, arg12, arg2) {
      arg02.polygonOffset(arg12, arg2);
    },
    __wbg_polygonOffset_94b427c5130ab6c2: function(arg02, arg12, arg2) {
      arg02.polygonOffset(arg12, arg2);
    },
    __wbg_postMessage_6dcc1574fef77104: function() {
      return handleError(function(arg02, arg12) {
        arg02.postMessage(arg12);
      }, arguments);
    },
    __wbg_postMessage_99ea49fc49d53c0b: function() {
      return handleError(function(arg02, arg12) {
        arg02.postMessage(arg12);
      }, arguments);
    },
    __wbg_postMessage_ff0d3fa36478ee89: function() {
      return handleError(function(arg02, arg12) {
        arg02.postMessage(arg12);
      }, arguments);
    },
    __wbg_preventDefault_19878c58b8010668: function(arg02) {
      arg02.preventDefault();
    },
    __wbg_prototypesetcall_de8e0d9553586985: function(arg02, arg12, arg2) {
      Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg02, arg12), arg2);
    },
    __wbg_push_adb0107829f02d75: function(arg02, arg12) {
      const ret2 = arg02.push(arg12);
      return ret2;
    },
    __wbg_queryCounterEXT_b0cddcdfb28830df: function(arg02, arg12, arg2) {
      arg02.queryCounterEXT(arg12, arg2 >>> 0);
    },
    __wbg_querySelectorAll_9b6a612499ecb916: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.querySelectorAll(getStringFromWasm0(arg12, arg2));
        return ret2;
      }, arguments);
    },
    __wbg_querySelector_2c472eddb417c6b3: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.querySelector(getStringFromWasm0(arg12, arg2));
        return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
      }, arguments);
    },
    __wbg_queueMicrotask_600b0f5c826e3bc6: function(arg02, arg12) {
      arg02.queueMicrotask(arg12);
    },
    __wbg_queueMicrotask_ac694eae12e92dfb: function(arg02) {
      queueMicrotask(arg02);
    },
    __wbg_queueMicrotask_be5fe34a8f4cad4d: function(arg02) {
      const ret2 = arg02.queueMicrotask;
      return ret2;
    },
    __wbg_queue_65d985f3e6d786a6: function(arg02) {
      const ret2 = arg02.queue;
      return ret2;
    },
    __wbg_random_b0d98802be10ff20: function() {
      const ret2 = Math.random();
      return ret2;
    },
    __wbg_readBuffer_2de0b72ac08915c8: function(arg02, arg12) {
      arg02.readBuffer(arg12 >>> 0);
    },
    __wbg_readPixels_0033d2834b498dda: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7) {
        arg02.readPixels(arg12, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
      }, arguments);
    },
    __wbg_readPixels_0e3230bf7a891882: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7) {
        arg02.readPixels(arg12, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
      }, arguments);
    },
    __wbg_readPixels_8f8bde9ee420ba35: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7) {
        arg02.readPixels(arg12, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
      }, arguments);
    },
    __wbg_read_ae34ffedeb11f034: function(arg02) {
      const ret2 = arg02.read();
      return ret2;
    },
    __wbg_read_bdbb415fea83404e: function(arg02) {
      const ret2 = arg02.read();
      return ret2;
    },
    __wbg_reason_21c585c1cbc2cc8f: function(arg02) {
      const ret2 = arg02.reason;
      return (__wbindgen_enum_GpuDeviceLostReason.indexOf(ret2) + 1 || 3) - 1;
    },
    __wbg_reject_671a1c459689d0e0: function(arg02) {
      const ret2 = Promise.reject(arg02);
      return ret2;
    },
    __wbg_removeEventListener_aa653c6b402cc27e: function() {
      return handleError(function(arg02, arg12, arg2, arg3) {
        arg02.removeEventListener(getStringFromWasm0(arg12, arg2), arg3);
      }, arguments);
    },
    __wbg_remove_07453fe173d20eee: function(arg02) {
      arg02.remove();
    },
    __wbg_renderbufferStorageMultisample_a9f65ef0cc53fb37: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.renderbufferStorageMultisample(arg12 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    },
    __wbg_renderbufferStorage_33c57e600b175bd6: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.renderbufferStorage(arg12 >>> 0, arg2 >>> 0, arg3, arg4);
    },
    __wbg_renderbufferStorage_3fb6d5a0f3e07d46: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.renderbufferStorage(arg12 >>> 0, arg2 >>> 0, arg3, arg4);
    },
    __wbg_repeat_8afe4eb608701a7e: function(arg02) {
      const ret2 = arg02.repeat;
      return ret2;
    },
    __wbg_requestAdapter_9ff5c9d1ff271165: function(arg02, arg12) {
      const ret2 = arg02.requestAdapter(arg12);
      return ret2;
    },
    __wbg_requestAdapter_c46930b8bc33722d: function(arg02) {
      const ret2 = arg02.requestAdapter();
      return ret2;
    },
    __wbg_requestAnimationFrame_bcb3ce6247e27dd4: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.requestAnimationFrame(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_requestDevice_c1c34f88a477e509: function(arg02, arg12) {
      const ret2 = arg02.requestDevice(arg12);
      return ret2;
    },
    __wbg_requestFullscreen_fde993af7528dc3c: function() {
      return handleError(function(arg02) {
        arg02.requestFullscreen();
      }, arguments);
    },
    __wbg_requestIdleCallback_95007e53e6e36e70: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.requestIdleCallback(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_requestIdleCallback_ffbadaab1fe5eed9: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.requestIdleCallback(arg12, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_resolve_020f95d838c6ef25: function(arg02) {
      const ret2 = Promise.resolve(arg02);
      return ret2;
    },
    __wbg_samplerParameterf_d7f38ba3194c43ba: function(arg02, arg12, arg2, arg3) {
      arg02.samplerParameterf(arg12, arg2 >>> 0, arg3);
    },
    __wbg_samplerParameteri_3d8994d9967c6803: function(arg02, arg12, arg2, arg3) {
      arg02.samplerParameteri(arg12, arg2 >>> 0, arg3);
    },
    __wbg_scale_e1e9a6c5d930107c: function(arg02) {
      const ret2 = arg02.scale;
      return ret2;
    },
    __wbg_scissor_2f02706fbca6e98a: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.scissor(arg12, arg2, arg3, arg4);
    },
    __wbg_scissor_cdfb84de20f004b6: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.scissor(arg12, arg2, arg3, arg4);
    },
    __wbg_screen_a2962b9efd780003: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.screen;
        return ret2;
      }, arguments);
    },
    __wbg_selectionEnd_4d779e46f115fc34: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.selectionEnd;
        return isLikeNone(ret2) ? Number.MAX_SAFE_INTEGER : ret2 >>> 0;
      }, arguments);
    },
    __wbg_selectionStart_093d5f15933d1091: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.selectionStart;
        return isLikeNone(ret2) ? Number.MAX_SAFE_INTEGER : ret2 >>> 0;
      }, arguments);
    },
    __wbg_setAttribute_507f8367905a9c03: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4) {
        arg02.setAttribute(getStringFromWasm0(arg12, arg2), getStringFromWasm0(arg3, arg4));
      }, arguments);
    },
    __wbg_setBindGroup_4ba56e1e0d26f244: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
        arg02.setBindGroup(arg12 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
      }, arguments);
    },
    __wbg_setBindGroup_6124849cc8547086: function(arg02, arg12, arg2) {
      arg02.setBindGroup(arg12 >>> 0, arg2);
    },
    __wbg_setPipeline_bab24dbce96903b9: function(arg02, arg12) {
      arg02.setPipeline(arg12);
    },
    __wbg_setPointerCapture_761aa655f9aebc1a: function() {
      return handleError(function(arg02, arg12) {
        arg02.setPointerCapture(arg12);
      }, arguments);
    },
    __wbg_setProperty_684ce273e28a7037: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4) {
        arg02.setProperty(getStringFromWasm0(arg12, arg2), getStringFromWasm0(arg3, arg4));
      }, arguments);
    },
    __wbg_setProperty_ada19cdd6ed650c2: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
        arg02.setProperty(getStringFromWasm0(arg12, arg2), getStringFromWasm0(arg3, arg4), getStringFromWasm0(arg5, arg6));
      }, arguments);
    },
    __wbg_setSelectionRange_21bd91387375d01d: function() {
      return handleError(function(arg02, arg12, arg2) {
        arg02.setSelectionRange(arg12 >>> 0, arg2 >>> 0);
      }, arguments);
    },
    __wbg_setTimeout_8be4960d8ad2bb76: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = arg02.setTimeout(arg12, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_setTimeout_9d0a5393fa9dc61c: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg02.setTimeout(arg12);
        return ret2;
      }, arguments);
    },
    __wbg_set_8155bb79a948541b: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = Reflect.set(arg02, arg12, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_set_a80955eb93b145c6: function(arg02, arg12, arg2) {
      arg02[arg12 >>> 0] = arg2;
    },
    __wbg_set_a_5f6e488475272136: function(arg02, arg12) {
      arg02.a = arg12;
    },
    __wbg_set_access_091f317905cd76a5: function(arg02, arg12) {
      arg02.access = __wbindgen_enum_GpuStorageTextureAccess[arg12];
    },
    __wbg_set_address_mode_u_a37cf1035585c638: function(arg02, arg12) {
      arg02.addressModeU = __wbindgen_enum_GpuAddressMode[arg12];
    },
    __wbg_set_address_mode_v_8ac049e029caef76: function(arg02, arg12) {
      arg02.addressModeV = __wbindgen_enum_GpuAddressMode[arg12];
    },
    __wbg_set_address_mode_w_eb9260ee11729e92: function(arg02, arg12) {
      arg02.addressModeW = __wbindgen_enum_GpuAddressMode[arg12];
    },
    __wbg_set_alpha_aa2e606e9e647b21: function(arg02, arg12) {
      arg02.alpha = arg12;
    },
    __wbg_set_alpha_mode_92402195b3ae1ee7: function(arg02, arg12) {
      arg02.alphaMode = __wbindgen_enum_GpuCanvasAlphaMode[arg12];
    },
    __wbg_set_alpha_to_coverage_enabled_b4ce9c3f7f8b7ad7: function(arg02, arg12) {
      arg02.alphaToCoverageEnabled = arg12 !== 0;
    },
    __wbg_set_array_layer_count_daec613068108a9d: function(arg02, arg12) {
      arg02.arrayLayerCount = arg12 >>> 0;
    },
    __wbg_set_array_stride_c2c009eabc18b5f6: function(arg02, arg12) {
      arg02.arrayStride = arg12;
    },
    __wbg_set_aspect_77332ac136ee94eb: function(arg02, arg12) {
      arg02.aspect = __wbindgen_enum_GpuTextureAspect[arg12];
    },
    __wbg_set_aspect_a823a14d00d42d37: function(arg02, arg12) {
      arg02.aspect = __wbindgen_enum_GpuTextureAspect[arg12];
    },
    __wbg_set_attributes_05f9117fd32ca606: function(arg02, arg12) {
      arg02.attributes = arg12;
    },
    __wbg_set_b_688365d692bba214: function(arg02, arg12) {
      arg02.b = arg12;
    },
    __wbg_set_base_array_layer_cc6c68d233489c4b: function(arg02, arg12) {
      arg02.baseArrayLayer = arg12 >>> 0;
    },
    __wbg_set_base_mip_level_e07a3efe9006d5ea: function(arg02, arg12) {
      arg02.baseMipLevel = arg12 >>> 0;
    },
    __wbg_set_beginning_of_pass_write_index_27be5b0b35ec3de0: function(arg02, arg12) {
      arg02.beginningOfPassWriteIndex = arg12 >>> 0;
    },
    __wbg_set_bind_group_layouts_5325d038771af328: function(arg02, arg12) {
      arg02.bindGroupLayouts = arg12;
    },
    __wbg_set_binding_b6b0fe5c281b8c69: function(arg02, arg12) {
      arg02.binding = arg12 >>> 0;
    },
    __wbg_set_binding_f3c188a8cd21455b: function(arg02, arg12) {
      arg02.binding = arg12 >>> 0;
    },
    __wbg_set_blend_8d6e9c08b5702a09: function(arg02, arg12) {
      arg02.blend = arg12;
    },
    __wbg_set_body_f301b68bff45f419: function(arg02, arg12) {
      arg02.body = arg12;
    },
    __wbg_set_box_ba18accc4586ad2a: function(arg02, arg12) {
      arg02.box = __wbindgen_enum_ResizeObserverBoxOptions[arg12];
    },
    __wbg_set_buffer_55f096330c8912b4: function(arg02, arg12) {
      arg02.buffer = arg12;
    },
    __wbg_set_buffer_e89095a9f0cafad3: function(arg02, arg12) {
      arg02.buffer = arg12;
    },
    __wbg_set_buffers_85a7238f4ef28ab4: function(arg02, arg12) {
      arg02.buffers = arg12;
    },
    __wbg_set_bytes_per_row_91681ca78d744888: function(arg02, arg12) {
      arg02.bytesPerRow = arg12 >>> 0;
    },
    __wbg_set_clear_value_642701f928a5ccb3: function(arg02, arg12) {
      arg02.clearValue = arg12;
    },
    __wbg_set_code_56e2d45ec1ff6c2d: function(arg02, arg12, arg2) {
      arg02.code = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_color_attachments_abe67f6631926e28: function(arg02, arg12) {
      arg02.colorAttachments = arg12;
    },
    __wbg_set_color_bc393d7efc3c8594: function(arg02, arg12) {
      arg02.color = arg12;
    },
    __wbg_set_compare_1509dc1a5420943f: function(arg02, arg12) {
      arg02.compare = __wbindgen_enum_GpuCompareFunction[arg12];
    },
    __wbg_set_compare_42211fbf15e3b850: function(arg02, arg12) {
      arg02.compare = __wbindgen_enum_GpuCompareFunction[arg12];
    },
    __wbg_set_count_26a934d1cd07d080: function(arg02, arg12) {
      arg02.count = arg12 >>> 0;
    },
    __wbg_set_credentials_d7f3b810cbf191e1: function(arg02, arg12) {
      arg02.credentials = __wbindgen_enum_RequestCredentials[arg12];
    },
    __wbg_set_cull_mode_9d466c1ab414cac8: function(arg02, arg12) {
      arg02.cullMode = __wbindgen_enum_GpuCullMode[arg12];
    },
    __wbg_set_depth_bias_428c9340b0fd937b: function(arg02, arg12) {
      arg02.depthBias = arg12;
    },
    __wbg_set_depth_bias_clamp_f009599ca67fa30c: function(arg02, arg12) {
      arg02.depthBiasClamp = arg12;
    },
    __wbg_set_depth_bias_slope_scale_7125880b4cb7a951: function(arg02, arg12) {
      arg02.depthBiasSlopeScale = arg12;
    },
    __wbg_set_depth_clear_value_442bf492734f63b6: function(arg02, arg12) {
      arg02.depthClearValue = arg12;
    },
    __wbg_set_depth_compare_30e9ea552da12fe2: function(arg02, arg12) {
      arg02.depthCompare = __wbindgen_enum_GpuCompareFunction[arg12];
    },
    __wbg_set_depth_fail_op_5e42dc3e4c382951: function(arg02, arg12) {
      arg02.depthFailOp = __wbindgen_enum_GpuStencilOperation[arg12];
    },
    __wbg_set_depth_load_op_34d430b74bb36d91: function(arg02, arg12) {
      arg02.depthLoadOp = __wbindgen_enum_GpuLoadOp[arg12];
    },
    __wbg_set_depth_or_array_layers_4bbbeadacb393f02: function(arg02, arg12) {
      arg02.depthOrArrayLayers = arg12 >>> 0;
    },
    __wbg_set_depth_read_only_138a11b10c731094: function(arg02, arg12) {
      arg02.depthReadOnly = arg12 !== 0;
    },
    __wbg_set_depth_stencil_1bd50dbc450c8650: function(arg02, arg12) {
      arg02.depthStencil = arg12;
    },
    __wbg_set_depth_stencil_attachment_1ee0d93bc3273369: function(arg02, arg12) {
      arg02.depthStencilAttachment = arg12;
    },
    __wbg_set_depth_store_op_0ea0a215313dbda7: function(arg02, arg12) {
      arg02.depthStoreOp = __wbindgen_enum_GpuStoreOp[arg12];
    },
    __wbg_set_depth_write_enabled_64c2e7f6fa4b6b7b: function(arg02, arg12) {
      arg02.depthWriteEnabled = arg12 !== 0;
    },
    __wbg_set_device_0d774b66e7288f72: function(arg02, arg12) {
      arg02.device = arg12;
    },
    __wbg_set_dimension_174ad7e2fb67fb4e: function(arg02, arg12) {
      arg02.dimension = __wbindgen_enum_GpuTextureViewDimension[arg12];
    },
    __wbg_set_dimension_36e13ccecae5af4b: function(arg02, arg12) {
      arg02.dimension = __wbindgen_enum_GpuTextureDimension[arg12];
    },
    __wbg_set_dst_factor_1ed75271a89a711e: function(arg02, arg12) {
      arg02.dstFactor = __wbindgen_enum_GpuBlendFactor[arg12];
    },
    __wbg_set_e92392c4b44c5de1: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4) {
        arg02.set(getStringFromWasm0(arg12, arg2), getStringFromWasm0(arg3, arg4));
      }, arguments);
    },
    __wbg_set_end_of_pass_write_index_e8f52fc08bc0603e: function(arg02, arg12) {
      arg02.endOfPassWriteIndex = arg12 >>> 0;
    },
    __wbg_set_entries_3017e6132f938c6e: function(arg02, arg12) {
      arg02.entries = arg12;
    },
    __wbg_set_entries_fc76ca4d7da6a709: function(arg02, arg12) {
      arg02.entries = arg12;
    },
    __wbg_set_entry_point_6fec5723cc790927: function(arg02, arg12, arg2) {
      arg02.entryPoint = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_entry_point_8db3b6d103e3b865: function(arg02, arg12, arg2) {
      arg02.entryPoint = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_external_texture_825fe2bc7a0c0603: function(arg02, arg12) {
      arg02.externalTexture = arg12;
    },
    __wbg_set_fail_op_77ab26c98f847b65: function(arg02, arg12) {
      arg02.failOp = __wbindgen_enum_GpuStencilOperation[arg12];
    },
    __wbg_set_format_1786adb7bc74c7c9: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuTextureFormat[arg12];
    },
    __wbg_set_format_6606f5c1fba6f459: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuVertexFormat[arg12];
    },
    __wbg_set_format_90860b0321868db4: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuTextureFormat[arg12];
    },
    __wbg_set_format_abf7a1bc5425c56a: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuTextureFormat[arg12];
    },
    __wbg_set_format_d347899cd860709c: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuTextureFormat[arg12];
    },
    __wbg_set_format_e9d4b1475bb3bd3b: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuTextureFormat[arg12];
    },
    __wbg_set_format_f9341112e43ea182: function(arg02, arg12) {
      arg02.format = __wbindgen_enum_GpuTextureFormat[arg12];
    },
    __wbg_set_fragment_1a595620425637e1: function(arg02, arg12) {
      arg02.fragment = arg12;
    },
    __wbg_set_front_face_50cdf4eb61504a46: function(arg02, arg12) {
      arg02.frontFace = __wbindgen_enum_GpuFrontFace[arg12];
    },
    __wbg_set_g_d4d1d77cf8fdd362: function(arg02, arg12) {
      arg02.g = arg12;
    },
    __wbg_set_has_dynamic_offset_7d30014fdbfe90c5: function(arg02, arg12) {
      arg02.hasDynamicOffset = arg12 !== 0;
    },
    __wbg_set_height_ca39bd9597314f83: function(arg02, arg12) {
      arg02.height = arg12 >>> 0;
    },
    __wbg_set_height_d72f2b76484a44de: function(arg02, arg12) {
      arg02.height = arg12 >>> 0;
    },
    __wbg_set_height_e8b5483b8c117d5e: function(arg02, arg12) {
      arg02.height = arg12 >>> 0;
    },
    __wbg_set_label_03d2396d4655a3e1: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_0c1bd0e976cf0a9a: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_1175a3329a06e52b: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_2d2227f4d5991e50: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_2f592bd1be3db6b3: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_8fd860a36d2c7b74: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_bae57fb9f24fde5c: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_be45aed56e4b9fee: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_c47c451211e2f6d2: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_cd567b7b35838e4c: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_d1c24b5a7a3ac31d: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_dcd98efbb9370da8: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_label_f92ae11c77d74198: function(arg02, arg12, arg2) {
      arg02.label = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_layout_7c5ba5bdcde8a0f0: function(arg02, arg12) {
      arg02.layout = arg12;
    },
    __wbg_set_layout_eeef59714f5bf48b: function(arg02, arg12) {
      arg02.layout = arg12;
    },
    __wbg_set_load_op_56844f51434037bf: function(arg02, arg12) {
      arg02.loadOp = __wbindgen_enum_GpuLoadOp[arg12];
    },
    __wbg_set_lod_max_clamp_3f157633f32c9f94: function(arg02, arg12) {
      arg02.lodMaxClamp = arg12;
    },
    __wbg_set_lod_min_clamp_7e246c739fb1a854: function(arg02, arg12) {
      arg02.lodMinClamp = arg12;
    },
    __wbg_set_mag_filter_69d846b974d4bcc0: function(arg02, arg12) {
      arg02.magFilter = __wbindgen_enum_GpuFilterMode[arg12];
    },
    __wbg_set_mapped_at_creation_48de4735fab51e78: function(arg02, arg12) {
      arg02.mappedAtCreation = arg12 !== 0;
    },
    __wbg_set_mask_0c49a66362fc0079: function(arg02, arg12) {
      arg02.mask = arg12 >>> 0;
    },
    __wbg_set_max_anisotropy_3ef0d5bca2336cc7: function(arg02, arg12) {
      arg02.maxAnisotropy = arg12;
    },
    __wbg_set_method_cf2b992b9a610bc3: function(arg02, arg12, arg2) {
      arg02.method = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_min_binding_size_689661b9ed25e083: function(arg02, arg12) {
      arg02.minBindingSize = arg12;
    },
    __wbg_set_min_filter_fbf2d8d9f503dcd7: function(arg02, arg12) {
      arg02.minFilter = __wbindgen_enum_GpuFilterMode[arg12];
    },
    __wbg_set_mip_level_246db61be15bdd69: function(arg02, arg12) {
      arg02.mipLevel = arg12 >>> 0;
    },
    __wbg_set_mip_level_count_72f8bc1f80f7539b: function(arg02, arg12) {
      arg02.mipLevelCount = arg12 >>> 0;
    },
    __wbg_set_mip_level_count_b19a0d9192e62d5d: function(arg02, arg12) {
      arg02.mipLevelCount = arg12 >>> 0;
    },
    __wbg_set_mipmap_filter_17fd50a3898fd5ff: function(arg02, arg12) {
      arg02.mipmapFilter = __wbindgen_enum_GpuMipmapFilterMode[arg12];
    },
    __wbg_set_module_08ad08e736d8edbf: function(arg02, arg12) {
      arg02.module = arg12;
    },
    __wbg_set_module_14e471fdd94c582d: function(arg02, arg12) {
      arg02.module = arg12;
    },
    __wbg_set_multisample_85f073947b782d07: function(arg02, arg12) {
      arg02.multisample = arg12;
    },
    __wbg_set_multisampled_40505c1381e1c32c: function(arg02, arg12) {
      arg02.multisampled = arg12 !== 0;
    },
    __wbg_set_name_6bc11ff756aeadc9: function(arg02, arg12, arg2) {
      arg02.name = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_offset_73156b0e0b41d79a: function(arg02, arg12) {
      arg02.offset = arg12;
    },
    __wbg_set_offset_8d9d9afffa18b591: function(arg02, arg12) {
      arg02.offset = arg12;
    },
    __wbg_set_offset_a097a8050a3a9a33: function(arg02, arg12) {
      arg02.offset = arg12;
    },
    __wbg_set_onmessage_6f838578941fe42d: function(arg02, arg12) {
      arg02.onmessage = arg12;
    },
    __wbg_set_onmessage_ed4e5288e2e3af6f: function(arg02, arg12) {
      arg02.onmessage = arg12;
    },
    __wbg_set_onuncapturederror_b9a9ff2c881b2b40: function(arg02, arg12) {
      arg02.onuncapturederror = arg12;
    },
    __wbg_set_operation_b5862f5a1a143b30: function(arg02, arg12) {
      arg02.operation = __wbindgen_enum_GpuBlendOperation[arg12];
    },
    __wbg_set_origin_9b3b0fbe0a5dc469: function(arg02, arg12) {
      arg02.origin = arg12;
    },
    __wbg_set_pass_op_e9470d1262fb8a8b: function(arg02, arg12) {
      arg02.passOp = __wbindgen_enum_GpuStencilOperation[arg12];
    },
    __wbg_set_power_preference_c0d3fa7ce46b1a2e: function(arg02, arg12) {
      arg02.powerPreference = __wbindgen_enum_GpuPowerPreference[arg12];
    },
    __wbg_set_primitive_369241acd17871f1: function(arg02, arg12) {
      arg02.primitive = arg12;
    },
    __wbg_set_query_set_18679a8580267d5a: function(arg02, arg12) {
      arg02.querySet = arg12;
    },
    __wbg_set_r_527e5a41c4b1a846: function(arg02, arg12) {
      arg02.r = arg12;
    },
    __wbg_set_readOnly_ee6c9403dfec2c15: function(arg02, arg12) {
      arg02.readOnly = arg12 !== 0;
    },
    __wbg_set_redirect_9d53fb52143d8ea4: function(arg02, arg12) {
      arg02.redirect = __wbindgen_enum_RequestRedirect[arg12];
    },
    __wbg_set_required_features_54918de8185c5fab: function(arg02, arg12) {
      arg02.requiredFeatures = arg12;
    },
    __wbg_set_required_limits_3b031f66f838f4e3: function(arg02, arg12) {
      arg02.requiredLimits = arg12;
    },
    __wbg_set_resolve_target_fe76b3f99cf72078: function(arg02, arg12) {
      arg02.resolveTarget = arg12;
    },
    __wbg_set_resource_fe385d2e3dadaf63: function(arg02, arg12) {
      arg02.resource = arg12;
    },
    __wbg_set_rows_per_image_d198b7e73a38978b: function(arg02, arg12) {
      arg02.rowsPerImage = arg12 >>> 0;
    },
    __wbg_set_sample_count_865e1d19b84e27e6: function(arg02, arg12) {
      arg02.sampleCount = arg12 >>> 0;
    },
    __wbg_set_sample_type_7088b1efddce6a69: function(arg02, arg12) {
      arg02.sampleType = __wbindgen_enum_GpuTextureSampleType[arg12];
    },
    __wbg_set_sampler_8c5d7fb1b02058c6: function(arg02, arg12) {
      arg02.sampler = arg12;
    },
    __wbg_set_shader_location_0ff30a733291a396: function(arg02, arg12) {
      arg02.shaderLocation = arg12 >>> 0;
    },
    __wbg_set_size_1e6281b07cd39177: function(arg02, arg12) {
      arg02.size = arg12;
    },
    __wbg_set_size_41cd9255ca1e4242: function(arg02, arg12) {
      arg02.size = arg12;
    },
    __wbg_set_size_a61ff22205255d61: function(arg02, arg12) {
      arg02.size = arg12;
    },
    __wbg_set_spellcheck_62439281527190b6: function(arg02, arg12) {
      arg02.spellcheck = arg12 !== 0;
    },
    __wbg_set_src_factor_1c4f755f8676df1b: function(arg02, arg12) {
      arg02.srcFactor = __wbindgen_enum_GpuBlendFactor[arg12];
    },
    __wbg_set_stencil_back_6ef4683123b19b25: function(arg02, arg12) {
      arg02.stencilBack = arg12;
    },
    __wbg_set_stencil_clear_value_10b58f674d0177c2: function(arg02, arg12) {
      arg02.stencilClearValue = arg12 >>> 0;
    },
    __wbg_set_stencil_front_aeb8580a97e5424b: function(arg02, arg12) {
      arg02.stencilFront = arg12;
    },
    __wbg_set_stencil_load_op_f20a90a66acd3d8c: function(arg02, arg12) {
      arg02.stencilLoadOp = __wbindgen_enum_GpuLoadOp[arg12];
    },
    __wbg_set_stencil_read_mask_2954f260d47349ea: function(arg02, arg12) {
      arg02.stencilReadMask = arg12 >>> 0;
    },
    __wbg_set_stencil_read_only_fb489d191b6d969b: function(arg02, arg12) {
      arg02.stencilReadOnly = arg12 !== 0;
    },
    __wbg_set_stencil_store_op_477c4cf6422dfa3f: function(arg02, arg12) {
      arg02.stencilStoreOp = __wbindgen_enum_GpuStoreOp[arg12];
    },
    __wbg_set_stencil_write_mask_3f8e9b3781814a95: function(arg02, arg12) {
      arg02.stencilWriteMask = arg12 >>> 0;
    },
    __wbg_set_step_mode_a35aef328761c452: function(arg02, arg12) {
      arg02.stepMode = __wbindgen_enum_GpuVertexStepMode[arg12];
    },
    __wbg_set_storage_texture_ab9eed9786337ef0: function(arg02, arg12) {
      arg02.storageTexture = arg12;
    },
    __wbg_set_store_op_caeede4654b3d847: function(arg02, arg12) {
      arg02.storeOp = __wbindgen_enum_GpuStoreOp[arg12];
    },
    __wbg_set_strip_index_format_0cd0510e166c4ec4: function(arg02, arg12) {
      arg02.stripIndexFormat = __wbindgen_enum_GpuIndexFormat[arg12];
    },
    __wbg_set_tabIndex_a9b7f8d964a179f0: function(arg02, arg12) {
      arg02.tabIndex = arg12;
    },
    __wbg_set_targets_6b0b3bdd87f35668: function(arg02, arg12) {
      arg02.targets = arg12;
    },
    __wbg_set_textContent_e027901c7bc836b5: function(arg02, arg12, arg2) {
      arg02.textContent = arg12 === 0 ? undefined : getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_texture_16d2be474ce6ad0c: function(arg02, arg12) {
      arg02.texture = arg12;
    },
    __wbg_set_texture_e25a73da75cf5808: function(arg02, arg12) {
      arg02.texture = arg12;
    },
    __wbg_set_timeout_f16c6f3e0abb708b: function(arg02, arg12) {
      arg02.timeout = arg12 >>> 0;
    },
    __wbg_set_timestamp_writes_c552d52fbb417005: function(arg02, arg12) {
      arg02.timestampWrites = arg12;
    },
    __wbg_set_title_2d5cc0af4a17d935: function(arg02, arg12, arg2) {
      arg02.title = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_topology_beefb3aca0612b00: function(arg02, arg12) {
      arg02.topology = __wbindgen_enum_GpuPrimitiveTopology[arg12];
    },
    __wbg_set_type_38961e08504ca674: function(arg02, arg12) {
      arg02.type = __wbindgen_enum_GpuBufferBindingType[arg12];
    },
    __wbg_set_type_c1eebc19f8a6aeb9: function(arg02, arg12) {
      arg02.type = __wbindgen_enum_GpuSamplerBindingType[arg12];
    },
    __wbg_set_type_e6de95ea1ca51953: function(arg02, arg12) {
      arg02.type = __wbindgen_enum_WorkerType[arg12];
    },
    __wbg_set_unclipped_depth_5a4f7eb57fe006b2: function(arg02, arg12) {
      arg02.unclippedDepth = arg12 !== 0;
    },
    __wbg_set_usage_7f0dda8309469b1c: function(arg02, arg12) {
      arg02.usage = arg12 >>> 0;
    },
    __wbg_set_usage_7fa9cd18d1104aca: function(arg02, arg12) {
      arg02.usage = arg12 >>> 0;
    },
    __wbg_set_usage_908213a4d4bb8bde: function(arg02, arg12) {
      arg02.usage = arg12 >>> 0;
    },
    __wbg_set_usage_ae014e77ff77ce06: function(arg02, arg12) {
      arg02.usage = arg12 >>> 0;
    },
    __wbg_set_value_676e9d6f43f3c9e4: function(arg02, arg12, arg2) {
      arg02.value = getStringFromWasm0(arg12, arg2);
    },
    __wbg_set_vertex_a4951dd9a7a4ed54: function(arg02, arg12) {
      arg02.vertex = arg12;
    },
    __wbg_set_view_bdeab150b5f0768c: function(arg02, arg12) {
      arg02.view = arg12;
    },
    __wbg_set_view_dbd0294573f64d05: function(arg02, arg12) {
      arg02.view = arg12;
    },
    __wbg_set_view_dimension_263387976511ebc9: function(arg02, arg12) {
      arg02.viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg12];
    },
    __wbg_set_view_dimension_3ed01b237e85826f: function(arg02, arg12) {
      arg02.viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg12];
    },
    __wbg_set_view_formats_bab284fc81b40e70: function(arg02, arg12) {
      arg02.viewFormats = arg12;
    },
    __wbg_set_view_formats_fe531a043efb71fa: function(arg02, arg12) {
      arg02.viewFormats = arg12;
    },
    __wbg_set_visibility_1bca121a89accba5: function(arg02, arg12) {
      arg02.visibility = arg12 >>> 0;
    },
    __wbg_set_width_1a5e2e86fa5bdcd8: function(arg02, arg12) {
      arg02.width = arg12 >>> 0;
    },
    __wbg_set_width_36ef6630b22fc519: function(arg02, arg12) {
      arg02.width = arg12 >>> 0;
    },
    __wbg_set_width_661c95ea46b71eba: function(arg02, arg12) {
      arg02.width = arg12 >>> 0;
    },
    __wbg_set_write_mask_144b25e2bd909124: function(arg02, arg12) {
      arg02.writeMask = arg12 >>> 0;
    },
    __wbg_set_x_56f0c2c08a62725c: function(arg02, arg12) {
      arg02.x = arg12 >>> 0;
    },
    __wbg_set_y_04fb8ce84735b4e1: function(arg02, arg12) {
      arg02.y = arg12 >>> 0;
    },
    __wbg_set_z_a51316db27a4941e: function(arg02, arg12) {
      arg02.z = arg12 >>> 0;
    },
    __wbg_shaderSource_7d3f360b4b626db7: function(arg02, arg12, arg2, arg3) {
      arg02.shaderSource(arg12, getStringFromWasm0(arg2, arg3));
    },
    __wbg_shaderSource_dcba4cd3379b35bd: function(arg02, arg12, arg2, arg3) {
      arg02.shaderSource(arg12, getStringFromWasm0(arg2, arg3));
    },
    __wbg_shiftKey_8eca009f693152b4: function(arg02) {
      const ret2 = arg02.shiftKey;
      return ret2;
    },
    __wbg_shiftKey_d24455602deb3490: function(arg02) {
      const ret2 = arg02.shiftKey;
      return ret2;
    },
    __wbg_size_86ca1114f3d8af74: function(arg02) {
      const ret2 = arg02.size;
      return ret2;
    },
    __wbg_slice_0206ff36405fd523: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4) {
        const ret2 = arg02.slice(arg12, arg2, getStringFromWasm0(arg3, arg4));
        return ret2;
      }, arguments);
    },
    __wbg_stack_3b0d974bbf31e44f: function(arg02, arg12) {
      const ret2 = arg12.stack;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_static_accessor_GLOBAL_THIS_466428f93b4eaa76: function() {
      const ret2 = typeof globalThis === "undefined" ? null : globalThis;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_static_accessor_GLOBAL_c7aea38d4de089bc: function() {
      const ret2 = typeof global === "undefined" ? null : global;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_static_accessor_SELF_42d4fae05e59267a: function() {
      const ret2 = typeof self === "undefined" ? null : self;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_static_accessor_WINDOW_e0db14a0eba6a812: function() {
      const ret2 = typeof window === "undefined" ? null : window;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_status_b0de02a07fd7d927: function(arg02) {
      const ret2 = arg02.status;
      return ret2;
    },
    __wbg_stencilFuncSeparate_1455ac65895207da: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.stencilFuncSeparate(arg12 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
    },
    __wbg_stencilFuncSeparate_55627e589746e09f: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.stencilFuncSeparate(arg12 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
    },
    __wbg_stencilMaskSeparate_85d929ff95496631: function(arg02, arg12, arg2) {
      arg02.stencilMaskSeparate(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_stencilMaskSeparate_8e37bf59a93afc15: function(arg02, arg12, arg2) {
      arg02.stencilMaskSeparate(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_stencilMask_020d2d7ea8e4f640: function(arg02, arg12) {
      arg02.stencilMask(arg12 >>> 0);
    },
    __wbg_stencilMask_967f16a89bfd056a: function(arg02, arg12) {
      arg02.stencilMask(arg12 >>> 0);
    },
    __wbg_stencilOpSeparate_1f45c75c83dad8d5: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.stencilOpSeparate(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    },
    __wbg_stencilOpSeparate_33a6764dd0ce6e24: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.stencilOpSeparate(arg12 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    },
    __wbg_store_523722c647247b86: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = Atomics.store(arg02, arg12 >>> 0, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_style_f09d6445af3dd2c6: function(arg02) {
      const ret2 = arg02.style;
      return ret2;
    },
    __wbg_subarray_a4cc58201c7359fd: function(arg02, arg12, arg2) {
      const ret2 = arg02.subarray(arg12 >>> 0, arg2 >>> 0);
      return ret2;
    },
    __wbg_submit_1290d44bb76ecef4: function(arg02, arg12) {
      arg02.submit(arg12);
    },
    __wbg_texImage2D_053488112c3d702f: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texImage2D_2854247ff7d047a1: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texImage2D_44740302c934daf1: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texImage3D_d23f7d2f9e66b916: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        arg02.texImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, arg10);
      }, arguments);
    },
    __wbg_texImage3D_faae3ea3f2969ecc: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        arg02.texImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, arg10);
      }, arguments);
    },
    __wbg_texParameteri_2bc38aa8e9964d77: function(arg02, arg12, arg2, arg3) {
      arg02.texParameteri(arg12 >>> 0, arg2 >>> 0, arg3);
    },
    __wbg_texParameteri_dd4f56c2acbbe859: function(arg02, arg12, arg2, arg3) {
      arg02.texParameteri(arg12 >>> 0, arg2 >>> 0, arg3);
    },
    __wbg_texStorage2D_d473a12d49d7deee: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.texStorage2D(arg12 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    },
    __wbg_texStorage3D_3ceb25ba9ad4b7ac: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
      arg02.texStorage3D(arg12 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
    },
    __wbg_texSubImage2D_1b383b66dfe35010: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_205cfbaea80e77e6: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_606540d3e650e0bb: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_62ae3d4b2700f7cd: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_6eb05d8f455f99ba: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_a035d2307e014a73: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_ad5a64d8f68a2d0d: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage2D_cb9ad676165c5da5: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        arg02.texSubImage2D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
      }, arguments);
    },
    __wbg_texSubImage3D_09e44c66b4ac6bc6: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_texSubImage3D_16678785ac62fd6b: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_texSubImage3D_3ee8764dfdcb6746: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_texSubImage3D_53489be691cee78d: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_texSubImage3D_73d365baf8dad003: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_texSubImage3D_8a2331639ee1ee0e: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_texSubImage3D_9b0bd9fd73d7bb1c: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        arg02.texSubImage3D(arg12 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
      }, arguments);
    },
    __wbg_text_4e32202a84cb608d: function(arg02) {
      const ret2 = arg02.text();
      return ret2;
    },
    __wbg_then_03887f33d8da4f96: function(arg02, arg12) {
      const ret2 = arg02.then(arg12);
      return ret2;
    },
    __wbg_then_7026b513a94278a8: function(arg02, arg12) {
      const ret2 = arg02.then(arg12);
      return ret2;
    },
    __wbg_then_72819b8d4e081fb5: function(arg02, arg12, arg2) {
      const ret2 = arg02.then(arg12, arg2);
      return ret2;
    },
    __wbg_then_f730e17d115c60b2: function(arg02, arg12, arg2) {
      const ret2 = arg02.then(arg12, arg2);
      return ret2;
    },
    __wbg_timeOrigin_f3d5cb4f4a06c2b7: function(arg02) {
      const ret2 = arg02.timeOrigin;
      return ret2;
    },
    __wbg_timeRemaining_c686fa94d766c38d: function(arg02) {
      const ret2 = arg02.timeRemaining();
      return ret2;
    },
    __wbg_type_1127e243128e0887: function(arg02, arg12) {
      const ret2 = arg12.type;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_types_13468343c3b00079: function(arg02) {
      const ret2 = arg02.types;
      return ret2;
    },
    __wbg_uniform1f_e92095ce29c38424: function(arg02, arg12, arg2) {
      arg02.uniform1f(arg12, arg2);
    },
    __wbg_uniform1f_e93503bc589b432d: function(arg02, arg12, arg2) {
      arg02.uniform1f(arg12, arg2);
    },
    __wbg_uniform1i_235dff1d94e0df95: function(arg02, arg12, arg2) {
      arg02.uniform1i(arg12, arg2);
    },
    __wbg_uniform1i_d5db9c3184abbd04: function(arg02, arg12, arg2) {
      arg02.uniform1i(arg12, arg2);
    },
    __wbg_uniform1ui_8bbaaa1161bfd433: function(arg02, arg12, arg2) {
      arg02.uniform1ui(arg12, arg2 >>> 0);
    },
    __wbg_uniform2fv_1443080aaf9c1077: function(arg02, arg12, arg2, arg3) {
      arg02.uniform2fv(arg12, getArrayF32FromWasm0(arg2, arg3));
    },
    __wbg_uniform2fv_b039f28911c30526: function(arg02, arg12, arg2, arg3) {
      arg02.uniform2fv(arg12, getArrayF32FromWasm0(arg2, arg3));
    },
    __wbg_uniform2iv_9648a06d054a25aa: function(arg02, arg12, arg2, arg3) {
      arg02.uniform2iv(arg12, getArrayI32FromWasm0(arg2, arg3));
    },
    __wbg_uniform2iv_e0496dc424dc25ec: function(arg02, arg12, arg2, arg3) {
      arg02.uniform2iv(arg12, getArrayI32FromWasm0(arg2, arg3));
    },
    __wbg_uniform2uiv_935dfb31f50dfbe3: function(arg02, arg12, arg2, arg3) {
      arg02.uniform2uiv(arg12, getArrayU32FromWasm0(arg2, arg3));
    },
    __wbg_uniform3fv_025760367cc4eed3: function(arg02, arg12, arg2, arg3) {
      arg02.uniform3fv(arg12, getArrayF32FromWasm0(arg2, arg3));
    },
    __wbg_uniform3fv_b985d45f54156d3b: function(arg02, arg12, arg2, arg3) {
      arg02.uniform3fv(arg12, getArrayF32FromWasm0(arg2, arg3));
    },
    __wbg_uniform3iv_193b7a0e1ae9ac9a: function(arg02, arg12, arg2, arg3) {
      arg02.uniform3iv(arg12, getArrayI32FromWasm0(arg2, arg3));
    },
    __wbg_uniform3iv_63e82687b07e66fc: function(arg02, arg12, arg2, arg3) {
      arg02.uniform3iv(arg12, getArrayI32FromWasm0(arg2, arg3));
    },
    __wbg_uniform3uiv_ccd86b78a5fb3077: function(arg02, arg12, arg2, arg3) {
      arg02.uniform3uiv(arg12, getArrayU32FromWasm0(arg2, arg3));
    },
    __wbg_uniform4f_61192d516e9bede4: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.uniform4f(arg12, arg2, arg3, arg4, arg5);
    },
    __wbg_uniform4f_d9bb623add5d2541: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.uniform4f(arg12, arg2, arg3, arg4, arg5);
    },
    __wbg_uniform4fv_c39527800fc76c8e: function(arg02, arg12, arg2, arg3) {
      arg02.uniform4fv(arg12, getArrayF32FromWasm0(arg2, arg3));
    },
    __wbg_uniform4fv_fcff56a650906708: function(arg02, arg12, arg2, arg3) {
      arg02.uniform4fv(arg12, getArrayF32FromWasm0(arg2, arg3));
    },
    __wbg_uniform4iv_197c2f54a8dfb5c2: function(arg02, arg12, arg2, arg3) {
      arg02.uniform4iv(arg12, getArrayI32FromWasm0(arg2, arg3));
    },
    __wbg_uniform4iv_9e6e36f0e1d1f84d: function(arg02, arg12, arg2, arg3) {
      arg02.uniform4iv(arg12, getArrayI32FromWasm0(arg2, arg3));
    },
    __wbg_uniform4uiv_73fc9e298d02c948: function(arg02, arg12, arg2, arg3) {
      arg02.uniform4uiv(arg12, getArrayU32FromWasm0(arg2, arg3));
    },
    __wbg_uniformBlockBinding_057177606c8b522f: function(arg02, arg12, arg2, arg3) {
      arg02.uniformBlockBinding(arg12, arg2 >>> 0, arg3 >>> 0);
    },
    __wbg_uniformMatrix2fv_013723900a9cb65c: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix2fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix2fv_fb61eccac67a8218: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix2fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix2x3fv_de8b00219f47ffb4: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix2x3fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix2x4fv_e659cc34e95fee5e: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix2x4fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix3fv_3e548032fc28c3e2: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix3fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix3fv_72ca83d3393e0364: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix3fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix3x2fv_8598636e806d318d: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix3x2fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix3x4fv_277fbf38db85e612: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix3x4fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix4fv_20161efad644f822: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix4fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix4fv_8689fd0481ac5ab4: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix4fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix4x2fv_e91bd4e774f6266d: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix4x2fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_uniformMatrix4x3fv_a829c88dfd0c29d3: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.uniformMatrix4x3fv(arg12, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    },
    __wbg_unmap_8f06698a75b8331a: function(arg02) {
      arg02.unmap();
    },
    __wbg_unobserve_9ac8d86971d3a8d3: function(arg02, arg12) {
      arg02.unobserve(arg12);
    },
    __wbg_useProgram_1c047de878f20b72: function(arg02, arg12) {
      arg02.useProgram(arg12);
    },
    __wbg_useProgram_9edff145e073d3b1: function(arg02, arg12) {
      arg02.useProgram(arg12);
    },
    __wbg_userAgent_adc3e375481683f8: function() {
      return handleError(function(arg02, arg12) {
        const ret2 = arg12.userAgent;
        const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
      }, arguments);
    },
    __wbg_valueOf_a8a77b9f1e9bfd39: function(arg02) {
      const ret2 = arg02.valueOf();
      return ret2;
    },
    __wbg_value_542338ffd3de015d: function(arg02) {
      const ret2 = arg02.value;
      return ret2;
    },
    __wbg_value_75dd6140b2a4f88b: function(arg02, arg12) {
      const ret2 = arg12.value;
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    __wbg_vertexAttribDivisorANGLE_581f060f68a0c850: function(arg02, arg12, arg2) {
      arg02.vertexAttribDivisorANGLE(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_vertexAttribDivisor_f910af52b19ce382: function(arg02, arg12, arg2) {
      arg02.vertexAttribDivisor(arg12 >>> 0, arg2 >>> 0);
    },
    __wbg_vertexAttribIPointer_54e6be6fa5e39567: function(arg02, arg12, arg2, arg3, arg4, arg5) {
      arg02.vertexAttribIPointer(arg12 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    },
    __wbg_vertexAttribPointer_7bc186aca7721b90: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
      arg02.vertexAttribPointer(arg12 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    },
    __wbg_vertexAttribPointer_b0838f8618a8c446: function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
      arg02.vertexAttribPointer(arg12 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    },
    __wbg_viewport_07bb1829f0fe2245: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.viewport(arg12, arg2, arg3, arg4);
    },
    __wbg_viewport_dfe81d333ce7be86: function(arg02, arg12, arg2, arg3, arg4) {
      arg02.viewport(arg12, arg2, arg3, arg4);
    },
    __wbg_visualViewport_6ac37a44608e245f: function(arg02) {
      const ret2 = arg02.visualViewport;
      return isLikeNone(ret2) ? 0 : addToExternrefTable0(ret2);
    },
    __wbg_waitAsync_3ba0b13f9a48f7ec: function() {
      return handleError(function(arg02, arg12, arg2) {
        const ret2 = Atomics.waitAsync(arg02, arg12 >>> 0, arg2);
        return ret2;
      }, arguments);
    },
    __wbg_waitAsync_442a13a06eeeb381: function() {
      const ret2 = Atomics.waitAsync;
      return ret2;
    },
    __wbg_waitAsync_ea6a3c85af0d1191: function(arg02, arg12, arg2) {
      const ret2 = Atomics.waitAsync(arg02, arg12 >>> 0, arg2);
      return ret2;
    },
    __wbg_warn_917d7f727ab78481: function(arg02) {
      console.warn(arg02);
    },
    __wbg_width_1952934caca67137: function(arg02) {
      const ret2 = arg02.width;
      return ret2;
    },
    __wbg_width_25247161d477c7d5: function(arg02) {
      const ret2 = arg02.width;
      return ret2;
    },
    __wbg_width_64d3816839636ecd: function() {
      return handleError(function(arg02) {
        const ret2 = arg02.width;
        return ret2;
      }, arguments);
    },
    __wbg_writeBuffer_b4bdd36178348ca5: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5, arg6) {
        arg02.writeBuffer(arg12, arg2, getArrayU8FromWasm0(arg3, arg4), arg5, arg6);
      }, arguments);
    },
    __wbg_writeText_0346496782732979: function(arg02, arg12, arg2) {
      const ret2 = arg02.writeText(getStringFromWasm0(arg12, arg2));
      return ret2;
    },
    __wbg_writeTexture_b45b69132e46a227: function() {
      return handleError(function(arg02, arg12, arg2, arg3, arg4, arg5) {
        arg02.writeTexture(arg12, getArrayU8FromWasm0(arg2, arg3), arg4, arg5);
      }, arguments);
    },
    __wbindgen_cast_0000000000000001: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue______true_);
      return ret2;
    },
    __wbindgen_cast_0000000000000002: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue__core_fbacfca9b76c475d___result__Result_____wasm_bindgen_623195cf354c3f6b___JsError___true_);
      return ret2;
    },
    __wbindgen_cast_0000000000000003: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___futures__task__wait_async_polyfill__MessageEvent______true_);
      return ret2;
    },
    __wbindgen_cast_0000000000000004: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Array______true_);
      return ret2;
    },
    __wbindgen_cast_0000000000000005: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue______true__4);
      return ret2;
    },
    __wbindgen_cast_0000000000000006: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Array______true__5);
      return ret2;
    },
    __wbindgen_cast_0000000000000007: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures________invoke___web_sys_67126e2832687bc1___features__gen_MessageEvent__MessageEvent______true_);
      return ret2;
    },
    __wbindgen_cast_0000000000000008: function(arg02, arg12) {
      const ret2 = makeMutClosure(arg02, arg12, wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke_______true_);
      return ret2;
    },
    __wbindgen_cast_0000000000000009: function(arg02) {
      const ret2 = arg02;
      return ret2;
    },
    __wbindgen_cast_000000000000000a: function(arg02, arg12) {
      const ret2 = getArrayF32FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_000000000000000b: function(arg02, arg12) {
      const ret2 = getArrayI16FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_000000000000000c: function(arg02, arg12) {
      const ret2 = getArrayI32FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_000000000000000d: function(arg02, arg12) {
      const ret2 = getArrayI8FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_000000000000000e: function(arg02, arg12) {
      const ret2 = getArrayU16FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_000000000000000f: function(arg02, arg12) {
      const ret2 = getArrayU32FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_0000000000000010: function(arg02, arg12) {
      const ret2 = getArrayU8FromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_cast_0000000000000011: function(arg02, arg12) {
      const ret2 = getStringFromWasm0(arg02, arg12);
      return ret2;
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, undefined);
      table.set(offset + 0, undefined);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    },
    __wbindgen_link_5a1fa9a05318ea21: function(arg02) {
      const val = `onmessage = function (ev) {
                let [ia, index, value] = ev.data;
                ia = new Int32Array(ia.buffer);
                let result = Atomics.wait(ia, index, value);
                postMessage(result);
            };
            `;
      const ret2 = typeof URL.createObjectURL === "undefined" ? "data:application/javascript," + encodeURIComponent(val) : URL.createObjectURL(new Blob([val], { type: "text/javascript" }));
      const ptr1 = passStringToWasm0(ret2, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg02 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg02 + 4 * 0, ptr1, true);
    },
    memory: memory || new WebAssembly.Memory({ initial: 88, maximum: 16384, shared: true })
  };
  return {
    __proto__: null,
    "./gpuix-web_bg.js": import0
  };
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke_______true_(arg02, arg12) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke_______true_(arg02, arg12);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue______true_(arg02, arg12, arg2) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue______true_(arg02, arg12, arg2);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___futures__task__wait_async_polyfill__MessageEvent______true_(arg02, arg12, arg2) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___futures__task__wait_async_polyfill__MessageEvent______true_(arg02, arg12, arg2);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Array______true_(arg02, arg12, arg2) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Array______true_(arg02, arg12, arg2);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue______true__4(arg02, arg12, arg2) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue______true__4(arg02, arg12, arg2);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Array______true__5(arg02, arg12, arg2) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Array______true__5(arg02, arg12, arg2);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures________invoke___web_sys_67126e2832687bc1___features__gen_MessageEvent__MessageEvent______true_(arg02, arg12, arg2) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures________invoke___web_sys_67126e2832687bc1___features__gen_MessageEvent__MessageEvent______true_(arg02, arg12, arg2);
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue__core_fbacfca9b76c475d___result__Result_____wasm_bindgen_623195cf354c3f6b___JsError___true_(arg02, arg12, arg2) {
  const ret2 = wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___wasm_bindgen_623195cf354c3f6b___JsValue__core_fbacfca9b76c475d___result__Result_____wasm_bindgen_623195cf354c3f6b___JsError___true_(arg02, arg12, arg2);
  if (ret2[1]) {
    throw takeFromExternrefTable0(ret2[0]);
  }
}
function wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Function_fn_wasm_bindgen_623195cf354c3f6b___JsValue_____wasm_bindgen_623195cf354c3f6b___sys__Undefined___js_sys_9477c292bafbf79f___Function_fn_wasm_bindgen_623195cf354c3f6b___JsValue_____wasm_bindgen_623195cf354c3f6b___sys__Undefined_______true_(arg02, arg12, arg2, arg3) {
  wasm.wasm_bindgen_623195cf354c3f6b___convert__closures_____invoke___js_sys_9477c292bafbf79f___Function_fn_wasm_bindgen_623195cf354c3f6b___JsValue_____wasm_bindgen_623195cf354c3f6b___sys__Undefined___js_sys_9477c292bafbf79f___Function_fn_wasm_bindgen_623195cf354c3f6b___JsValue_____wasm_bindgen_623195cf354c3f6b___sys__Undefined_______true_(arg02, arg12, arg2, arg3);
}
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc_command_export();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1;i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
function getArrayF32FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}
function getArrayI16FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getInt16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}
function getArrayI32FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}
function getArrayI8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getInt8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
function getArrayU16FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}
function getArrayU32FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
function getFloat32ArrayMemory0() {
  if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
  }
  return cachedFloat32ArrayMemory0;
}
function getInt16ArrayMemory0() {
  if (cachedInt16ArrayMemory0 === null || cachedInt16ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedInt16ArrayMemory0 = new Int16Array(wasm.memory.buffer);
  }
  return cachedInt16ArrayMemory0;
}
function getInt32ArrayMemory0() {
  if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32ArrayMemory0;
}
function getInt8ArrayMemory0() {
  if (cachedInt8ArrayMemory0 === null || cachedInt8ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedInt8ArrayMemory0 = new Int8Array(wasm.memory.buffer);
  }
  return cachedInt8ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
function getUint16ArrayMemory0() {
  if (cachedUint16ArrayMemory0 === null || cachedUint16ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedUint16ArrayMemory0 = new Uint16Array(wasm.memory.buffer);
  }
  return cachedUint16ArrayMemory0;
}
function getUint32ArrayMemory0() {
  if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
  }
  return cachedUint32ArrayMemory0;
}
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.buffer !== wasm.memory.buffer) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store_command_export(idx);
  }
}
function isLikeNone(x) {
  return x === undefined || x === null;
}
function makeMutClosure(arg02, arg12, f) {
  const state = { a: arg02, b: arg12, cnt: 1 };
  const real = (...args) => {
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      state.a = a;
      real._wbg_cb_unref();
    }
  };
  real._wbg_cb_unref = () => {
    if (--state.cnt === 0) {
      wasm.__wbindgen_destroy_closure_command_export(state.a, state.b);
      state.a = 0;
      CLOSURE_DTORS.unregister(state);
    }
  };
  CLOSURE_DTORS.register(real, state, state);
  return real;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (;offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127)
      break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret2 = cachedTextEncoder.encodeInto(arg, view);
    offset += ret2.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc_command_export(idx);
  return value;
}
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().slice(ptr, ptr + len));
}
function __wbg_finalize_init(instance, module, thread_stack_size) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module;
  cachedDataViewMemory0 = null;
  cachedFloat32ArrayMemory0 = null;
  cachedInt16ArrayMemory0 = null;
  cachedInt32ArrayMemory0 = null;
  cachedInt8ArrayMemory0 = null;
  cachedUint16ArrayMemory0 = null;
  cachedUint32ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  if (typeof thread_stack_size !== "undefined" && (typeof thread_stack_size !== "number" || thread_stack_size === 0 || thread_stack_size % 65536 !== 0)) {
    throw new Error("invalid stack size");
  }
  wasm.__wbindgen_start(thread_stack_size);
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (!module.ok) {
      throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
    }
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module, memory2) {
  if (wasm !== undefined)
    return wasm;
  let thread_stack_size;
  if (module !== undefined) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module, memory: memory2, thread_stack_size } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports(memory2);
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module, thread_stack_size);
}
async function __wbg_init(module_or_path, memory2) {
  if (wasm !== undefined)
    return wasm;
  let thread_stack_size;
  if (module_or_path !== undefined) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path, memory: memory2, thread_stack_size } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === undefined) {
    module_or_path = new URL("gpuix-web_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports(memory2);
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module, thread_stack_size);
}
var __wbindgen_enum_GpuAddressMode, __wbindgen_enum_GpuBlendFactor, __wbindgen_enum_GpuBlendOperation, __wbindgen_enum_GpuBufferBindingType, __wbindgen_enum_GpuCanvasAlphaMode, __wbindgen_enum_GpuCompareFunction, __wbindgen_enum_GpuCullMode, __wbindgen_enum_GpuDeviceLostReason, __wbindgen_enum_GpuFilterMode, __wbindgen_enum_GpuFrontFace, __wbindgen_enum_GpuIndexFormat, __wbindgen_enum_GpuLoadOp, __wbindgen_enum_GpuMipmapFilterMode, __wbindgen_enum_GpuPowerPreference, __wbindgen_enum_GpuPrimitiveTopology, __wbindgen_enum_GpuSamplerBindingType, __wbindgen_enum_GpuStencilOperation, __wbindgen_enum_GpuStorageTextureAccess, __wbindgen_enum_GpuStoreOp, __wbindgen_enum_GpuTextureAspect, __wbindgen_enum_GpuTextureDimension, __wbindgen_enum_GpuTextureFormat, __wbindgen_enum_GpuTextureSampleType, __wbindgen_enum_GpuTextureViewDimension, __wbindgen_enum_GpuVertexFormat, __wbindgen_enum_GpuVertexStepMode, __wbindgen_enum_RequestCredentials, __wbindgen_enum_RequestRedirect, __wbindgen_enum_ResizeObserverBoxOptions, __wbindgen_enum_WorkerType, GpuixRendererFinalization, CLOSURE_DTORS, cachedDataViewMemory0 = null, cachedFloat32ArrayMemory0 = null, cachedInt16ArrayMemory0 = null, cachedInt32ArrayMemory0 = null, cachedInt8ArrayMemory0 = null, cachedUint16ArrayMemory0 = null, cachedUint32ArrayMemory0 = null, cachedUint8ArrayMemory0 = null, cachedTextDecoder, MAX_SAFARI_DECODE_BYTES = 2146435072, numBytesDecoded = 0, cachedTextEncoder, WASM_VECTOR_LEN = 0, wasmModule, wasmInstance, wasm;
var init_gpuix_web = __esm(() => {
  if (Symbol.dispose)
    GpuixRenderer.prototype[Symbol.dispose] = GpuixRenderer.prototype.free;
  __wbindgen_enum_GpuAddressMode = ["clamp-to-edge", "repeat", "mirror-repeat"];
  __wbindgen_enum_GpuBlendFactor = ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant", "src1", "one-minus-src1", "src1-alpha", "one-minus-src1-alpha"];
  __wbindgen_enum_GpuBlendOperation = ["add", "subtract", "reverse-subtract", "min", "max"];
  __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];
  __wbindgen_enum_GpuCanvasAlphaMode = ["opaque", "premultiplied"];
  __wbindgen_enum_GpuCompareFunction = ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always"];
  __wbindgen_enum_GpuCullMode = ["none", "front", "back"];
  __wbindgen_enum_GpuDeviceLostReason = ["unknown", "destroyed"];
  __wbindgen_enum_GpuFilterMode = ["nearest", "linear"];
  __wbindgen_enum_GpuFrontFace = ["ccw", "cw"];
  __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];
  __wbindgen_enum_GpuLoadOp = ["load", "clear"];
  __wbindgen_enum_GpuMipmapFilterMode = ["nearest", "linear"];
  __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];
  __wbindgen_enum_GpuPrimitiveTopology = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];
  __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];
  __wbindgen_enum_GpuStencilOperation = ["keep", "zero", "replace", "invert", "increment-clamp", "decrement-clamp", "increment-wrap", "decrement-wrap"];
  __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];
  __wbindgen_enum_GpuStoreOp = ["store", "discard"];
  __wbindgen_enum_GpuTextureAspect = ["all", "stencil-only", "depth-only"];
  __wbindgen_enum_GpuTextureDimension = ["1d", "2d", "3d"];
  __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];
  __wbindgen_enum_GpuTextureSampleType = ["float", "unfilterable-float", "depth", "sint", "uint"];
  __wbindgen_enum_GpuTextureViewDimension = ["1d", "2d", "2d-array", "cube", "cube-array", "3d"];
  __wbindgen_enum_GpuVertexFormat = ["uint8", "uint8x2", "uint8x4", "sint8", "sint8x2", "sint8x4", "unorm8", "unorm8x2", "unorm8x4", "snorm8", "snorm8x2", "snorm8x4", "uint16", "uint16x2", "uint16x4", "sint16", "sint16x2", "sint16x4", "unorm16", "unorm16x2", "unorm16x4", "snorm16", "snorm16x2", "snorm16x4", "float16", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4", "sint32", "sint32x2", "sint32x3", "sint32x4", "unorm10-10-10-2", "unorm8x4-bgra"];
  __wbindgen_enum_GpuVertexStepMode = ["vertex", "instance"];
  __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];
  __wbindgen_enum_RequestRedirect = ["follow", "error", "manual"];
  __wbindgen_enum_ResizeObserverBoxOptions = ["border-box", "content-box", "device-pixel-content-box"];
  __wbindgen_enum_WorkerType = ["classic", "module"];
  GpuixRendererFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {}, unregister: () => {} } : new FinalizationRegistry((ptr) => wasm.__wbg_gpuixrenderer_free(ptr, 1));
  CLOSURE_DTORS = typeof FinalizationRegistry === "undefined" ? { register: () => {}, unregister: () => {} } : new FinalizationRegistry((state) => wasm.__wbindgen_destroy_closure_command_export(state.a, state.b));
  cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : undefined;
  if (cachedTextDecoder)
    cachedTextDecoder.decode();
  cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder : undefined;
  if (cachedTextEncoder) {
    cachedTextEncoder.encodeInto = function(arg, view) {
      const buf = cachedTextEncoder.encode(arg);
      view.set(buf);
      return {
        read: arg.length,
        written: buf.length
      };
    };
  }
});

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/wasm/gpuix-web_bg.wasm
var gpuix_web_bg_default = "./gpuix-web_bg.wasm";
var init_gpuix_web_bg = () => {};

// ../gpuix-fractalsvelte/node_modules/@gpuix/native/browser.mjs
var init_browser = __esm(async () => {
  init_gpuix_web();
  init_gpuix_web_bg();
  await __wbg_init({ module_or_path: gpuix_web_bg_default });
});

// ../gpuix-fractalsvelte/src/render.ts
function host() {
  const slots = globalThis;
  return slots[SLOT] ??= { native: null, root: null, component: null, loop: null, keys: [] };
}
function handle_event(event, onEvent) {
  try {
    dispatch(event);
    flushSync();
    commit();
  } catch (error) {
    console.error("[gpuix-fractalsvelte] event handler failed:", error);
  }
  onEvent?.(event);
}
function next_frame() {
  return new Promise((resolve) => {
    if (looping)
      frame_waiters.push(resolve);
    else
      setTimeout(resolve, FRAME_MS);
  });
}
function start_automation(native) {
  console.log = console.info = console.debug = console.error.bind(console);
  const server = "./automation-server.ts";
  import(server).then((module) => module.serve_automation(native, next_frame), (error) => console.error("[gpuix-fractalsvelte] automation server failed to load:", error));
}
function start_frame_loop(native) {
  if (!native.requiresTick()) {
    set_auto_commit(true);
    return {
      stop() {
        set_auto_commit(false);
      }
    };
  }
  let stopped = false;
  let timer = null;
  const loop = () => {
    if (stopped)
      return;
    const started = performance.now();
    try {
      if (is_dirty())
        commit();
    } catch (error) {
      console.error("[gpuix-fractalsvelte] commit failed:", error);
    }
    if (native.tick() === false) {
      stopped = true;
      process.exit(0);
    }
    for (const resolve of frame_waiters.splice(0))
      resolve();
    timer = setTimeout(loop, Math.max(0, FRAME_MS - (performance.now() - started)));
  };
  looping = true;
  loop();
  return {
    stop() {
      stopped = true;
      looping = false;
      if (timer !== null)
        clearTimeout(timer);
      for (const resolve of frame_waiters.splice(0))
        resolve();
    }
  };
}
function overlay_on_render(fps, option, applied, created) {
  if (fps)
    return created ? fps === "1" ? "full" : fps : undefined;
  return option === applied ? undefined : option;
}
function render(Component, options = {}) {
  const { props = {}, rootStyle, onEvent, onKeyDown, onKeyUp, onSelectionChange, debugFrameOverlay, ...window_options } = options;
  const slot = host();
  const remount = slot.component != null;
  const created = !slot.native;
  if (!slot.native) {
    slot.native = new GpuixRenderer((err, event) => {
      if (err) {
        console.error("[gpuix-fractalsvelte] native event error:", err);
        return;
      }
      if (!event)
        return;
      handle_event(event, onEvent);
    });
    slot.native.init(window_options);
    const automation = env("GPUIX_AUTOMATION");
    if (automation && automation !== "0")
      start_automation(slot.native);
    console.log("[gpuix-fractalsvelte] created native window");
  }
  if (slot.component) {
    try {
      unmount(slot.component);
    } catch {}
    slot.component = null;
  }
  let retiring = null;
  if (slot.root && slot.root.nativeId !== null) {
    commit();
    retiring = slot.root.nativeId;
  }
  set_native(slot.native);
  const overlay = overlay_on_render(env("GPUIX_FPS"), debugFrameOverlay, slot.overlay, created);
  if (overlay)
    set_debug_overlay(overlay);
  slot.overlay = debugFrameOverlay;
  for (const off of slot.keys)
    off();
  slot.keys = [];
  if (onKeyDown)
    slot.keys.push(on_window_key("keydown", onKeyDown));
  if (onKeyUp)
    slot.keys.push(on_window_key("keyup", onKeyUp));
  if (onSelectionChange)
    slot.keys.push(on_selection_change(onSelectionChange));
  const root = create_root(rootStyle);
  if (retiring !== null)
    queue_destroy(retiring);
  const anchor = renderer_default.createComment("");
  renderer_default.insert(root, anchor, null);
  slot.root = root;
  const component = mount(Component, { renderer: renderer_default, target: root, anchor, props });
  slot.component = component;
  flushSync();
  commit();
  if (!slot.loop)
    slot.loop = start_frame_loop(slot.native);
  const shot = env("GPUIX_SCREENSHOT");
  if (shot) {
    const native = slot.native;
    setTimeout(() => {
      try {
        native.captureScreenshot?.(shot);
        console.log(`[gpuix-fractalsvelte] screenshot -> ${shot}`);
      } catch (err) {
        console.error("[gpuix-fractalsvelte] screenshot failed:", err.message);
      }
    }, 600);
  }
  console.log(remount ? "[gpuix-fractalsvelte] remount complete" : "[gpuix-fractalsvelte] mount complete");
  return component;
}
var FRAME_MS = 8, SLOT, env = (name) => globalThis.process?.env?.[name], frame_waiters, looping = false;
var init_render2 = __esm(async () => {
  init_index_client();
  init_renderer2();
  init_window2();
  await init_browser();
  SLOT = Symbol.for("gpuix.svelte.host");
  frame_waiters = [];
});

// ../gpuix-fractalsvelte/src/web.ts
init_renderer2();
init_style();

// ../gpuix-fractalsvelte/src/fractalstyler/mode.ts
var current = process.env?.GPUIX_THEME === "light" ? "light" : "dark";
var set_mode_value = (next) => {
  current = next;
};

// ../gpuix-fractalsvelte/src/web.ts
init_events();
init_window2();

// ../gpuix-fractalsvelte/src/search.ts
init_index_client2();
init_host();

// ../gpuix-fractalsvelte/src/web.ts
var render2 = async (...args) => {
  const mod = await init_render2().then(() => ({}));
  return render(...args);
};

// gallery/Gallery.svelte
init_renderer2();
init_custom_renderer();

// ../gpuix-fractalsvelte/node_modules/svelte/src/version.js
var PUBLIC_VERSION = "5";

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") {
  ((globalThis.__svelte ??= {}).v ??= new Set).add(PUBLIC_VERSION);
}

// ../gpuix-fractalsvelte/node_modules/svelte/src/internal/flags/async.js
enable_async_mode_flag();

// gallery/Gallery.svelte
init_client();

// ../gpuix-fractalsvelte/src/components/Scroller.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root = from_tree([
  [
    "div",
    { class: "inset svelte-ytv5pa" },
    ["virtual-list", { class: "list svelte-ytv5pa" }, ,]
  ]
]);
var root_1 = from_tree([["div", null, ["div", null, ,]]]);
var root_2 = from_tree([["div", { class: "overlay svelte-ytv5pa" }]]);
var root_3 = from_tree([
  [
    "div",
    { class: "wrap svelte-ytv5pa" },
    ,
    " ",
    ["div", { class: "gutter svelte-ytv5pa" }, ["div"]],
    " ",
    ,
  ]
]);
function Scroller($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let gap = prop($$props, "gap", 3, 8), pad = prop($$props, "pad", 3, "0"), grow = prop($$props, "grow", 3, 1), scroll = prop($$props, "scroll", 3, true), follow = prop($$props, "follow", 3, false), virtual = prop($$props, "virtual", 3, false), estimate = prop($$props, "estimate", 3, 80), testid = prop($$props, "testid", 3, null);
  let column = null;
  let content = null;
  let thumb = state(proxy({ top: 0, height: 0 }));
  let drag = state(null);
  let last_total = 0;
  let in_view = 0;
  let reports = 0;
  const PRIOR = 8;
  function rows() {
    let n = 0;
    for (let c = column?.first ?? null;c; c = c.next)
      if (c.nativeId !== null)
        n++;
    return n;
  }
  function metrics() {
    const native = get_native();
    if (!native || !column?.nativeId)
      return null;
    if (virtual()) {
      const top = native.getListScrollTop(column.nativeId);
      const count = rows();
      if (!top || !top[2] || count === 0)
        return null;
      const per = top[2] / ((PRIOR * (top[2] / estimate()) + in_view) / (PRIOR + reports));
      return {
        native,
        viewport: top[2],
        total: count * per,
        offset: -(top[0] * per + top[1]),
        per
      };
    }
    if (!content?.nativeId)
      return null;
    const viewport = native.getElementBounds(column.nativeId)?.height;
    const total = native.getElementBounds(content.nativeId)?.height;
    if (!viewport || !total)
      return null;
    return {
      native,
      viewport,
      total,
      offset: native.getScrollOffset(column.nativeId)?.[1] ?? 0,
      per: 0
    };
  }
  function scroll_to(m, offset) {
    if (!virtual()) {
      m.native.scrollTo(column.nativeId, 0, offset);
      return;
    }
    const index = -offset / m.per;
    m.native.scrollToItem(column.nativeId, Math.floor(index), (index - Math.floor(index)) * m.per);
  }
  function place(m, offset) {
    let top = 0;
    let height = 0;
    if ((scroll() || virtual()) && m.total > m.viewport) {
      const h = Math.max(24, m.viewport / m.total * m.viewport);
      height = Math.round(h);
      top = Math.round(-offset / (m.total - m.viewport) * (m.viewport - h));
    }
    if (top !== get(thumb).top || height !== get(thumb).height)
      set(thumb, { top, height }, true);
  }
  function update() {
    const m = metrics();
    if (!m)
      return;
    if (!virtual() && follow() && m.total !== last_total && m.total > m.viewport) {
      const bottom = m.viewport - m.total;
      scroll_to(m, bottom);
      place(m, bottom);
    } else {
      place(m, m.offset);
    }
    last_total = m.total;
  }
  function grab(e) {
    if (e.button !== 0)
      return;
    const m = metrics();
    if (m)
      set(drag, { y: e.y, offset: m.offset }, true);
  }
  function drag_to(e) {
    if (get(drag) === null)
      return;
    if (e.pressedButton == null) {
      set(drag, null);
      return;
    }
    const m = metrics();
    if (!m || m.total <= m.viewport)
      return;
    const travel = m.viewport - get(thumb).height;
    const wanted = get(drag).offset - (e.y - get(drag).y) / travel * (m.total - m.viewport);
    const offset = Math.max(m.viewport - m.total, Math.min(0, wanted));
    scroll_to(m, offset);
    place(m, offset);
  }
  let pending = null;
  function refresh() {
    if (pending !== null)
      return;
    pending = setTimeout(() => {
      pending = null;
      update();
    }, 50);
  }
  function on_range(e) {
    const rows = (e.endIndex ?? 0) - (e.startIndex ?? 0);
    if (rows > 0) {
      in_view += rows;
      reports++;
    }
    refresh();
  }
  user_effect(() => {
    if (!scroll() && !follow() && !virtual())
      return;
    const timer = setInterval(update, follow() ? 100 : 250);
    return () => clearInterval(timer);
  });
  var div = root_3();
  var node_1 = child(div);
  {
    var consequent = ($$anchor) => {
      var div_1 = root();
      var virtual_list = child(div_1);
      var node_2 = child(virtual_list);
      snippet(node_2, () => validate_snippet_renderer(renderer_default, $$props.children));
      reset(virtual_list);
      attach2(virtual_list, () => (node) => column = node);
      reset(div_1);
      template_effect(() => {
        set_style(div_1, `padding: ${pad() ?? ""}`);
        set_attribute2(virtual_list, "estimatedItemHeight", estimate());
        set_attribute2(virtual_list, "followTail", follow());
        set_attribute2(virtual_list, "testId", testid());
      });
      event("visiblerange", virtual_list, on_range);
      append($$anchor, div_1);
    };
    var alternate = ($$anchor) => {
      var div_2 = root_1();
      let classes;
      var div_3 = child(div_2);
      let classes_1;
      var node_3 = child(div_3);
      snippet(node_3, () => validate_snippet_renderer(renderer_default, $$props.children));
      reset(div_3);
      attach2(div_3, () => (node) => content = node);
      reset(div_2);
      attach2(div_2, () => (node) => column = node);
      template_effect(() => {
        classes = set_class(div_2, 0, "column svelte-ytv5pa", null, classes, { fixed: !scroll() });
        set_attribute2(div_2, "testId", testid());
        classes_1 = set_class(div_3, 0, "content svelte-ytv5pa", null, classes_1, { fixed: !scroll() });
        set_style(div_3, `gap: ${gap() ?? ""}px; padding: ${pad() ?? ""}`);
      });
      event("scroll", div_2, refresh);
      append($$anchor, div_2);
    };
    if_block(node_1, ($$render) => {
      if (virtual())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  var div_4 = sibling(node_1, 2);
  var div_5 = child(div_4);
  let classes_2;
  let styles;
  reset(div_4);
  var node_4 = sibling(div_4, 2);
  {
    var consequent_1 = ($$anchor) => {
      var div_6 = root_2();
      template_effect(() => set_attribute2(div_6, "testId", testid() && `${testid()}-overlay`));
      event("mousemove", div_6, drag_to);
      event("mouseup", div_6, () => set(drag, null));
      append($$anchor, div_6);
    };
    if_block(node_4, ($$render) => {
      if (get(drag) !== null)
        $$render(consequent_1);
    });
  }
  reset(div);
  template_effect(() => {
    set_style(div, `flex-grow: ${grow() ?? ""}`);
    classes_2 = set_class(div_5, 0, "thumb svelte-ytv5pa", null, classes_2, { dragging: get(drag) !== null });
    set_attribute2(div_5, "testId", testid() && `${testid()}-thumb`);
    styles = set_style(div_5, "", styles, {
      top: `${get(thumb).top ?? ""}px`,
      height: `${get(thumb).height ?? ""}px`
    });
  });
  event("mousedown", div_5, grab);
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-ytv5pa", [{ classes: ["wrap"], tag: null, pseudo: null, style: { position: "relative", display: "flex", flexDirection: "column", flexBasis: 0, minHeight: 0, minWidth: 0, width: "100%", height: "100%" } }, { classes: ["column"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", height: "100%", paddingRight: 12, overflowY: "scroll" } }, { classes: ["content"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column" } }, { classes: ["inset"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 } }, { classes: ["list"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 } }, { classes: ["gutter"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, width: 8, pointerEvents: "none" } }, { classes: ["thumb"], tag: null, pseudo: null, css: "position: absolute; left: 0; width: 8px; border-radius: 4px; cursor: default; user-select: none; background-color: var(--scroller-thumb, #585b70)" }, { classes: ["thumb"], tag: null, pseudo: "hover", css: "background-color: var(--scroller-thumb-hover, #7f849c)" }, { classes: ["overlay"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, userSelect: "none" } }, { classes: ["column", "fixed"], tag: null, pseudo: null, style: { overflowY: "hidden" } }, { classes: ["content", "fixed"], tag: null, pseudo: null, style: { flexGrow: 1, minHeight: 0 } }, { classes: ["thumb", "dragging"], tag: null, pseudo: null, css: "background-color: var(--scroller-thumb-hover, #7f849c)" }]);

// src/theme/ThemeProvider.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/theme/tokens.ts
var shape = {
  "radius-0": "0px",
  "radius-sm": "4px",
  "radius-md": "6px",
  "radius-bs": "8px",
  "radius-lg": "11px",
  "radius-full": "9999px",
  "font-sans": "Inter",
  "font-mono": "Menlo",
  "text-xs": "11px",
  "text-sm": "12px",
  "text-md": "14px",
  "text-lg": "16px",
  "text-xl": "20px",
  "text-2xl": "26px"
};
var light = {
  name: "light",
  dark: false,
  tokens: {
    ...shape,
    bg: "#f6f6f7",
    "bg-surface": "#ffffff",
    "bg-raised": "#eeeef0",
    "bg-sunken": "#ffffff",
    "bg-extra": "#0f111a66",
    "text-primary": "#1b1d24",
    "text-secondary": "#5d6170",
    "text-muted": "#9a9eab",
    "text-theme": "#ffffff",
    "text-inverse": "#ffffff",
    border: "#e1e2e6",
    "border-strong": "#c4c6cd",
    ring: "#4f6bed",
    "theme-color": "#4f6bed",
    "theme-color-alt": "#3f59d6",
    "theme-color-sub": "#e6eaff",
    success: "#1f9d57",
    "success-hover": "#188248",
    "success-soft": "#ddf4e6",
    warning: "#c77c0e",
    "warning-hover": "#a8680b",
    "warning-soft": "#fbefd8",
    danger: "#d33c3c",
    "danger-hover": "#ba2f2f",
    "danger-soft": "#fbe2e2",
    info: "#3b82f6",
    "info-hover": "#2f6fd9",
    "info-soft": "#e0ecff"
  }
};
var dark = {
  name: "dark",
  dark: true,
  tokens: {
    ...shape,
    bg: "#141519",
    "bg-surface": "#1c1d23",
    "bg-raised": "#262830",
    "bg-sunken": "#22242b",
    "bg-extra": "#00000099",
    "text-primary": "#e8e9ee",
    "text-secondary": "#a2a5b3",
    "text-muted": "#6c6f7d",
    "text-theme": "#0e1020",
    "text-inverse": "#ffffff",
    border: "#2e3039",
    "border-strong": "#434654",
    ring: "#7c93ff",
    "theme-color": "#6d84ff",
    "theme-color-alt": "#8396ff",
    "theme-color-sub": "#272e52",
    success: "#3fc07a",
    "success-hover": "#5fd193",
    "success-soft": "#173326",
    warning: "#e6a23c",
    "warning-hover": "#f0b35e",
    "warning-soft": "#3a2c14",
    danger: "#f06464",
    "danger-hover": "#ff7b7b",
    "danger-soft": "#3d1a1c",
    info: "#5b9dff",
    "info-hover": "#7ab2ff",
    "info-soft": "#16294a"
  }
};
var mandala = {
  name: "mandala",
  dark: false,
  tokens: {
    ...light.tokens,
    "radius-sm": "2px",
    "radius-md": "4px",
    "radius-lg": "6px",
    bg: "#fbf7ef",
    "bg-surface": "#fffdf8",
    "bg-raised": "#f2ebdd",
    "bg-sunken": "#fffdf8",
    "text-primary": "#2a251f",
    "text-secondary": "#6b6153",
    "text-muted": "#a59a88",
    border: "#e7dcc7",
    "border-strong": "#cdbfa5",
    ring: "#c2571a",
    "theme-color": "#c2571a",
    "theme-color-alt": "#a94912",
    "theme-color-sub": "#f7e2d2"
  }
};
var midnight = {
  name: "midnight",
  dark: true,
  tokens: {
    ...dark.tokens,
    "radius-sm": "6px",
    "radius-md": "10px",
    "radius-lg": "16px",
    bg: "#0b0f17",
    "bg-surface": "#111827",
    "bg-raised": "#1a2233",
    "bg-sunken": "#151d2c",
    border: "#1f2a3d",
    "border-strong": "#2f3d57",
    ring: "#2dd4bf",
    "theme-color": "#2dd4bf",
    "theme-color-alt": "#5eead4",
    "theme-color-sub": "#0f3a36",
    "text-theme": "#04201c"
  }
};
var themes = { light, dark, mandala, midnight };
function to_vars(tokens) {
  const out = {};
  for (const [k, v] of Object.entries(tokens))
    if (v != null)
      out[k] = v;
  return out;
}

// src/theme/ThemeProvider.svelte
init_renderer2();
var root2 = from_tree([["div", { class: "ui-root svelte-182eu6e" }, ,]]);
function ThemeProvider($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let theme = prop($$props, "theme", 3, light), tokens = prop($$props, "tokens", 19, () => ({})), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  user_effect(() => {
    const t = { ...theme().tokens, ...tokens() };
    set_mode_value(theme().dark ? "dark" : "light");
    set_css_vars({
      ...to_vars(t),
      "scroller-thumb": t["text-muted"],
      "scroller-thumb-hover": t["text-secondary"]
    });
  });
  var div = root2();
  var node = child(div);
  snippet(node, () => validate_snippet_renderer(renderer_default, $$props.children));
  reset(div);
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-182eu6e", [{ classes: ["ui-root"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; width: 100%; height: 100%; background-color: var(--bg, #f6f6f7); color: var(--text-primary, #1b1d24); font-family: var(--font-sans, Inter); font-size: var(--text-md, 14px)" }]);

// gallery/demos/Button.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Button.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/group.svelte.ts
init_client();
init_index_client();
var KEY = Symbol("ui-button-group");
function provide_group() {
  const members = proxy([]);
  let next = 0;
  setContext(KEY, {
    join() {
      const id = next++;
      members.push(id);
      onDestroy(() => members.splice(members.indexOf(id), 1));
      return () => {
        const i = members.indexOf(id);
        const n = members.length;
        return n === 1 ? "only" : i === 0 ? "first" : i === n - 1 ? "last" : "middle";
      };
    }
  });
}
function use_join() {
  return getContext(KEY)?.join() ?? (() => null);
}

// src/components/Button.svelte
init_renderer2();
var root3 = from_tree([["div", null, , " ", , " ", ,]]);
function Button($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let children = prop($$props, "children", 3, undefined), label = prop($$props, "label", 3, ""), variant = prop($$props, "variant", 3, "primary"), size = prop($$props, "size", 3, "h-bs"), shape = prop($$props, "shape", 3, "min"), disabled = prop($$props, "disabled", 3, false), loading = prop($$props, "loading", 3, false), full = prop($$props, "full", 3, false), leading = prop($$props, "leading", 3, undefined), trailing = prop($$props, "trailing", 3, undefined), onclick = prop($$props, "onclick", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const join = use_join();
  const live = user_derived(() => !disabled() && !loading());
  function activate(e) {
    if (get(live))
      onclick()?.(e);
  }
  function key(e) {
    if (e.key === "enter" || e.key === "space")
      activate(e);
  }
  var div = root3();
  let classes;
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      snippet(node_1, () => validate_snippet_renderer(renderer_default, leading()));
      append($$anchor, fragment);
    };
    if_block(node, ($$render) => {
      if (leading())
        $$render(consequent);
    });
  }
  var node_2 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor) => {
      var text2 = text("…");
      append($$anchor, text2);
    };
    var consequent_2 = ($$anchor) => {
      var fragment_1 = comment();
      var node_3 = first_child(fragment_1);
      snippet(node_3, () => validate_snippet_renderer(renderer_default, children()));
      append($$anchor, fragment_1);
    };
    var alternate = ($$anchor) => {
      var text_1 = text();
      template_effect(() => set_text(text_1, label()));
      append($$anchor, text_1);
    };
    if_block(node_2, ($$render) => {
      if (loading())
        $$render(consequent_1);
      else if (children())
        $$render(consequent_2, 1);
      else
        $$render(alternate, -1);
    });
  }
  var node_4 = sibling(node_2, 2);
  {
    var consequent_3 = ($$anchor) => {
      var fragment_3 = comment();
      var node_5 = first_child(fragment_3);
      snippet(node_5, () => validate_snippet_renderer(renderer_default, trailing()));
      append($$anchor, fragment_3);
    };
    if_block(node_4, ($$render) => {
      if (trailing())
        $$render(consequent_3);
    });
  }
  reset(div);
  template_effect(($0) => {
    classes = set_class(div, 0, `btn el-variant ${variant() ?? ""} el-shape ${shape() ?? ""} el-size ${size() ?? ""} px-bs ${$0 ?? ""}`, "svelte-u8jfhp", classes, { on: get(live), off: !get(live), full: full() });
    set_attribute2(div, "tabindex", disabled() ? -1 : 0);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  }, [() => join() ? `j-${join()}` : ""]);
  event("click", div, activate);
  event("keydown", div, key);
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-u8jfhp", [{ classes: ["btn"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", userSelect: "none", cursor: "pointer" } }, { classes: ["btn", "full"], tag: null, pseudo: null, style: { width: "100%" } }, { classes: ["btn", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["btn", "j-first"], tag: null, pseudo: null, style: { borderTopRightRadius: 0, borderBottomRightRadius: 0 } }, { classes: ["btn", "j-middle"], tag: null, pseudo: null, style: { borderRadius: 0, marginLeft: -1 } }, { classes: ["btn", "j-last"], tag: null, pseudo: null, style: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -1 } }]);

// gallery/demos/Button.demo.svelte
var plus = renderer_snippet(renderer_default, ($$anchor) => {
  var div = root4();
  append($$anchor, div);
});
var arrow = renderer_snippet(renderer_default, ($$anchor) => {
  var div_1 = root_12();
  append($$anchor, div_1);
});
var root4 = from_tree([["div", null, "+"]]);
var root_12 = from_tree([["div", null, "→"]]);
var root_22 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 20px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
    ],
    " ",
    ["div", null, " "]
  ]
]);
function Button_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let clicks = state(0);
  const variants = [
    "primary",
    "secondary",
    "themed",
    "outline",
    "ghost",
    "link",
    "info",
    "success",
    "warning",
    "danger"
  ];
  const shapes = ["square", "min", "modern", "curved", "round"];
  const sizes = ["h-sm", "h-md", "h-bs", "h-lg", "h-xl"];
  var div_2 = root_22();
  var div_3 = child(div_2);
  each(div_3, 21, () => variants, index, ($$anchor, v) => {
    var fragment = comment();
    var node = first_child(fragment);
    Button(node, {
      get variant() {
        return get(v);
      },
      get label() {
        return get(v);
      },
      onclick: () => update(clicks)
    });
    append($$anchor, fragment);
  });
  reset(div_3);
  var div_4 = sibling(div_3, 2);
  each(div_4, 21, () => shapes, index, ($$anchor, s) => {
    var fragment_1 = comment();
    var node_1 = first_child(fragment_1);
    Button(node_1, {
      get shape() {
        return get(s);
      },
      get label() {
        return get(s);
      }
    });
    append($$anchor, fragment_1);
  });
  reset(div_4);
  var div_5 = sibling(div_4, 2);
  each(div_5, 21, () => sizes, index, ($$anchor, z) => {
    var fragment_2 = comment();
    var node_2 = first_child(fragment_2);
    Button(node_2, {
      get size() {
        return get(z);
      },
      get label() {
        return get(z);
      }
    });
    append($$anchor, fragment_2);
  });
  reset(div_5);
  var div_6 = sibling(div_5, 2);
  var node_3 = child(div_6);
  Button(node_3, {
    label: "Save",
    get leading() {
      return plus;
    }
  });
  var node_4 = sibling(node_3, 2);
  Button(node_4, {
    label: "Next",
    get trailing() {
      return arrow;
    }
  });
  var node_5 = sibling(node_4, 2);
  Button(node_5, { label: "Full width", full: true });
  reset(div_6);
  var div_7 = sibling(div_6, 2);
  var node_6 = child(div_7);
  Button(node_6, { label: "Disabled", disabled: true });
  var node_7 = sibling(node_6, 2);
  Button(node_7, { label: "Loading", loading: true });
  reset(div_7);
  var div_8 = sibling(div_7, 2);
  var text = only_child(div_8);
  reset(div_2);
  template_effect(() => set_text(text, `clicks: ${get(clicks) ?? ""}`));
  append($$anchor, div_2);
  $$pop_renderer();
}

// gallery/demos/ButtonGroup.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/ButtonGroup.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root5 = from_tree([["div", null, " "]]);
var root_13 = from_tree([["div"]]);
var root_23 = from_tree([["div", { class: "joined svelte-8h8dx4" }, ,]]);
function ButtonGroup($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let children = prop($$props, "children", 3, undefined), options = prop($$props, "options", 3, undefined), value = prop($$props, "value", 3, null), onchange = prop($$props, "onchange", 3, undefined), variant = prop($$props, "variant", 3, "primary"), size = prop($$props, "size", 3, "h-bs"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  provide_group();
  let focused = state(false);
  function pick(option) {
    if (!option.disabled && option.value !== value())
      onchange()?.(option.value);
  }
  function step(delta) {
    const live = options().filter((o) => !o.disabled);
    const at = live.findIndex((o) => o.value === value());
    const next = live[(at + delta + live.length) % live.length];
    if (next)
      pick(next);
  }
  function key(e) {
    if (e.key === "left" || e.key === "up")
      step(-1);
    else if (e.key === "right" || e.key === "down")
      step(1);
  }
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor) => {
      var div = root_13();
      let classes;
      set_attribute2(div, "tabindex", 0);
      each(div, 21, options, (option) => option.value, ($$anchor, option) => {
        const selected = user_derived(() => get(option).value === value());
        var div_1 = root5();
        let classes_1;
        var text = only_child(div_1, true);
        template_effect(() => {
          classes_1 = set_class(div_1, 0, `seg el-size ${size() ?? ""} ${get(selected) ? `el-variant ${variant()}` : ""}`, "svelte-8h8dx4", classes_1, { on: !get(option).disabled, off: get(option).disabled });
          set_attribute2(div_1, "testId", testid() && `${testid()}-${get(option).value}`);
          set_text(text, get(option).label);
        });
        event("click", div_1, () => pick(get(option)));
        append($$anchor, div_1);
      });
      reset(div);
      template_effect(() => {
        classes = set_class(div, 0, "track svelte-8h8dx4", null, classes, { focused: get(focused) });
        set_style(div, style());
        set_attribute2(div, "testId", testid());
      });
      event("keydown", div, key);
      event("focus", div, () => set(focused, true));
      event("blur", div, () => set(focused, false));
      append($$anchor, div);
    };
    var alternate = ($$anchor) => {
      var div_2 = root_23();
      var node_1 = child(div_2);
      {
        var consequent_1 = ($$anchor) => {
          var fragment_1 = comment();
          var node_2 = first_child(fragment_1);
          snippet(node_2, () => validate_snippet_renderer(renderer_default, children()));
          append($$anchor, fragment_1);
        };
        if_block(node_1, ($$render) => {
          if (children())
            $$render(consequent_1);
        });
      }
      reset(div_2);
      template_effect(() => {
        set_style(div_2, style());
        set_attribute2(div_2, "testId", testid());
      });
      append($$anchor, div_2);
    };
    if_block(node, ($$render) => {
      if (options())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-8h8dx4", [{ classes: ["track"], tag: null, pseudo: null, css: "align-self: flex-start; display: flex; flex-direction: row; align-items: center; gap: 2px; padding: 2px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md); background-color: var(--bg-raised)" }, { classes: ["seg"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); font-weight: 500; color: var(--text-secondary); user-select: none; white-space: nowrap" }, { classes: ["joined"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 0 } }, { classes: ["track", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["seg", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["seg", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }]);

// gallery/demos/ButtonGroup.demo.svelte
var root6 = from_tree([, , " ", , " ", ,], 1);
var root_14 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center"
      },
      ,
      " ",
      ["div", { style: "color: var(--text-secondary)" }, " "]
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center"
      },
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center"
      },
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: row; gap: 0" },
      ,
    ]
  ]
]);
function ButtonGroup_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let range = state("week");
  let view = state("list");
  let align = state("left");
  const views = [
    { value: "list", label: "List" },
    { value: "board", label: "Board" },
    { value: "graph", label: "Graph" }
  ];
  const aligns = [
    { value: "left", label: "Left" },
    { value: "centre", label: "Centre" },
    { value: "right", label: "Right" }
  ];
  var div = root_14();
  var div_1 = child(div);
  var node = child(div_1);
  ButtonGroup(node, {
    options: [
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
      { value: "year", label: "Year", disabled: true }
    ],
    get value() {
      return get(range);
    },
    onchange: (v) => set(range, v, true)
  });
  var div_2 = sibling(node, 2);
  var text = only_child(div_2);
  reset(div_1);
  var div_3 = sibling(div_1, 2);
  var node_1 = child(div_3);
  ButtonGroup(node_1, {
    get options() {
      return views;
    },
    get value() {
      return get(view);
    },
    onchange: (v) => set(view, v, true),
    variant: "secondary",
    size: "h-md"
  });
  var node_2 = sibling(node_1, 2);
  ButtonGroup(node_2, {
    get options() {
      return views;
    },
    get value() {
      return get(view);
    },
    onchange: (v) => set(view, v, true),
    variant: "success",
    size: "h-lg"
  });
  reset(div_3);
  var div_4 = sibling(div_3, 2);
  var node_3 = child(div_4);
  ButtonGroup(node_3, {
    get options() {
      return aligns;
    },
    get value() {
      return get(align);
    },
    onchange: (v) => set(align, v, true),
    variant: "warning"
  });
  var node_4 = sibling(node_3, 2);
  ButtonGroup(node_4, {
    get options() {
      return aligns;
    },
    get value() {
      return get(align);
    },
    onchange: (v) => set(align, v, true),
    variant: "danger"
  });
  reset(div_4);
  var div_5 = sibling(div_4, 2);
  var node_5 = child(div_5);
  {
    const children = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment = root6();
      var node_6 = first_child(fragment);
      Button(node_6, { variant: "outline", size: "h-md", label: "Undo" });
      var node_7 = sibling(node_6, 2);
      Button(node_7, { variant: "outline", size: "h-md", label: "Redo" });
      var node_8 = sibling(node_7, 2);
      Button(node_8, { variant: "outline", size: "h-md", label: "Reset" });
      append($$anchor, fragment);
    });
    ButtonGroup(node_5, { children, $$slots: { default: true } });
  }
  reset(div_5);
  reset(div);
  template_effect(() => set_text(text, `range: ${get(range) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/IconButton.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/IconButton.svelte
init_renderer2();
init_custom_renderer();
init_client();

// ../gpuix-fractalsvelte/src/components/Tooltip.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_index_client();
init_renderer2();
var root7 = from_tree([
  [
    "div",
    { class: "pin svelte-1pykzpn" },
    [
      "div",
      { class: "dot svelte-1pykzpn" },
      ["anchored", null, ["div", { class: "tip svelte-1pykzpn" }, ,]]
    ]
  ]
]);
var root_15 = from_tree([
  [
    "div",
    { class: "host svelte-1pykzpn" },
    ["div", null, , " ", ,]
  ]
]);
function Tooltip($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let side = prop($$props, "side", 3, "top"), align = prop($$props, "align", 3, "center"), gap = prop($$props, "gap", 3, 6), delay = prop($$props, "delay", 3, 300), open = prop($$props, "open", 3, null), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const CORNERS = {
    top: {
      start: "bottomLeft",
      center: "bottomCenter",
      end: "bottomRight"
    },
    right: { start: "topLeft", center: "leftCenter", end: "bottomLeft" },
    bottom: { start: "topLeft", center: "topCenter", end: "topRight" },
    left: { start: "topRight", center: "rightCenter", end: "bottomRight" }
  };
  const x = user_derived(() => side() === "left" ? "start" : side() === "right" ? "end" : align());
  const y = user_derived(() => side() === "top" ? "start" : side() === "bottom" ? "end" : align());
  let shown = state(false);
  let timer;
  const over = { wrap: false, trigger: false, tip: false };
  function sync() {
    clearTimeout(timer);
    if (!over.wrap && !over.trigger && !over.tip)
      timer = setTimeout(() => set(shown, false), 80);
    else if (!get(shown))
      timer = setTimeout(() => set(shown, true), delay());
  }
  const track = (source) => ({
    onmouseenter: () => {
      over[source] = true;
      sync();
    },
    onmouseleave: () => {
      over[source] = false;
      sync();
    }
  });
  const wrap = track("wrap");
  const trigger = track("trigger");
  const tip = track("tip");
  onDestroy(() => clearTimeout(timer));
  var div = root_15();
  var div_1 = child(div);
  attribute_effect(div_1, () => ({ class: "anchor", hitbox: "self", ...wrap, testId: testid() }), undefined, undefined, undefined, "svelte-1pykzpn");
  var node = child(div_1);
  snippet(node, () => validate_snippet_renderer(renderer_default, $$props.children), () => trigger);
  var node_1 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor) => {
      var div_2 = root7();
      let styles;
      var div_3 = child(div_2);
      var anchored = child(div_3);
      attribute_effect(anchored, () => ({
        side: side(),
        align: "start",
        anchor: CORNERS[side()][align()],
        gap: gap(),
        occlude: false,
        class: "layer",
        ...tip
      }), undefined, undefined, undefined, "svelte-1pykzpn");
      var div_4 = child(anchored);
      var node_2 = child(div_4);
      {
        var consequent = ($$anchor) => {
          var text2 = text();
          template_effect(() => set_text(text2, $$props.content));
          append($$anchor, text2);
        };
        var alternate = ($$anchor) => {
          var fragment_1 = comment();
          var node_3 = first_child(fragment_1);
          snippet(node_3, () => validate_snippet_renderer(renderer_default, $$props.content));
          append($$anchor, fragment_1);
        };
        if_block(node_2, ($$render) => {
          if (typeof $$props.content === "string")
            $$render(consequent);
          else
            $$render(alternate, -1);
        });
      }
      reset(div_4);
      reset(anchored);
      reset(div_3);
      reset(div_2);
      template_effect(() => {
        styles = set_style(div_2, "", styles, { "justify-content": get(x), "align-items": get(y) });
        set_style(div_4, style());
        set_attribute2(div_4, "testId", testid() && `${testid()}-tip`);
      });
      append($$anchor, div_2);
    };
    if_block(node_1, ($$render) => {
      if (open() ?? get(shown))
        $$render(consequent_1);
    });
  }
  reset(div_1);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1pykzpn", [{ classes: ["host"], tag: null, pseudo: null, style: { display: "flex", alignItems: "start" } }, { classes: ["anchor"], tag: null, pseudo: null, style: { position: "relative", display: "flex" } }, { classes: ["pin"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "flex", pointerEvents: "none" } }, { classes: ["dot"], tag: null, pseudo: null, style: { width: 0, height: 0 } }, { classes: ["layer"], tag: null, pseudo: null, style: { backgroundColor: "#00000001" } }, { classes: ["tip"], tag: null, pseudo: null, css: "padding: 4px 8px; border-radius: 6px; font-size: 12px; line-height: 16px; white-space: nowrap; user-select: none; background-color: var(--tooltip-surface, #313244); color: var(--tooltip-ink, #cdd6f4)" }]);

// src/components/IconButton.svelte
init_renderer2();
var root8 = from_tree([["div", null, ,]]);
function IconButton($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const button = renderer_snippet(renderer_default, ($$anchor, hover = noop) => {
    var div = root8();
    attribute_effect(div, ($0) => ({
      class: `btn-icon el-variant ${variant() ?? ""} el-shape ${shape() ?? ""} el-size ${size() ?? ""} ${$0 ?? ""}`,
      tabindex: disabled() ? -1 : 0,
      onclick: activate,
      onkeydown: key,
      ...hover(),
      style: style(),
      testId: testid(),
      [CLASS]: { off: !get(live) }
    }), [() => join() ? `j-${join()}` : ""], undefined, undefined, "svelte-927nsr");
    var node = child(div);
    {
      var consequent = ($$anchor) => {
        var fragment = comment();
        var node_1 = first_child(fragment);
        snippet(node_1, () => validate_snippet_renderer(renderer_default, children()));
        append($$anchor, fragment);
      };
      var alternate = ($$anchor) => {
        var text2 = text();
        template_effect(() => set_text(text2, glyph()));
        append($$anchor, text2);
      };
      if_block(node, ($$render) => {
        if (children())
          $$render(consequent);
        else
          $$render(alternate, -1);
      });
    }
    reset(div);
    append($$anchor, div);
  });
  let children = prop($$props, "children", 3, undefined), glyph = prop($$props, "glyph", 3, ""), label = prop($$props, "label", 3, ""), variant = prop($$props, "variant", 3, "ghost"), size = prop($$props, "size", 3, "h-bs"), shape = prop($$props, "shape", 3, "min"), disabled = prop($$props, "disabled", 3, false), onclick = prop($$props, "onclick", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const join = use_join();
  const live = user_derived(() => !disabled());
  function activate(e) {
    if (get(live))
      onclick()?.(e);
  }
  function key(e) {
    if (e.key === "enter" || e.key === "space")
      activate(e);
  }
  var fragment_2 = comment();
  var node_2 = first_child(fragment_2);
  {
    var consequent_1 = ($$anchor) => {
      var fragment_3 = comment();
      var node_3 = first_child(fragment_3);
      {
        const children = renderer_snippet(renderer_default, ($$anchor, hover = noop) => {
          var fragment_4 = comment();
          var node_4 = first_child(fragment_4);
          validate_snippet_renderer(renderer_default, button)(node_4, hover);
          append($$anchor, fragment_4);
        });
        Tooltip(node_3, {
          get content() {
            return label();
          },
          children,
          $$slots: { default: true }
        });
      }
      append($$anchor, fragment_3);
    };
    var alternate_1 = ($$anchor) => {
      var fragment_5 = comment();
      var node_5 = first_child(fragment_5);
      validate_snippet_renderer(renderer_default, button)(node_5, () => ({}));
      append($$anchor, fragment_5);
    };
    if_block(node_2, ($$render) => {
      if (label())
        $$render(consequent_1);
      else
        $$render(alternate_1, -1);
    });
  }
  append($$anchor, fragment_2);
  $$pop_renderer();
  pop();
}
define_styles("svelte-927nsr", [{ classes: ["btn-icon"], tag: null, pseudo: null, style: { flexShrink: 0, userSelect: "none", cursor: "pointer" } }, { classes: ["btn-icon", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["btn-icon", "j-first"], tag: null, pseudo: null, style: { borderTopRightRadius: 0, borderBottomRightRadius: 0 } }, { classes: ["btn-icon", "j-middle"], tag: null, pseudo: null, style: { borderRadius: 0, marginLeft: -1 } }, { classes: ["btn-icon", "j-last"], tag: null, pseudo: null, style: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -1 } }]);

// gallery/demos/IconButton.demo.svelte
var root9 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
    ],
    " ",
    ["div", null, " "]
  ]
]);
function IconButton_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let added = state(0);
  const variants = [
    "primary",
    "secondary",
    "themed",
    "outline",
    "ghost",
    "link",
    "info",
    "success",
    "warning",
    "danger"
  ];
  const sizes = ["h-sm", "h-md", "h-bs", "h-lg", "h-xl"];
  const shapes = ["square", "min", "modern", "curved", "round"];
  var div = root9();
  var div_1 = child(div);
  each(div_1, 21, () => variants, index, ($$anchor, v) => {
    var fragment = comment();
    var node = first_child(fragment);
    IconButton(node, {
      get variant() {
        return get(v);
      },
      glyph: "+",
      get label() {
        return get(v);
      },
      onclick: () => update(added)
    });
    append($$anchor, fragment);
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  each(div_2, 21, () => shapes, index, ($$anchor, s) => {
    var fragment_1 = comment();
    var node_1 = first_child(fragment_1);
    IconButton(node_1, {
      get shape() {
        return get(s);
      },
      variant: "outline",
      glyph: "+",
      get label() {
        return get(s);
      }
    });
    append($$anchor, fragment_1);
  });
  reset(div_2);
  var div_3 = sibling(div_2, 2);
  each(div_3, 21, () => sizes, index, ($$anchor, z) => {
    var fragment_2 = comment();
    var node_2 = first_child(fragment_2);
    IconButton(node_2, {
      get size() {
        return get(z);
      },
      glyph: "✕",
      get label() {
        return get(z);
      }
    });
    append($$anchor, fragment_2);
  });
  reset(div_3);
  var div_4 = sibling(div_3, 2);
  var node_3 = child(div_4);
  IconButton(node_3, { glyph: "−", label: "Disabled", disabled: true });
  var node_4 = sibling(node_3, 2);
  {
    const children = renderer_snippet(renderer_default, ($$anchor) => {
      next();
      var text2 = text("★");
      append($$anchor, text2);
    });
    IconButton(node_4, {
      variant: "themed",
      label: "Star",
      children,
      $$slots: { default: true }
    });
  }
  reset(div_4);
  var div_5 = sibling(div_4, 2);
  var text_1 = only_child(div_5);
  reset(div);
  template_effect(() => set_text(text_1, `added: ${get(added) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Link.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Link.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root10 = from_tree([["div", null, ,]]);
function Link($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let children = prop($$props, "children", 3, undefined), label = prop($$props, "label", 3, ""), variant = prop($$props, "variant", 3, "themed"), size = prop($$props, "size", 3, "h-bs"), disabled = prop($$props, "disabled", 3, false), onclick = prop($$props, "onclick", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  const live = user_derived(() => !disabled());
  function activate(e) {
    if (get(live))
      onclick()?.(e);
  }
  function key(e) {
    if (e.key === "enter" || e.key === "space")
      activate(e);
  }
  var div = root10();
  let classes;
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      snippet(node_1, () => validate_snippet_renderer(renderer_default, children()));
      append($$anchor, fragment);
    };
    var alternate = ($$anchor) => {
      var text2 = text();
      template_effect(() => set_text(text2, label()));
      append($$anchor, text2);
    };
    if_block(node, ($$render) => {
      if (children())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  reset(div);
  template_effect(() => {
    classes = set_class(div, 0, `link el-size ${variant() ?? ""} ${size() ?? ""}`, "svelte-4ul4r9", classes, { on: get(live), off: !get(live), focused: get(focused) });
    set_attribute2(div, "tabindex", disabled() ? -1 : 0);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  event("click", div, activate);
  event("keydown", div, key);
  event("focus", div, () => set(focused, true));
  event("blur", div, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-4ul4r9", [{ classes: ["link"], tag: null, pseudo: null, css: "align-self: flex-start; border-width: 1px; border-color: #00000000; border-radius: var(--radius-sm); padding: 0 2px; font-weight: 500; text-decoration: none; user-select: none; cursor: pointer" }, { classes: ["link", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["link", "themed"], tag: null, pseudo: null, css: "color: var(--theme-color)" }, { classes: ["link", "danger"], tag: null, pseudo: null, css: "color: var(--danger)" }, { classes: ["link", "success"], tag: null, pseudo: null, css: "color: var(--success)" }, { classes: ["link", "warning"], tag: null, pseudo: null, css: "color: var(--warning)" }, { classes: ["link", "info"], tag: null, pseudo: null, css: "color: var(--info)" }, { classes: ["link", "secondary"], tag: null, pseudo: null, css: "color: var(--text-primary)" }, { classes: ["link", "on"], tag: null, pseudo: "hover", style: { textDecoration: "underline" } }, { classes: ["link", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["link", "on", "themed"], tag: null, pseudo: "hover", css: "color: var(--theme-color-alt)" }, { classes: ["link", "on", "danger"], tag: null, pseudo: "hover", css: "color: var(--danger-hover)" }]);

// gallery/demos/Link.demo.svelte
var root11 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 14px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    ["div", { style: "color: var(--text-secondary)" }, " "]
  ]
]);
function Link_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let last = state("none");
  var div = root11();
  var div_1 = child(div);
  each(div_1, 20, () => [
    "themed",
    "secondary",
    "info",
    "success",
    "warning",
    "danger"
  ], index, ($$anchor, variant) => {
    var fragment = comment();
    var node = first_child(fragment);
    Link(node, {
      get variant() {
        return variant;
      },
      get label() {
        return variant;
      },
      onclick: () => set(last, variant, true)
    });
    append($$anchor, fragment);
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_1 = child(div_2);
  Link(node_1, {
    size: "h-sm",
    label: "Small",
    onclick: () => set(last, "small")
  });
  var node_2 = sibling(node_1, 2);
  Link(node_2, {
    size: "h-md",
    label: "Medium",
    onclick: () => set(last, "medium")
  });
  var node_3 = sibling(node_2, 2);
  Link(node_3, {
    size: "h-lg",
    label: "Large",
    onclick: () => set(last, "large")
  });
  var node_4 = sibling(node_3, 2);
  Link(node_4, { label: "Disabled", disabled: true });
  reset(div_2);
  var div_3 = sibling(div_2, 2);
  var text = only_child(div_3);
  reset(div);
  template_effect(() => set_text(text, `last clicked: ${get(last) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Toggle.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Toggle.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root12 = from_tree([["div", null, ,]]);
function Toggle($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let children = prop($$props, "children", 3, undefined), label = prop($$props, "label", 3, ""), pressed = prop($$props, "pressed", 3, false), onchange = prop($$props, "onchange", 3, undefined), variant = prop($$props, "variant", 3, "outline"), pressedVariant = prop($$props, "pressedVariant", 3, "themed"), size = prop($$props, "size", 3, "h-bs"), disabled = prop($$props, "disabled", 3, false), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const join = use_join();
  let focused = state(false);
  const live = user_derived(() => !disabled());
  function flip(e) {
    if (get(live))
      onchange()?.(!pressed());
  }
  function key(e) {
    if (e.key === "enter" || e.key === "space")
      flip(e);
  }
  var div = root12();
  let classes;
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      snippet(node_1, () => validate_snippet_renderer(renderer_default, children()));
      append($$anchor, fragment);
    };
    var alternate = ($$anchor) => {
      var text2 = text();
      template_effect(() => set_text(text2, label()));
      append($$anchor, text2);
    };
    if_block(node, ($$render) => {
      if (children())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  reset(div);
  template_effect(($0) => {
    classes = set_class(div, 0, `toggle el-size ${size() ?? ""} ${$0 ?? ""} ${variant() ?? ""} ${pressed() ? `pressed-${pressedVariant()}` : ""}`, "svelte-1gtj7n3", classes, {
      pressed: pressed(),
      idle: !pressed(),
      on: get(live),
      off: !get(live),
      focused: get(focused)
    });
    set_attribute2(div, "tabindex", disabled() ? -1 : 0);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  }, [() => join() ? `j-${join()}` : ""]);
  event("click", div, flip);
  event("keydown", div, key);
  event("focus", div, () => set(focused, true));
  event("blur", div, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1gtj7n3", [{ classes: ["toggle"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 6px; border-width: 1px; border-color: #00000000; border-radius: var(--radius-md); font-weight: 500; white-space: nowrap; user-select: none; cursor: pointer; color: var(--text-secondary)" }, { classes: ["toggle", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["toggle", "outline"], tag: null, pseudo: null, css: "background-color: #00000000; border-color: var(--border-strong)" }, { classes: ["toggle", "ghost"], tag: null, pseudo: null, style: { backgroundColor: "#00000000" } }, { classes: ["toggle", "pressed-themed"], tag: null, pseudo: null, css: "background-color: var(--theme-color-sub); color: var(--theme-color)" }, { classes: ["toggle", "pressed-secondary"], tag: null, pseudo: null, css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["toggle", "pressed-info"], tag: null, pseudo: null, css: "background-color: var(--info-soft); color: var(--info)" }, { classes: ["toggle", "pressed-success"], tag: null, pseudo: null, css: "background-color: var(--success-soft); color: var(--success)" }, { classes: ["toggle", "pressed-warning"], tag: null, pseudo: null, css: "background-color: var(--warning-soft); color: var(--warning)" }, { classes: ["toggle", "pressed-danger"], tag: null, pseudo: null, css: "background-color: var(--danger-soft); color: var(--danger)" }, { classes: ["toggle", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["toggle", "j-first"], tag: null, pseudo: null, style: { borderTopRightRadius: 0, borderBottomRightRadius: 0 } }, { classes: ["toggle", "j-middle"], tag: null, pseudo: null, style: { borderRadius: 0, marginLeft: -1 } }, { classes: ["toggle", "j-last"], tag: null, pseudo: null, style: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -1 } }, { classes: ["toggle", "on", "idle"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }]);

// gallery/demos/Toggle.demo.svelte
var root13 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    ["div", { style: "color: var(--text-secondary)" }, " "]
  ]
]);
function Toggle_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let bold = state(false);
  let italic = state(true);
  let wrap = state(false);
  var div = root13();
  var div_1 = child(div);
  var node = child(div_1);
  Toggle(node, {
    label: "Bold",
    get pressed() {
      return get(bold);
    },
    onchange: (p) => set(bold, p, true)
  });
  var node_1 = sibling(node, 2);
  Toggle(node_1, {
    label: "Italic",
    get pressed() {
      return get(italic);
    },
    onchange: (p) => set(italic, p, true),
    pressedVariant: "secondary"
  });
  var node_2 = sibling(node_1, 2);
  Toggle(node_2, {
    label: "Wrap",
    get pressed() {
      return get(wrap);
    },
    onchange: (p) => set(wrap, p, true),
    pressedVariant: "success",
    variant: "ghost"
  });
  var node_3 = sibling(node_2, 2);
  Toggle(node_3, {
    label: "Locked",
    pressed: true,
    disabled: true,
    pressedVariant: "danger"
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  each(div_2, 20, () => [
    "themed",
    "secondary",
    "info",
    "success",
    "warning",
    "danger"
  ], index, ($$anchor, pressedVariant) => {
    var fragment = comment();
    var node_4 = first_child(fragment);
    {
      let $0 = user_derived(() => pressedVariant !== "secondary");
      Toggle(node_4, {
        get pressedVariant() {
          return pressedVariant;
        },
        get label() {
          return pressedVariant;
        },
        get pressed() {
          return get($0);
        }
      });
    }
    append($$anchor, fragment);
  });
  reset(div_2);
  var div_3 = sibling(div_2, 2);
  var node_5 = child(div_3);
  Toggle(node_5, { size: "h-md", label: "Small", pressed: true });
  var node_6 = sibling(node_5, 2);
  Toggle(node_6, { size: "h-bs", label: "Medium", pressed: true });
  var node_7 = sibling(node_6, 2);
  Toggle(node_7, { size: "h-lg", label: "Large", pressed: true });
  reset(div_3);
  var div_4 = sibling(div_3, 2);
  var text = only_child(div_4);
  reset(div);
  template_effect(() => set_text(text, `bold: ${get(bold) ? "on" : "off"} · italic: ${get(italic) ? "on" : "off"} · wrap: ${get(wrap) ? "on" : "off"}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Checkbox.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Checkbox.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root14 = from_tree([["svg", { class: "mark svelte-2eg8wy" }]], 4);
var root_16 = from_tree([["div", { class: "text svelte-2eg8wy" }, ,]]);
var root_24 = from_tree([["div", { class: "text svelte-2eg8wy" }, " "]]);
var root_32 = from_tree([
  [
    "div",
    { hitbox: "self", role: "checkbox" },
    ["div", null, ,],
    " ",
    ,
  ]
]);
function Checkbox($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const CHECK = '<svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const DASH = '<svg viewBox="0 0 16 16"><path d="M4 8h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  let checked = prop($$props, "checked", 3, false), indeterminate = prop($$props, "indeterminate", 3, false), onchange = prop($$props, "onchange", 3, undefined), label = prop($$props, "label", 3, ""), children = prop($$props, "children", 3, undefined), disabled = prop($$props, "disabled", 3, false), size = prop($$props, "size", 3, "h-sm"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  const lit = user_derived(() => checked() || indeterminate());
  const mark = user_derived(() => indeterminate() ? DASH : checked() ? CHECK : "");
  function toggle() {
    if (!disabled())
      onchange()?.(!checked());
  }
  function key(e) {
    if (e.key === "space")
      toggle();
  }
  var div = root_32();
  let classes;
  var div_1 = child(div);
  let classes_1;
  var node = child(div_1);
  {
    var consequent = ($$anchor) => {
      var svg = root14();
      template_effect(() => set_attribute2(svg, "source", get(mark)));
      append($$anchor, svg);
    };
    if_block(node, ($$render) => {
      if (get(mark))
        $$render(consequent);
    });
  }
  reset(div_1);
  var node_1 = sibling(div_1, 2);
  {
    var consequent_1 = ($$anchor) => {
      var div_2 = root_16();
      var node_2 = child(div_2);
      snippet(node_2, () => validate_snippet_renderer(renderer_default, children()));
      reset(div_2);
      append($$anchor, div_2);
    };
    var consequent_2 = ($$anchor) => {
      var div_3 = root_24();
      var text = only_child(div_3, true);
      template_effect(() => set_text(text, label()));
      append($$anchor, div_3);
    };
    if_block(node_1, ($$render) => {
      if (children())
        $$render(consequent_1);
      else if (label())
        $$render(consequent_2, 1);
    });
  }
  reset(div);
  template_effect(() => {
    classes = set_class(div, 0, `row ${size() ?? ""}`, "svelte-2eg8wy", classes, { on: !disabled(), off: disabled() });
    set_attribute2(div, "tabindex", disabled() ? -1 : 0);
    set_attribute2(div, "aria-label", label() || null);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    classes_1 = set_class(div_1, 0, `box box-${size() ?? ""}`, "svelte-2eg8wy", classes_1, { lit: get(lit), focused: get(focused) });
    set_attribute2(div_1, "testId", testid() && `${testid()}-box`);
  });
  event("click", div, toggle);
  event("keydown", div, key);
  event("focus", div, () => set(focused, true));
  event("blur", div, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-2eg8wy", [{ classes: ["row"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 8 } }, { classes: ["box"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-width: 1px; border-color: var(--border-strong); border-radius: var(--radius-sm); background-color: var(--bg-surface)" }, { classes: ["mark"], tag: null, pseudo: null, css: "width: 12px; height: 12px; color: var(--text-theme)" }, { classes: ["text"], tag: null, pseudo: null, css: "font-size: var(--text-md); color: var(--text-primary)" }, { classes: ["row", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["row", "off"], tag: null, pseudo: null, style: { cursor: "not-allowed", opacity: 0.5 } }, { classes: ["box", "lit"], tag: null, pseudo: null, css: "background-color: var(--theme-color); border-color: var(--theme-color)" }, { classes: ["box", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }]);

// gallery/demos/Checkbox.demo.svelte
var root15 = from_tree([["div", { style: "padding-left: 24px" }, ,]]);
var root_17 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: row; gap: 48px" },
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 12px" },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 12px" },
      ,
      " ",
      ,
    ]
  ]
]);
function Checkbox_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let items = state(proxy([true, false, true]));
  const all = user_derived(() => get(items).every(Boolean));
  const some = user_derived(() => get(items).some(Boolean) && !get(all));
  let terms = state(false);
  var div = root_17();
  var div_1 = child(div);
  var node = child(div_1);
  Checkbox(node, { label: "Small", size: "h-sm", checked: true });
  var node_1 = sibling(node, 2);
  Checkbox(node_1, {
    label: "Medium",
    size: "h-md",
    get checked() {
      return get(terms);
    },
    onchange: (v) => set(terms, v, true)
  });
  var node_2 = sibling(node_1, 2);
  Checkbox(node_2, { label: "Large", size: "h-bs", checked: true });
  var node_3 = sibling(node_2, 2);
  Checkbox(node_3, { label: "Indeterminate", indeterminate: true });
  var node_4 = sibling(node_3, 2);
  Checkbox(node_4, { label: "Disabled", disabled: true });
  var node_5 = sibling(node_4, 2);
  Checkbox(node_5, { label: "Disabled checked", disabled: true, checked: true });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_6 = child(div_2);
  Checkbox(node_6, {
    label: "Select all",
    get checked() {
      return get(all);
    },
    get indeterminate() {
      return get(some);
    },
    onchange: (v) => set(items, get(items).map(() => v), true)
  });
  var node_7 = sibling(node_6, 2);
  each(node_7, 17, () => get(items), index, ($$anchor, on, i) => {
    var div_3 = root15();
    var node_8 = child(div_3);
    Checkbox(node_8, {
      label: `Item ${i + 1}`,
      get checked() {
        return get(on);
      },
      onchange: (v) => get(items)[i] = v
    });
    reset(div_3);
    append($$anchor, div_3);
  });
  reset(div_2);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/RadioGroup.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/RadioGroup.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root16 = from_tree([["div", { class: "dot svelte-td64dj" }]]);
var root_18 = from_tree([
  [
    "div",
    null,
    ["div", null, ,],
    " ",
    ["div", { class: "label svelte-td64dj" }, " "]
  ]
]);
var root_25 = from_tree([["div"]]);
function RadioGroup($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let value = prop($$props, "value", 3, null), onchange = prop($$props, "onchange", 3, undefined), direction = prop($$props, "direction", 3, "column"), size = prop($$props, "size", 3, "h-sm"), disabled = prop($$props, "disabled", 3, false), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const nodes = [];
  let focused = state(-1);
  const checked = user_derived(() => $$props.options.findIndex((o) => o.value === value()));
  const enabled = (i) => !disabled() && !$$props.options[i].disabled;
  const focus_node = (node) => {
    if (node?.nativeId != null)
      get_native()?.focusElement(node.nativeId);
  };
  function pick(i) {
    if (!enabled(i) || i === get(checked))
      return;
    onchange()?.($$props.options[i].value);
  }
  function move(from, dir) {
    const n = $$props.options.length;
    for (let step = 1;step < n; step++) {
      const i = (from + dir * step + n) % n;
      if (enabled(i)) {
        focus_node(nodes[i]);
        pick(i);
        return;
      }
    }
  }
  function key(i, e) {
    if (e.key === "down" || e.key === "right")
      move(i, 1);
    else if (e.key === "up" || e.key === "left")
      move(i, -1);
    else if (e.key === "space")
      pick(i);
  }
  var div = root_25();
  each(div, 23, () => $$props.options, (opt) => opt.value, ($$anchor, opt, i) => {
    var div_1 = root_18();
    let classes;
    var div_2 = child(div_1);
    let classes_1;
    var node_1 = child(div_2);
    {
      var consequent = ($$anchor) => {
        var div_3 = root16();
        append($$anchor, div_3);
      };
      if_block(node_1, ($$render) => {
        if (get(i) === get(checked))
          $$render(consequent);
      });
    }
    reset(div_2);
    var div_4 = sibling(div_2, 2);
    var text = only_child(div_4, true);
    reset(div_1);
    attach2(div_1, () => (node) => nodes[get(i)] = node);
    template_effect(($0, $1, $2) => {
      classes = set_class(div_1, 0, "opt svelte-td64dj", null, classes, { on: $0, off: $1 });
      set_attribute2(div_1, "tabindex", $2);
      set_attribute2(div_1, "testId", testid() && `${testid()}-${get(opt).value}`);
      classes_1 = set_class(div_2, 0, `circle box-${size() ?? ""}`, "svelte-td64dj", classes_1, {
        checked: get(i) === get(checked),
        focused: get(focused) === get(i)
      });
      set_text(text, get(opt).label);
    }, [
      () => enabled(get(i)),
      () => !enabled(get(i)),
      () => enabled(get(i)) ? 0 : -1
    ]);
    event("click", div_1, () => pick(get(i)));
    event("keydown", div_1, (e) => key(get(i), e));
    event("focus", div_1, () => set(focused, get(i), true));
    event("blur", div_1, () => set(focused, -1));
    append($$anchor, div_1);
  });
  reset(div);
  template_effect(() => {
    set_class(div, 0, `group ${direction() ?? ""}`, "svelte-td64dj");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-td64dj", [{ classes: ["group"], tag: null, pseudo: null, style: { display: "flex" } }, { classes: ["opt"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 8, userSelect: "none" } }, { classes: ["circle"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; border-width: 1px; border-color: var(--border-strong); border-radius: var(--radius-full); background-color: var(--bg-surface)" }, { classes: ["dot"], tag: null, pseudo: null, css: "width: 40%; height: 40%; border-radius: var(--radius-full); background-color: var(--theme-color)" }, { classes: ["label"], tag: null, pseudo: null, css: "color: var(--text-primary); font-size: var(--text-md)" }, { classes: ["group", "column"], tag: null, pseudo: null, style: { flexDirection: "column", gap: 4 } }, { classes: ["group", "row"], tag: null, pseudo: null, style: { flexDirection: "row", gap: 16 } }, { classes: ["opt", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["opt", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["circle", "checked"], tag: null, pseudo: null, css: "border-color: var(--theme-color)" }, { classes: ["circle", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }]);

// gallery/demos/RadioGroup.demo.svelte
var root17 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 20px; padding: 8px"
    },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 48px; align-items: start"
      },
      [
        "div",
        { style: "display: flex; flex-direction: column; gap: 8px" },
        [
          "div",
          {
            style: "color: var(--text-secondary); font-size: var(--text-sm)"
          },
          "Column · md · one disabled option"
        ],
        " ",
        ,
      ],
      " ",
      [
        "div",
        { style: "display: flex; flex-direction: column; gap: 8px" },
        [
          "div",
          {
            style: "color: var(--text-secondary); font-size: var(--text-sm)"
          },
          "Sizes"
        ],
        " ",
        ,
        " ",
        ,
      ]
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      [
        "div",
        {
          style: "color: var(--text-secondary); font-size: var(--text-sm)"
        },
        "Row"
      ],
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      [
        "div",
        {
          style: "color: var(--text-secondary); font-size: var(--text-sm)"
        },
        "Disabled group"
      ],
      " ",
      ,
    ],
    " ",
    ["div", { style: "color: var(--text-secondary)" }, " "]
  ]
]);
function RadioGroup_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const plans = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "lifetime", label: "Lifetime", disabled: true }
  ];
  const views = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "board", label: "Board" }
  ];
  let plan = state("monthly");
  let view = state("grid");
  var div = root17();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var node = sibling(child(div_2), 2);
  RadioGroup(node, {
    get options() {
      return plans;
    },
    get value() {
      return get(plan);
    },
    onchange: (v) => set(plan, v, true)
  });
  reset(div_2);
  var div_3 = sibling(div_2, 2);
  var node_1 = sibling(child(div_3), 2);
  {
    let $0 = user_derived(() => plans.slice(0, 2));
    RadioGroup(node_1, {
      get options() {
        return get($0);
      },
      get value() {
        return get(plan);
      },
      size: "h-sm",
      onchange: (v) => set(plan, v, true)
    });
  }
  var node_2 = sibling(node_1, 2);
  {
    let $0 = user_derived(() => plans.slice(0, 2));
    RadioGroup(node_2, {
      get options() {
        return get($0);
      },
      get value() {
        return get(plan);
      },
      size: "h-bs",
      onchange: (v) => set(plan, v, true)
    });
  }
  reset(div_3);
  reset(div_1);
  var div_4 = sibling(div_1, 2);
  var node_3 = sibling(child(div_4), 2);
  RadioGroup(node_3, {
    get options() {
      return views;
    },
    get value() {
      return get(view);
    },
    direction: "row",
    onchange: (v) => set(view, v, true)
  });
  reset(div_4);
  var div_5 = sibling(div_4, 2);
  var node_4 = sibling(child(div_5), 2);
  RadioGroup(node_4, {
    get options() {
      return views;
    },
    value: "list",
    direction: "row",
    disabled: true
  });
  reset(div_5);
  var div_6 = sibling(div_5, 2);
  var text = only_child(div_6);
  reset(div);
  template_effect(() => set_text(text, `plan: ${get(plan) ?? ""} · view: ${get(view) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Select.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Select.svelte
init_renderer2();
init_custom_renderer();
init_client();

// ../gpuix-fractalsvelte/src/components/Popover.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root18 = from_tree([
  [
    "div",
    { class: "pin svelte-1h6iz0d" },
    [
      "div",
      { class: "dot svelte-1h6iz0d" },
      [
        "anchored",
        { align: "start", class: "layer svelte-1h6iz0d" },
        ["div", { class: "panel svelte-1h6iz0d" }, ,]
      ]
    ]
  ]
]);
var root_19 = from_tree([
  [
    "div",
    { class: "host svelte-1h6iz0d" },
    ["div", { class: "anchor svelte-1h6iz0d" }, , " ", ,]
  ]
]);
function Popover($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let side = prop($$props, "side", 3, "bottom"), align = prop($$props, "align", 3, "start"), gap = prop($$props, "gap", 3, 4), position = prop($$props, "position", 3, null), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const CORNERS = {
    top: {
      start: "bottomLeft",
      center: "bottomCenter",
      end: "bottomRight"
    },
    right: { start: "topLeft", center: "leftCenter", end: "bottomLeft" },
    bottom: { start: "topLeft", center: "topCenter", end: "topRight" },
    left: { start: "topRight", center: "rightCenter", end: "bottomRight" }
  };
  const x = user_derived(() => side() === "left" ? "start" : side() === "right" ? "end" : align());
  const y = user_derived(() => side() === "top" ? "start" : side() === "bottom" ? "end" : align());
  let anchor = null;
  function outside(e) {
    const box = anchor?.nativeId == null ? null : get_native()?.getElementBounds(anchor.nativeId);
    const px = e.x ?? -1;
    const py = e.y ?? -1;
    if (box && px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height)
      return;
    $$props.onclose();
  }
  user_effect(() => {
    if (!$$props.open)
      return;
    return on_window_key("keydown", (e) => {
      if (e.key === "escape")
        $$props.onclose();
    });
  });
  var div = root_19();
  var div_1 = child(div);
  var node_1 = child(div_1);
  snippet(node_1, () => validate_snippet_renderer(renderer_default, $$props.children));
  var node_2 = sibling(node_1, 2);
  {
    var consequent = ($$anchor) => {
      var div_2 = root18();
      let styles;
      var div_3 = child(div_2);
      var anchored = child(div_3);
      var div_4 = child(anchored);
      var node_3 = child(div_4);
      snippet(node_3, () => validate_snippet_renderer(renderer_default, $$props.content));
      reset(div_4);
      reset(anchored);
      reset(div_3);
      reset(div_2);
      template_effect(() => {
        styles = set_style(div_2, "", styles, { "justify-content": get(x), "align-items": get(y) });
        set_attribute2(anchored, "side", side());
        set_attribute2(anchored, "anchor", CORNERS[side()][align()]);
        set_attribute2(anchored, "gap", gap());
        set_attribute2(anchored, "position", position());
        set_style(div_4, style());
        set_attribute2(div_4, "testId", testid() && `${testid()}-panel`);
      });
      event("mousedownoutside", div_4, outside);
      append($$anchor, div_2);
    };
    if_block(node_2, ($$render) => {
      if ($$props.open)
        $$render(consequent);
    });
  }
  reset(div_1);
  attach2(div_1, () => (node) => anchor = node);
  reset(div);
  template_effect(() => set_attribute2(div_1, "testId", testid()));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1h6iz0d", [{ classes: ["host"], tag: null, pseudo: null, style: { display: "flex", alignItems: "start" } }, { classes: ["anchor"], tag: null, pseudo: null, style: { position: "relative", display: "flex" } }, { classes: ["pin"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "flex", pointerEvents: "none" } }, { classes: ["dot"], tag: null, pseudo: null, style: { width: 0, height: 0 } }, { classes: ["layer"], tag: null, pseudo: null, style: { backgroundColor: "#00000001" } }, { classes: ["panel"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; padding: 4px; border-radius: 8px; border-width: 1px; border-color: var(--popover-border, #45475a); background-color: var(--popover-surface, #1e1e2e); color: var(--popover-ink, #cdd6f4)" }]);

// src/components/Select.svelte
init_renderer2();
var root19 = from_tree([
  [
    "div",
    null,
    ["div", { class: "check svelte-2jrnnb" }, " "],
    " ",
    ["div", { class: "name svelte-2jrnnb" }, " "]
  ]
]);
var root_110 = from_tree([["div", null, ,]]);
var root_26 = from_tree([
  [
    "div",
    null,
    ["div", null, " "],
    " ",
    ["div", { class: "chevron svelte-2jrnnb" }, "▾"]
  ]
]);
function Select($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const list = renderer_snippet(renderer_default, ($$anchor) => {
    var fragment = comment();
    var node_1 = first_child(fragment);
    each(node_1, 19, () => $$props.options, (opt) => opt.value, ($$anchor, opt, i) => {
      var div = root19();
      let classes;
      var div_1 = child(div);
      var text = only_child(div_1, true);
      var div_2 = sibling(div_1, 2);
      var text_1 = only_child(div_2, true);
      reset(div);
      attach2(div, () => (node) => items[get(i)] = node);
      template_effect(($0, $1) => {
        classes = set_class(div, 0, `item el-size ${size() ?? ""}`, "svelte-2jrnnb", classes, { on: $0, off: $1, hl: get(i) === get(active) });
        set_attribute2(div, "testId", testid() && `${testid()}-option-${get(opt).value}`);
        set_text(text, get(i) === get(selected) ? "✓" : "");
        set_text(text_1, get(opt).label);
      }, [() => enabled(get(i)), () => !enabled(get(i))]);
      event("mouseenter", div, () => enabled(get(i)) && set(active, get(i), true));
      event("click", div, () => pick(get(i)));
      append($$anchor, div);
    });
    append($$anchor, fragment);
  });
  let value = prop($$props, "value", 3, null), onchange = prop($$props, "onchange", 3, undefined), placeholder = prop($$props, "placeholder", 3, "Select…"), size = prop($$props, "size", 3, "h-lg"), disabled = prop($$props, "disabled", 3, false), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const ITEM = { "h-md": 20, "h-bs": 24, "h-lg": 32, "h-xl": 40 };
  const MAX_ROWS = 8;
  let open = state(false);
  let active = state(-1);
  let width = state(200);
  let focused = state(false);
  let trigger = null;
  const items = [];
  const selected = user_derived(() => $$props.options.findIndex((o) => o.value === value()));
  const enabled = (i) => !disabled() && !$$props.options[i].disabled;
  const long = user_derived(() => $$props.options.length > MAX_ROWS);
  function toggle() {
    if (disabled())
      return;
    if (get(open)) {
      set(open, false);
      return;
    }
    const box = trigger?.nativeId == null ? null : get_native()?.getElementBounds(trigger.nativeId);
    if (box)
      set(width, box.width, true);
    set(active, get(selected) >= 0 ? get(selected) : $$props.options.findIndex((o) => !o.disabled), true);
    set(open, true);
  }
  function pick(i) {
    if (i < 0 || !enabled(i))
      return;
    set(open, false);
    if ($$props.options[i].value !== value())
      onchange()?.($$props.options[i].value);
  }
  function move(dir) {
    for (let i = get(active) + dir;i >= 0 && i < $$props.options.length; i += dir) {
      if (!$$props.options[i].disabled) {
        set(active, i, true);
        const node = items[i];
        if (node?.nativeId != null)
          get_native()?.scrollIntoView(node.nativeId);
        return;
      }
    }
  }
  function key(e) {
    if (!get(open)) {
      if (e.key === "enter" || e.key === "space" || e.key === "down" || e.key === "up")
        toggle();
    } else if (e.key === "down")
      move(1);
    else if (e.key === "up")
      move(-1);
    else if (e.key === "enter" || e.key === "space")
      pick(get(active));
    else if (e.key === "tab")
      set(open, false);
  }
  var fragment_1 = comment();
  var node_2 = first_child(fragment_1);
  {
    const content = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_2 = comment();
      var node_3 = first_child(fragment_2);
      {
        var consequent = ($$anchor) => {
          var div_3 = root_110();
          var node_4 = child(div_3);
          {
            let $0 = user_derived(() => testid() && `${testid()}-scroll`);
            Scroller(node_4, {
              gap: 0,
              get testid() {
                return get($0);
              },
              children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
                var fragment_3 = comment();
                var node_5 = first_child(fragment_3);
                validate_snippet_renderer(renderer_default, list)(node_5);
                append($$anchor, fragment_3);
              }),
              $$slots: { default: true }
            });
          }
          reset(div_3);
          template_effect(() => set_style(div_3, `height: ${MAX_ROWS * ITEM[size()]}px`));
          append($$anchor, div_3);
        };
        var alternate = ($$anchor) => {
          var fragment_4 = comment();
          var node_6 = first_child(fragment_4);
          validate_snippet_renderer(renderer_default, list)(node_6);
          append($$anchor, fragment_4);
        };
        if_block(node_3, ($$render) => {
          if (get(long))
            $$render(consequent);
          else
            $$render(alternate, -1);
        });
      }
      append($$anchor, fragment_2);
    });
    Popover(node_2, {
      get open() {
        return get(open);
      },
      onclose: () => set(open, false),
      gap: 4,
      get style() {
        return `width: ${get(width) ?? ""}px; padding: 4px; border-radius: var(--radius-md); border-color: var(--border); background-color: var(--bg-sunken); color: var(--text-primary)`;
      },
      get testid() {
        return testid();
      },
      content,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var div_4 = root_26();
        let classes_1;
        var div_5 = child(div_4);
        let classes_2;
        var text_2 = only_child(div_5, true);
        next(2);
        reset(div_4);
        attach2(div_4, () => (node) => trigger = node);
        template_effect(() => {
          classes_1 = set_class(div_4, 0, `trigger el-size ${size() ?? ""}`, "svelte-2jrnnb", classes_1, { on: !disabled(), off: disabled(), focused: get(focused) });
          set_attribute2(div_4, "tabindex", disabled() ? -1 : 0);
          set_style(div_4, style());
          set_attribute2(div_4, "testId", testid() && `${testid()}-trigger`);
          classes_2 = set_class(div_5, 0, "value svelte-2jrnnb", null, classes_2, { placeholder: get(selected) < 0 });
          set_text(text_2, get(selected) >= 0 ? $$props.options[get(selected)].label : placeholder());
        });
        event("click", div_4, toggle);
        event("keydown", div_4, key);
        event("focus", div_4, () => set(focused, true));
        event("blur", div_4, () => set(focused, false));
        append($$anchor, div_4);
      }),
      $$slots: { content: true, default: true }
    });
  }
  append($$anchor, fragment_1);
  $$pop_renderer();
  pop();
}
define_styles("svelte-2jrnnb", [{ classes: ["trigger"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; gap: 8px; width: 200px; padding: 0 10px; border-width: 1px; border-color: var(--border-strong); border-radius: var(--radius-md); background-color: var(--bg-surface); color: var(--text-primary); user-select: none" }, { classes: ["value"], tag: null, pseudo: null, style: { flexGrow: 1 } }, { classes: ["chevron"], tag: null, pseudo: null, css: "color: var(--text-secondary)" }, { classes: ["item"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; gap: 6px; padding: 0 8px; border-radius: var(--radius-sm); color: var(--text-primary); user-select: none" }, { classes: ["check"], tag: null, pseudo: null, css: "width: 12px; color: var(--theme-color)" }, { classes: ["name"], tag: null, pseudo: null, style: { flexGrow: 1 } }, { classes: ["trigger", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["trigger", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["trigger", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["value", "placeholder"], tag: null, pseudo: null, css: "color: var(--text-muted)" }, { classes: ["item", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["item", "off"], tag: null, pseudo: null, css: "color: var(--text-muted); cursor: not-allowed" }, { classes: ["item", "hl"], tag: null, pseudo: null, css: "background-color: var(--bg-raised)" }]);

// gallery/demos/Select.demo.svelte
var root20 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 16px; padding: 8px"
    },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center"
      },
      ,
      " ",
      ,
    ],
    " ",
    ["div", { style: "color: var(--text-secondary)" }, " "]
  ]
]);
function Select_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const fruits = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "date", label: "Date", disabled: true },
    { value: "elder", label: "Elderberry" }
  ];
  const zones = Array.from({ length: 24 }, (_, i) => ({ value: `z${i + 1}`, label: `Zone ${i + 1}` }));
  let fruit = state(null);
  let zone = state("z3");
  var div = root20();
  var div_1 = child(div);
  var node = child(div_1);
  Select(node, {
    get options() {
      return fruits;
    },
    get value() {
      return get(fruit);
    },
    onchange: (v) => set(fruit, v, true),
    placeholder: "Pick a fruit",
    size: "h-md"
  });
  var node_1 = sibling(node, 2);
  Select(node_1, {
    get options() {
      return fruits;
    },
    get value() {
      return get(fruit);
    },
    onchange: (v) => set(fruit, v, true),
    placeholder: "Pick a fruit"
  });
  var node_2 = sibling(node_1, 2);
  Select(node_2, {
    get options() {
      return fruits;
    },
    get value() {
      return get(fruit);
    },
    onchange: (v) => set(fruit, v, true),
    placeholder: "Pick a fruit",
    size: "h-xl"
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_3 = child(div_2);
  Select(node_3, {
    get options() {
      return fruits;
    },
    value: "banana",
    disabled: true
  });
  var node_4 = sibling(node_3, 2);
  Select(node_4, {
    get options() {
      return zones;
    },
    get value() {
      return get(zone);
    },
    onchange: (v) => set(zone, v, true),
    placeholder: "Long list"
  });
  reset(div_2);
  var div_3 = sibling(div_2, 2);
  var text = only_child(div_3);
  reset(div);
  template_effect(() => set_text(text, `fruit: ${get(fruit) ?? "none" ?? ""} · zone: ${get(zone) ?? "none" ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Slider.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Slider.svelte
init_renderer2();
init_custom_renderer();
init_client();

// ../gpuix-fractalsvelte/src/components/Portal.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root21 = from_tree([["div", { portal: "", class: "portal svelte-17r779r" }, ,]]);
function Portal($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  var div = root21();
  var node = child(div);
  snippet(node, () => validate_snippet_renderer(renderer_default, $$props.children));
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}
define_styles("svelte-17r779r", [{ classes: ["portal"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" } }]);

// src/components/Slider.svelte
init_renderer2();
var root_111 = from_tree([["div", { class: "cover svelte-11dl705" }]]);
var root_27 = from_tree([
  [
    "div",
    { hitbox: "self" },
    [
      "div",
      { class: "track svelte-11dl705" },
      ["div", { class: "fill svelte-11dl705" }, ["div"]]
    ]
  ],
  " ",
  ,
], 1);
function Slider($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let onchange = prop($$props, "onchange", 3, undefined), min = prop($$props, "min", 3, 0), max = prop($$props, "max", 3, 100), step = prop($$props, "step", 3, 1), size = prop($$props, "size", 3, "h-md"), disabled = prop($$props, "disabled", 3, false), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let root = null;
  let track = null;
  let focused = state(false);
  let dragging = state(false);
  const clamp = (v) => Math.min(max(), Math.max(min(), v));
  const fraction = user_derived(() => max() > min() ? (clamp($$props.value) - min()) / (max() - min()) : 0);
  function set2(raw) {
    const next = Number(clamp(min() + Math.round((raw - min()) / step()) * step()).toFixed(10));
    if (!disabled() && next !== $$props.value)
      onchange()?.(next);
  }
  function set_from_x(x) {
    const box = track?.nativeId == null ? null : get_native()?.getElementBounds(track.nativeId);
    if (!box || box.width <= 0)
      return;
    const f = Math.min(1, Math.max(0, (x - box.x) / box.width));
    set2(min() + f * (max() - min()));
  }
  function press(e) {
    if (disabled() || e.button !== 0)
      return;
    if (root?.nativeId != null)
      get_native()?.focusElement(root.nativeId);
    set(dragging, true);
    set_from_x(e.x);
  }
  function drag_move(e) {
    if (e.pressedButton == null)
      set(dragging, false);
    else
      set_from_x(e.x);
  }
  function key(e) {
    if (e.key === "right" || e.key === "up")
      set2($$props.value + step());
    else if (e.key === "left" || e.key === "down")
      set2($$props.value - step());
    else if (e.key === "home")
      set2(min());
    else if (e.key === "end")
      set2(max());
  }
  var fragment = root_27();
  var div = first_child(fragment);
  let classes;
  var div_1 = child(div);
  var div_2 = child(div_1);
  let styles;
  var div_3 = child(div_2);
  let classes_1;
  reset(div_2);
  reset(div_1);
  attach2(div_1, () => (node) => track = node);
  reset(div);
  attach2(div, () => (node) => root = node);
  var node_1 = sibling(div, 2);
  {
    var consequent = ($$anchor) => {
      var fragment_1 = comment();
      var node_2 = first_child(fragment_1);
      Portal(node_2, {
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div_4 = root_111();
          template_effect(() => set_attribute2(div_4, "testId", testid() && `${testid()}-cover`));
          event("mousemove", div_4, drag_move);
          event("mouseup", div_4, () => set(dragging, false));
          append($$anchor, div_4);
        }),
        $$slots: { default: true }
      });
      append($$anchor, fragment_1);
    };
    if_block(node_1, ($$render) => {
      if (get(dragging))
        $$render(consequent);
    });
  }
  template_effect(() => {
    classes = set_class(div, 0, `root ${size() ?? ""}`, "svelte-11dl705", classes, { on: !disabled(), off: disabled(), focused: get(focused) });
    set_attribute2(div, "tabindex", disabled() ? -1 : 0);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    set_attribute2(div_1, "testId", testid() && `${testid()}-track`);
    styles = set_style(div_2, "", styles, { width: `${get(fraction) * 100}%` });
    classes_1 = set_class(div_3, 0, `thumb ${size() ?? ""}`, "svelte-11dl705", classes_1, { focused: get(focused) });
    set_attribute2(div_3, "testId", testid() && `${testid()}-thumb`);
  });
  event("mousedown", div, press);
  event("keydown", div, key);
  event("focus", div, () => set(focused, true));
  event("blur", div, () => set(focused, false));
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-11dl705", [{ classes: ["root"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", width: 240, minWidth: 120, userSelect: "none" } }, { classes: ["track"], tag: null, pseudo: null, css: "flex-grow: 1; height: 4px; margin: 0 10px; background-color: var(--bg-raised); border-radius: var(--radius-full)" }, { classes: ["fill"], tag: null, pseudo: null, css: "position: relative; height: 100%; background-color: var(--theme-color); border-radius: var(--radius-full)" }, { classes: ["thumb"], tag: null, pseudo: null, css: "position: absolute; border-width: 2px; border-color: var(--theme-color); border-radius: var(--radius-full); background-color: var(--bg-surface)" }, { classes: ["cover"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, cursor: "pointer" } }, { classes: ["root", "h-sm"], tag: null, pseudo: null, css: "height: var(--height-sm)" }, { classes: ["root", "h-md"], tag: null, pseudo: null, css: "height: var(--height-md)" }, { classes: ["root", "h-bs"], tag: null, pseudo: null, css: "height: var(--height-bs)" }, { classes: ["root", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["root", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["thumb", "h-sm"], tag: null, pseudo: null, css: "width: var(--height-sm); height: var(--height-sm); right: -8px; top: -6px" }, { classes: ["thumb", "h-md"], tag: null, pseudo: null, css: "width: var(--height-md); height: var(--height-md); right: -10px; top: -8px" }, { classes: ["thumb", "h-bs"], tag: null, pseudo: null, css: "width: var(--height-bs); height: var(--height-bs); right: -12px; top: -10px" }, { classes: ["thumb", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring); background-color: var(--theme-color-sub)" }]);

// gallery/demos/Slider.demo.svelte
var root22 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 20px; padding: 8px; width: 360px"
    },
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      [
        "div",
        {
          style: "display: flex; flex-direction: row; justify-content: space-between; color: var(--text-secondary); font-size: var(--text-sm)"
        },
        ["div", null, "Volume"],
        ["div", null, " "]
      ],
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      [
        "div",
        {
          style: "color: var(--text-secondary); font-size: var(--text-sm)"
        },
        "Step 2 of 0–10 · sm"
      ],
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      [
        "div",
        {
          style: "color: var(--text-secondary); font-size: var(--text-sm)"
        },
        "Large"
      ],
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      [
        "div",
        {
          style: "color: var(--text-secondary); font-size: var(--text-sm)"
        },
        "Disabled"
      ],
      " ",
      ,
    ]
  ]
]);
function Slider_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let volume = state(40);
  let brightness = state(70);
  let level = state(4);
  var div = root22();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = sibling(child(div_2));
  var text = only_child(div_3, true);
  reset(div_2);
  var node = sibling(div_2, 2);
  Slider(node, {
    get value() {
      return get(volume);
    },
    onchange: (v) => set(volume, v, true)
  });
  reset(div_1);
  var div_4 = sibling(div_1, 2);
  var node_1 = sibling(child(div_4), 2);
  Slider(node_1, {
    get value() {
      return get(level);
    },
    min: 0,
    max: 10,
    step: 2,
    size: "h-sm",
    onchange: (v) => set(level, v, true)
  });
  reset(div_4);
  var div_5 = sibling(div_4, 2);
  var node_2 = sibling(child(div_5), 2);
  Slider(node_2, {
    get value() {
      return get(brightness);
    },
    size: "h-bs",
    onchange: (v) => set(brightness, v, true)
  });
  reset(div_5);
  var div_6 = sibling(div_5, 2);
  var node_3 = sibling(child(div_6), 2);
  Slider(node_3, { value: 30, disabled: true });
  reset(div_6);
  reset(div);
  template_effect(() => set_text(text, get(volume)));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Switch.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Switch.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root23 = from_tree([["div", { class: "text svelte-16nel9t" }, ,]]);
var root_112 = from_tree([["div", { class: "text svelte-16nel9t" }, " "]]);
var root_28 = from_tree([
  [
    "div",
    { hitbox: "self", role: "switch" },
    ["div", null, ["div"]],
    " ",
    ,
  ]
]);
function Switch($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let checked = prop($$props, "checked", 3, false), onchange = prop($$props, "onchange", 3, undefined), label = prop($$props, "label", 3, ""), children = prop($$props, "children", 3, undefined), disabled = prop($$props, "disabled", 3, false), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  function toggle() {
    if (!disabled())
      onchange()?.(!checked());
  }
  function key(e) {
    if (e.key === "space")
      toggle();
  }
  var div = root_28();
  let classes;
  var div_1 = child(div);
  let classes_1;
  var div_2 = child(div_1);
  let classes_2;
  reset(div_1);
  var node = sibling(div_1, 2);
  {
    var consequent = ($$anchor) => {
      var div_3 = root23();
      var node_1 = child(div_3);
      snippet(node_1, () => validate_snippet_renderer(renderer_default, children()));
      reset(div_3);
      append($$anchor, div_3);
    };
    var consequent_1 = ($$anchor) => {
      var div_4 = root_112();
      var text = only_child(div_4, true);
      template_effect(() => set_text(text, label()));
      append($$anchor, div_4);
    };
    if_block(node, ($$render) => {
      if (children())
        $$render(consequent);
      else if (label())
        $$render(consequent_1, 1);
    });
  }
  reset(div);
  template_effect(() => {
    classes = set_class(div, 0, "row svelte-16nel9t", null, classes, { on: !disabled(), off: disabled() });
    set_attribute2(div, "tabindex", disabled() ? -1 : 0);
    set_attribute2(div, "aria-label", label() || null);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    classes_1 = set_class(div_1, 0, "track svelte-16nel9t", null, classes_1, { lit: checked(), focused: get(focused) });
    set_attribute2(div_1, "testId", testid() && `${testid()}-track`);
    classes_2 = set_class(div_2, 0, "thumb svelte-16nel9t", null, classes_2, { lit: checked() });
    set_attribute2(div_2, "testId", testid() && `${testid()}-thumb`);
  });
  event("click", div, toggle);
  event("keydown", div, key);
  event("focus", div, () => set(focused, true));
  event("blur", div, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-16nel9t", [{ classes: ["row"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 8 } }, { classes: ["track"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; justify-content: start; flex-shrink: 0; padding: 1px; border-width: 1px; border-color: #00000000; border-radius: var(--radius-full); background-color: var(--border-strong); width: var(--switch-w); height: var(--switch-h)" }, { classes: ["thumb"], tag: null, pseudo: null, css: "width: var(--switch-thumb); height: var(--switch-thumb); border-radius: var(--radius-full); background-color: var(--bg-surface)" }, { classes: ["text"], tag: null, pseudo: null, css: "font-size: var(--text-md); color: var(--text-primary)" }, { classes: ["row", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["row", "off"], tag: null, pseudo: null, style: { cursor: "not-allowed", opacity: 0.5 } }, { classes: ["track", "lit"], tag: null, pseudo: null, css: "background-color: var(--theme-color); justify-content: end" }, { classes: ["track", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["thumb", "lit"], tag: null, pseudo: null, css: "background-color: var(--text-theme)" }]);

// gallery/demos/Switch.demo.svelte
var root24 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: row; gap: 48px" },
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 12px" },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 12px" },
      ,
      " ",
      ,
      " ",
      [
        "div",
        {
          style: "color: var(--text-secondary); font-size: var(--text-sm)"
        },
        " "
      ]
    ]
  ]
]);
function Switch_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let wifi = state(true);
  let sync = state(false);
  let beta = state(false);
  var div = root24();
  var div_1 = child(div);
  var node = child(div_1);
  Switch(node, { label: "Small", checked: true });
  var node_1 = sibling(node, 2);
  Switch(node_1, {
    label: "Medium",
    get checked() {
      return get(wifi);
    },
    onchange: (v) => set(wifi, v, true)
  });
  var node_2 = sibling(node_1, 2);
  Switch(node_2, { label: "Large", checked: true });
  var node_3 = sibling(node_2, 2);
  Switch(node_3, { label: "Disabled", disabled: true });
  var node_4 = sibling(node_3, 2);
  Switch(node_4, { label: "Disabled on", disabled: true, checked: true });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_5 = child(div_2);
  Switch(node_5, {
    label: "Sync across devices",
    get checked() {
      return get(sync);
    },
    onchange: (v) => set(sync, v, true)
  });
  var node_6 = sibling(node_5, 2);
  Switch(node_6, {
    label: "Join the beta",
    get checked() {
      return get(beta);
    },
    onchange: (v) => set(beta, v, true)
  });
  var div_3 = sibling(node_6, 2);
  var text = only_child(div_3);
  reset(div_2);
  reset(div);
  template_effect(() => set_text(text, `sync ${get(sync) ? "on" : "off"} · beta ${get(beta) ? "on" : "off"}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/TextArea.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/TextArea.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root25 = from_tree([["div", { class: "label svelte-14ylnlo" }, " "]]);
var root_113 = from_tree([["div", null, " "]]);
var root_29 = from_tree([
  [
    "div",
    { class: "root svelte-14ylnlo" },
    ,
    " ",
    ["div", null, ["textarea"]],
    " ",
    ,
  ]
]);
function TextArea($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let value = prop($$props, "value", 3, ""), onchange = prop($$props, "onchange", 3, undefined), placeholder = prop($$props, "placeholder", 3, ""), label = prop($$props, "label", 3, ""), hint = prop($$props, "hint", 3, ""), error = prop($$props, "error", 3, ""), rows = prop($$props, "rows", 3, 3), maxRows = prop($$props, "maxRows", 3, undefined), disabled = prop($$props, "disabled", 3, false), size = prop($$props, "size", 3, "md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  let input = null;
  var div = root_29();
  var node_1 = child(div);
  {
    var consequent = ($$anchor) => {
      var div_1 = root25();
      var text = only_child(div_1, true);
      template_effect(() => set_text(text, label()));
      append($$anchor, div_1);
    };
    if_block(node_1, ($$render) => {
      if (label())
        $$render(consequent);
    });
  }
  var div_2 = sibling(node_1, 2);
  let classes;
  var textarea = child(div_2);
  remove_textarea_child(textarea);
  attach2(textarea, () => (node) => input = node);
  reset(div_2);
  var node_2 = sibling(div_2, 2);
  {
    var consequent_1 = ($$anchor) => {
      var div_3 = root_113();
      let classes_1;
      var text_1 = only_child(div_3, true);
      template_effect(() => {
        classes_1 = set_class(div_3, 0, "msg svelte-14ylnlo", null, classes_1, { error: !!error() });
        set_attribute2(div_3, "testId", testid() && `${testid()}-msg`);
        set_text(text_1, error() || hint());
      });
      append($$anchor, div_3);
    };
    if_block(node_2, ($$render) => {
      if (error() || hint())
        $$render(consequent_1);
    });
  }
  reset(div);
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    classes = set_class(div_2, 0, `box ${size() ?? ""}`, "svelte-14ylnlo", classes, {
      on: !disabled(),
      off: disabled(),
      focused: get(focused),
      error: !!error()
    });
    set_attribute2(div_2, "testId", testid() && `${testid()}-box`);
    set_class(textarea, 0, `inner text-${size() ?? ""}`, "svelte-14ylnlo");
    set_value(textarea, value());
    set_attribute2(textarea, "placeholder", placeholder());
    set_attribute2(textarea, "minRows", rows());
    set_attribute2(textarea, "maxRows", maxRows());
    set_attribute2(textarea, "readOnly", disabled());
    set_attribute2(textarea, "tabindex", disabled() ? -1 : null);
    set_attribute2(textarea, "aria-label", label() || null);
    set_attribute2(textarea, "testId", testid() && `${testid()}-input`);
  });
  event("click", div_2, () => !disabled() && input && focus_element(input));
  event("change", textarea, (e) => onchange()?.(e.value));
  event("focus", textarea, () => set(focused, true));
  event("blur", textarea, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-14ylnlo", [{ classes: ["root"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 6 } }, { classes: ["label"], tag: null, pseudo: null, css: "font-size: var(--text-sm); font-weight: 500; color: var(--text-primary)" }, { classes: ["box"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; padding: 8px 10px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border-strong); border-radius: var(--radius-md)" }, { classes: ["inner"], tag: null, pseudo: null, css: "padding: 0; border-width: 0; background-color: #00000000; color: var(--text-primary); font-family: var(--font-sans); line-height: 20px" }, { classes: ["msg"], tag: null, pseudo: null, css: "font-size: var(--text-sm); color: var(--text-secondary)" }, { classes: ["box", "sm"], tag: null, pseudo: null, css: "border-radius: var(--radius-sm); padding: 6px 8px" }, { classes: ["box", "lg"], tag: null, pseudo: null, css: "border-radius: var(--radius-lg); padding: 10px 12px" }, { classes: ["box", "on"], tag: null, pseudo: null, style: { cursor: "text" } }, { classes: ["box", "off"], tag: null, pseudo: null, css: "background-color: var(--bg-raised); opacity: 0.5; cursor: not-allowed" }, { classes: ["box", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["box", "error"], tag: null, pseudo: null, css: "border-color: var(--danger)" }, { classes: ["msg", "error"], tag: null, pseudo: null, css: "color: var(--danger)" }]);

// gallery/demos/TextArea.demo.svelte
var root26 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 16px; width: 360px"
    },
    ,
    " ",
    [
      "div",
      {
        style: "color: var(--text-secondary); font-size: var(--text-sm)"
      },
      " "
    ],
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
  ]
]);
function TextArea_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let notes = state("");
  var div = root26();
  var node = child(div);
  TextArea(node, {
    label: "Notes",
    placeholder: "Write freely. The field grows with the text.",
    hint: "Enter adds a line",
    get value() {
      return get(notes);
    },
    onchange: (v) => set(notes, v, true),
    maxRows: 6
  });
  var div_1 = sibling(node, 2);
  var text = only_child(div_1);
  var node_1 = sibling(div_1, 2);
  TextArea(node_1, { size: "sm", rows: 2, placeholder: "Small, two rows" });
  var node_2 = sibling(node_1, 2);
  TextArea(node_2, { size: "lg", rows: 2, placeholder: "Large, two rows" });
  var node_3 = sibling(node_2, 2);
  TextArea(node_3, {
    label: "Summary",
    value: "This copy is too long for the field.",
    error: "Keep it under 120 characters"
  });
  var node_4 = sibling(node_3, 2);
  TextArea(node_4, {
    label: "Changelog",
    value: "Locked for the release.",
    rows: 2,
    disabled: true
  });
  reset(div);
  template_effect(() => set_text(text, `${get(notes).length ?? ""} characters`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/TextInput.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/TextInput.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root27 = from_tree([["div", { class: "label svelte-1htx3qi" }, " "]]);
var root_114 = from_tree([["div", { class: "adorn svelte-1htx3qi" }, ,]]);
var root_210 = from_tree([["div", { class: "adorn svelte-1htx3qi" }, ,]]);
var root_33 = from_tree([["div", null, " "]]);
var root_4 = from_tree([
  [
    "div",
    { class: "root svelte-1htx3qi" },
    ,
    " ",
    [
      "div",
      { hitbox: "self" },
      ,
      " ",
      ["input", { class: "inner svelte-1htx3qi" }],
      " ",
      ,
    ],
    " ",
    ,
  ]
]);
function TextInput($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let value = prop($$props, "value", 3, ""), onchange = prop($$props, "onchange", 3, undefined), onsubmit = prop($$props, "onsubmit", 3, undefined), placeholder = prop($$props, "placeholder", 3, ""), label = prop($$props, "label", 3, ""), hint = prop($$props, "hint", 3, ""), error = prop($$props, "error", 3, ""), disabled = prop($$props, "disabled", 3, false), size = prop($$props, "size", 3, "h-lg"), leading = prop($$props, "leading", 3, undefined), trailing = prop($$props, "trailing", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  let input = null;
  function focus_field() {
    if (!disabled() && input)
      focus_element(input);
  }
  var div = root_4();
  var node_1 = child(div);
  {
    var consequent = ($$anchor) => {
      var div_1 = root27();
      var text = only_child(div_1, true);
      template_effect(() => set_text(text, label()));
      append($$anchor, div_1);
    };
    if_block(node_1, ($$render) => {
      if (label())
        $$render(consequent);
    });
  }
  var div_2 = sibling(node_1, 2);
  let classes;
  var node_2 = child(div_2);
  {
    var consequent_1 = ($$anchor) => {
      var div_3 = root_114();
      var node_3 = child(div_3);
      snippet(node_3, () => validate_snippet_renderer(renderer_default, leading()));
      reset(div_3);
      append($$anchor, div_3);
    };
    if_block(node_2, ($$render) => {
      if (leading())
        $$render(consequent_1);
    });
  }
  var input_1 = sibling(node_2, 2);
  remove_input_defaults(input_1);
  attach2(input_1, () => (node) => input = node);
  var node_4 = sibling(input_1, 2);
  {
    var consequent_2 = ($$anchor) => {
      var div_4 = root_210();
      var node_5 = child(div_4);
      snippet(node_5, () => validate_snippet_renderer(renderer_default, trailing()));
      reset(div_4);
      append($$anchor, div_4);
    };
    if_block(node_4, ($$render) => {
      if (trailing())
        $$render(consequent_2);
    });
  }
  reset(div_2);
  var node_6 = sibling(div_2, 2);
  {
    var consequent_3 = ($$anchor) => {
      var div_5 = root_33();
      let classes_1;
      var text_1 = only_child(div_5, true);
      template_effect(() => {
        classes_1 = set_class(div_5, 0, "msg svelte-1htx3qi", null, classes_1, { error: !!error() });
        set_attribute2(div_5, "testId", testid() && `${testid()}-msg`);
        set_text(text_1, error() || hint());
      });
      append($$anchor, div_5);
    };
    if_block(node_6, ($$render) => {
      if (error() || hint())
        $$render(consequent_3);
    });
  }
  reset(div);
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    classes = set_class(div_2, 0, `field el-size ${size() ?? ""}`, "svelte-1htx3qi", classes, {
      on: !disabled(),
      off: disabled(),
      focused: get(focused),
      error: !!error()
    });
    set_attribute2(div_2, "testId", testid() && `${testid()}-field`);
    set_value(input_1, value());
    set_attribute2(input_1, "placeholder", placeholder());
    set_attribute2(input_1, "readOnly", disabled());
    set_attribute2(input_1, "tabindex", disabled() ? -1 : null);
    set_attribute2(input_1, "aria-label", label() || null);
    set_attribute2(input_1, "testId", testid() && `${testid()}-input`);
  });
  event("click", div_2, focus_field);
  event("change", input_1, (e) => onchange()?.(e.value));
  event("submit", input_1, (e) => onsubmit()?.(e.value));
  event("focus", input_1, () => set(focused, true));
  event("blur", input_1, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1htx3qi", [{ classes: ["root"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 6 } }, { classes: ["label"], tag: null, pseudo: null, css: "font-size: var(--text-sm); font-weight: 500; color: var(--text-primary)" }, { classes: ["field"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; gap: 8px; padding: 0 10px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border-strong); border-radius: var(--radius-md)" }, { classes: ["inner"], tag: null, pseudo: null, css: "flex-grow: 1; min-width: 0; height: 20px; padding: 0; border-width: 0; background-color: #00000000; color: var(--text-primary); font-family: var(--font-sans)" }, { classes: ["adorn"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; color: var(--text-secondary); font-size: var(--text-sm)" }, { classes: ["msg"], tag: null, pseudo: null, css: "font-size: var(--text-sm); color: var(--text-secondary)" }, { classes: ["field", "on"], tag: null, pseudo: null, style: { cursor: "text" } }, { classes: ["field", "off"], tag: null, pseudo: null, css: "background-color: var(--bg-raised); opacity: 0.5; cursor: not-allowed" }, { classes: ["field", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["field", "error"], tag: null, pseudo: null, css: "border-color: var(--danger)" }, { classes: ["msg", "error"], tag: null, pseudo: null, css: "color: var(--danger)" }]);

// gallery/demos/TextInput.demo.svelte
var root28 = from_tree([["div", null, "https://"]]);
var root_115 = from_tree([["div", { style: "font-size: var(--text-xs)" }, "esc"]]);
var root_211 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 16px; width: 360px"
    },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: flex-end"
      },
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    ,
    " ",
    [
      "div",
      {
        style: "color: var(--text-secondary); font-size: var(--text-sm)"
      },
      " "
    ],
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
  ]
]);
function TextInput_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let name = state("");
  let site = state("");
  let submitted = state("");
  let query = state("");
  var div = root_211();
  var div_1 = child(div);
  var node = child(div_1);
  TextInput(node, {
    size: "h-md",
    placeholder: "Small",
    style: "flex-grow: 1; flex-basis: 0; min-width: 0"
  });
  var node_1 = sibling(node, 2);
  TextInput(node_1, {
    size: "h-lg",
    placeholder: "Medium",
    style: "flex-grow: 1; flex-basis: 0; min-width: 0"
  });
  var node_2 = sibling(node_1, 2);
  TextInput(node_2, {
    size: "h-xl",
    placeholder: "Large",
    style: "flex-grow: 1; flex-basis: 0; min-width: 0"
  });
  reset(div_1);
  var node_3 = sibling(div_1, 2);
  TextInput(node_3, {
    label: "Name",
    placeholder: "Ada Lovelace",
    hint: "Shown on your profile",
    get value() {
      return get(name);
    },
    onchange: (v) => set(name, v, true),
    onsubmit: (v) => set(submitted, v, true)
  });
  var div_2 = sibling(node_3, 2);
  var text = only_child(div_2);
  var node_4 = sibling(div_2, 2);
  {
    const leading = renderer_snippet(renderer_default, ($$anchor) => {
      var div_3 = root28();
      append($$anchor, div_3);
    });
    TextInput(node_4, {
      label: "Website",
      placeholder: "example.com",
      get value() {
        return get(site);
      },
      onchange: (v) => set(site, v, true),
      leading,
      $$slots: { leading: true }
    });
  }
  var node_5 = sibling(node_4, 2);
  {
    const trailing = renderer_snippet(renderer_default, ($$anchor) => {
      var div_4 = root_115();
      append($$anchor, div_4);
    });
    TextInput(node_5, {
      placeholder: "Search notes",
      get value() {
        return get(query);
      },
      onchange: (v) => set(query, v, true),
      trailing,
      $$slots: { trailing: true }
    });
  }
  var node_6 = sibling(node_5, 2);
  TextInput(node_6, {
    label: "Email",
    value: "ada@",
    error: "Enter a valid email address"
  });
  var node_7 = sibling(node_6, 2);
  TextInput(node_7, {
    label: "Organisation",
    value: "Analytical Engine Ltd",
    disabled: true,
    hint: "Managed by your admin"
  });
  reset(div);
  template_effect(() => set_text(text, `submitted: ${(get(submitted) || "—") ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Box.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Box.svelte
init_renderer2();
init_custom_renderer();
init_client();
var root29 = from_tree([["div", null, ,]]);
function Box($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  const PAD = { sm: "pad-sm", md: "pad-md", lg: "pad-lg" };
  const RADIUS = { sm: "radius-sm", md: "radius-md", lg: "radius-lg" };
  let children = prop($$props, "children", 3, undefined), padding = prop($$props, "padding", 3, undefined), bg = prop($$props, "bg", 3, "none"), border = prop($$props, "border", 3, false), radius = prop($$props, "radius", 3, "md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const pad = user_derived(() => padding() === undefined ? "" : typeof padding() === "number" ? `padding: ${padding()}px; ` : "");
  const css = user_derived(() => `${get(pad)}${radius() === "none" ? "border-radius: 0px; " : ""}${style() ?? ""}`);
  var div = root29();
  var node = child(div);
  snippet(node, () => validate_snippet_renderer(renderer_default, children()) ?? noop);
  reset(div);
  template_effect(() => {
    set_class(div, 0, `box ${bg() === "none" ? "" : `bg-${bg()}`} ${(typeof padding() === "string" ? PAD[padding()] : "") ?? ""} ${(radius() === "none" ? "" : RADIUS[radius()]) ?? ""} ${border() ? "border" : ""}`);
    set_style(div, get(css));
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Box.demo.svelte
var root30 = from_tree([["div", null, "none"]]);
var root_116 = from_tree([["div", null, "surface"]]);
var root_212 = from_tree([["div", null, "raised"]]);
var root_34 = from_tree([["div", null, " "]]);
var root_42 = from_tree([["div", null, "sm"]]);
var root_5 = from_tree([["div", null, "md"]]);
var root_6 = from_tree([["div", null, "lg"]]);
var root_7 = from_tree([["div", null, "20px"]]);
var root_8 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 20px" },
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      ["div", null, "Background"],
      " ",
      [
        "div",
        { style: "display: flex; flex-direction: row; gap: 12px" },
        ,
        " ",
        ,
        " ",
        ,
      ]
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      ["div", null, "Radius"],
      " ",
      [
        "div",
        { style: "display: flex; flex-direction: row; gap: 12px" }
      ]
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      ["div", null, "Padding"],
      " ",
      [
        "div",
        {
          style: "display: flex; flex-direction: row; gap: 12px; align-items: start"
        },
        ,
        " ",
        ,
        " ",
        ,
        " ",
        ,
      ]
    ]
  ]
]);
function Box_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const caption = "font-size: var(--text-sm); color: var(--text-secondary)";
  const chip = "padding: 4px 8px; border-radius: var(--radius-sm); background-color: var(--theme-color-sub); font-size: var(--text-sm); color: var(--theme-color)";
  var div = root_8();
  var div_1 = child(div);
  var div_2 = child(div_1);
  set_style(div_2, caption);
  var div_3 = sibling(div_2, 2);
  var node = child(div_3);
  Box(node, {
    bg: "none",
    padding: "md",
    border: true,
    style: "flex-grow: 1",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_4 = root30();
      set_style(div_4, caption);
      append($$anchor, div_4);
    }),
    $$slots: { default: true }
  });
  var node_1 = sibling(node, 2);
  Box(node_1, {
    bg: "surface",
    padding: "md",
    border: true,
    style: "flex-grow: 1",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_5 = root_116();
      set_style(div_5, caption);
      append($$anchor, div_5);
    }),
    $$slots: { default: true }
  });
  var node_2 = sibling(node_1, 2);
  Box(node_2, {
    bg: "raised",
    padding: "md",
    style: "flex-grow: 1",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_6 = root_212();
      set_style(div_6, caption);
      append($$anchor, div_6);
    }),
    $$slots: { default: true }
  });
  reset(div_3);
  reset(div_1);
  var div_7 = sibling(div_1, 2);
  var div_8 = child(div_7);
  set_style(div_8, caption);
  var div_9 = sibling(div_8, 2);
  each(div_9, 20, () => ["none", "sm", "md", "lg"], index, ($$anchor, radius) => {
    var fragment = comment();
    var node_3 = first_child(fragment);
    Box(node_3, {
      bg: "raised",
      padding: "sm",
      get radius() {
        return radius;
      },
      border: true,
      style: "flex-grow: 1; height: 44px; align-items: center; justify-content: center",
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var div_10 = root_34();
        set_style(div_10, caption);
        var text = only_child(div_10, true);
        template_effect(() => set_text(text, radius));
        append($$anchor, div_10);
      }),
      $$slots: { default: true }
    });
    append($$anchor, fragment);
  });
  reset(div_9);
  reset(div_7);
  var div_11 = sibling(div_7, 2);
  var div_12 = child(div_11);
  set_style(div_12, caption);
  var div_13 = sibling(div_12, 2);
  var node_4 = child(div_13);
  Box(node_4, {
    bg: "surface",
    padding: "sm",
    border: true,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_14 = root_42();
      set_style(div_14, chip);
      append($$anchor, div_14);
    }),
    $$slots: { default: true }
  });
  var node_5 = sibling(node_4, 2);
  Box(node_5, {
    bg: "surface",
    padding: "md",
    border: true,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_15 = root_5();
      set_style(div_15, chip);
      append($$anchor, div_15);
    }),
    $$slots: { default: true }
  });
  var node_6 = sibling(node_5, 2);
  Box(node_6, {
    bg: "surface",
    padding: "lg",
    border: true,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_16 = root_6();
      set_style(div_16, chip);
      append($$anchor, div_16);
    }),
    $$slots: { default: true }
  });
  var node_7 = sibling(node_6, 2);
  Box(node_7, {
    bg: "surface",
    padding: 20,
    border: true,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_17 = root_7();
      set_style(div_17, chip);
      append($$anchor, div_17);
    }),
    $$slots: { default: true }
  });
  reset(div_13);
  reset(div_11);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Card.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Card.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root31 = from_tree([["div", { class: "title svelte-1juwsal" }, " "]]);
var root_117 = from_tree([["div", { class: "desc svelte-1juwsal" }, " "]]);
var root_213 = from_tree([["div", null, ,]]);
var root_35 = from_tree([
  [
    "div",
    { class: "head svelte-1juwsal" },
    ["div", { class: "heading svelte-1juwsal" }, , " ", ,],
    " ",
    ,
  ]
]);
var root_43 = from_tree([["div", { class: "body svelte-1juwsal" }, ,]]);
var root_52 = from_tree([["div", null, ,]]);
var root_62 = from_tree([["div", null, , " ", , " ", ,]]);
function Card($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let children = prop($$props, "children", 3, undefined), title = prop($$props, "title", 3, ""), description = prop($$props, "description", 3, ""), actions = prop($$props, "actions", 3, undefined), footer = prop($$props, "footer", 3, undefined), padding = prop($$props, "padding", 3, "lg"), clickable = prop($$props, "clickable", 3, false), onclick = prop($$props, "onclick", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  const css = user_derived(() => `${typeof padding() === "number" ? `padding: ${padding()}px; ` : ""}${style() ?? ""}`);
  const swallow = () => {};
  function key(e) {
    if (e.key === "enter" || e.key === "space")
      onclick()?.(e);
  }
  var div = root_62();
  let classes;
  var node = child(div);
  {
    var consequent_3 = ($$anchor) => {
      var div_1 = root_35();
      var div_2 = child(div_1);
      var node_1 = child(div_2);
      {
        var consequent = ($$anchor) => {
          var div_3 = root31();
          var text = only_child(div_3, true);
          template_effect(() => set_text(text, title()));
          append($$anchor, div_3);
        };
        if_block(node_1, ($$render) => {
          if (title())
            $$render(consequent);
        });
      }
      var node_2 = sibling(node_1, 2);
      {
        var consequent_1 = ($$anchor) => {
          var div_4 = root_117();
          var text_1 = only_child(div_4, true);
          template_effect(() => set_text(text_1, description()));
          append($$anchor, div_4);
        };
        if_block(node_2, ($$render) => {
          if (description())
            $$render(consequent_1);
        });
      }
      reset(div_2);
      var node_3 = sibling(div_2, 2);
      {
        var consequent_2 = ($$anchor) => {
          var div_5 = root_213();
          let classes_1;
          var node_4 = child(div_5);
          snippet(node_4, () => validate_snippet_renderer(renderer_default, actions()));
          reset(div_5);
          template_effect(() => classes_1 = set_class(div_5, 0, "actions svelte-1juwsal", null, classes_1, { shield: clickable() }));
          event("click", div_5, function(...$$args) {
            (clickable() ? swallow : undefined)?.apply(this, $$args);
          });
          append($$anchor, div_5);
        };
        if_block(node_3, ($$render) => {
          if (actions())
            $$render(consequent_2);
        });
      }
      reset(div_1);
      append($$anchor, div_1);
    };
    if_block(node, ($$render) => {
      if (title() || description() || actions())
        $$render(consequent_3);
    });
  }
  var node_5 = sibling(node, 2);
  {
    var consequent_4 = ($$anchor) => {
      var div_6 = root_43();
      var node_6 = child(div_6);
      snippet(node_6, () => validate_snippet_renderer(renderer_default, children()));
      reset(div_6);
      append($$anchor, div_6);
    };
    if_block(node_5, ($$render) => {
      if (children())
        $$render(consequent_4);
    });
  }
  var node_7 = sibling(node_5, 2);
  {
    var consequent_5 = ($$anchor) => {
      var div_7 = root_52();
      let classes_2;
      var node_8 = child(div_7);
      snippet(node_8, () => validate_snippet_renderer(renderer_default, footer()));
      reset(div_7);
      template_effect(() => classes_2 = set_class(div_7, 0, "foot svelte-1juwsal", null, classes_2, { shield: clickable() }));
      event("click", div_7, function(...$$args) {
        (clickable() ? swallow : undefined)?.apply(this, $$args);
      });
      append($$anchor, div_7);
    };
    if_block(node_7, ($$render) => {
      if (footer())
        $$render(consequent_5);
    });
  }
  reset(div);
  template_effect(() => {
    classes = set_class(div, 0, `card ${typeof padding() === "string" ? `pad-${padding()}` : ""}`, "svelte-1juwsal", classes, { on: clickable(), focused: get(focused) });
    set_attribute2(div, "tabindex", clickable() ? 0 : undefined);
    set_style(div, get(css));
    set_attribute2(div, "testId", testid());
  });
  event("click", div, function(...$$args) {
    (clickable() ? onclick() : undefined)?.apply(this, $$args);
  });
  event("keydown", div, function(...$$args) {
    (clickable() ? key : undefined)?.apply(this, $$args);
  });
  event("focus", div, () => set(focused, true));
  event("blur", div, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1juwsal", [{ classes: ["card"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; gap: 12px; background-color: var(--bg-surface); color: var(--text-primary); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg)" }, { classes: ["head"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "start", justifyContent: "space-between", gap: 12 } }, { classes: ["heading"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", flexGrow: 1, gap: 4 } }, { classes: ["title"], tag: null, pseudo: null, css: "font-size: var(--text-lg); font-weight: 600" }, { classes: ["desc"], tag: null, pseudo: null, css: "font-size: var(--text-sm); color: var(--text-secondary)" }, { classes: ["actions"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", gap: 4 } }, { classes: ["shield"], tag: null, pseudo: null, style: { backgroundColor: "#00000001" } }, { classes: ["body"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; gap: 8px; color: var(--text-secondary)" }, { classes: ["foot"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; justify-content: end; gap: 8px; padding-top: 12px; border-top-width: 1px; border-color: var(--border)" }, { classes: ["card", "on"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["card", "on"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised)" }, { classes: ["card", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }]);

// gallery/demos/Card.demo.svelte
var root32 = from_tree([, , " ", ,], 1);
var root_118 = from_tree([["div", { style: "color: var(--text-secondary)" }, " "]]);
var root_214 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: start"
      },
      [
        "div",
        { style: "flex-grow: 1; flex-basis: 0; min-width: 0" },
        ,
      ],
      " ",
      [
        "div",
        { style: "flex-grow: 1; flex-basis: 0; min-width: 0" },
        ,
      ]
    ],
    " ",
    ,
    " ",
    ,
  ]
]);
function Card_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let opened = state(0);
  let starred = state(false);
  var div = root_214();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var node = child(div_2);
  {
    const footer = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment = root32();
      var node_1 = first_child(fragment);
      Button(node_1, { label: "Cancel", variant: "ghost", size: "h-md" });
      var node_2 = sibling(node_1, 2);
      Button(node_2, { label: "Open", size: "h-md" });
      append($$anchor, fragment);
    });
    Card(node, {
      title: "Project Atlas",
      description: "Edited 2 hours ago",
      footer,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        next();
        var text2 = text("Shared with 4 people. Last build passed on main.");
        append($$anchor, text2);
      }),
      $$slots: { footer: true, default: true }
    });
  }
  reset(div_2);
  var div_3 = sibling(div_2, 2);
  var node_3 = child(div_3);
  {
    const actions = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_1 = comment();
      var node_4 = first_child(fragment_1);
      {
        let $0 = user_derived(() => get(starred) ? "Starred" : "Star");
        let $1 = user_derived(() => get(starred) ? "themed" : "ghost");
        Button(node_4, {
          get label() {
            return get($0);
          },
          get variant() {
            return get($1);
          },
          size: "h-md",
          onclick: () => set(starred, !get(starred))
        });
      }
      append($$anchor, fragment_1);
    });
    Card(node_3, {
      title: "Quarterly report",
      description: "Draft · 12 pages",
      actions,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        next();
        var text_1 = text("Finance numbers are final. Review the summary before sending.");
        append($$anchor, text_1);
      }),
      $$slots: { actions: true, default: true }
    });
  }
  reset(div_3);
  reset(div_1);
  var node_5 = sibling(div_1, 2);
  Card(node_5, {
    title: "Compact",
    description: "padding sm",
    padding: "sm",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      next();
      var text_2 = text("Tight padding.");
      append($$anchor, text_2);
    }),
    $$slots: { default: true }
  });
  var node_6 = sibling(node_5, 2);
  Card(node_6, {
    title: "Open a workspace",
    description: "Click the card to open it",
    clickable: true,
    onclick: () => update(opened),
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_4 = root_118();
      var text_3 = only_child(div_4);
      template_effect(() => set_text(text_3, `Opened ${get(opened) ?? ""} times.`));
      append($$anchor, div_4);
    }),
    $$slots: { default: true }
  });
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Divider.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Divider.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root33 = from_tree([["div", { class: "rule vertical svelte-1mo5fdd" }]]);
var root_119 = from_tree([
  [
    "div",
    { class: "labelled svelte-1mo5fdd" },
    ["div", { class: "line svelte-1mo5fdd" }],
    " ",
    ["div", { class: "label svelte-1mo5fdd" }, " "],
    " ",
    ["div", { class: "line svelte-1mo5fdd" }]
  ]
]);
var root_215 = from_tree([["div", { class: "rule horizontal svelte-1mo5fdd" }]]);
function Divider($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let orientation = prop($$props, "orientation", 3, "horizontal"), label = prop($$props, "label", 3, ""), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor) => {
      var div = root33();
      template_effect(() => {
        set_style(div, style());
        set_attribute2(div, "testId", testid());
      });
      append($$anchor, div);
    };
    var consequent_1 = ($$anchor) => {
      var div_1 = root_119();
      var div_2 = sibling(child(div_1), 2);
      var text = only_child(div_2, true);
      next(2);
      reset(div_1);
      template_effect(() => {
        set_style(div_1, style());
        set_attribute2(div_1, "testId", testid());
        set_text(text, label());
      });
      append($$anchor, div_1);
    };
    var alternate = ($$anchor) => {
      var div_3 = root_215();
      template_effect(() => {
        set_style(div_3, style());
        set_attribute2(div_3, "testId", testid());
      });
      append($$anchor, div_3);
    };
    if_block(node, ($$render) => {
      if (orientation() === "vertical")
        $$render(consequent);
      else if (label())
        $$render(consequent_1, 1);
      else
        $$render(alternate, -1);
    });
  }
  append($$anchor, fragment);
  $$pop_renderer();
}
define_styles("svelte-1mo5fdd", [{ classes: ["rule"], tag: null, pseudo: null, css: "background-color: var(--border); align-self: stretch" }, { classes: ["labelled"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "stretch" } }, { classes: ["line"], tag: null, pseudo: null, css: "flex-grow: 1; height: 1px; background-color: var(--border)" }, { classes: ["label"], tag: null, pseudo: null, css: "font-size: var(--text-sm); color: var(--text-muted)" }, { classes: ["rule", "horizontal"], tag: null, pseudo: null, style: { height: 1 } }, { classes: ["rule", "vertical"], tag: null, pseudo: null, style: { width: 1 } }]);

// gallery/demos/Divider.demo.svelte
var root34 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 12px; width: 360px"
    },
    ["div", null, "Profile"],
    " ",
    ,
    " ",
    ["div", null, "Name, email and avatar."],
    " ",
    ,
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center; height: 32px"
      },
      ["div", null, "Left"],
      " ",
      ,
      " ",
      ["div", null, "Centre"],
      " ",
      ,
      " ",
      ["div", null, "Right"]
    ],
    " ",
    ,
    " ",
    ["div", null, "Deleting a workspace cannot be undone."]
  ]
]);
function Divider_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const body = "font-size: var(--text-md); color: var(--text-primary)";
  const muted = "font-size: var(--text-sm); color: var(--text-secondary)";
  var div = root34();
  var div_1 = child(div);
  set_style(div_1, body);
  var node = sibling(div_1, 2);
  Divider(node, {});
  var div_2 = sibling(node, 2);
  set_style(div_2, muted);
  var node_1 = sibling(div_2, 2);
  Divider(node_1, { label: "Advanced" });
  var div_3 = sibling(node_1, 2);
  var div_4 = child(div_3);
  set_style(div_4, body);
  var node_2 = sibling(div_4, 2);
  Divider(node_2, { orientation: "vertical" });
  var div_5 = sibling(node_2, 2);
  set_style(div_5, body);
  var node_3 = sibling(div_5, 2);
  Divider(node_3, { orientation: "vertical" });
  var div_6 = sibling(node_3, 2);
  set_style(div_6, body);
  reset(div_3);
  var node_4 = sibling(div_3, 2);
  Divider(node_4, { label: "Danger zone" });
  var div_7 = sibling(node_4, 2);
  set_style(div_7, muted);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Grid.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Grid.svelte
init_renderer2();
init_custom_renderer();
init_client();
var root35 = from_tree([["div", null, ,]]);
function Grid($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let columns = prop($$props, "columns", 3, 2), gap = prop($$props, "gap", 3, "md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  var div = root35();
  let classes;
  var node = child(div);
  snippet(node, () => validate_snippet_renderer(renderer_default, $$props.children));
  reset(div);
  template_effect(() => {
    classes = set_class(div, 0, `grid grid-fixed-${columns() ?? ""}`, null, classes, {
      "gap-xs": gap() === "xs",
      "gap-sm": gap() === "sm",
      "gap-md": gap() === "md",
      "gap-bs": gap() === "bs",
      "gap-lg": gap() === "lg",
      "gap-xl": gap() === "xl"
    });
    set_style(div, `${typeof gap() === "number" ? `gap: ${gap()}px; ` : ""}${style() ?? "" ?? ""}`);
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Grid.demo.svelte
var root36 = from_tree([
  [
    "div",
    {
      style: "font-size: var(--text-sm); color: var(--text-secondary)"
    },
    " "
  ],
  " ",
  [
    "div",
    {
      style: "font-size: var(--text-xl); font-weight: 600; color: var(--text-primary)"
    },
    " "
  ]
], 1);
var root_120 = from_tree([
  [
    "div",
    {
      style: "padding: 6px 8px; font-size: var(--text-md); color: var(--text-primary)"
    },
    " "
  ]
]);
var root_216 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 20px" },
    ,
    " ",
    ,
  ]
]);
function Grid_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const metrics = [
    { label: "Revenue", value: "$48.2k" },
    { label: "Users", value: "1,284" },
    { label: "Retention", value: "62%" },
    { label: "Latency", value: "84 ms" },
    { label: "Errors", value: "0.2%" },
    { label: "Uptime", value: "99.98%" }
  ];
  var div = root_216();
  var node = child(div);
  Grid(node, {
    columns: 3,
    gap: "md",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 17, () => metrics, (m) => m.label, ($$anchor, m) => {
        var fragment_1 = comment();
        var node_2 = first_child(fragment_1);
        Box(node_2, {
          bg: "raised",
          padding: "md",
          radius: "md",
          children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
            var fragment_2 = root36();
            var div_1 = first_child(fragment_2);
            var text = only_child(div_1, true);
            var div_2 = sibling(div_1, 2);
            var text_1 = only_child(div_2, true);
            template_effect(() => {
              set_text(text, get(m).label);
              set_text(text_1, get(m).value);
            });
            append($$anchor, fragment_2);
          }),
          $$slots: { default: true }
        });
        append($$anchor, fragment_1);
      });
      append($$anchor, fragment);
    }),
    $$slots: { default: true }
  });
  var node_3 = sibling(node, 2);
  Grid(node_3, {
    columns: 2,
    gap: "sm",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_3 = comment();
      var node_4 = first_child(fragment_3);
      each(node_4, 16, () => ["Inbox", "Drafts", "Sent", "Archive"], (name) => name, ($$anchor, name) => {
        var fragment_4 = comment();
        var node_5 = first_child(fragment_4);
        Box(node_5, {
          bg: "surface",
          padding: "sm",
          border: true,
          radius: "sm",
          children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
            var div_3 = root_120();
            var text_2 = only_child(div_3, true);
            template_effect(() => set_text(text_2, name));
            append($$anchor, div_3);
          }),
          $$slots: { default: true }
        });
        append($$anchor, fragment_4);
      });
      append($$anchor, fragment_3);
    }),
    $$slots: { default: true }
  });
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/ScrollArea.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/ScrollArea.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root37 = from_tree([["div", { class: "area svelte-1wfh9ws" }, ,]]);
function ScrollArea($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let height = prop($$props, "height", 3, null), maxHeight = prop($$props, "maxHeight", 3, null), gap = prop($$props, "gap", 3, 8), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const css = user_derived(() => `${height() == null ? "" : `height: ${height()}px; `}${maxHeight() == null ? "" : `max-height: ${maxHeight()}px; `}${style() ?? ""}`);
  var div = root37();
  var node = child(div);
  {
    let $0 = user_derived(() => testid() && `${testid()}-list`);
    Scroller(node, {
      get gap() {
        return gap();
      },
      get testid() {
        return get($0);
      },
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var fragment = comment();
        var node_1 = first_child(fragment);
        snippet(node_1, () => validate_snippet_renderer(renderer_default, $$props.children));
        append($$anchor, fragment);
      }),
      $$slots: { default: true }
    });
  }
  reset(div);
  template_effect(() => {
    set_style(div, get(css));
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
}
define_styles("svelte-1wfh9ws", [{ classes: ["area"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", minHeight: 0 } }]);

// gallery/demos/ScrollArea.demo.svelte
var root38 = from_tree([["div", null, " "]]);
var root_121 = from_tree([["div", null, " "]]);
var root_217 = from_tree([
  ["div", null, "Only item"],
  " ",
  ["div", null, "Second item"]
], 1);
var root_36 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: row; gap: 16px; align-items: start"
    },
    ["div", null, ["div", null, "maxHeight 150"], " ", ,],
    " ",
    ["div", null, ["div", null, "fixed height 150"], " ", ,],
    " ",
    [
      "div",
      null,
      ["div", null, "short, shrinks to content"],
      " ",
      ,
    ]
  ]
]);
function ScrollArea_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const rows = Array.from({ length: 20 }, (_, i) => i + 1);
  const caption = "font-size: var(--text-sm); color: var(--text-secondary); padding-bottom: 6px";
  const frame = "width: 200px; padding: 8px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)";
  const line = "font-size: var(--text-md); color: var(--text-primary)";
  var div = root_36();
  var div_1 = child(div);
  var div_2 = child(div_1);
  set_style(div_2, caption);
  var node = sibling(div_2, 2);
  ScrollArea(node, {
    maxHeight: 150,
    gap: 4,
    style: frame,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 16, () => rows, (r) => r, ($$anchor, r) => {
        var div_3 = root38();
        set_style(div_3, "height: 22px; font-size: var(--text-md); color: var(--text-primary)");
        var text = only_child(div_3);
        template_effect(() => set_text(text, `Message ${r ?? ""}`));
        append($$anchor, div_3);
      });
      append($$anchor, fragment);
    }),
    $$slots: { default: true }
  });
  reset(div_1);
  var div_4 = sibling(div_1, 2);
  var div_5 = child(div_4);
  set_style(div_5, caption);
  var node_2 = sibling(div_5, 2);
  ScrollArea(node_2, {
    height: 150,
    gap: 4,
    style: frame,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_1 = comment();
      var node_3 = first_child(fragment_1);
      each(node_3, 16, () => rows, (r) => r, ($$anchor, r) => {
        var div_6 = root_121();
        set_style(div_6, "height: 22px; font-size: var(--text-md); color: var(--text-primary)");
        var text_1 = only_child(div_6);
        template_effect(() => set_text(text_1, `Track ${r ?? ""}`));
        append($$anchor, div_6);
      });
      append($$anchor, fragment_1);
    }),
    $$slots: { default: true }
  });
  reset(div_4);
  var div_7 = sibling(div_4, 2);
  var div_8 = child(div_7);
  set_style(div_8, caption);
  var node_4 = sibling(div_8, 2);
  ScrollArea(node_4, {
    maxHeight: 150,
    gap: 4,
    style: frame,
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_2 = root_217();
      var div_9 = first_child(fragment_2);
      set_style(div_9, "height: 22px; font-size: var(--text-md); color: var(--text-primary)");
      var div_10 = sibling(div_9, 2);
      set_style(div_10, "height: 22px; font-size: var(--text-md); color: var(--text-primary)");
      append($$anchor, fragment_2);
    }),
    $$slots: { default: true }
  });
  reset(div_7);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Spacer.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Spacer.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root39 = from_tree([["div", { class: "spacer svelte-1eui277" }]]);
function Spacer($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  var div = root39();
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
}
define_styles("svelte-1eui277", [{ classes: ["spacer"], tag: null, pseudo: null, style: { flexGrow: 1 } }]);

// gallery/demos/Spacer.demo.svelte
var root40 = from_tree([["div", null, "Atlas"], " ", , " ", , " ", ,], 1);
var root_122 = from_tree([
  ["div", null, "Invoice #1042"],
  " ",
  ["div", null, "Issued 3 June · Due 17 June"],
  " ",
  ,
  " ",
  ["div", null, "Total due"],
  " ",
  [
    "div",
    {
      style: "font-size: var(--text-2xl); font-weight: 600; color: var(--text-primary)"
    },
    "$2,480.00"
  ],
  " ",
  [
    "div",
    {
      style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
    },
    ,
    " ",
    ,
  ]
], 1);
var root_218 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    ,
    " ",
    ,
  ]
]);
function Spacer_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const title = "font-size: var(--text-md); font-weight: 600; color: var(--text-primary)";
  const muted = "font-size: var(--text-sm); color: var(--text-secondary)";
  var div = root_218();
  var node = child(div);
  Box(node, {
    bg: "surface",
    border: true,
    radius: "md",
    padding: "sm",
    style: "flex-direction: row; gap: 8px; align-items: center",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment = root40();
      var div_1 = first_child(fragment);
      set_style(div_1, "padding: 0 6px; font-size: var(--text-md); font-weight: 600; color: var(--text-primary)");
      var node_1 = sibling(div_1, 2);
      Spacer(node_1, {});
      var node_2 = sibling(node_1, 2);
      Button(node_2, { label: "Share", variant: "ghost", size: "h-md" });
      var node_3 = sibling(node_2, 2);
      Button(node_3, { label: "Publish", size: "h-md" });
      append($$anchor, fragment);
    }),
    $$slots: { default: true }
  });
  var node_4 = sibling(node, 2);
  Box(node_4, {
    bg: "surface",
    border: true,
    radius: "md",
    padding: "md",
    style: "height: 200px; gap: 8px",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_1 = root_122();
      var div_2 = first_child(fragment_1);
      set_style(div_2, title);
      var div_3 = sibling(div_2, 2);
      set_style(div_3, muted);
      var node_5 = sibling(div_3, 2);
      Spacer(node_5, {});
      var div_4 = sibling(node_5, 2);
      set_style(div_4, muted);
      var div_5 = sibling(div_4, 4);
      var node_6 = child(div_5);
      Spacer(node_6, {});
      var node_7 = sibling(node_6, 2);
      Button(node_7, { label: "Pay now", size: "h-md" });
      reset(div_5);
      append($$anchor, fragment_1);
    }),
    $$slots: { default: true }
  });
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/SplitPane.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/SplitPane.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_index_client();
init_renderer2();
var root_123 = from_tree([["div", { class: "overlay svelte-iqa2fr" }]]);
var root_219 = from_tree([
  [
    "div",
    null,
    ["div", { class: "pane lead svelte-iqa2fr" }, ,],
    " ",
    ["div", { hitbox: "self" }, ["div"]],
    " ",
    ["div", { class: "pane rest svelte-iqa2fr" }, ,],
    " ",
    ,
  ]
]);
function SplitPane($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const GRIP = 9;
  const NUDGE = 10;
  let direction = prop($$props, "direction", 3, "row"), initial = prop($$props, "initial", 3, 240), minFirst = prop($$props, "minFirst", 3, 80), minSecond = prop($$props, "minSecond", 3, 80), onresize = prop($$props, "onresize", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let size = state(proxy(untrack(() => initial())));
  let root = null;
  let drag = state(null);
  let focused = state(false);
  const horizontal = user_derived(() => direction() === "row");
  const lit = user_derived(() => get(focused) || get(drag) !== null);
  const first_css = user_derived(() => get(horizontal) ? `width: ${get(size)}px` : `height: ${get(size)}px`);
  function clamp(v) {
    const box = root?.nativeId == null ? null : get_native()?.getElementBounds(root.nativeId);
    const total = box ? get(horizontal) ? box.width : box.height : Infinity;
    return Math.max(minFirst(), Math.min(v, total - GRIP - minSecond()));
  }
  function resize(next) {
    set(size, next, true);
    onresize()?.(next);
  }
  function grab(e) {
    if (e.button !== 0)
      return;
    set(drag, { at: get(horizontal) ? e.x : e.y, start: get(size) }, true);
  }
  function move(e) {
    if (get(drag) === null)
      return;
    if (e.pressedButton == null) {
      set(drag, null);
      return;
    }
    resize(clamp(get(drag).start + (get(horizontal) ? e.x : e.y) - get(drag).at));
  }
  function key(e) {
    if (e.key === (get(horizontal) ? "left" : "up"))
      resize(clamp(get(size) - NUDGE));
    else if (e.key === (get(horizontal) ? "right" : "down"))
      resize(clamp(get(size) + NUDGE));
  }
  var div = root_219();
  var div_1 = child(div);
  var node_1 = child(div_1);
  snippet(node_1, () => validate_snippet_renderer(renderer_default, $$props.first));
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  set_attribute2(div_2, "tabindex", 0);
  var div_3 = child(div_2);
  let classes;
  reset(div_2);
  var div_4 = sibling(div_2, 2);
  var node_2 = child(div_4);
  snippet(node_2, () => validate_snippet_renderer(renderer_default, $$props.second));
  reset(div_4);
  var node_3 = sibling(div_4, 2);
  {
    var consequent = ($$anchor) => {
      var div_5 = root_123();
      event("mousemove", div_5, move);
      event("mouseup", div_5, () => set(drag, null));
      append($$anchor, div_5);
    };
    if_block(node_3, ($$render) => {
      if (get(drag) !== null)
        $$render(consequent);
    });
  }
  reset(div);
  attach2(div, () => (node) => root = node);
  template_effect(() => {
    set_class(div, 0, `split ${direction() ?? ""}`, "svelte-iqa2fr");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    set_style(div_1, get(first_css));
    set_class(div_2, 0, `grip ${direction() ?? ""}`, "svelte-iqa2fr");
    set_attribute2(div_2, "testId", testid() && `${testid()}-divider`);
    classes = set_class(div_3, 0, `line ${direction() ?? ""}`, "svelte-iqa2fr", classes, { focused: get(lit) });
  });
  event("mousedown", div_2, grab);
  event("keydown", div_2, key);
  event("focus", div_2, () => set(focused, true));
  event("blur", div_2, () => set(focused, false));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-iqa2fr", [{ classes: ["split"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", position: "relative", flexGrow: 1, minWidth: 0, minHeight: 0 } }, { classes: ["pane"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflow: "hidden" } }, { classes: ["grip"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignSelf: "stretch", flexShrink: 0, paddingTop: 0, paddingRight: 4, paddingBottom: 0, paddingLeft: 4, cursor: "col-resize" } }, { classes: ["line"], tag: null, pseudo: null, css: "background-color: var(--border)" }, { classes: ["overlay"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 } }, { classes: ["split", "column"], tag: null, pseudo: null, style: { flexDirection: "column" } }, { classes: ["pane", "lead"], tag: null, pseudo: null, style: { flexShrink: 0 } }, { classes: ["pane", "rest"], tag: null, pseudo: null, style: { flexGrow: 1 } }, { classes: ["grip", "column"], tag: null, pseudo: null, style: { flexDirection: "column", paddingTop: 4, paddingRight: 0, paddingBottom: 4, paddingLeft: 0, cursor: "row-resize" } }, { classes: ["line", "row"], tag: null, pseudo: null, style: { width: 1, alignSelf: "stretch" } }, { classes: ["line", "column"], tag: null, pseudo: null, style: { height: 1, alignSelf: "stretch" } }, { classes: ["line", "focused"], tag: null, pseudo: null, css: "background-color: var(--ring)" }]);

// gallery/demos/SplitPane.demo.svelte
var root41 = from_tree([
  [
    "div",
    {
      style: "font-size: var(--text-md); color: var(--text-primary)"
    },
    " "
  ]
]);
var root_124 = from_tree([
  [
    "div",
    null,
    [
      "div",
      {
        style: "font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); padding-bottom: 4px"
      },
      "FILES"
    ],
    " ",
    ,
  ]
]);
var root_220 = from_tree([
  [
    "div",
    null,
    [
      "div",
      {
        style: "font-size: var(--text-lg); font-weight: 600; color: var(--text-primary)"
      },
      "Button.svelte"
    ],
    " ",
    [
      "div",
      null,
      "Drag the divider, or focus it and use the arrow keys."
    ]
  ]
]);
var root_37 = from_tree([
  [
    "div",
    null,
    [
      "div",
      {
        style: "font-size: var(--text-md); color: var(--text-primary)"
      },
      "Input"
    ]
  ]
]);
var root_44 = from_tree([
  [
    "div",
    null,
    [
      "div",
      {
        style: "font-size: var(--text-md); color: var(--text-primary)"
      },
      "Output"
    ]
  ]
]);
var root_53 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: column; height: 200px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)"
      },
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: column; height: 150px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)"
      },
      ,
    ],
    " ",
    ["div", null, " "]
  ]
]);
function SplitPane_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const files = [
    "index.ts",
    "Button.svelte",
    "Modal.svelte",
    "tokens.ts",
    "README.md"
  ];
  const caption = "font-size: var(--text-sm); color: var(--text-secondary)";
  const pane = "display: flex; flex-direction: column; flex-grow: 1; background-color: var(--bg-surface); padding: 10px 12px; gap: 4px";
  let width = state(0);
  var div = root_53();
  var div_1 = child(div);
  var node = child(div_1);
  {
    const first = renderer_snippet(renderer_default, ($$anchor) => {
      var div_2 = root_124();
      set_style(div_2, "display: flex; flex-direction: column; flex-grow: 1; background-color: var(--bg-surface); padding: 10px 12px; gap: 4px; background-color: var(--bg-raised)");
      var node_1 = sibling(child(div_2), 2);
      each(node_1, 16, () => files, (f) => f, ($$anchor, f) => {
        var div_3 = root41();
        var text = only_child(div_3, true);
        template_effect(() => set_text(text, f));
        append($$anchor, div_3);
      });
      reset(div_2);
      append($$anchor, div_2);
    });
    const second = renderer_snippet(renderer_default, ($$anchor) => {
      var div_4 = root_220();
      set_style(div_4, pane);
      var div_5 = sibling(child(div_4), 2);
      set_style(div_5, caption);
      reset(div_4);
      append($$anchor, div_4);
    });
    SplitPane(node, {
      initial: 180,
      minFirst: 120,
      minSecond: 160,
      onresize: (s) => set(width, s, true),
      first,
      second,
      $$slots: { first: true, second: true }
    });
  }
  reset(div_1);
  var div_6 = sibling(div_1, 2);
  var node_2 = child(div_6);
  {
    const first = renderer_snippet(renderer_default, ($$anchor) => {
      var div_7 = root_37();
      set_style(div_7, "display: flex; flex-direction: column; flex-grow: 1; background-color: var(--bg-surface); padding: 10px 12px; gap: 4px; background-color: var(--bg-raised)");
      append($$anchor, div_7);
    });
    const second = renderer_snippet(renderer_default, ($$anchor) => {
      var div_8 = root_44();
      set_style(div_8, pane);
      append($$anchor, div_8);
    });
    SplitPane(node_2, {
      direction: "column",
      initial: 70,
      minFirst: 50,
      minSecond: 50,
      first,
      second,
      $$slots: { first: true, second: true }
    });
  }
  reset(div_6);
  var div_9 = sibling(div_6, 2);
  set_style(div_9, caption);
  var text_1 = only_child(div_9);
  reset(div);
  template_effect(() => set_text(text_1, `Top pane width: ${(get(width) || 180) ?? ""}px`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Stack.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Stack.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root42 = from_tree([["div", null, ,]]);
function Stack($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let direction = prop($$props, "direction", 3, "column"), gap = prop($$props, "gap", 3, "sm"), align = prop($$props, "align", 3, "stretch"), justify = prop($$props, "justify", 3, "start"), wrap = prop($$props, "wrap", 3, false), padding = prop($$props, "padding", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const css = user_derived(() => `${typeof gap() === "number" ? `gap: ${gap()}px; ` : ""}${typeof padding() === "number" ? `padding: ${padding()}px; ` : ""}${style() ?? ""}`);
  var div = root42();
  let classes;
  var node = child(div);
  snippet(node, () => validate_snippet_renderer(renderer_default, $$props.children));
  reset(div);
  template_effect(() => {
    classes = set_class(div, 0, `stack ${direction() ?? ""} al-${align() ?? ""} jc-${justify() ?? ""} ${typeof gap() === "string" ? `gap-${gap()}` : ""} ${typeof padding() === "string" ? `pad-${padding()}` : ""}`, "svelte-1kxidke", classes, { wrap: wrap() });
    set_style(div, get(css));
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
}
define_styles("svelte-1kxidke", [{ classes: ["stack"], tag: null, pseudo: null, style: { display: "flex" } }, { classes: ["al-start"], tag: null, pseudo: null, style: { alignItems: "start" } }, { classes: ["al-center"], tag: null, pseudo: null, style: { alignItems: "center" } }, { classes: ["al-end"], tag: null, pseudo: null, style: { alignItems: "end" } }, { classes: ["jc-start"], tag: null, pseudo: null, style: { justifyContent: "start" } }, { classes: ["jc-center"], tag: null, pseudo: null, style: { justifyContent: "center" } }, { classes: ["jc-end"], tag: null, pseudo: null, style: { justifyContent: "end" } }, { classes: ["jc-between"], tag: null, pseudo: null, style: { justifyContent: "space-between" } }, { classes: ["jc-around"], tag: null, pseudo: null, style: { justifyContent: "space-around" } }, { classes: ["stack", "row"], tag: null, pseudo: null, style: { flexDirection: "row" } }, { classes: ["stack", "column"], tag: null, pseudo: null, style: { flexDirection: "column" } }, { classes: ["stack", "wrap"], tag: null, pseudo: null, style: { flexWrap: "wrap" } }]);

// gallery/demos/Stack.demo.svelte
var root43 = from_tree([["div", null, " "]]);
var root_125 = from_tree([
  [
    "div",
    {
      style: "font-size: var(--text-md); font-weight: 600; color: var(--text-primary)"
    },
    "Toolbar"
  ],
  " ",
  ,
], 1);
var root_221 = from_tree([["div", null, "Step one"]]);
var root_38 = from_tree([["div", null, "Step two"]]);
var root_45 = from_tree([["div", null, "Step three"]]);
var root_54 = from_tree([, , " ", , " ", ,], 1);
var root_63 = from_tree([["div", null, " "]]);
var root_72 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 18px" },
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      ["div", null, "Row, gap md, align center"],
      " ",
      ,
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: column; gap: 8px" },
      ["div", null, " "],
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 24px; align-items: start"
      },
      [
        "div",
        {
          style: "display: flex; flex-direction: column; gap: 8px; flex-grow: 1"
        },
        ["div", null, "Column, gap sm"],
        " ",
        ,
      ],
      " ",
      [
        "div",
        {
          style: "display: flex; flex-direction: column; gap: 8px; width: 200px"
        },
        ["div", null, "Wrap in 200px"],
        " ",
        ,
      ]
    ]
  ]
]);
function Stack_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const chip = "font-size: var(--text-sm); color: var(--text-primary)";
  const caption = "font-size: var(--text-sm); color: var(--text-secondary)";
  const tags = [
    "Design",
    "Svelte",
    "GPUI",
    "Rust",
    "Motion",
    "Tokens",
    "Docs"
  ];
  let justify = state("between");
  var div = root_72();
  var div_1 = child(div);
  var div_2 = child(div_1);
  set_style(div_2, caption);
  var node = sibling(div_2, 2);
  Stack(node, {
    direction: "row",
    gap: "md",
    align: "center",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 16, () => tags.slice(0, 3), (t) => t, ($$anchor, t) => {
        var fragment_1 = comment();
        var node_2 = first_child(fragment_1);
        Box(node_2, {
          bg: "raised",
          radius: "sm",
          padding: 6,
          children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
            var div_3 = root43();
            set_style(div_3, chip);
            var text = only_child(div_3, true);
            template_effect(() => set_text(text, t));
            append($$anchor, div_3);
          }),
          $$slots: { default: true }
        });
        append($$anchor, fragment_1);
      });
      append($$anchor, fragment);
    }),
    $$slots: { default: true }
  });
  reset(div_1);
  var div_4 = sibling(div_1, 2);
  var div_5 = child(div_4);
  set_style(div_5, caption);
  var text_1 = only_child(div_5);
  var node_3 = sibling(div_5, 2);
  Stack(node_3, {
    direction: "row",
    get justify() {
      return get(justify);
    },
    align: "center",
    gap: "sm",
    style: "padding: 10px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_2 = root_125();
      var node_4 = sibling(first_child(fragment_2), 2);
      Button(node_4, {
        label: "Cycle",
        variant: "outline",
        size: "h-md",
        onclick: () => set(justify, get(justify) === "between" ? "center" : get(justify) === "center" ? "start" : "between", true)
      });
      append($$anchor, fragment_2);
    }),
    $$slots: { default: true }
  });
  reset(div_4);
  var div_6 = sibling(div_4, 2);
  var div_7 = child(div_6);
  var div_8 = child(div_7);
  set_style(div_8, caption);
  var node_5 = sibling(div_8, 2);
  Stack(node_5, {
    direction: "column",
    gap: "sm",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_3 = root_54();
      var node_6 = first_child(fragment_3);
      Box(node_6, {
        bg: "raised",
        radius: "sm",
        padding: "sm",
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div_9 = root_221();
          set_style(div_9, chip);
          append($$anchor, div_9);
        }),
        $$slots: { default: true }
      });
      var node_7 = sibling(node_6, 2);
      Box(node_7, {
        bg: "raised",
        radius: "sm",
        padding: "sm",
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div_10 = root_38();
          set_style(div_10, chip);
          append($$anchor, div_10);
        }),
        $$slots: { default: true }
      });
      var node_8 = sibling(node_7, 2);
      Box(node_8, {
        bg: "raised",
        radius: "sm",
        padding: "sm",
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div_11 = root_45();
          set_style(div_11, chip);
          append($$anchor, div_11);
        }),
        $$slots: { default: true }
      });
      append($$anchor, fragment_3);
    }),
    $$slots: { default: true }
  });
  reset(div_7);
  var div_12 = sibling(div_7, 2);
  var div_13 = child(div_12);
  set_style(div_13, caption);
  var node_9 = sibling(div_13, 2);
  Stack(node_9, {
    direction: "row",
    wrap: true,
    gap: "sm",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_4 = comment();
      var node_10 = first_child(fragment_4);
      each(node_10, 16, () => tags, (t) => t, ($$anchor, t) => {
        var fragment_5 = comment();
        var node_11 = first_child(fragment_5);
        Box(node_11, {
          bg: "raised",
          radius: "sm",
          padding: 6,
          children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
            var div_14 = root_63();
            set_style(div_14, chip);
            var text_2 = only_child(div_14, true);
            template_effect(() => set_text(text_2, t));
            append($$anchor, div_14);
          }),
          $$slots: { default: true }
        });
        append($$anchor, fragment_5);
      });
      append($$anchor, fragment_4);
    }),
    $$slots: { default: true }
  });
  reset(div_12);
  reset(div_6);
  reset(div);
  template_effect(() => set_text(text_1, `Row, justify ${get(justify) ?? ""} (click to cycle)`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Breadcrumbs.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Breadcrumbs.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root44 = from_tree([["div", { class: "sep svelte-1gu7a8v" }, " "]]);
var root_126 = from_tree([, , " ", ["div", null, " "]], 1);
var root_222 = from_tree([["div"]]);
function Breadcrumbs($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let separator = prop($$props, "separator", 3, "/"), size = prop($$props, "size", 3, "md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(null);
  function key(e, onclick) {
    if (e.key === "enter" || e.key === "space")
      onclick();
  }
  var div = root_222();
  each(div, 21, () => $$props.items, index, ($$anchor, item, i) => {
    const current = user_derived(() => i === $$props.items.length - 1);
    var fragment = root_126();
    var node = first_child(fragment);
    {
      var consequent = ($$anchor) => {
        var div_1 = root44();
        var text = only_child(div_1, true);
        template_effect(() => set_text(text, separator()));
        append($$anchor, div_1);
      };
      if_block(node, ($$render) => {
        if (i > 0)
          $$render(consequent);
      });
    }
    var div_2 = sibling(node, 2);
    let classes;
    var text_1 = only_child(div_2, true);
    template_effect(() => {
      classes = set_class(div_2, 0, "crumb svelte-1gu7a8v", null, classes, {
        clickable: !!get(item).onclick,
        current: get(current),
        focused: get(focused) === i
      });
      set_attribute2(div_2, "tabindex", get(item).onclick ? 0 : undefined);
      set_attribute2(div_2, "testId", testid() && `${testid()}-${i}`);
      set_text(text_1, get(item).label);
    });
    event("click", div_2, function(...$$args) {
      get(item).onclick?.apply(this, $$args);
    });
    event("keydown", div_2, function(...$$args) {
      (get(item).onclick ? (e) => key(e, get(item).onclick) : undefined)?.apply(this, $$args);
    });
    event("focus", div_2, () => set(focused, i, true));
    event("blur", div_2, () => set(focused, null));
    append($$anchor, fragment);
  });
  reset(div);
  template_effect(() => {
    set_class(div, 0, `crumbs ${size() ?? ""}`, "svelte-1gu7a8v");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1gu7a8v", [{ classes: ["crumbs"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 2, whiteSpace: "nowrap" } }, { classes: ["crumb"], tag: null, pseudo: null, css: "padding: 0 6px; border-width: 1px; border-color: #00000000; border-radius: var(--radius-sm); color: var(--text-secondary); user-select: none" }, { classes: ["sep"], tag: null, pseudo: null, css: "padding: 0 2px; color: var(--text-muted)" }, { classes: ["crumbs", "sm"], tag: null, pseudo: null, css: "font-size: var(--text-sm); line-height: 22px" }, { classes: ["crumbs", "md"], tag: null, pseudo: null, css: "font-size: var(--text-md); line-height: 26px" }, { classes: ["crumbs", "lg"], tag: null, pseudo: null, css: "font-size: var(--text-lg); line-height: 32px" }, { classes: ["crumb", "clickable"], tag: null, pseudo: null, style: { cursor: "pointer" } }, { classes: ["crumb", "clickable"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["crumb", "current"], tag: null, pseudo: null, css: "color: var(--text-primary); font-weight: 600" }, { classes: ["crumb", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }]);

// gallery/demos/Breadcrumbs.demo.svelte
var root45 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 16px; align-items: start"
    },
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ["div", { style: "color: var(--text-secondary)" }, " "]
  ]
]);
function Breadcrumbs_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let visited = state("none");
  const go = (name) => () => set(visited, name, true);
  var div = root45();
  var node = child(div);
  {
    let $0 = user_derived(() => [
      { label: "Workspace", onclick: go("Workspace") },
      { label: "Projects", onclick: go("Projects") },
      { label: "Fractal UI" }
    ]);
    Breadcrumbs(node, {
      get items() {
        return get($0);
      }
    });
  }
  var node_1 = sibling(node, 2);
  {
    let $0 = user_derived(() => [
      { label: "Settings", onclick: go("Settings") },
      { label: "Keyboard" }
    ]);
    Breadcrumbs(node_1, {
      size: "sm",
      separator: "›",
      get items() {
        return get($0);
      }
    });
  }
  var node_2 = sibling(node_1, 2);
  {
    let $0 = user_derived(() => [
      { label: "Docs", onclick: go("Docs") },
      { label: "Components" }
    ]);
    Breadcrumbs(node_2, {
      size: "lg",
      separator: "→",
      get items() {
        return get($0);
      }
    });
  }
  var div_1 = sibling(node_2, 2);
  var text = only_child(div_1);
  reset(div);
  template_effect(() => set_text(text, `last visited: ${get(visited) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Menu.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Menu.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root46 = from_tree([["div", { class: "sep svelte-1sd24ec" }]]);
var root_127 = from_tree([["div", { class: "shortcut svelte-1sd24ec" }, " "]]);
var root_223 = from_tree([
  [
    "div",
    null,
    ["div", { class: "label svelte-1sd24ec" }, " "],
    " ",
    ,
  ]
]);
var root_39 = from_tree([["div", { class: "menu svelte-1sd24ec" }]]);
var root_46 = from_tree([["div", null, ,]]);
function Menu($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let open = prop($$props, "open", 3, false), onopenchange = prop($$props, "onopenchange", 3, undefined), side = prop($$props, "side", 3, "bottom"), align = prop($$props, "align", 3, "start"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const panel = user_derived(() => `background-color: var(--bg-sunken); color: var(--text-primary); border-color: var(--border); border-radius: var(--radius-md); padding: 4px; min-width: 200px; ${style() ?? ""}`);
  let active = state(-1);
  let focused = state(false);
  const selectable = (entry) => !!entry && !("separator" in entry) && !entry.disabled;
  function next(from, dir) {
    const n = $$props.items.length;
    let i = from < 0 ? dir > 0 ? -1 : n : from;
    for (let k = 0;k < n; k++) {
      i = (i + dir + n) % n;
      if (selectable($$props.items[i]))
        return i;
    }
    return from;
  }
  function show(value) {
    if (value)
      set(active, next(-1, 1), true);
    onopenchange()?.(value);
  }
  function choose(entry) {
    if (!selectable(entry))
      return;
    show(false);
    entry.onselect();
  }
  function key(e) {
    if (!open() && (e.key === "enter" || e.key === "space" || e.key === "down"))
      show(true);
  }
  user_effect(() => {
    if (!open())
      return;
    return on_window_key("keydown", (e) => {
      if (e.key === "down")
        set(active, next(get(active), 1), true);
      else if (e.key === "up")
        set(active, next(get(active), -1), true);
      else if (e.key === "enter" && get(active) >= 0)
        choose($$props.items[get(active)]);
    });
  });
  var fragment = comment();
  var node = first_child(fragment);
  {
    const content = renderer_snippet(renderer_default, ($$anchor) => {
      var div = root_39();
      each(div, 21, () => $$props.items, index, ($$anchor, entry, i) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        {
          var consequent = ($$anchor) => {
            var div_1 = root46();
            append($$anchor, div_1);
          };
          var alternate = ($$anchor) => {
            const variant = user_derived(() => get(entry).variant ?? "secondary");
            var div_2 = root_223();
            let classes;
            var div_3 = child(div_2);
            var text = only_child(div_3, true);
            var node_2 = sibling(div_3, 2);
            {
              var consequent_1 = ($$anchor) => {
                var div_4 = root_127();
                var text_1 = only_child(div_4, true);
                template_effect(() => set_text(text_1, get(entry).shortcut));
                append($$anchor, div_4);
              };
              if_block(node_2, ($$render) => {
                if (get(entry).shortcut)
                  $$render(consequent_1);
              });
            }
            reset(div_2);
            template_effect(() => {
              classes = set_class(div_2, 0, `item ${get(variant) ?? ""}`, "svelte-1sd24ec", classes, { hl: i === get(active), off: get(entry).disabled });
              set_text(text, get(entry).label);
            });
            event("mouseenter", div_2, () => {
              if (selectable(get(entry)))
                set(active, i, true);
            });
            event("click", div_2, () => choose(get(entry)));
            append($$anchor, div_2);
          };
          if_block(node_1, ($$render) => {
            if ("separator" in get(entry))
              $$render(consequent);
            else
              $$render(alternate, -1);
          });
        }
        append($$anchor, fragment_1);
      });
      reset(div);
      append($$anchor, div);
    });
    Popover(node, {
      get open() {
        return open();
      },
      onclose: () => show(false),
      get side() {
        return side();
      },
      get align() {
        return align();
      },
      gap: 4,
      get style() {
        return get(panel);
      },
      get testid() {
        return testid();
      },
      content,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var div_5 = root_46();
        let classes_1;
        set_attribute2(div_5, "tabindex", 0);
        var node_3 = child(div_5);
        snippet(node_3, () => validate_snippet_renderer(renderer_default, $$props.trigger));
        reset(div_5);
        template_effect(() => {
          classes_1 = set_class(div_5, 0, "trigger svelte-1sd24ec", null, classes_1, { focused: get(focused) });
          set_attribute2(div_5, "testId", testid() && `${testid()}-trigger`);
        });
        event("click", div_5, () => show(!open()));
        event("keydown", div_5, key);
        event("focus", div_5, () => set(focused, true));
        event("blur", div_5, () => set(focused, false));
        append($$anchor, div_5);
      }),
      $$slots: { content: true, default: true }
    });
  }
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1sd24ec", [{ classes: ["trigger"], tag: null, pseudo: null, css: "display: flex; border-width: 1px; border-color: #00000000; border-radius: var(--radius-md)" }, { classes: ["menu"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column" } }, { classes: ["item"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; gap: 16px; height: 28px; padding: 0 10px; border-radius: var(--radius-sm); font-size: var(--text-md); white-space: nowrap; user-select: none; cursor: pointer" }, { classes: ["label"], tag: null, pseudo: null, style: { display: "flex", flexGrow: 1 } }, { classes: ["shortcut"], tag: null, pseudo: null, css: "color: var(--text-muted); font-size: var(--text-xs); font-family: var(--font-mono)" }, { classes: ["sep"], tag: null, pseudo: null, css: "height: 1px; margin: 4px 6px; background-color: var(--border)" }, { classes: ["trigger", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["item", "secondary"], tag: null, pseudo: null, css: "color: var(--text-primary)" }, { classes: ["item", "themed"], tag: null, pseudo: null, css: "color: var(--theme-color)" }, { classes: ["item", "info"], tag: null, pseudo: null, css: "color: var(--info)" }, { classes: ["item", "success"], tag: null, pseudo: null, css: "color: var(--success)" }, { classes: ["item", "warning"], tag: null, pseudo: null, css: "color: var(--warning)" }, { classes: ["item", "danger"], tag: null, pseudo: null, css: "color: var(--danger)" }, { classes: ["item", "hl"], tag: null, pseudo: null, css: "background-color: var(--bg-raised)" }, { classes: ["item", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["item", "danger", "hl"], tag: null, pseudo: null, css: "background-color: var(--danger-soft)" }]);

// gallery/demos/Menu.demo.svelte
var root47 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 24px; align-items: start"
      },
      ,
      " ",
      ,
      " ",
      [
        "div",
        { style: "color: var(--text-secondary); padding-top: 8px" },
        " "
      ]
    ]
  ]
]);
function Menu_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let open = state(false);
  let picked = state("nothing");
  const pick = (name) => () => set(picked, name, true);
  var div = root47();
  var div_1 = child(div);
  var node = child(div_1);
  {
    const trigger = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      Button(node_1, { label: "Actions", variant: "outline" });
      append($$anchor, fragment);
    });
    let $0 = user_derived(() => [
      { label: "Rename", shortcut: "⌘R", onselect: pick("Rename") },
      {
        label: "Duplicate",
        shortcut: "⌘D",
        onselect: pick("Duplicate")
      },
      { label: "Share…", onselect: pick("Share") },
      { separator: true },
      { label: "Archive", disabled: true, onselect: pick("Archive") },
      {
        label: "Delete",
        shortcut: "⌫",
        variant: "danger",
        onselect: pick("Delete")
      }
    ]);
    Menu(node, {
      get open() {
        return get(open);
      },
      onopenchange: (o) => set(open, o, true),
      style: "min-width: 220px",
      get items() {
        return get($0);
      },
      trigger,
      $$slots: { trigger: true }
    });
  }
  var node_2 = sibling(node, 2);
  {
    const trigger = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_1 = comment();
      var node_3 = first_child(fragment_1);
      Button(node_3, { label: "Open upward", variant: "outline" });
      append($$anchor, fragment_1);
    });
    let $0 = user_derived(() => [{ label: "Above the trigger", onselect: pick("Above") }]);
    Menu(node_2, {
      side: "top",
      get items() {
        return get($0);
      },
      trigger,
      $$slots: { trigger: true }
    });
  }
  var div_2 = sibling(node_2, 2);
  var text = only_child(div_2);
  reset(div_1);
  reset(div);
  template_effect(() => set_text(text, `picked: ${get(picked) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/NavList.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/NavList.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root48 = from_tree([["div", { class: "heading svelte-8t6415" }, " "]]);
var root_128 = from_tree([["div", { class: "icon svelte-8t6415" }, ,]]);
var root_224 = from_tree([["div", { class: "badge svelte-8t6415" }, " "]]);
var root_310 = from_tree([
  [
    "div",
    null,
    ,
    " ",
    ["div", { class: "label svelte-8t6415" }, " "],
    " ",
    ,
  ]
]);
var root_47 = from_tree([["div", { class: "section svelte-8t6415" }, , " ", ,]]);
var root_55 = from_tree([["div", { class: "nav svelte-8t6415" }]]);
function NavList($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let onchange = prop($$props, "onchange", 3, undefined), size = prop($$props, "size", 3, "h-lg"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const nodes = {};
  const flat = user_derived(() => $$props.sections.flatMap((s) => s.items));
  let focused = state(null);
  function pick(item) {
    if (!item.disabled && item.id !== $$props.value)
      onchange()?.(item.id);
  }
  function step(id, dir) {
    const live = get(flat).filter((item) => !item.disabled);
    const at = live.findIndex((item) => item.id === id);
    const next = live[(at + dir + live.length) % live.length];
    if (!next)
      return;
    pick(next);
    focus_element(nodes[next.id]);
  }
  function key(e, id) {
    if (e.key === "up")
      step(id, -1);
    else if (e.key === "down")
      step(id, 1);
    else if (e.key === "enter" || e.key === "space")
      pick(get(flat).find((item) => item.id === id));
  }
  var div = root_55();
  each(div, 21, () => $$props.sections, index, ($$anchor, section) => {
    var div_1 = root_47();
    var node_1 = child(div_1);
    {
      var consequent = ($$anchor) => {
        var div_2 = root48();
        var text = only_child(div_2, true);
        template_effect(() => set_text(text, get(section).title));
        append($$anchor, div_2);
      };
      if_block(node_1, ($$render) => {
        if (get(section).title)
          $$render(consequent);
      });
    }
    var node_2 = sibling(node_1, 2);
    each(node_2, 17, () => get(section).items, (item) => item.id, ($$anchor, item) => {
      const active = user_derived(() => get(item).id === $$props.value);
      var div_3 = root_310();
      let classes;
      var node_3 = child(div_3);
      {
        var consequent_1 = ($$anchor) => {
          var div_4 = root_128();
          var node_4 = child(div_4);
          snippet(node_4, () => validate_snippet_renderer(renderer_default, get(item).icon));
          reset(div_4);
          append($$anchor, div_4);
        };
        if_block(node_3, ($$render) => {
          if (get(item).icon)
            $$render(consequent_1);
        });
      }
      var div_5 = sibling(node_3, 2);
      var text_1 = only_child(div_5, true);
      var node_5 = sibling(div_5, 2);
      {
        var consequent_2 = ($$anchor) => {
          var div_6 = root_224();
          var text_2 = only_child(div_6, true);
          template_effect(() => set_text(text_2, get(item).badge));
          append($$anchor, div_6);
        };
        if_block(node_5, ($$render) => {
          if (get(item).badge)
            $$render(consequent_2);
        });
      }
      reset(div_3);
      attach2(div_3, () => (node) => nodes[get(item).id] = node);
      template_effect(() => {
        classes = set_class(div_3, 0, `item el-size ${size() ?? ""}`, "svelte-8t6415", classes, {
          active: get(active),
          off: get(item).disabled,
          rest: !get(active) && !get(item).disabled,
          focused: get(focused) === get(item).id
        });
        set_attribute2(div_3, "tabindex", get(active) ? 0 : -1);
        set_attribute2(div_3, "testId", testid() && `${testid()}-${get(item).id}`);
        set_text(text_1, get(item).label);
      });
      event("click", div_3, () => pick(get(item)));
      event("keydown", div_3, (e) => key(e, get(item).id));
      event("focus", div_3, () => set(focused, get(item).id, true));
      event("blur", div_3, () => set(focused, null));
      append($$anchor, div_3);
    });
    reset(div_1);
    append($$anchor, div_1);
  });
  reset(div);
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-8t6415", [{ classes: ["nav"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 12 } }, { classes: ["section"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 2 } }, { classes: ["heading"], tag: null, pseudo: null, css: "padding: 0 10px 4px 10px; font-size: var(--text-xs); font-weight: 600; color: var(--text-muted); white-space: nowrap" }, { classes: ["item"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; gap: 8px; padding: 0 10px; border-width: 1px; border-color: #00000000; border-radius: var(--radius-md); background-color: #00000000; color: var(--text-secondary); font-weight: 500; white-space: nowrap; user-select: none; cursor: pointer" }, { classes: ["icon"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", width: 16 } }, { classes: ["label"], tag: null, pseudo: null, style: { display: "flex", flexGrow: 1 } }, { classes: ["badge"], tag: null, pseudo: null, css: "height: 16px; padding: 0 6px; border-radius: var(--radius-full); background-color: var(--bg-raised); color: var(--text-secondary); font-size: var(--text-xs); line-height: 16px" }, { classes: ["item", "active"], tag: null, pseudo: null, css: "background-color: var(--theme-color-sub); color: var(--theme-color)" }, { classes: ["item", "rest"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["item", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["item", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }]);

// gallery/demos/NavList.demo.svelte
var inbox = renderer_snippet(renderer_default, ($$anchor) => {
  var text = root49();
  append($$anchor, text);
});
var gear = renderer_snippet(renderer_default, ($$anchor) => {
  var text_1 = root_129();
  append($$anchor, text_1);
});
var root49 = from_tree([["text", null, "✉"]], 4);
var root_129 = from_tree([["text", null, "⚙"]], 4);
var root_225 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: row; gap: 32px" },
    ["div", { style: "width: 220px" }, ,],
    " ",
    ["div", { style: "width: 180px" }, ,]
  ]
]);
function NavList_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let value = state("inbox");
  const sections = [
    {
      title: "Mail",
      items: [
        { id: "inbox", label: "Inbox", badge: "12", icon: inbox },
        { id: "drafts", label: "Drafts", badge: "2" },
        { id: "starred", label: "Starred" }
      ]
    },
    {
      title: "Account",
      items: [
        { id: "general", label: "General", icon: gear },
        { id: "billing", label: "Billing", disabled: true }
      ]
    }
  ];
  var div = root_225();
  var div_1 = child(div);
  var node = child(div_1);
  NavList(node, {
    get sections() {
      return sections;
    },
    get value() {
      return get(value);
    },
    onchange: (id) => set(value, id, true)
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_1 = child(div_2);
  NavList(node_1, {
    get sections() {
      return sections;
    },
    value: "general",
    size: "h-md"
  });
  reset(div_2);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Pagination.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Pagination.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root50 = from_tree([["div", { class: "gap svelte-1iajb95" }, "…"]]);
var root_130 = from_tree([["div", { class: "pager svelte-1iajb95" }, , " ", , " ", ,]]);
function Pagination($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let siblings = prop($$props, "siblings", 3, 1), onchange = prop($$props, "onchange", 3, undefined), size = prop($$props, "size", 3, "h-md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const slots = user_derived(() => {
    const out = [1];
    const from = Math.max(2, $$props.page - siblings());
    const to = Math.min($$props.total - 1, $$props.page + siblings());
    if (from > 2)
      out.push("gap");
    for (let p = from;p <= to; p++)
      out.push(p);
    if (to < $$props.total - 1)
      out.push("gap");
    if ($$props.total > 1)
      out.push($$props.total);
    return out;
  });
  function go(p) {
    if (p >= 1 && p <= $$props.total && p !== $$props.page)
      onchange()?.(p);
  }
  var div = root_130();
  var node = child(div);
  {
    let $0 = user_derived(() => $$props.page <= 1);
    let $1 = user_derived(() => testid() && `${testid()}-prev`);
    Button(node, {
      variant: "ghost",
      get size() {
        return size();
      },
      label: "Previous",
      get disabled() {
        return get($0);
      },
      onclick: () => go($$props.page - 1),
      get testid() {
        return get($1);
      }
    });
  }
  var node_1 = sibling(node, 2);
  each(node_1, 17, () => get(slots), index, ($$anchor, slot) => {
    var fragment = comment();
    var node_2 = first_child(fragment);
    {
      var consequent = ($$anchor) => {
        var div_1 = root50();
        append($$anchor, div_1);
      };
      var alternate = ($$anchor) => {
        const current = user_derived(() => get(slot) === $$props.page);
        var fragment_1 = comment();
        var node_3 = first_child(fragment_1);
        {
          let $0 = user_derived(() => get(current) ? "primary" : "ghost");
          let $1 = user_derived(() => String(get(slot)));
          let $2 = user_derived(() => testid() && `${testid()}-${get(slot)}`);
          Button(node_3, {
            get variant() {
              return get($0);
            },
            get size() {
              return size();
            },
            get label() {
              return get($1);
            },
            onclick: () => go(get(slot)),
            get testid() {
              return get($2);
            }
          });
        }
        append($$anchor, fragment_1);
      };
      if_block(node_2, ($$render) => {
        if (get(slot) === "gap")
          $$render(consequent);
        else
          $$render(alternate, -1);
      });
    }
    append($$anchor, fragment);
  });
  var node_4 = sibling(node_1, 2);
  {
    let $0 = user_derived(() => $$props.page >= $$props.total);
    let $1 = user_derived(() => testid() && `${testid()}-next`);
    Button(node_4, {
      variant: "ghost",
      get size() {
        return size();
      },
      label: "Next",
      get disabled() {
        return get($0);
      },
      onclick: () => go($$props.page + 1),
      get testid() {
        return get($1);
      }
    });
  }
  reset(div);
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1iajb95", [{ classes: ["pager"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4 } }, { classes: ["gap"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; justify-content: center; width: 24px; color: var(--text-muted)" }]);

// gallery/demos/Pagination.demo.svelte
var root51 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 16px; align-items: start"
    },
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ["div", { style: "color: var(--text-secondary)" }, " "]
  ]
]);
function Pagination_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let page = state(1);
  let wide = state(7);
  let small = state(2);
  var div = root51();
  var node = child(div);
  Pagination(node, {
    get page() {
      return get(page);
    },
    total: 24,
    onchange: (p) => set(page, p, true)
  });
  var node_1 = sibling(node, 2);
  Pagination(node_1, {
    get page() {
      return get(wide);
    },
    total: 24,
    siblings: 2,
    onchange: (p) => set(wide, p, true)
  });
  var node_2 = sibling(node_1, 2);
  Pagination(node_2, {
    get page() {
      return get(small);
    },
    total: 5,
    size: "h-sm",
    onchange: (p) => set(small, p, true)
  });
  var node_3 = sibling(node_2, 2);
  Pagination(node_3, { page: 3, total: 3, size: "h-lg" });
  var div_1 = sibling(node_3, 2);
  var text = only_child(div_1);
  reset(div);
  template_effect(() => set_text(text, `page ${get(page) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Tabs.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Tabs.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root52 = from_tree([["div"]]);
var root_131 = from_tree([
  [
    "div",
    null,
    ["div", { class: "label svelte-j84j6i" }, " "],
    " ",
    ,
  ]
]);
var root_226 = from_tree([["div", { class: "panel svelte-j84j6i" }, ,]]);
var root_311 = from_tree([["div", { class: "tabs svelte-j84j6i" }, ["div"], " ", ,]]);
function Tabs($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let onchange = prop($$props, "onchange", 3, undefined), variant = prop($$props, "variant", 3, "line"), size = prop($$props, "size", 3, "h-bs"), children = prop($$props, "children", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const nodes = {};
  let focused = state(null);
  function select(id) {
    if (id !== $$props.value)
      onchange()?.(id);
  }
  function pick(item) {
    if (!item.disabled)
      select(item.id);
  }
  function step(id, dir) {
    const live = $$props.items.filter((item) => !item.disabled);
    const at = live.findIndex((item) => item.id === id);
    const next = live[(at + dir + live.length) % live.length];
    if (!next)
      return;
    select(next.id);
    focus_element(nodes[next.id]);
  }
  function key(e, id) {
    if (e.key === "left")
      step(id, -1);
    else if (e.key === "right")
      step(id, 1);
    else if (e.key === "enter" || e.key === "space")
      select(id);
  }
  var div = root_311();
  var div_1 = child(div);
  each(div_1, 21, () => $$props.items, (item) => item.id, ($$anchor, item) => {
    const active = user_derived(() => get(item).id === $$props.value);
    var div_2 = root_131();
    let classes;
    var div_3 = child(div_2);
    var text = only_child(div_3, true);
    var node_1 = sibling(div_3, 2);
    {
      var consequent = ($$anchor) => {
        var div_4 = root52();
        let classes_1;
        template_effect(() => classes_1 = set_class(div_4, 0, "bar svelte-j84j6i", null, classes_1, { lit: get(active) }));
        append($$anchor, div_4);
      };
      if_block(node_1, ($$render) => {
        if (variant() === "line")
          $$render(consequent);
      });
    }
    reset(div_2);
    attach2(div_2, () => (node) => nodes[get(item).id] = node);
    template_effect(() => {
      classes = set_class(div_2, 0, `tab el-size ${size() ?? ""} ${variant() ?? ""}`, "svelte-j84j6i", classes, {
        active: get(active),
        off: get(item).disabled,
        rest: !get(active) && !get(item).disabled,
        focused: get(focused) === get(item).id
      });
      set_attribute2(div_2, "tabindex", get(active) ? 0 : -1);
      set_attribute2(div_2, "testId", testid() && `${testid()}-${get(item).id}`);
      set_text(text, get(item).label);
    });
    event("click", div_2, () => pick(get(item)));
    event("keydown", div_2, (e) => key(e, get(item).id));
    event("focus", div_2, () => set(focused, get(item).id, true));
    event("blur", div_2, () => set(focused, null));
    append($$anchor, div_2);
  });
  reset(div_1);
  var node_2 = sibling(div_1, 2);
  {
    var consequent_1 = ($$anchor) => {
      var div_5 = root_226();
      var node_3 = child(div_5);
      snippet(node_3, () => validate_snippet_renderer(renderer_default, children()), () => $$props.value);
      reset(div_5);
      append($$anchor, div_5);
    };
    if_block(node_2, ($$render) => {
      if (children())
        $$render(consequent_1);
    });
  }
  reset(div);
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    set_class(div_1, 0, `list ${variant() ?? ""}`, "svelte-j84j6i");
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-j84j6i", [{ classes: ["tabs"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 12 } }, { classes: ["list"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row" } }, { classes: ["tab"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; border-width: 1px; border-color: #00000000; background-color: #00000000; color: var(--text-secondary); font-weight: 500; white-space: nowrap; user-select: none; cursor: pointer" }, { classes: ["label"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", flexGrow: 1, alignItems: "center", justifyContent: "center", paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12 } }, { classes: ["bar"], tag: null, pseudo: null, style: { height: 2, backgroundColor: "#00000000" } }, { classes: ["panel"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column" } }, { classes: ["list", "line"], tag: null, pseudo: null, css: "border-bottom-width: 1px; border-color: var(--border)" }, { classes: ["list", "pill"], tag: null, pseudo: null, css: "align-self: start; gap: 2px; padding: 3px; border-radius: var(--radius-md); background-color: var(--bg-raised)" }, { classes: ["tab", "active"], tag: null, pseudo: null, css: "color: var(--text-primary)" }, { classes: ["tab", "rest"], tag: null, pseudo: "hover", css: "color: var(--text-primary)" }, { classes: ["tab", "off"], tag: null, pseudo: null, style: { opacity: 0.5, cursor: "not-allowed" } }, { classes: ["tab", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }, { classes: ["bar", "lit"], tag: null, pseudo: null, css: "background-color: var(--theme-color)" }, { classes: ["tab", "pill", "active"], tag: null, pseudo: null, css: "background-color: var(--bg-surface)" }]);

// gallery/demos/Tabs.demo.svelte
var root53 = from_tree([["div", { style: "color: var(--text-secondary)" }, " "]]);
var root_132 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 24px; width: 420px"
    },
    ,
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: center"
      },
      ,
      " ",
      ,
    ]
  ]
]);
function Tabs_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let line = state("overview");
  let pill = state("day");
  let small = state("code");
  const items = [
    { id: "overview", label: "Overview" },
    { id: "activity", label: "Activity" },
    { id: "billing", label: "Billing", disabled: true },
    { id: "settings", label: "Settings" }
  ];
  const periods = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" }
  ];
  var div = root_132();
  var node = child(div);
  {
    const children = renderer_snippet(renderer_default, ($$anchor, id = noop) => {
      var div_1 = root53();
      var text = only_child(div_1);
      template_effect(() => set_text(text, `Showing ${id() ?? ""}.`));
      append($$anchor, div_1);
    });
    Tabs(node, {
      get items() {
        return items;
      },
      get value() {
        return get(line);
      },
      onchange: (id) => set(line, id, true),
      children,
      $$slots: { default: true }
    });
  }
  var div_2 = sibling(node, 2);
  var node_1 = child(div_2);
  Tabs(node_1, {
    get items() {
      return periods;
    },
    get value() {
      return get(pill);
    },
    variant: "pill",
    onchange: (id) => set(pill, id, true)
  });
  var node_2 = sibling(node_1, 2);
  Tabs(node_2, {
    get items() {
      return periods;
    },
    get value() {
      return get(small);
    },
    variant: "pill",
    size: "h-md",
    onchange: (id) => set(small, id, true)
  });
  reset(div_2);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/ContextMenu.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/ContextMenu.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root54 = from_tree([["div", { class: "sep svelte-ki1pds" }]]);
var root_133 = from_tree([["div", null, " "]]);
var root_227 = from_tree([
  [
    "div",
    { class: "scrim svelte-ki1pds" },
    ["div", { class: "menu svelte-ki1pds" }]
  ]
]);
var root_312 = from_tree([
  ["div", { class: "area svelte-ki1pds", hitbox: "self" }, ,],
  " ",
  ,
], 1);
function ContextMenu($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const WIDTH = 220;
  const ROW = 28;
  const RULE = 9;
  let style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let at = state(null);
  let active = state(-1);
  const height = user_derived(() => $$props.items.reduce((h, e) => h + ("separator" in e ? RULE : ROW), 10));
  function open_at(e) {
    const win = get_native()?.getWindowSize();
    const x = e.x ?? 0;
    const y = e.y ?? 0;
    set(at, win ? {
      x: Math.max(0, Math.min(x, win.width - WIDTH)),
      y: Math.max(0, Math.min(y, win.height - get(height)))
    } : { x, y }, true);
    set(active, -1);
  }
  function close() {
    set(at, null);
    set(active, -1);
  }
  function choose(i) {
    const entry = $$props.items[i];
    if (!entry || "separator" in entry || entry.disabled)
      return;
    close();
    entry.onselect?.();
  }
  function step(dir) {
    const n = $$props.items.length;
    let i = get(active) < 0 ? dir > 0 ? -1 : n : get(active);
    for (let k = 0;k < n; k++) {
      i = (i + dir + n) % n;
      const entry = $$props.items[i];
      if (!("separator" in entry) && !entry.disabled) {
        set(active, i, true);
        return;
      }
    }
  }
  user_effect(() => {
    if (!get(at))
      return;
    return on_window_key("keydown", (e) => {
      if (e.key === "escape")
        close();
      else if (e.key === "down")
        step(1);
      else if (e.key === "up")
        step(-1);
      else if (e.key === "enter" && get(active) >= 0)
        choose(get(active));
    });
  });
  var fragment = root_312();
  var div = first_child(fragment);
  var node = child(div);
  snippet(node, () => validate_snippet_renderer(renderer_default, $$props.children));
  reset(div);
  var node_1 = sibling(div, 2);
  {
    var consequent_1 = ($$anchor) => {
      var fragment_1 = comment();
      var node_2 = first_child(fragment_1);
      Portal(node_2, {
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div_1 = root_227();
          var div_2 = child(div_1);
          each(div_2, 21, () => $$props.items, index, ($$anchor, entry, i) => {
            var fragment_2 = comment();
            var node_3 = first_child(fragment_2);
            {
              var consequent = ($$anchor) => {
                var div_3 = root54();
                append($$anchor, div_3);
              };
              var alternate = ($$anchor) => {
                var div_4 = root_133();
                let classes;
                var text = only_child(div_4, true);
                template_effect(() => {
                  classes = set_class(div_4, 0, "item svelte-ki1pds", null, classes, {
                    off: get(entry).disabled,
                    active: get(active) === i && !get(entry).disabled,
                    danger: get(entry).danger
                  });
                  set_text(text, get(entry).label);
                });
                event("mouseenter", div_4, () => !get(entry).disabled && set(active, i, true));
                event("mouseleave", div_4, () => set(active, -1));
                event("click", div_4, () => choose(i));
                append($$anchor, div_4);
              };
              if_block(node_3, ($$render) => {
                if ("separator" in get(entry))
                  $$render(consequent);
                else
                  $$render(alternate, -1);
              });
            }
            append($$anchor, fragment_2);
          });
          reset(div_2);
          reset(div_1);
          template_effect(() => {
            set_attribute2(div_1, "testId", testid() && `${testid()}-scrim`);
            set_style(div_2, `left: ${get(at).x ?? ""}px; top: ${get(at).y ?? ""}px; width: 220px`);
            set_attribute2(div_2, "testId", testid() && `${testid()}-menu`);
          });
          event("click", div_1, close);
          event("auxclick", div_1, close);
          event("click", div_2, () => {});
          append($$anchor, div_1);
        }),
        $$slots: { default: true }
      });
      append($$anchor, fragment_1);
    };
    if_block(node_1, ($$render) => {
      if (get(at))
        $$render(consequent_1);
    });
  }
  template_effect(() => {
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  event("click", div, (e) => e.modifiers?.ctrl && open_at(e));
  event("auxclick", div, (e) => e.isRightClick && open_at(e));
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-ki1pds", [{ classes: ["area"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column" } }, { classes: ["scrim"], tag: null, pseudo: null, style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 } }, { classes: ["menu"], tag: null, pseudo: null, css: "position: absolute; display: flex; flex-direction: column; padding: 4px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md); background-color: var(--bg-sunken); color: var(--text-primary); font-size: var(--text-md)" }, { classes: ["item"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; height: 28px; padding: 0 10px; border-radius: var(--radius-sm); line-height: 20px; white-space: nowrap; user-select: none; cursor: pointer" }, { classes: ["sep"], tag: null, pseudo: null, css: "height: 1px; margin: 4px 0; background-color: var(--border)" }, { classes: ["item", "active"], tag: null, pseudo: null, css: "background-color: var(--bg-raised)" }, { classes: ["item", "danger"], tag: null, pseudo: null, css: "color: var(--danger)" }, { classes: ["item", "off"], tag: null, pseudo: null, css: "color: var(--text-muted); cursor: not-allowed" }]);

// gallery/demos/ContextMenu.demo.svelte
var root55 = from_tree([
  [
    "div",
    {
      style: "font-size: var(--text-md); color: var(--text-primary)"
    },
    "Right-click anywhere in this panel"
  ]
]);
var root_134 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    ,
    " ",
    [
      "div",
      {
        style: "font-size: var(--text-sm); color: var(--text-secondary)"
      },
      " "
    ]
  ]
]);
function ContextMenu_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let last = state("none");
  const pick = (name) => () => set(last, name, true);
  const items = [
    { label: "Cut", onselect: pick("Cut") },
    { label: "Copy", onselect: pick("Copy") },
    { label: "Paste", onselect: pick("Paste") },
    { separator: true },
    { label: "Rename", onselect: pick("Rename") },
    {
      label: "Duplicate",
      disabled: true,
      onselect: pick("Duplicate")
    },
    { separator: true },
    { label: "Delete", danger: true, onselect: pick("Delete") }
  ];
  var div = root_134();
  var node = child(div);
  ContextMenu(node, {
    get items() {
      return items;
    },
    style: "height: 150px; align-items: center; justify-content: center; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg)",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div_1 = root55();
      append($$anchor, div_1);
    }),
    $$slots: { default: true }
  });
  var div_2 = sibling(node, 2);
  var text = only_child(div_2);
  reset(div);
  template_effect(() => set_text(text, `last action: ${get(last) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Drawer.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Drawer.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root56 = from_tree([["div", { class: "close svelte-2fqns7" }, "✕"]]);
var root_135 = from_tree([
  [
    "div",
    { class: "head svelte-2fqns7" },
    ["div", { class: "title svelte-2fqns7" }, " "],
    " ",
    ,
  ]
]);
var root_228 = from_tree([["div", { class: "foot svelte-2fqns7" }, ,]]);
var root_313 = from_tree([
  [
    "div",
    { class: "scrim svelte-2fqns7" },
    [
      "div",
      null,
      ,
      " ",
      ["div", { class: "body svelte-2fqns7" }, ,],
      " ",
      ,
    ]
  ]
]);
function Drawer($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const WIDTH = { sm: 320, md: 420, lg: 560 };
  const HEIGHT = { sm: 240, md: 320, lg: 440 };
  const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  };
  let open = prop($$props, "open", 3, false), onclose = prop($$props, "onclose", 3, undefined), side = prop($$props, "side", 3, "right"), size = prop($$props, "size", 3, "md"), title = prop($$props, "title", 3, ""), dismissable = prop($$props, "dismissable", 3, true), footer = prop($$props, "footer", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const extent = user_derived(() => side() === "bottom" ? HEIGHT[size()] : WIDTH[size()]);
  const slide = (offset) => side() === "left" ? { left: offset } : side() === "right" ? { right: offset } : { bottom: offset };
  user_effect(() => {
    if (!open() || !dismissable())
      return;
    return on_window_key("keydown", (e) => {
      if (e.key === "escape")
        onclose()?.();
    });
  });
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_3 = ($$anchor) => {
      var fragment_1 = comment();
      var node_1 = first_child(fragment_1);
      Portal(node_1, {
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div = root_313();
          var div_1 = child(div);
          var node_2 = child(div_1);
          {
            var consequent_1 = ($$anchor) => {
              var div_2 = root_135();
              var div_3 = child(div_2);
              var text = only_child(div_3, true);
              var node_3 = sibling(div_3, 2);
              {
                var consequent = ($$anchor) => {
                  var div_4 = root56();
                  template_effect(() => set_attribute2(div_4, "testId", testid() && `${testid()}-close`));
                  event("click", div_4, () => onclose()?.());
                  append($$anchor, div_4);
                };
                if_block(node_3, ($$render) => {
                  if (dismissable())
                    $$render(consequent);
                });
              }
              reset(div_2);
              template_effect(() => set_text(text, title()));
              append($$anchor, div_2);
            };
            if_block(node_2, ($$render) => {
              if (title())
                $$render(consequent_1);
            });
          }
          var div_5 = sibling(node_2, 2);
          var node_4 = child(div_5);
          Scroller(node_4, {
            pad: "20px",
            gap: 12,
            children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
              var fragment_2 = comment();
              var node_5 = first_child(fragment_2);
              snippet(node_5, () => validate_snippet_renderer(renderer_default, $$props.children));
              append($$anchor, fragment_2);
            }),
            $$slots: { default: true }
          });
          reset(div_5);
          var node_6 = sibling(div_5, 2);
          {
            var consequent_2 = ($$anchor) => {
              var div_6 = root_228();
              var node_7 = child(div_6);
              snippet(node_7, () => validate_snippet_renderer(renderer_default, footer()));
              reset(div_6);
              append($$anchor, div_6);
            };
            if_block(node_6, ($$render) => {
              if (footer())
                $$render(consequent_2);
            });
          }
          reset(div_1);
          reset(div);
          template_effect(($0) => {
            set_attribute2(div, "motion", FADE);
            set_attribute2(div, "testId", testid() && `${testid()}-scrim`);
            set_class(div_1, 0, `panel ${side() ?? ""} ${side() === "bottom" ? `drawer-h-${size()}` : `drawer-w-${size()}`}`, "svelte-2fqns7");
            set_style(div_1, style());
            set_attribute2(div_1, "motion", $0);
            set_attribute2(div_1, "testId", testid());
          }, [
            () => ({
              initial: slide(-get(extent)),
              animate: slide(0),
              transition: { duration: 0.2, ease: "easeOut" }
            })
          ]);
          event("click", div, () => dismissable() && onclose()?.());
          event("click", div_1, () => {});
          append($$anchor, div);
        }),
        $$slots: { default: true }
      });
      append($$anchor, fragment_1);
    };
    if_block(node, ($$render) => {
      if (open())
        $$render(consequent_3);
    });
  }
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-2fqns7", [{ classes: ["scrim"], tag: null, pseudo: null, css: "position: absolute; inset: 0; background-color: var(--bg-extra)" }, { classes: ["panel"], tag: null, pseudo: null, css: "position: absolute; display: flex; flex-direction: column; background-color: var(--bg-sunken); color: var(--text-primary); border-color: var(--border)" }, { classes: ["head"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom-width: 1px; border-color: var(--border)" }, { classes: ["title"], tag: null, pseudo: null, css: "font-size: var(--text-lg); font-weight: 600" }, { classes: ["close"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; font-size: 12px" }, { classes: ["close"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["body"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; flex-grow: 1; min-height: 0; color: var(--text-secondary); line-height: 20px" }, { classes: ["foot"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; justify-content: end; gap: 8px; padding: 12px 20px; border-top-width: 1px; border-color: var(--border); background-color: var(--bg-surface)" }, { classes: ["panel", "left"], tag: null, pseudo: null, style: { top: 0, bottom: 0, left: 0, borderRightWidth: 1 } }, { classes: ["panel", "right"], tag: null, pseudo: null, style: { top: 0, bottom: 0, right: 0, borderLeftWidth: 1 } }, { classes: ["panel", "bottom"], tag: null, pseudo: null, style: { left: 0, right: 0, bottom: 0, borderTopWidth: 1 } }]);

// gallery/demos/Drawer.demo.svelte
var root57 = from_tree([, , " ", ,], 1);
var root_136 = from_tree([
  [
    "div",
    {
      style: "font-size: var(--text-md); color: var(--text-primary)"
    },
    "Workspace"
  ],
  " ",
  [
    "div",
    null,
    "Choose the defaults used for new projects, including the theme, font size and autosave interval."
  ],
  " ",
  [
    "div",
    null,
    "Changes apply to every window once you press Apply."
  ]
], 1);
var root_229 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ["div", { style: "flex-grow: 1" }],
      " ",
      [
        "div",
        {
          style: "font-size: var(--text-sm); color: var(--text-secondary)"
        },
        " "
      ]
    ],
    " ",
    [
      "div",
      {
        style: "font-size: var(--text-sm); color: var(--text-secondary)"
      },
      "Size for left and right drawers: sm, md, lg. Escape or a scrim click closes."
    ],
    " ",
    [
      "div",
      { style: "display: flex; flex-direction: row; gap: 8px" }
    ],
    " ",
    ,
    " ",
    ,
  ]
]);
function Drawer_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let open = state(false);
  let locked = state(false);
  let side = state("right");
  let size = state("sm");
  let applied = state(0);
  const show = (s) => {
    set(side, s, true);
    set(open, true);
  };
  var div = root_229();
  var div_1 = child(div);
  var node = child(div_1);
  Button(node, {
    label: "Left",
    variant: "outline",
    onclick: () => show("left")
  });
  var node_1 = sibling(node, 2);
  Button(node_1, { label: "Right", onclick: () => show("right") });
  var node_2 = sibling(node_1, 2);
  Button(node_2, {
    label: "Bottom",
    variant: "outline",
    onclick: () => show("bottom")
  });
  var node_3 = sibling(node_2, 2);
  Button(node_3, {
    label: "Locked",
    variant: "outline",
    onclick: () => set(locked, true)
  });
  var div_2 = sibling(node_3, 4);
  var text2 = only_child(div_2);
  reset(div_1);
  var div_3 = sibling(div_1, 4);
  each(div_3, 20, () => ["sm", "md", "lg"], index, ($$anchor, s) => {
    var fragment = comment();
    var node_4 = first_child(fragment);
    {
      let $0 = user_derived(() => get(size) === s ? "primary" : "outline");
      Button(node_4, {
        get label() {
          return s;
        },
        size: "h-md",
        get variant() {
          return get($0);
        },
        onclick: () => set(size, s, true)
      });
    }
    append($$anchor, fragment);
  });
  reset(div_3);
  var node_5 = sibling(div_3, 2);
  {
    const footer = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_1 = comment();
      var node_6 = first_child(fragment_1);
      Button(node_6, { label: "Close", onclick: () => set(locked, false) });
      append($$anchor, fragment_1);
    });
    Drawer(node_5, {
      get open() {
        return get(locked);
      },
      side: "left",
      size: "sm",
      title: "Locked",
      dismissable: false,
      onclose: () => set(locked, false),
      footer,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        next();
        var text_1 = text("Escape and the scrim do nothing here.");
        append($$anchor, text_1);
      }),
      $$slots: { footer: true, default: true }
    });
  }
  var node_7 = sibling(node_5, 2);
  {
    const footer = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_2 = root57();
      var node_8 = first_child(fragment_2);
      Button(node_8, {
        label: "Cancel",
        variant: "ghost",
        onclick: () => set(open, false)
      });
      var node_9 = sibling(node_8, 2);
      Button(node_9, {
        label: "Apply",
        onclick: () => {
          update(applied);
          set(open, false);
        }
      });
      append($$anchor, fragment_2);
    });
    Drawer(node_7, {
      get open() {
        return get(open);
      },
      get side() {
        return get(side);
      },
      get size() {
        return get(size);
      },
      title: "Settings",
      onclose: () => set(open, false),
      footer,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var fragment_3 = root_136();
        next(4);
        append($$anchor, fragment_3);
      }),
      $$slots: { footer: true, default: true }
    });
  }
  reset(div);
  template_effect(() => set_text(text2, `applied ${get(applied) ?? ""}×`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Modal.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Modal.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root58 = from_tree([["div", { class: "close svelte-9z2xsc" }, "✕"]]);
var root_137 = from_tree([
  [
    "div",
    { class: "head svelte-9z2xsc" },
    ["div", { class: "title svelte-9z2xsc" }, " "],
    " ",
    ,
  ]
]);
var root_230 = from_tree([["div", { class: "foot svelte-9z2xsc" }, ,]]);
var root_314 = from_tree([
  [
    "div",
    { class: "scrim svelte-9z2xsc" },
    [
      "div",
      null,
      ,
      " ",
      ["div", { class: "body svelte-9z2xsc" }, ,],
      " ",
      ,
    ]
  ]
]);
function Modal($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let open = prop($$props, "open", 3, false), onclose = prop($$props, "onclose", 3, undefined), title = prop($$props, "title", 3, ""), size = prop($$props, "size", 3, "md"), dismissable = prop($$props, "dismissable", 3, true), footer = prop($$props, "footer", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  user_effect(() => {
    if (!open() || !dismissable())
      return;
    return on_window_key("keydown", (e) => {
      if (e.key === "escape")
        onclose()?.();
    });
  });
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_3 = ($$anchor) => {
      var fragment_1 = comment();
      var node_1 = first_child(fragment_1);
      Portal(node_1, {
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          var div = root_314();
          var div_1 = child(div);
          var node_2 = child(div_1);
          {
            var consequent_1 = ($$anchor) => {
              var div_2 = root_137();
              var div_3 = child(div_2);
              var text = only_child(div_3, true);
              var node_3 = sibling(div_3, 2);
              {
                var consequent = ($$anchor) => {
                  var div_4 = root58();
                  template_effect(() => set_attribute2(div_4, "testId", testid() && `${testid()}-close`));
                  event("click", div_4, () => onclose()?.());
                  append($$anchor, div_4);
                };
                if_block(node_3, ($$render) => {
                  if (dismissable())
                    $$render(consequent);
                });
              }
              reset(div_2);
              template_effect(() => set_text(text, title()));
              append($$anchor, div_2);
            };
            if_block(node_2, ($$render) => {
              if (title())
                $$render(consequent_1);
            });
          }
          var div_5 = sibling(node_2, 2);
          var node_4 = child(div_5);
          snippet(node_4, () => validate_snippet_renderer(renderer_default, $$props.children));
          reset(div_5);
          var node_5 = sibling(div_5, 2);
          {
            var consequent_2 = ($$anchor) => {
              var div_6 = root_230();
              var node_6 = child(div_6);
              snippet(node_6, () => validate_snippet_renderer(renderer_default, footer()));
              reset(div_6);
              append($$anchor, div_6);
            };
            if_block(node_5, ($$render) => {
              if (footer())
                $$render(consequent_2);
            });
          }
          reset(div_1);
          reset(div);
          template_effect(() => {
            set_attribute2(div, "testId", testid() && `${testid()}-scrim`);
            set_class(div_1, 0, `dialog modal-w-${size() ?? ""}`, "svelte-9z2xsc");
            set_style(div_1, style());
            set_attribute2(div_1, "testId", testid());
          });
          event("click", div, () => dismissable() && onclose()?.());
          event("click", div_1, () => {});
          append($$anchor, div);
        }),
        $$slots: { default: true }
      });
      append($$anchor, fragment_1);
    };
    if_block(node, ($$render) => {
      if (open())
        $$render(consequent_3);
    });
  }
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-9z2xsc", [{ classes: ["scrim"], tag: null, pseudo: null, css: "position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background-color: var(--bg-extra)" }, { classes: ["dialog"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; max-height: 90%; background-color: var(--bg-sunken); color: var(--text-primary); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg); overflow: hidden" }, { classes: ["head"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingRight: 20, paddingBottom: 0, paddingLeft: 20 } }, { classes: ["title"], tag: null, pseudo: null, css: "font-size: var(--text-lg); font-weight: 600" }, { classes: ["close"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; font-size: 12px" }, { classes: ["close"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["body"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 20px 20px; color: var(--text-secondary); line-height: 20px" }, { classes: ["foot"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; justify-content: end; gap: 8px; padding: 12px 20px; border-top-width: 1px; border-color: var(--border); background-color: var(--bg-surface); border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg)" }]);

// gallery/demos/Modal.demo.svelte
var root59 = from_tree([, , " ", ,], 1);
var root_138 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: row" },
    ,
    " ",
    ,
  ],
  " ",
  ,
  " ",
  ,
], 1);
function Modal_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let open = state(false);
  let small = state(false);
  var fragment = root_138();
  var div = first_child(fragment);
  var node = child(div);
  Button(node, { label: "Open modal", onclick: () => set(open, true) });
  var node_1 = sibling(node, 2);
  Button(node_1, {
    label: "Small, not dismissable",
    variant: "outline",
    onclick: () => set(small, true)
  });
  reset(div);
  var node_2 = sibling(div, 2);
  {
    const footer = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_1 = root59();
      var node_3 = first_child(fragment_1);
      Button(node_3, {
        label: "Cancel",
        variant: "ghost",
        onclick: () => set(open, false)
      });
      var node_4 = sibling(node_3, 2);
      Button(node_4, { label: "Publish", onclick: () => set(open, false) });
      append($$anchor, fragment_1);
    });
    Modal(node_2, {
      get open() {
        return get(open);
      },
      onclose: () => set(open, false),
      title: "Publish changes?",
      footer,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        next();
        var text2 = text("Your edits will be visible to everyone with access.");
        append($$anchor, text2);
      }),
      $$slots: { footer: true, default: true }
    });
  }
  var node_5 = sibling(node_2, 2);
  {
    const footer = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_2 = comment();
      var node_6 = first_child(fragment_2);
      Button(node_6, { label: "Close", onclick: () => set(small, false) });
      append($$anchor, fragment_2);
    });
    Modal(node_5, {
      get open() {
        return get(small);
      },
      onclose: () => set(small, false),
      title: "Locked",
      size: "sm",
      dismissable: false,
      footer,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        next();
        var text_1 = text("Escape and the scrim do nothing here.");
        append($$anchor, text_1);
      }),
      $$slots: { footer: true, default: true }
    });
  }
  append($$anchor, fragment);
  $$pop_renderer();
}

// gallery/demos/Popover.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Popover.svelte
init_renderer2();
init_custom_renderer();
init_client();
function Popover2($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let side = prop($$props, "side", 3, "bottom"), align = prop($$props, "align", 3, "start"), gap = prop($$props, "gap", 3, 4), position = prop($$props, "position", 3, null), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const panel = user_derived(() => `background-color: var(--bg-sunken); color: var(--text-primary); font-size: var(--text-md); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md); padding: 4px; min-width: 160px${style() ? `; ${style()}` : ""}`);
  var fragment = comment();
  var node = first_child(fragment);
  Popover(node, {
    get open() {
      return $$props.open;
    },
    get onclose() {
      return $$props.onclose;
    },
    get children() {
      return $$props.children;
    },
    get content() {
      return $$props.content;
    },
    get side() {
      return side();
    },
    get align() {
      return align();
    },
    get gap() {
      return gap();
    },
    get position() {
      return position();
    },
    get style() {
      return get(panel);
    },
    get testid() {
      return testid();
    }
  });
  append($$anchor, fragment);
  $$pop_renderer();
}

// gallery/demos/Popover.demo.svelte
var root60 = from_tree([
  [
    "div",
    { hover: "background-color: var(--bg-raised)" },
    "Rename"
  ],
  " ",
  [
    "div",
    { hover: "background-color: var(--bg-raised)" },
    "Duplicate"
  ],
  " ",
  [
    "div",
    { hover: "background-color: var(--bg-raised)" },
    "Move to…"
  ]
], 1);
var root_139 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 8px; padding: 6px; width: 200px"
    },
    [
      "div",
      {
        style: "font-size: var(--text-md); font-weight: 600; color: var(--text-primary)"
      },
      "Share link"
    ],
    " ",
    [
      "div",
      {
        style: "font-size: var(--text-sm); color: var(--text-secondary)"
      },
      "Anyone with the link can view."
    ],
    " ",
    ,
  ]
]);
var root_231 = from_tree([
  [
    "div",
    { hover: "background-color: var(--bg-raised)" },
    "Name"
  ],
  " ",
  [
    "div",
    { hover: "background-color: var(--bg-raised)" },
    "Date modified"
  ],
  " ",
  [
    "div",
    { hover: "background-color: var(--bg-raised)" },
    "Size"
  ]
], 1);
var root_315 = from_tree([["div", null, "Pinned at the click"]]);
var root_48 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: start"
      },
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: start"
      },
      ,
    ],
    " ",
    [
      "div",
      {
        style: "font-size: var(--text-sm); color: var(--text-secondary)"
      },
      " "
    ]
  ]
]);
function Popover_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let which = state(null);
  let last = state("none");
  let pinned = state(null);
  const choose = (name) => {
    set(last, name, true);
    set(which, null);
  };
  const row = "padding: 6px 10px; border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--text-md)";
  var div = root_48();
  var div_1 = child(div);
  var node = child(div_1);
  {
    const content = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment = root60();
      var div_2 = first_child(fragment);
      set_style(div_2, row);
      var div_3 = sibling(div_2, 2);
      set_style(div_3, row);
      var div_4 = sibling(div_3, 2);
      set_style(div_4, row);
      event("click", div_2, () => choose("Rename"));
      event("click", div_3, () => choose("Duplicate"));
      event("click", div_4, () => choose("Move to…"));
      append($$anchor, fragment);
    });
    let $0 = user_derived(() => get(which) === "actions");
    Popover2(node, {
      get open() {
        return get($0);
      },
      onclose: () => set(which, null),
      content,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        Button(node_1, {
          label: "Actions",
          variant: "outline",
          onclick: () => set(which, get(which) === "actions" ? null : "actions", true)
        });
        append($$anchor, fragment_1);
      }),
      $$slots: { content: true, default: true }
    });
  }
  var node_2 = sibling(node, 2);
  {
    const content = renderer_snippet(renderer_default, ($$anchor) => {
      var div_5 = root_139();
      var node_3 = sibling(child(div_5), 4);
      Button(node_3, {
        label: "Copy link",
        size: "h-md",
        full: true,
        onclick: () => choose("Copied link")
      });
      reset(div_5);
      append($$anchor, div_5);
    });
    let $0 = user_derived(() => get(which) === "share");
    Popover2(node_2, {
      get open() {
        return get($0);
      },
      onclose: () => set(which, null),
      side: "right",
      align: "start",
      content,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var fragment_2 = comment();
        var node_4 = first_child(fragment_2);
        Button(node_4, {
          label: "Share",
          variant: "themed",
          onclick: () => set(which, get(which) === "share" ? null : "share", true)
        });
        append($$anchor, fragment_2);
      }),
      $$slots: { content: true, default: true }
    });
  }
  var node_5 = sibling(node_2, 2);
  {
    const content = renderer_snippet(renderer_default, ($$anchor) => {
      var fragment_3 = root_231();
      var div_6 = first_child(fragment_3);
      set_style(div_6, row);
      var div_7 = sibling(div_6, 2);
      set_style(div_7, row);
      var div_8 = sibling(div_7, 2);
      set_style(div_8, row);
      event("click", div_6, () => choose("Name"));
      event("click", div_7, () => choose("Date modified"));
      event("click", div_8, () => choose("Size"));
      append($$anchor, fragment_3);
    });
    let $0 = user_derived(() => get(which) === "sort");
    Popover2(node_5, {
      get open() {
        return get($0);
      },
      onclose: () => set(which, null),
      side: "top",
      align: "end",
      content,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var fragment_4 = comment();
        var node_6 = first_child(fragment_4);
        Button(node_6, {
          label: "Sort",
          variant: "secondary",
          onclick: () => set(which, get(which) === "sort" ? null : "sort", true)
        });
        append($$anchor, fragment_4);
      }),
      $$slots: { content: true, default: true }
    });
  }
  reset(div_1);
  var div_9 = sibling(div_1, 2);
  var node_7 = child(div_9);
  {
    const content = renderer_snippet(renderer_default, ($$anchor) => {
      var div_10 = root_315();
      set_style(div_10, row);
      event("click", div_10, () => choose("Pinned item"));
      append($$anchor, div_10);
    });
    let $0 = user_derived(() => get(pinned) !== null);
    Popover2(node_7, {
      get open() {
        return get($0);
      },
      onclose: () => set(pinned, null),
      get position() {
        return get(pinned);
      },
      content,
      children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
        var fragment_5 = comment();
        var node_8 = first_child(fragment_5);
        Button(node_8, {
          label: "Panel at the pointer",
          variant: "secondary",
          onclick: (e) => set(pinned, get(pinned) ? null : { x: e.x ?? 0, y: e.y ?? 0 }, true)
        });
        append($$anchor, fragment_5);
      }),
      $$slots: { content: true, default: true }
    });
  }
  reset(div_9);
  var div_11 = sibling(div_9, 2);
  var text = only_child(div_11);
  reset(div);
  template_effect(() => set_text(text, `last choice: ${get(last) ?? ""}`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Toast.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Toast.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/toast.svelte.ts
init_client();
var toasts = proxy([]);
var timers = new Map;
var next2 = 1;
function toast(message, { title = "", variant = "secondary", duration = 4000 } = {}) {
  const id = next2++;
  toasts.push({ id, message, title, variant });
  if (duration > 0)
    timers.set(id, setTimeout(() => dismiss(id), duration));
  return id;
}
function dismiss(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  const i = toasts.findIndex((t) => t.id === id);
  if (i >= 0)
    toasts.splice(i, 1);
}

// src/components/Toast.svelte
init_renderer2();
var root61 = from_tree([["div", { class: "title svelte-17z9j3z" }, " "]]);
var root_140 = from_tree([
  [
    "div",
    { class: "toast svelte-17z9j3z" },
    ["div"],
    " ",
    [
      "div",
      { class: "text svelte-17z9j3z" },
      ,
      " ",
      ["div", { class: "message svelte-17z9j3z" }, " "]
    ],
    " ",
    ["div", { class: "close svelte-17z9j3z" }, "✕"]
  ]
]);
var root_232 = from_tree([["div", { class: "stack svelte-17z9j3z" }]]);
function Toast($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  };
  var fragment = comment();
  var node = first_child(fragment);
  Portal(node, {
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var div = root_232();
      each(div, 21, () => toasts, (t) => t.id, ($$anchor, t) => {
        var div_1 = root_140();
        var div_2 = child(div_1);
        var div_3 = sibling(div_2, 2);
        var node_1 = child(div_3);
        {
          var consequent = ($$anchor) => {
            var div_4 = root61();
            var text = only_child(div_4, true);
            template_effect(() => set_text(text, get(t).title));
            append($$anchor, div_4);
          };
          if_block(node_1, ($$render) => {
            if (get(t).title)
              $$render(consequent);
          });
        }
        var div_5 = sibling(node_1, 2);
        var text_1 = only_child(div_5, true);
        reset(div_3);
        var div_6 = sibling(div_3, 2);
        reset(div_1);
        template_effect(() => {
          set_attribute2(div_1, "motion", FADE);
          set_attribute2(div_1, "testId", testid() && `${testid()}-${get(t).id}`);
          set_class(div_2, 0, `bar ${get(t).variant ?? ""}`, "svelte-17z9j3z");
          set_text(text_1, get(t).message);
          set_attribute2(div_6, "testId", testid() && `${testid()}-close-${get(t).id}`);
        });
        event("click", div_6, () => dismiss(get(t).id));
        append($$anchor, div_1);
      });
      reset(div);
      template_effect(() => {
        set_style(div, style());
        set_attribute2(div, "testId", testid());
      });
      append($$anchor, div);
    }),
    $$slots: { default: true }
  });
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-17z9j3z", [{ classes: ["stack"], tag: null, pseudo: null, style: { position: "absolute", right: 16, bottom: 16, width: 320, display: "flex", flexDirection: "column", gap: 8 } }, { classes: ["toast"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; background-color: var(--bg-sunken); color: var(--text-primary); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)" }, { classes: ["bar"], tag: null, pseudo: null, css: "width: 4px; align-self: stretch; background-color: var(--border-strong)" }, { classes: ["text"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 2, flexGrow: 1, paddingTop: 10, paddingRight: 12, paddingBottom: 10, paddingLeft: 12 } }, { classes: ["title"], tag: null, pseudo: null, css: "font-size: var(--text-md); font-weight: 600" }, { classes: ["message"], tag: null, pseudo: null, css: "font-size: var(--text-sm); line-height: 18px; color: var(--text-secondary)" }, { classes: ["close"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; margin: 8px 8px 0 0; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 11px; cursor: pointer" }, { classes: ["close"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["bar", "secondary"], tag: null, pseudo: null, css: "background-color: var(--text-secondary)" }, { classes: ["bar", "themed"], tag: null, pseudo: null, css: "background-color: var(--theme-color)" }, { classes: ["bar", "info"], tag: null, pseudo: null, css: "background-color: var(--info)" }, { classes: ["bar", "success"], tag: null, pseudo: null, css: "background-color: var(--success)" }, { classes: ["bar", "warning"], tag: null, pseudo: null, css: "background-color: var(--warning)" }, { classes: ["bar", "danger"], tag: null, pseudo: null, css: "background-color: var(--danger)" }]);

// gallery/demos/Toast.demo.svelte
var root62 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      [
        "div",
        {
          style: "font-size: var(--text-sm); color: var(--text-secondary)"
        },
        " "
      ]
    ],
    " ",
    ,
  ]
]);
function Toast_demo($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  var div = root62();
  var div_1 = child(div);
  var node = child(div_1);
  Button(node, {
    label: "Accent",
    variant: "themed",
    onclick: () => toast("A new version is ready to install.", { title: "Update", variant: "themed" })
  });
  var node_1 = sibling(node, 2);
  Button(node_1, {
    label: "Neutral",
    variant: "secondary",
    onclick: () => toast("Changes are saved to this device.", { title: "Saved" })
  });
  var node_2 = sibling(node_1, 2);
  Button(node_2, {
    label: "Success",
    variant: "success",
    onclick: () => toast("Your export finished in 4 seconds.", { title: "Export complete", variant: "success" })
  });
  var node_3 = sibling(node_2, 2);
  Button(node_3, {
    label: "Warn",
    variant: "warning",
    onclick: () => toast("Storage is 90% full.", { title: "Heads up", variant: "warning" })
  });
  var node_4 = sibling(node_3, 2);
  Button(node_4, {
    label: "Danger",
    variant: "danger",
    onclick: () => toast("The upload stopped. Check your connection.", { title: "Upload failed", variant: "danger", duration: 0 })
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_5 = child(div_2);
  Button(node_5, {
    label: "Clear all",
    variant: "ghost",
    size: "h-md",
    onclick: () => toasts.forEach((t) => dismiss(t.id))
  });
  var div_3 = sibling(node_5, 2);
  var text = only_child(div_3);
  reset(div_2);
  var node_6 = sibling(div_2, 2);
  Toast(node_6, {});
  reset(div);
  template_effect(() => set_text(text, `${toasts.length ?? ""} showing · the danger toast stays until closed`));
  append($$anchor, div);
  $$pop_renderer();
  pop();
}

// gallery/demos/Tooltip.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Tooltip.svelte
init_renderer2();
init_custom_renderer();
init_client();
function Tooltip2($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let side = prop($$props, "side", 3, "top"), align = prop($$props, "align", 3, "center"), gap = prop($$props, "gap", 3, 6), delay = prop($$props, "delay", 3, 300), open = prop($$props, "open", 3, null), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const tip = user_derived(() => `background-color: var(--text-primary); color: var(--bg); font-size: var(--text-sm); border-radius: var(--radius-sm); padding: 4px 8px${style() ? `; ${style()}` : ""}`);
  var fragment = comment();
  var node = first_child(fragment);
  Tooltip(node, {
    get children() {
      return $$props.children;
    },
    get content() {
      return $$props.content;
    },
    get side() {
      return side();
    },
    get align() {
      return align();
    },
    get gap() {
      return gap();
    },
    get delay() {
      return delay();
    },
    get open() {
      return open();
    },
    get style() {
      return get(tip);
    },
    get testid() {
      return testid();
    }
  });
  append($$anchor, fragment);
  $$pop_renderer();
}

// gallery/demos/Tooltip.demo.svelte
var root63 = from_tree([["div", null, " "]]);
var root_141 = from_tree([["div", null, "Save"]]);
var root_233 = from_tree([["div", null, "Pinned"]]);
var root_316 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 24px; padding-top: 44px"
    },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ["div", null, 'Hover the buttons. "Pinned" is forced open.']
    ]
  ]
]);
function Tooltip_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const trigger = "padding: 6px 12px; border-radius: var(--radius-sm); background-color: var(--bg-raised); color: var(--text-primary); font-size: var(--text-md)";
  const hover = "background-color: var(--border)";
  const caption = "font-size: var(--text-sm); color: var(--text-secondary)";
  var div = root_316();
  var div_1 = child(div);
  each(div_1, 20, () => ["top", "right", "bottom", "left"], index, ($$anchor, side) => {
    var fragment = comment();
    var node = first_child(fragment);
    {
      const children = renderer_snippet(renderer_default, ($$anchor, h = noop) => {
        var div_2 = root63();
        attribute_effect(div_2, () => ({ ...h(), style: trigger, hover }));
        var text = only_child(div_2, true);
        template_effect(() => set_text(text, side));
        append($$anchor, div_2);
      });
      let $0 = user_derived(() => `Shown on the ${side}`);
      Tooltip2(node, {
        get content() {
          return get($0);
        },
        get side() {
          return side;
        },
        delay: 150,
        children,
        $$slots: { default: true }
      });
    }
    append($$anchor, fragment);
  });
  reset(div_1);
  var div_3 = sibling(div_1, 2);
  var node_1 = child(div_3);
  {
    const children = renderer_snippet(renderer_default, ($$anchor, h = noop) => {
      var div_4 = root_141();
      attribute_effect(div_4, () => ({ ...h(), style: trigger, hover }));
      append($$anchor, div_4);
    });
    Tooltip2(node_1, {
      content: "Save (⌘S)",
      delay: 150,
      children,
      $$slots: { default: true }
    });
  }
  var node_2 = sibling(node_1, 2);
  {
    const children = renderer_snippet(renderer_default, ($$anchor, h = noop) => {
      var div_5 = root_233();
      attribute_effect(div_5, () => ({ ...h(), style: trigger, hover }));
      append($$anchor, div_5);
    });
    Tooltip2(node_2, {
      content: "Forced open",
      open: true,
      side: "bottom",
      children,
      $$slots: { default: true }
    });
  }
  var div_6 = sibling(node_2, 2);
  set_style(div_6, caption);
  reset(div_3);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Alert.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Alert.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root64 = from_tree([["div", { class: "title svelte-14a4x9d" }, " "]]);
var root_142 = from_tree([["div", { class: "body svelte-14a4x9d" }, ,]]);
var root_234 = from_tree([["div", null, "✕"]]);
var root_317 = from_tree([
  [
    "div",
    null,
    ["div"],
    " ",
    ["div", { class: "text svelte-14a4x9d" }, , " ", ,],
    " ",
    ,
  ]
]);
function Alert($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let title = prop($$props, "title", 3, ""), variant = prop($$props, "variant", 3, "info"), children = prop($$props, "children", 3, undefined), onclose = prop($$props, "onclose", 3, undefined), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  let focused = state(false);
  function key(e) {
    if (e.key === "enter" || e.key === "space")
      onclose()?.();
  }
  var div = root_317();
  var div_1 = child(div);
  var div_2 = sibling(div_1, 2);
  var node = child(div_2);
  {
    var consequent = ($$anchor) => {
      var div_3 = root64();
      var text = only_child(div_3, true);
      template_effect(() => set_text(text, title()));
      append($$anchor, div_3);
    };
    if_block(node, ($$render) => {
      if (title())
        $$render(consequent);
    });
  }
  var node_1 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor) => {
      var div_4 = root_142();
      var node_2 = child(div_4);
      snippet(node_2, () => validate_snippet_renderer(renderer_default, children()));
      reset(div_4);
      append($$anchor, div_4);
    };
    if_block(node_1, ($$render) => {
      if (children())
        $$render(consequent_1);
    });
  }
  reset(div_2);
  var node_3 = sibling(div_2, 2);
  {
    var consequent_2 = ($$anchor) => {
      var div_5 = root_234();
      let classes;
      set_attribute2(div_5, "tabindex", 0);
      template_effect(() => {
        classes = set_class(div_5, 0, "close svelte-14a4x9d", null, classes, { focused: get(focused) });
        set_attribute2(div_5, "testId", testid() && `${testid()}-close`);
      });
      event("click", div_5, () => onclose()());
      event("keydown", div_5, key);
      event("focus", div_5, () => set(focused, true));
      event("blur", div_5, () => set(focused, false));
      append($$anchor, div_5);
    };
    if_block(node_3, ($$render) => {
      if (onclose())
        $$render(consequent_2);
    });
  }
  reset(div);
  template_effect(() => {
    set_class(div, 0, `alert ${variant() ?? ""}`, "svelte-14a4x9d");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
    set_class(div_1, 0, `dot ${variant() ?? ""}`, "svelte-14a4x9d");
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-14a4x9d", [{ classes: ["alert"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: flex-start; gap: 10px; padding: 12px 14px; border-width: 1px; border-radius: var(--radius-md)" }, { classes: ["dot"], tag: null, pseudo: null, css: "width: 8px; height: 8px; margin-top: 5px; border-radius: var(--radius-full)" }, { classes: ["text"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", flexGrow: 1, gap: 2 } }, { classes: ["title"], tag: null, pseudo: null, css: "color: var(--text-primary); font-size: var(--text-sm); font-weight: 600; line-height: 18px" }, { classes: ["body"], tag: null, pseudo: null, css: "color: var(--text-secondary); font-size: var(--text-sm); line-height: 18px" }, { classes: ["close"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-width: 1px; border-color: #00000000; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 11px; cursor: pointer" }, { classes: ["close"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised); color: var(--text-primary)" }, { classes: ["alert", "info"], tag: null, pseudo: null, css: "background-color: var(--info-soft); border-color: var(--info)" }, { classes: ["alert", "secondary"], tag: null, pseudo: null, css: "background-color: var(--bg-raised); border-color: var(--border-strong)" }, { classes: ["alert", "success"], tag: null, pseudo: null, css: "background-color: var(--success-soft); border-color: var(--success)" }, { classes: ["alert", "warning"], tag: null, pseudo: null, css: "background-color: var(--warning-soft); border-color: var(--warning)" }, { classes: ["alert", "danger"], tag: null, pseudo: null, css: "background-color: var(--danger-soft); border-color: var(--danger)" }, { classes: ["dot", "info"], tag: null, pseudo: null, css: "background-color: var(--info)" }, { classes: ["dot", "secondary"], tag: null, pseudo: null, css: "background-color: var(--text-secondary)" }, { classes: ["dot", "success"], tag: null, pseudo: null, css: "background-color: var(--success)" }, { classes: ["dot", "warning"], tag: null, pseudo: null, css: "background-color: var(--warning)" }, { classes: ["dot", "danger"], tag: null, pseudo: null, css: "background-color: var(--danger)" }, { classes: ["close", "focused"], tag: null, pseudo: null, css: "border-color: var(--ring)" }]);

// gallery/demos/Alert.demo.svelte
var root65 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 12px; max-width: 460px"
    },
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
  ]
]);
function Alert_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let shown = state(true);
  var div = root65();
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      Alert(node_1, {
        title: "Export complete",
        variant: "success",
        onclose: () => set(shown, false),
        children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
          next();
          var text2 = text("Saved 12 files to ~/Documents/export.");
          append($$anchor, text2);
        }),
        $$slots: { default: true }
      });
      append($$anchor, fragment);
    };
    if_block(node, ($$render) => {
      if (get(shown))
        $$render(consequent);
    });
  }
  var node_2 = sibling(node, 2);
  Alert(node_2, {
    title: "Update available",
    variant: "info",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      next();
      var text_1 = text("Version 1.4 adds faster search.");
      append($$anchor, text_1);
    }),
    $$slots: { default: true }
  });
  var node_3 = sibling(node_2, 2);
  Alert(node_3, {
    title: "Disk almost full",
    variant: "warning",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      next();
      var text_2 = text("Free some space before exporting.");
      append($$anchor, text_2);
    }),
    $$slots: { default: true }
  });
  var node_4 = sibling(node_3, 2);
  Alert(node_4, {
    title: "Sync failed",
    variant: "danger",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      next();
      var text_3 = text("The server did not respond. Try again.");
      append($$anchor, text_3);
    }),
    $$slots: { default: true }
  });
  var node_5 = sibling(node_4, 2);
  Alert(node_5, {
    variant: "secondary",
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      next();
      var text_4 = text("Plain note without a title.");
      append($$anchor, text_4);
    }),
    $$slots: { default: true }
  });
  var node_6 = sibling(node_5, 2);
  {
    var consequent_1 = ($$anchor) => {
      var fragment_1 = comment();
      var node_7 = first_child(fragment_1);
      Button(node_7, {
        label: "Show again",
        size: "h-md",
        variant: "outline",
        onclick: () => set(shown, true)
      });
      append($$anchor, fragment_1);
    };
    if_block(node_6, ($$render) => {
      if (!get(shown))
        $$render(consequent_1);
    });
  }
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Avatar.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Avatar.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root66 = from_tree([["img", { class: "img svelte-177snva", objectfit: "cover" }]]);
var root_143 = from_tree([["div", null, " "]]);
var root_235 = from_tree([["div", null, ,]]);
function Avatar($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let name = prop($$props, "name", 3, ""), src = prop($$props, "src", 3, null), size = prop($$props, "size", 3, "md"), shape = prop($$props, "shape", 3, "circle"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const words = user_derived(() => name().trim().split(/\s+/).filter(Boolean));
  const initials = user_derived(() => (get(words).length > 1 ? get(words)[0][0] + get(words)[get(words).length - 1][0] : (get(words)[0] ?? "").slice(0, 1)).toUpperCase());
  const TEXT = { sm: "text-xs", md: "text-sm", lg: "text-md" };
  var div = root_235();
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var img = root66();
      template_effect(() => {
        set_attribute2(img, "src", src());
        set_attribute2(img, "alt", name());
        set_attribute2(img, "testId", testid() && `${testid()}-img`);
      });
      append($$anchor, img);
    };
    var alternate = ($$anchor) => {
      var div_1 = root_143();
      var text = only_child(div_1, true);
      template_effect(() => {
        set_class(div_1, 0, `initials ${TEXT[size()] ?? ""}`, "svelte-177snva");
        set_text(text, get(initials));
      });
      append($$anchor, div_1);
    };
    if_block(node, ($$render) => {
      if (src())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  reset(div);
  template_effect(() => {
    set_class(div, 0, `avatar avatar-${size() ?? ""} ${shape() === "circle" ? "radius-full" : "radius-md"}`, "svelte-177snva");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-177snva", [{ classes: ["avatar"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: var(--theme-color-sub)" }, { classes: ["img"], tag: null, pseudo: null, style: { width: "100%", height: "100%" } }, { classes: ["initials"], tag: null, pseudo: null, css: "color: var(--theme-color); font-weight: 600; user-select: none" }]);

// gallery/demos/Avatar.demo.svelte
var root67 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 12px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ]
  ]
]);
function Avatar_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Alan Turing"];
  var div = root67();
  var div_1 = child(div);
  var node = child(div_1);
  Avatar(node, { name: "Ada Lovelace", size: "sm" });
  var node_1 = sibling(node, 2);
  Avatar(node_1, { name: "Ada Lovelace" });
  var node_2 = sibling(node_1, 2);
  Avatar(node_2, { name: "Ada Lovelace", size: "lg" });
  var node_3 = sibling(node_2, 2);
  Avatar(node_3, { name: "Ada Lovelace", size: "lg", shape: "square" });
  var node_4 = sibling(node_3, 2);
  Avatar(node_4, {
    name: "Grace Hopper",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAgElEQVR4nA3JIQFFMQhA0R/n1VgNGqAxa4CZXgMaoDGEwNwwf8ee3ycsQQQTjhBCCSP8PmUpophylFBKGX2xWRvZ2OZsYlOb2S+c5YhjznHCKWf8xWVd5GKXc4lLXea+CFYggQUniKCCiRfJSiSx5CSRVDL5olmNNNacJppqpvkDd6t6gRN3ZoUAAAAASUVORK5CYII=",
    size: "lg"
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  each(div_2, 21, () => PEOPLE, index, ($$anchor, person) => {
    var fragment = comment();
    var node_5 = first_child(fragment);
    Avatar(node_5, {
      get name() {
        return get(person);
      }
    });
    append($$anchor, fragment);
  });
  reset(div_2);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Badge.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Badge.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root68 = from_tree([["div", null, ,]]);
function Badge($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  let children = prop($$props, "children", 3, undefined), label = prop($$props, "label", 3, ""), variant = prop($$props, "variant", 3, "secondary"), size = prop($$props, "size", 3, "md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  var div = root68();
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      snippet(node_1, () => validate_snippet_renderer(renderer_default, children()));
      append($$anchor, fragment);
    };
    var alternate = ($$anchor) => {
      var text2 = text();
      template_effect(() => set_text(text2, label()));
      append($$anchor, text2);
    };
    if_block(node, ($$render) => {
      if (children())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  reset(div);
  template_effect(() => {
    set_class(div, 0, `badge ${variant() ?? ""} ${size() ?? ""}`, "svelte-1tmgz9s");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
}
define_styles("svelte-1tmgz9s", [{ classes: ["badge"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; justify-content: center; border-width: 1px; border-color: #00000000; border-radius: var(--radius-full); font-weight: 500; white-space: nowrap; user-select: none" }, { classes: ["badge", "sm"], tag: null, pseudo: null, css: "height: 18px; padding: 0 7px; font-size: var(--text-xs)" }, { classes: ["badge", "md"], tag: null, pseudo: null, css: "height: 22px; padding: 0 9px; font-size: var(--text-sm)" }, { classes: ["badge", "secondary"], tag: null, pseudo: null, css: "background-color: var(--bg-raised); color: var(--text-secondary)" }, { classes: ["badge", "info"], tag: null, pseudo: null, css: "background-color: var(--info-soft); color: var(--info)" }, { classes: ["badge", "success"], tag: null, pseudo: null, css: "background-color: var(--success-soft); color: var(--success)" }, { classes: ["badge", "warning"], tag: null, pseudo: null, css: "background-color: var(--warning-soft); color: var(--warning)" }, { classes: ["badge", "danger"], tag: null, pseudo: null, css: "background-color: var(--danger-soft); color: var(--danger)" }]);

// gallery/demos/Badge.demo.svelte
var root69 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      }
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
      " ",
      ,
    ]
  ]
]);
function Badge_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const VARIANTS = ["secondary", "info", "success", "warning", "danger"];
  var div = root69();
  var div_1 = child(div);
  each(div_1, 21, () => VARIANTS, index, ($$anchor, variant) => {
    var fragment = comment();
    var node = first_child(fragment);
    Badge(node, {
      get variant() {
        return get(variant);
      },
      get label() {
        return get(variant);
      }
    });
    append($$anchor, fragment);
  });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var node_1 = child(div_2);
  Badge(node_1, { size: "sm", label: "Small" });
  var node_2 = sibling(node_1, 2);
  Badge(node_2, { size: "md", label: "Medium" });
  var node_3 = sibling(node_2, 2);
  Badge(node_3, { variant: "success", label: "Live" });
  var node_4 = sibling(node_3, 2);
  Badge(node_4, { variant: "danger", label: "3 errors" });
  reset(div_2);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Kbd.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Kbd.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root70 = from_tree([["div", null, " "]]);
var root_144 = from_tree([["div"]]);
function Kbd($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let keys = prop($$props, "keys", 3, ""), size = prop($$props, "size", 3, "h-md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const GLYPHS = {
    cmd: "⌘",
    ctrl: "⌃",
    alt: "⌥",
    option: "⌥",
    shift: "⇧",
    enter: "↵",
    return: "↵",
    esc: "⎋",
    escape: "⎋",
    tab: "⇥",
    backspace: "⌫",
    delete: "⌦",
    up: "↑",
    down: "↓",
    left: "←",
    right: "→",
    space: "Space"
  };
  const caps = user_derived(() => keys().split("+").map((k) => k.trim().toLowerCase()).filter(Boolean).map((k) => GLYPHS[k] ?? k.toUpperCase()));
  var div = root_144();
  each(div, 21, () => get(caps), index, ($$anchor, cap) => {
    var div_1 = root70();
    var text = only_child(div_1, true);
    template_effect(() => {
      set_class(div_1, 0, `cap el-size ${size() ?? ""}`, "svelte-1jy3x5n");
      set_text(text, get(cap));
    });
    append($$anchor, div_1);
  });
  reset(div);
  template_effect(() => {
    set_class(div, 0, `kbd ${size() ?? ""}`, "svelte-1jy3x5n");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1jy3x5n", [{ classes: ["kbd"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 4 } }, { classes: ["cap"], tag: null, pseudo: null, css: "display: flex; align-items: center; justify-content: center; border-width: 1px; border-bottom-width: 2px; border-color: var(--border-strong); border-radius: var(--radius-sm); background-color: var(--bg-raised); color: var(--text-secondary); font-weight: 500; white-space: nowrap; user-select: none" }, { classes: ["cap"], tag: null, pseudo: null, css: "min-width: var(--height-md); padding: 0 6px" }]);

// gallery/demos/Kbd.demo.svelte
var root71 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: space-between"
    },
    ["div", { style: "color: var(--text-secondary)" }, " "],
    " ",
    ,
  ]
]);
var root_145 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 12px" },
    ,
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 16px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
    ]
  ]
]);
function Kbd_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const SHORTCUTS = [
    ["Command palette", "cmd+k"],
    ["Save", "cmd+s"],
    ["Find in page", "cmd+shift+f"],
    ["Send message", "shift+enter"],
    ["Close dialog", "esc"]
  ];
  var div = root_145();
  var node = child(div);
  each(node, 17, () => SHORTCUTS, index, ($$anchor, $$item) => {
    var $$array = user_derived(() => to_array(get($$item), 2));
    let action = () => get($$array)[0];
    let keys = () => get($$array)[1];
    var div_1 = root71();
    var div_2 = child(div_1);
    var text = only_child(div_2, true);
    var node_1 = sibling(div_2, 2);
    Kbd(node_1, {
      get keys() {
        return keys();
      }
    });
    reset(div_1);
    template_effect(() => set_text(text, action()));
    append($$anchor, div_1);
  });
  var div_3 = sibling(node, 2);
  var node_2 = child(div_3);
  Kbd(node_2, { keys: "cmd+k", size: "h-sm" });
  var node_3 = sibling(node_2, 2);
  Kbd(node_3, { keys: "up", size: "h-sm" });
  var node_4 = sibling(node_3, 2);
  Kbd(node_4, { keys: "down", size: "h-sm" });
  reset(div_3);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Progress.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Progress.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root72 = from_tree([
  ["div", { class: "grow" }],
  " ",
  ["div", { style: "width: 30%" }],
  " ",
  ["div", { class: "grow" }]
], 1);
var root_146 = from_tree([["div"]]);
var root_236 = from_tree([["div", { role: "progressbar" }, ,]]);
function Progress($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let value = prop($$props, "value", 3, 0), indeterminate = prop($$props, "indeterminate", 3, false), variant = prop($$props, "variant", 3, "themed"), size = prop($$props, "size", 3, "md"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const pct = user_derived(() => Math.min(100, Math.max(0, value())));
  const TICKS = 60;
  let tick = state(0);
  user_effect(() => {
    if (!indeterminate())
      return;
    const id = setInterval(() => set(tick, (get(tick) + 1) % TICKS), 30);
    return () => clearInterval(id);
  });
  const sweep = user_derived(() => 0.5 - 0.5 * Math.cos(2 * Math.PI * get(tick) / TICKS));
  var div = root_236();
  var node = child(div);
  {
    var consequent = ($$anchor) => {
      var fragment = root72();
      var div_1 = first_child(fragment);
      var div_2 = sibling(div_1, 2);
      var div_3 = sibling(div_2, 2);
      template_effect(() => {
        set_style(div_1, `flex-grow: ${get(sweep) ?? ""}`);
        set_class(div_2, 0, `bar ${variant() ?? ""} progress-${size() ?? ""}`, "svelte-1e4r23l");
        set_attribute2(div_2, "testId", testid() && `${testid()}-fill`);
        set_style(div_3, `flex-grow: ${1 - get(sweep)}`);
      });
      append($$anchor, fragment);
    };
    var alternate = ($$anchor) => {
      var div_4 = root_146();
      template_effect(() => {
        set_class(div_4, 0, `bar ${variant() ?? ""} progress-${size() ?? ""}`, "svelte-1e4r23l");
        set_style(div_4, `width: ${get(pct) ?? ""}%`);
        set_attribute2(div_4, "testId", testid() && `${testid()}-fill`);
      });
      append($$anchor, div_4);
    };
    if_block(node, ($$render) => {
      if (indeterminate())
        $$render(consequent);
      else
        $$render(alternate, -1);
    });
  }
  reset(div);
  template_effect(() => {
    set_class(div, 0, `track progress-${size() ?? ""}`, "svelte-1e4r23l");
    set_attribute2(div, "aria-valuetext", indeterminate() ? "loading" : `${get(pct)}%`);
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1e4r23l", [{ classes: ["track"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; align-items: center; width: 100%; background-color: var(--bg-raised); border-radius: var(--radius-full); overflow: hidden" }, { classes: ["bar"], tag: null, pseudo: null, css: "height: 100%; border-radius: var(--radius-full)" }, { classes: ["bar", "themed"], tag: null, pseudo: null, css: "background-color: var(--theme-color)" }, { classes: ["bar", "secondary"], tag: null, pseudo: null, css: "background-color: var(--text-secondary)" }, { classes: ["bar", "info"], tag: null, pseudo: null, css: "background-color: var(--info)" }, { classes: ["bar", "success"], tag: null, pseudo: null, css: "background-color: var(--success)" }, { classes: ["bar", "warning"], tag: null, pseudo: null, css: "background-color: var(--warning)" }, { classes: ["bar", "danger"], tag: null, pseudo: null, css: "background-color: var(--danger)" }]);

// gallery/demos/Progress.demo.svelte
var root73 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: column; gap: 14px; width: 420px"
    },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 8px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ["div", { style: "color: var(--text-secondary)" }, " "]
    ],
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
    " ",
    ,
  ]
]);
function Progress_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  let value = state(35);
  var div = root73();
  var div_1 = child(div);
  var node = child(div_1);
  Button(node, {
    label: "-10",
    size: "h-md",
    variant: "outline",
    onclick: () => set(value, Math.max(0, get(value) - 10), true)
  });
  var node_1 = sibling(node, 2);
  Button(node_1, {
    label: "+10",
    size: "h-md",
    variant: "outline",
    onclick: () => set(value, Math.min(100, get(value) + 10), true)
  });
  var div_2 = sibling(node_1, 2);
  var text = only_child(div_2);
  reset(div_1);
  var node_2 = sibling(div_1, 2);
  Progress(node_2, {
    get value() {
      return get(value);
    },
    size: "sm"
  });
  var node_3 = sibling(node_2, 2);
  Progress(node_3, {
    get value() {
      return get(value);
    }
  });
  var node_4 = sibling(node_3, 2);
  Progress(node_4, {
    get value() {
      return get(value);
    },
    size: "lg",
    variant: "success"
  });
  var node_5 = sibling(node_4, 2);
  Progress(node_5, {
    get value() {
      return get(value);
    },
    variant: "warning"
  });
  var node_6 = sibling(node_5, 2);
  Progress(node_6, {
    get value() {
      return get(value);
    },
    variant: "danger"
  });
  var node_7 = sibling(node_6, 2);
  Progress(node_7, { indeterminate: true });
  reset(div);
  template_effect(() => set_text(text, `${get(value) ?? ""}%`));
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/demos/Spinner.demo.svelte
init_renderer2();
init_custom_renderer();
init_client();

// src/components/Spinner.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root74 = from_tree([["div"]]);
var root_147 = from_tree([["div"]]);
function Spinner($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let size = prop($$props, "size", 3, "h-bs"), variant = prop($$props, "variant", 3, "themed"), style = prop($$props, "style", 3, null), testid = prop($$props, "testid", 3, null);
  const BOX = { "h-sm": 16, "h-md": 20, "h-bs": 24, "h-lg": 32 };
  const COUNT = 8;
  let head = state(0);
  user_effect(() => {
    const id = setInterval(() => set(head, (get(head) + 1) % COUNT), 90);
    return () => clearInterval(id);
  });
  const box = user_derived(() => BOX[size()]);
  const dot = user_derived(() => Math.round(get(box) / 6));
  const dots = user_derived(() => Array.from({ length: COUNT }, (_, i) => {
    const angle = i / COUNT * 2 * Math.PI - Math.PI / 2;
    const r = get(box) / 2 - get(dot) / 2;
    const behind = (get(head) - i + COUNT) % COUNT;
    return {
      i,
      x: get(box) / 2 + r * Math.cos(angle) - get(dot) / 2,
      y: get(box) / 2 + r * Math.sin(angle) - get(dot) / 2,
      o: 1 - behind / COUNT * 0.85
    };
  }));
  var div = root_147();
  each(div, 21, () => get(dots), (d) => d.i, ($$anchor, d) => {
    var div_1 = root74();
    template_effect(() => {
      set_class(div_1, 0, `dot ${variant() ?? ""}`, "svelte-1dm2jda");
      set_style(div_1, `left: ${get(d).x ?? ""}px; top: ${get(d).y ?? ""}px; width: ${get(dot) ?? ""}px; height: ${get(dot) ?? ""}px; opacity: ${get(d).o ?? ""}`);
    });
    append($$anchor, div_1);
  });
  reset(div);
  template_effect(() => {
    set_class(div, 0, `spin ${size() ?? ""}`, "svelte-1dm2jda");
    set_style(div, style());
    set_attribute2(div, "testId", testid());
  });
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1dm2jda", [{ classes: ["spin"], tag: null, pseudo: null, style: { position: "relative" } }, { classes: ["dot"], tag: null, pseudo: null, css: "position: absolute; border-radius: var(--radius-full)" }, { classes: ["spin", "h-sm"], tag: null, pseudo: null, css: "width: var(--height-sm); height: var(--height-sm)" }, { classes: ["spin", "h-md"], tag: null, pseudo: null, css: "width: var(--height-md); height: var(--height-md)" }, { classes: ["spin", "h-bs"], tag: null, pseudo: null, css: "width: var(--height-bs); height: var(--height-bs)" }, { classes: ["spin", "h-lg"], tag: null, pseudo: null, css: "width: var(--height-lg); height: var(--height-lg)" }, { classes: ["dot", "themed"], tag: null, pseudo: null, css: "background-color: var(--theme-color)" }, { classes: ["dot", "secondary"], tag: null, pseudo: null, css: "background-color: var(--text-secondary)" }, { classes: ["dot", "info"], tag: null, pseudo: null, css: "background-color: var(--info)" }, { classes: ["dot", "success"], tag: null, pseudo: null, css: "background-color: var(--success)" }, { classes: ["dot", "warning"], tag: null, pseudo: null, css: "background-color: var(--warning)" }, { classes: ["dot", "danger"], tag: null, pseudo: null, css: "background-color: var(--danger)" }]);

// gallery/demos/Spinner.demo.svelte
var root75 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 16px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 20px; align-items: center"
      },
      ,
      " ",
      ,
      " ",
      ,
    ],
    " ",
    [
      "div",
      {
        style: "display: flex; flex-direction: row; gap: 20px; align-items: center"
      }
    ]
  ]
]);
function Spinner_demo($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const VARIANTS = ["themed", "secondary", "success", "warning", "danger"];
  var div = root75();
  var div_1 = child(div);
  var node = child(div_1);
  Spinner(node, { size: "h-sm" });
  var node_1 = sibling(node, 2);
  Spinner(node_1, { size: "h-md" });
  var node_2 = sibling(node_1, 2);
  Spinner(node_2, { size: "h-lg" });
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  each(div_2, 21, () => VARIANTS, index, ($$anchor, variant) => {
    var fragment = comment();
    var node_3 = first_child(fragment);
    Spinner(node_3, {
      get variant() {
        return get(variant);
      },
      size: "h-lg"
    });
    append($$anchor, fragment);
  });
  reset(div_2);
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
}

// gallery/registry.ts
var demos = [
  { name: "Button", category: "actions", description: "Clickable action with variants, sizes, shapes, loading and icon slots.", docs: "`Button` runs an action on click, Enter or Space. It is a focusable `div`, so it works anywhere in a GPUI tree.\n\n```svelte\n<script>\n  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';\n</script>\n\n<Button label=\"Save\" onclick={save} />\n<Button variant=\"danger\" size=\"h-md\" shape=\"square\">Delete</Button>\n<Button variant=\"ghost\" loading={busy} shape=\"modern\" label=\"Sync\" />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `children` | `Snippet` | — | Content; `label` is the plain-text shorthand. |\n| `label` | `string` | `''` |   |\n| `variant` | `'primary' \\| 'secondary' \\| 'themed' \\| 'outline' \\| 'ghost' \\| 'link' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'primary'` | Fractalstyler's variant axis. |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-bs'` | Fractalstyler's size axis. |\n| `shape` | `'square' \\| 'min' \\| 'modern' \\| 'curved' \\| 'round'` | `'min'` |   |\n| `disabled` | `boolean` | `false` |   |\n| `loading` | `boolean` | `false` | Shows `…` in place of the content and swallows clicks. |\n| `full` | `boolean` | `false` | Stretches to the parent's width. |\n| `leading` | `Snippet` | — | Snippet before the content, usually an icon. |\n| `trailing` | `Snippet` | — |   |\n| `onclick` | `(e: GpuixEvent) => void` | — |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\nNone; the component takes its colours from the element it sits in.\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Enter, Space | Activate while focused |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Button from 'gpuix-fractalsvelte-ui/Button.svelte';\n\tlet clicks = $state(0);\n\tconst variants = ['primary', 'secondary', 'themed', 'outline', 'ghost', 'link', 'info', 'success', 'warning', 'danger'] as const;\n\tconst shapes = ['square', 'min', 'modern', 'curved', 'round'] as const;\n\tconst sizes = ['h-sm', 'h-md', 'h-bs', 'h-lg', 'h-xl'] as const;\n\n</script>\n\n{#snippet plus()}<div>+</div>{/snippet}\n{#snippet arrow()}<div>→</div>{/snippet}\n\n<div style=\"display: flex; flex-direction: column; gap: 20px\">\n\t<div style=\"display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px\">\n\t\t{#each variants as v}\n\t\t\t<Button variant={v} label={v} onclick={() => clicks++} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each shapes as s}\n\t\t\t<Button shape={s} label={s} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each sizes as z}\n\t\t\t<Button size={z} label={z} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Button label=\"Save\" leading={plus} />\n\t\t<Button label=\"Next\" trailing={arrow} />\n\t\t<Button label=\"Full width\" full />\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Button label=\"Disabled\" disabled />\n\t\t<Button label=\"Loading\" loading />\n\t</div>\n\t<div>clicks: {clicks}</div>\n</div>\n```\n\n## GPUI notes\n\n- The focus ring is a border colour change, since GPUI has no outline or shadow.\n- Disabled buttons drop their hover rule rather than overriding it, because a `:hover` rule outranks a plain class.", demo: Button_demo },
  { name: "ButtonGroup", category: "actions", description: "Row of attached buttons, or a segmented single-select control driven by options and value.", docs: `\`ButtonGroup\` has two modes. Give it \`options\` for a segmented, single-select control. Give it children to lay buttons out in a row.

\`\`\`svelte
<script>
  import ButtonGroup from 'gpuix-fractalsvelte-ui/ButtonGroup.svelte';
  let range = $state('week');
</script>

<ButtonGroup
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'year', label: 'Year', disabled: true }
  ]}
  value={range}
  onchange={(v) => (range = v)}
/>

<ButtonGroup>
  <Button variant="outline" label="Left" />
  <Button variant="outline" label="Right" />
</ButtonGroup>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`children\` | \`Snippet\` | — | Attached mode: the child buttons laid out edge to edge. |
| \`options\` | \`Option[]\` | — | Segmented mode: one selectable segment per option. Use instead of \`children\`. |
| \`value\` | \`T \\| null\` | — |   |
| \`onchange\` | \`(value: T) => void\` | — |   |
| \`variant\` | \`'primary' \\| 'secondary' \\| 'themed' \\| 'outline' \\| 'ghost' \\| 'link' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'\` | \`'primary'\` | Fractalstyler's variant for the selected segment. |
| \`size\` | \`'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'\` | \`'h-bs'\` | Fractalstyler's size axis. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

\`bg-raised\`, \`border\`, \`radius-md\`, \`radius-sm\`, \`ring\`, \`text-secondary\`
## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves focus to the segmented group (one stop) |
| Left, Up | Select the previous enabled option, wrapping |
| Right, Down | Select the next enabled option, wrapping |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import ButtonGroup from 'gpuix-fractalsvelte-ui/ButtonGroup.svelte';
	type Range = 'day' | 'week' | 'month' | 'year';
	let range = $state<Range>('week');
	let view = $state('list');
	let align = $state('left');
	const views = [
		{ value: 'list', label: 'List' },
		{ value: 'board', label: 'Board' },
		{ value: 'graph', label: 'Graph' }
	];
	const aligns = [
		{ value: 'left', label: 'Left' },
		{ value: 'centre', label: 'Centre' },
		{ value: 'right', label: 'Right' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup
			options={[
				{ value: 'day', label: 'Day' },
				{ value: 'week', label: 'Week' },
				{ value: 'month', label: 'Month' },
				{ value: 'year', label: 'Year', disabled: true }
			]}
			value={range}
			onchange={(v: Range) => (range = v)}
		/>
		<div style="color: var(--text-secondary)">range: {range}</div>
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup options={views} value={view} onchange={(v) => (view = v)} variant="secondary" size="h-md" />
		<ButtonGroup options={views} value={view} onchange={(v) => (view = v)} variant="success" size="h-lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup options={aligns} value={align} onchange={(v) => (align = v)} variant="warning" />
		<ButtonGroup options={aligns} value={align} onchange={(v) => (align = v)} variant="danger" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 0">
		<ButtonGroup>
			{#snippet children()}
				<Button variant="outline" size="h-md" label="Undo" />
				<Button variant="outline" size="h-md" label="Redo" />
				<Button variant="outline" size="h-md" label="Reset" />
			{/snippet}
		</ButtonGroup>
	</div>
</div>
\`\`\`

## GPUI notes

- Segmented mode is one focusable track, not one tab stop per segment, as in a native radio group.
- In attached mode, \`Button\`, \`IconButton\` and \`Toggle\` children join automatically. Through context they learn whether they are first, middle or last, square their inner corners, and overlap borders by 1px so seams never double. Other children are laid out edge to edge unchanged.`, demo: ButtonGroup_demo },
  { name: "IconButton", category: "actions", description: "Square icon-only action with a hover tooltip, sharing Button's variants and sizes.", docs: "`IconButton` is a square `Button` for a single icon. Give it a `label` and hovering shows a tooltip. Like `Button`, it is a focusable `div`.\n\n```svelte\n<script>\n  import IconButton from 'gpuix-fractalsvelte-ui/IconButton.svelte';\n</script>\n\n<IconButton glyph=\"+\" label=\"Add\" onclick={add} />\n<IconButton variant=\"danger\" label=\"Delete\">\n  {#snippet children()}\uD83D\uDDD1{/snippet}\n</IconButton>\n<IconButton glyph=\"✕\" size=\"h-md\" disabled />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `children` | `Snippet` | — | The icon; `glyph` is the plain-text shorthand. |\n| `glyph` | `string` | `''` |   |\n| `label` | `string` | `''` | Tooltip text shown after a short hover. |\n| `variant` | `'primary' \\| 'secondary' \\| 'themed' \\| 'outline' \\| 'ghost' \\| 'link' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'ghost'` | Fractalstyler's variant axis. |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-bs'` | Fractalstyler's size axis; the button is a square of that height. |\n| `shape` | `'square' \\| 'min' \\| 'modern' \\| 'curved' \\| 'round'` | `'min'` |   |\n| `disabled` | `boolean` | `false` |   |\n| `onclick` | `(e: GpuixEvent) => void` | — |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\nNone; the component takes its colours from the element it sits in.\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Enter, Space | Activate while focused |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport IconButton from 'gpuix-fractalsvelte-ui/IconButton.svelte';\n\tlet added = $state(0);\n\tconst variants = ['primary', 'secondary', 'themed', 'outline', 'ghost', 'link', 'info', 'success', 'warning', 'danger'] as const;\n\tconst sizes = ['h-sm', 'h-md', 'h-bs', 'h-lg', 'h-xl'] as const;\n\tconst shapes = ['square', 'min', 'modern', 'curved', 'round'] as const;\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t<div style=\"display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px\">\n\t\t{#each variants as v}\n\t\t\t<IconButton variant={v} glyph=\"+\" label={v} onclick={() => added++} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each shapes as s}\n\t\t\t<IconButton shape={s} variant=\"outline\" glyph=\"+\" label={s} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each sizes as z}\n\t\t\t<IconButton size={z} glyph=\"✕\" label={z} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<IconButton glyph=\"−\" label=\"Disabled\" disabled />\n\t\t<IconButton variant=\"themed\" label=\"Star\">\n\t\t\t{#snippet children()}★{/snippet}\n\t\t</IconButton>\n\t</div>\n\t<div>added: {added}</div>\n</div>\n```\n\n## GPUI notes\n\n- The tooltip wraps the button with `Tooltip` and spreads its hover handlers onto the button. A button with its own `onclick` would otherwise block the hover.\n- The focus ring is a border colour change, since GPUI has no outline or shadow.\n- Disabled buttons drop their hover rule rather than overriding it.", demo: IconButton_demo },
  { name: "Link", category: "actions", description: "Inline text action with variants, underlined on hover.", docs: "`Link` is a text action that looks like a link. It is a focusable `div`, so it runs an action on click, Enter or Space like `Button`.\n\n```svelte\n<script>\n  import Link from 'gpuix-fractalsvelte-ui/Link.svelte';\n</script>\n\n<Link label=\"Read the docs\" onclick={openDocs} />\n<Link variant=\"danger\" size=\"h-md\" label=\"Remove\" onclick={remove} />\n<Link disabled label=\"Unavailable\" />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `children` | `Snippet` | — |   |\n| `label` | `string` | `''` |   |\n| `variant` | `'themed' \\| 'secondary' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'themed'` | Text colour, in fractalstyler's names; `secondary` is plain ink. |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-bs'` |   |\n| `disabled` | `boolean` | `false` |   |\n| `onclick` | `(e: GpuixEvent) => void` | — |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`danger`, `danger-hover`, `info`, `radius-sm`, `ring`, `success`, `text-primary`, `theme-color`, `theme-color-alt`, `warning`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Enter, Space | Activate while focused |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Link from 'gpuix-fractalsvelte-ui/Link.svelte';\n\tlet last = $state('none');\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 14px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 16px; align-items: center\">\n\t\t{#each ['themed', 'secondary', 'info', 'success', 'warning', 'danger'] as const as variant}\n\t\t\t<Link {variant} label={variant} onclick={() => (last = variant)} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 16px; align-items: center\">\n\t\t<Link size=\"h-sm\" label=\"Small\" onclick={() => (last = 'small')} />\n\t\t<Link size=\"h-md\" label=\"Medium\" onclick={() => (last = 'medium')} />\n\t\t<Link size=\"h-lg\" label=\"Large\" onclick={() => (last = 'large')} />\n\t\t<Link label=\"Disabled\" disabled />\n\t</div>\n\t<div style=\"color: var(--text-secondary)\">last clicked: {last}</div>\n</div>\n```\n\n## GPUI notes\n\n- The hover underline is `text-decoration`, which GPUI inherits to the text.\n- The root hugs its text (`align-self: flex-start`), so only the text is clickable, not the full row.\n- The focus ring is a border colour change, since GPUI has no outline.", demo: Link_demo },
  { name: "Toggle", category: "actions", description: "Button that holds a pressed or unpressed state, with a `pressedVariant` for the pressed look.", docs: "`Toggle` is a button with two states. It is controlled, so the parent owns `pressed` and updates it in `onchange`.\n\n```svelte\n<script>\n  import Toggle from 'gpuix-fractalsvelte-ui/Toggle.svelte';\n  let bold = $state(false);\n</script>\n\n<Toggle label=\"Bold\" pressed={bold} onchange={(p) => (bold = p)} />\n<Toggle pressedVariant=\"success\" label=\"Wrap\" pressed={wrap} onchange={(p) => (wrap = p)} />\n<Toggle label=\"Locked\" disabled pressed />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `children` | `Snippet` | — |   |\n| `label` | `string` | `''` |   |\n| `pressed` | `boolean` | `false` | Whether the toggle is on. Pair with `onchange`. |\n| `onchange` | `(pressed: boolean) => void` | — | Called with the next pressed state. |\n| `variant` | `'outline' \\| 'ghost'` | `'outline'` |   |\n| `pressedVariant` | `'themed' \\| 'secondary' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'themed'` | Colour of the pressed state, in fractalstyler's names. |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-bs'` | Fractalstyler's height steps. |\n| `disabled` | `boolean` | `false` |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `border-strong`, `danger`, `danger-soft`, `info`, `info-soft`, `radius-md`, `ring`, `success`, `success-soft`, `text-primary`, `text-secondary`, `theme-color`, `theme-color-sub`, `warning`, `warning-soft`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Enter, Space | Flip the state while focused |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Toggle from 'gpuix-fractalsvelte-ui/Toggle.svelte';\n\tlet bold = $state(false);\n\tlet italic = $state(true);\n\tlet wrap = $state(false);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Toggle label=\"Bold\" pressed={bold} onchange={(p) => (bold = p)} />\n\t\t<Toggle label=\"Italic\" pressed={italic} onchange={(p) => (italic = p)} pressedVariant=\"secondary\" />\n\t\t<Toggle label=\"Wrap\" pressed={wrap} onchange={(p) => (wrap = p)} pressedVariant=\"success\" variant=\"ghost\" />\n\t\t<Toggle label=\"Locked\" pressed disabled pressedVariant=\"danger\" />\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each ['themed', 'secondary', 'info', 'success', 'warning', 'danger'] as const as pressedVariant}\n\t\t\t<Toggle pressedVariant={pressedVariant} label={pressedVariant} pressed={pressedVariant !== 'secondary'} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Toggle size=\"h-md\" label=\"Small\" pressed />\n\t\t<Toggle size=\"h-bs\" label=\"Medium\" pressed />\n\t\t<Toggle size=\"h-lg\" label=\"Large\" pressed />\n\t</div>\n\t<div style=\"color: var(--text-secondary)\">bold: {bold ? 'on' : 'off'} · italic: {italic ? 'on' : 'off'} · wrap: {wrap ? 'on' : 'off'}</div>\n</div>\n```\n\n## GPUI notes\n\n- The pressed state changes the fill and text colour only, so the focus ring on the border still shows on a pressed toggle.\n- Disabled toggles drop their hover rule rather than overriding it.", demo: Toggle_demo },
  { name: "Checkbox", category: "inputs", description: "Boolean or indeterminate check with a label, in three sizes, controlled by the parent.", docs: '`Checkbox` is controlled: it shows `checked` and calls `onchange` with the next state. The parent stores the value.\n\n```svelte\n<script>\n  import Checkbox from \'gpuix-fractalsvelte-ui/Checkbox.svelte\';\n  let agree = $state(false);\n  let all = $state(false);\n</script>\n\n<Checkbox label="Accept terms" checked={agree} onchange={(v) => (agree = v)} />\n<Checkbox label="Select all" indeterminate={!all && someSelected} onchange={(v) => (all = v)} />\n<Checkbox label="Locked" checked disabled />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `checked` | `boolean` | `false` |   |\n| `indeterminate` | `boolean` | `false` | Shows a dash in place of the tick. The parent decides what a click means, and clears it. |\n| `onchange` | `(checked: boolean) => void` | — | Called with the next checked state when the box or label is clicked, or Space is pressed. |\n| `label` | `string` | `\'\'` | Plain-text label, ignored when `children` is given. |\n| `children` | `Snippet` | — |   |\n| `disabled` | `boolean` | `false` |   |\n| `size` | `\'h-sm\' \\| \'h-md\' \\| \'h-bs\'` | `\'h-sm\'` | Fractalstyler\'s height steps; the box is that height square. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-surface`, `border-strong`, `radius-sm`, `ring`, `text-md`, `text-primary`, `text-theme`, `theme-color`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Space | Toggle while focused |\n\nEnter is not handled.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery\'s Demo view renders them.\n\n```svelte\n<script lang="ts">\n\timport Checkbox from \'gpuix-fractalsvelte-ui/Checkbox.svelte\';\n\n\tlet items = $state([true, false, true]);\n\tconst all = $derived(items.every(Boolean));\n\tconst some = $derived(items.some(Boolean) && !all);\n\tlet terms = $state(false);\n</script>\n\n<div style="display: flex; flex-direction: row; gap: 48px">\n\t<div style="display: flex; flex-direction: column; gap: 12px">\n\t\t<Checkbox label="Small" size="h-sm" checked />\n\t\t<Checkbox label="Medium" size="h-md" checked={terms} onchange={(v) => (terms = v)} />\n\t\t<Checkbox label="Large" size="h-bs" checked />\n\t\t<Checkbox label="Indeterminate" indeterminate />\n\t\t<Checkbox label="Disabled" disabled />\n\t\t<Checkbox label="Disabled checked" disabled checked />\n\t</div>\n\n\t<div style="display: flex; flex-direction: column; gap: 12px">\n\t\t<Checkbox\n\t\t\tlabel="Select all"\n\t\t\tchecked={all}\n\t\t\tindeterminate={some}\n\t\t\tonchange={(v) => (items = items.map(() => v))}\n\t\t/>\n\t\t{#each items as on, i (i)}\n\t\t\t<div style="padding-left: 24px">\n\t\t\t\t<Checkbox label="Item {i + 1}" checked={on} onchange={(v) => (items[i] = v)} />\n\t\t\t</div>\n\t\t{/each}\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- The root has `hitbox="self"`, so clicks on the box or label reach the row.\n- The tick and dash are inline SVGs. They take their colour from `currentColor` via the `.mark` class.\n- Focus is a border colour change on the box, since GPUI has no outline.\n- A disabled row has `tabindex` -1 and no click handler effect; the `onchange` is never called.', demo: Checkbox_demo },
  { name: "RadioGroup", category: "inputs", description: "Pick one of a few options, in a column or a row, with arrow-key navigation.", docs: "`RadioGroup` shows a set of options and reports the one the user picks. Each option is a focusable `div`, so arrow keys and Space work in any GPUI tree.\n\n```svelte\n<script>\n  import RadioGroup from 'gpuix-fractalsvelte-ui/RadioGroup.svelte';\n  let plan = $state('monthly');\n</script>\n\n<RadioGroup\n  options={[\n    { value: 'monthly', label: 'Monthly' },\n    { value: 'yearly', label: 'Yearly' },\n    { value: 'lifetime', label: 'Lifetime', disabled: true }\n  ]}\n  value={plan}\n  onchange={(v) => (plan = v)}\n/>\n<RadioGroup options={views} value={view} direction=\"row\" onchange={(v) => (view = v)} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `options` | `Option[]` | — |   |\n| `value` | `string \\| null` | — | The checked option's value, or `null` for none. |\n| `onchange` | `(value: string) => void` | — |   |\n| `direction` | `'row' \\| 'column'` | `'column'` |   |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs'` | `'h-sm'` | Fractalstyler's height steps; each circle is that height square. |\n| `disabled` | `boolean` | `false` |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-surface`, `border-strong`, `radius-full`, `ring`, `text-md`, `text-primary`, `theme-color`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Down, Right | Select the next enabled option, wrapping at the end |\n| Up, Left | Select the previous enabled option, wrapping at the start |\n| Space | Select the focused option |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport RadioGroup from 'gpuix-fractalsvelte-ui/RadioGroup.svelte';\n\tconst plans = [\n\t\t{ value: 'monthly', label: 'Monthly' },\n\t\t{ value: 'yearly', label: 'Yearly' },\n\t\t{ value: 'lifetime', label: 'Lifetime', disabled: true }\n\t];\n\tconst views = [\n\t\t{ value: 'list', label: 'List' },\n\t\t{ value: 'grid', label: 'Grid' },\n\t\t{ value: 'board', label: 'Board' }\n\t];\n\tlet plan = $state<string | null>('monthly');\n\tlet view = $state<string | null>('grid');\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 20px; padding: 8px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 48px; align-items: start\">\n\t\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Column · md · one disabled option</div>\n\t\t\t<RadioGroup options={plans} value={plan} onchange={(v) => (plan = v)} />\n\t\t</div>\n\t\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Sizes</div>\n\t\t\t<RadioGroup options={plans.slice(0, 2)} value={plan} size=\"h-sm\" onchange={(v) => (plan = v)} />\n\t\t\t<RadioGroup options={plans.slice(0, 2)} value={plan} size=\"h-bs\" onchange={(v) => (plan = v)} />\n\t\t</div>\n\t</div>\n\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Row</div>\n\t\t<RadioGroup options={views} value={view} direction=\"row\" onchange={(v) => (view = v)} />\n\t</div>\n\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Disabled group</div>\n\t\t<RadioGroup options={views} value=\"list\" direction=\"row\" disabled />\n\t</div>\n\t<div style=\"color: var(--text-secondary)\">plan: {plan} · view: {view}</div>\n</div>\n```\n\n## GPUI notes\n\n- The focus ring is a border colour change on the circle, since GPUI has no outline or shadow.\n- Arrow keys move focus with the selection through `get_native().focusElement`, which works in headless tests too. The `focus_element` window helper is a no-op headless.\n- Every enabled option is a tab stop, so Tab visits each one. A roving tab stop (one per group) would match native radios more closely; it is not implemented.", demo: RadioGroup_demo },
  { name: "Select", category: "inputs", description: "Dropdown that picks one option from a list, with keyboard navigation and a scrolling list for long option sets.", docs: "`Select` shows the chosen option in a trigger and opens a list beside it. The list is a `Popover`, so it closes on an outside press and on Escape.\n\n```svelte\n<script>\n  import Select from 'gpuix-fractalsvelte-ui/Select.svelte';\n  let fruit = $state(null);\n</script>\n\n<Select\n  options={[\n    { value: 'apple', label: 'Apple' },\n    { value: 'banana', label: 'Banana' },\n    { value: 'date', label: 'Date', disabled: true }\n  ]}\n  value={fruit}\n  onchange={(v) => (fruit = v)}\n  placeholder=\"Pick a fruit\"\n/>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `options` | `Option[]` | — |   |\n| `value` | `string \\| null` | — | The chosen option's value, or `null` to show the placeholder. |\n| `onchange` | `(value: string) => void` | — |   |\n| `placeholder` | `string` | `'Select…'` |   |\n| `size` | `'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-lg'` | Fractalstyler's height steps for the trigger and rows. |\n| `disabled` | `boolean` | `false` |   |\n| `style` | `string \\| null` | — | Inline CSS for the trigger; `width` defaults to 200px. |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `bg-surface`, `border-strong`, `radius-md`, `radius-sm`, `ring`, `text-muted`, `text-primary`, `text-secondary`, `theme-color`\n## Keyboard\n\n| Key | Closed | Open |\n| --- | --- | --- |\n| Enter, Space, Down, Up | Open the list | Enter and Space pick the highlighted option |\n| Down | — | Highlight the next enabled option |\n| Up | — | Highlight the previous enabled option |\n| Escape | — | Close without changing the value |\n| Tab | — | Close |\n\nFocus stays on the trigger while the list is open. The arrow keys move a highlight, not focus.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Select from 'gpuix-fractalsvelte-ui/Select.svelte';\n\n\tconst fruits = [\n\t\t{ value: 'apple', label: 'Apple' },\n\t\t{ value: 'banana', label: 'Banana' },\n\t\t{ value: 'cherry', label: 'Cherry' },\n\t\t{ value: 'date', label: 'Date', disabled: true },\n\t\t{ value: 'elder', label: 'Elderberry' }\n\t];\n\tconst zones = Array.from({ length: 24 }, (_, i) => ({ value: `z${i + 1}`, label: `Zone ${i + 1}` }));\n\n\tlet fruit = $state<string | null>(null);\n\tlet zone = $state<string | null>('z3');\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 16px; padding: 8px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 12px; align-items: center\">\n\t\t<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder=\"Pick a fruit\" size=\"h-md\" />\n\t\t<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder=\"Pick a fruit\" />\n\t\t<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder=\"Pick a fruit\" size=\"h-xl\" />\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 12px; align-items: center\">\n\t\t<Select options={fruits} value=\"banana\" disabled />\n\t\t<Select options={zones} value={zone} onchange={(v) => (zone = v)} placeholder=\"Long list\" />\n\t</div>\n\t<div style=\"color: var(--text-secondary)\">fruit: {fruit ?? 'none'} · zone: {zone ?? 'none'}</div>\n</div>\n```\n\n## GPUI notes\n\n- The panel's colours come from the fractalstyler tokens in `style`, since `Popover`'s own fallbacks are dark and would show in the light theme.\n- Opening the list highlights the chosen option, or the first enabled one.\n- The highlighted row is scrolled into view with `get_native().scrollIntoView`, which the headless renderer does not implement, so that scroll is only verified in a window.", demo: Select_demo },
  { name: "Slider", category: "inputs", description: "Pick a number in a range by dragging the thumb, clicking the track or using the arrow keys.", docs: "`Slider` maps a value between `min` and `max` onto a horizontal track. Dragging, clicking and the keyboard all report through `onchange`.\n\n```svelte\n<script>\n  import Slider from 'gpuix-fractalsvelte-ui/Slider.svelte';\n  let volume = $state(40);\n</script>\n\n<Slider value={volume} onchange={(v) => (volume = v)} />\n<Slider value={level} min={0} max={10} step={2} size=\"h-sm\" onchange={(v) => (level = v)} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `value` | `number` | — |   |\n| `onchange` | `(value: number) => void` | — |   |\n| `min` | `number` | `0` |   |\n| `max` | `number` | `100` |   |\n| `step` | `number` | `1` | Values snap to `min + n * step`. |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs'` | `'h-md'` | Fractalstyler's height steps for the control. |\n| `disabled` | `boolean` | `false` |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `bg-surface`, `height-bs`, `height-md`, `height-sm`, `radius-full`, `ring`, `theme-color`, `theme-color-sub`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Right, Up | Step up by `step` |\n| Left, Down | Step down by `step` |\n| Home | Jump to `min` |\n| End | Jump to `max` |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Slider from 'gpuix-fractalsvelte-ui/Slider.svelte';\n\tlet volume = $state(40);\n\tlet brightness = $state(70);\n\tlet level = $state(4);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 20px; padding: 8px; width: 360px\">\n\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t<div style=\"display: flex; flex-direction: row; justify-content: space-between; color: var(--text-secondary); font-size: var(--text-sm)\">\n\t\t\t<div>Volume</div><div>{volume}</div>\n\t\t</div>\n\t\t<Slider value={volume} onchange={(v) => (volume = v)} />\n\t</div>\n\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Step 2 of 0–10 · sm</div>\n\t\t<Slider value={level} min={0} max={10} step={2} size=\"h-sm\" onchange={(v) => (level = v)} />\n\t</div>\n\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Large</div>\n\t\t<Slider value={brightness} size=\"h-bs\" onchange={(v) => (brightness = v)} />\n\t</div>\n\t<div style=\"display: flex; flex-direction: column; gap: 8px\">\n\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">Disabled</div>\n\t\t<Slider value={30} disabled />\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- A click or drag on the root sets the value from the track's painted bounds, so the root's hit area is taller than the track.\n- The thumb is a child of the fill, so its position comes from the fill's width percentage and needs no measurement. Its overhang is a negative `right` offset.\n- GPUI does not capture the pointer, so a drag shows a window-sized cover, which ends the drag on release or on a move with no button held.", demo: Slider_demo },
  { name: "Switch", category: "inputs", description: "On/off toggle with a track and thumb, optional label, and three sizes.", docs: "`Switch` is a controlled on/off control. The parent owns `checked` and updates it in `onchange`, which receives the next state. Clicking the track or label, or pressing Space while focused, requests the change.\n\n```svelte\n<script>\n  import Switch from 'gpuix-fractalsvelte-ui/Switch.svelte';\n  let notify = $state(false);\n</script>\n\n<Switch label=\"Notifications\" checked={notify} onchange={(v) => (notify = v)} />\n\n<Switch checked disabled>\n  {#snippet children()}Locked on{/snippet}\n</Switch>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `checked` | `boolean` | `false` |   |\n| `onchange` | `(checked: boolean) => void` | — | Called with the next state when the track or label is clicked, or Space is pressed. |\n| `label` | `string` | `''` | Plain-text label, ignored when `children` is given. |\n| `children` | `Snippet` | — |   |\n| `disabled` | `boolean` | `false` |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-surface`, `border-strong`, `radius-full`, `ring`, `switch-h`, `switch-thumb`, `switch-w`, `text-md`, `text-primary`, `text-theme`, `theme-color`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Space | Toggle while focused |\n\nEnter does not toggle. A disabled switch is removed from the tab order (`tabindex -1`).\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Switch from 'gpuix-fractalsvelte-ui/Switch.svelte';\n\n\tlet wifi = $state(true);\n\tlet sync = $state(false);\n\tlet beta = $state(false);\n</script>\n\n<div style=\"display: flex; flex-direction: row; gap: 48px\">\n\t<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t\t<Switch label=\"Small\" checked />\n\t\t<Switch label=\"Medium\" checked={wifi} onchange={(v) => (wifi = v)} />\n\t\t<Switch label=\"Large\" checked />\n\t\t<Switch label=\"Disabled\" disabled />\n\t\t<Switch label=\"Disabled on\" disabled checked />\n\t</div>\n\n\t<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t\t<Switch label=\"Sync across devices\" checked={sync} onchange={(v) => (sync = v)} />\n\t\t<Switch label=\"Join the beta\" checked={beta} onchange={(v) => (beta = v)} />\n\t\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">\n\t\t\tsync {sync ? 'on' : 'off'} · beta {beta ? 'on' : 'off'}\n\t\t</div>\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- The focus ring is the track's border colour, since GPUI has no outline.\n- The thumb moves by flipping `justify-content` on the track, so it snaps rather than slides.\n- The root row is clickable, so a click on the label toggles as well as a click on the track.", demo: Switch_demo },
  { name: "TextArea", category: "inputs", description: "Multi-line text field with label, hint or error text, and a height that grows with its content.", docs: "`TextArea` is a controlled multi-line field. The parent owns `value` and updates it in `onchange`, which receives the new text. The field starts at `rows` lines and grows with its text, up to `maxRows` if set.\n\n```svelte\n<script>\n  import TextArea from 'gpuix-fractalsvelte-ui/TextArea.svelte';\n  let notes = $state('');\n</script>\n\n<TextArea label=\"Notes\" placeholder=\"Write something\" hint=\"Shown under the field\" value={notes} onchange={(v) => (notes = v)} />\n\n<TextArea label=\"Bio\" rows={2} maxRows={6} error=\"Too long\" value={bio} onchange={(v) => (bio = v)} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `value` | `string` | `''` |   |\n| `onchange` | `(value: string) => void` | — | Called on every edit with the new text. |\n| `placeholder` | `string` | `''` |   |\n| `label` | `string` | `''` | Shown above the field. |\n| `hint` | `string` | `''` | Shown under the field, unless `error` is set. |\n| `error` | `string` | `''` | Shown under the field in the danger colour, in place of `hint`. |\n| `rows` | `number` | `3` | Visible height in lines; the field grows with its text from here. |\n| `maxRows` | `number` | — | Stops growing at this many lines, then scrolls. Unset grows without limit. |\n| `disabled` | `boolean` | `false` | Greys the field and ignores edits. |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Text size: fractalstyler's sm, md or lg. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `bg-surface`, `border-strong`, `danger`, `font-sans`, `radius-lg`, `radius-md`, `radius-sm`, `ring`, `text-primary`, `text-secondary`, `text-sm`\n## Keyboard\n\nNone handled by the component. Enter inserts a line, as in any multi-line field.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport TextArea from 'gpuix-fractalsvelte-ui/TextArea.svelte';\n\tlet notes = $state('');\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 16px; width: 360px\">\n\t<TextArea\n\t\tlabel=\"Notes\"\n\t\tplaceholder=\"Write freely. The field grows with the text.\"\n\t\thint=\"Enter adds a line\"\n\t\tvalue={notes}\n\t\tonchange={(v) => (notes = v)}\n\t\tmaxRows={6}\n\t/>\n\t<div style=\"color: var(--text-secondary); font-size: var(--text-sm)\">{notes.length} characters</div>\n\n\t<TextArea size=\"sm\" rows={2} placeholder=\"Small, two rows\" />\n\t<TextArea size=\"lg\" rows={2} placeholder=\"Large, two rows\" />\n\t<TextArea label=\"Summary\" value=\"This copy is too long for the field.\" error=\"Keep it under 120 characters\" />\n\t<TextArea label=\"Changelog\" value=\"Locked for the release.\" rows={2} disabled />\n</div>\n```\n\n## GPUI notes\n\n- Clicking anywhere in the box focuses the inner textarea, so the padding is part of the hit area.\n- The focus ring is a border colour change, since GPUI has no outline.\n- Line height is fixed in px per size, so `rows` and `maxRows` are exact line counts.\n- A disabled field uses `readOnly` and reduced opacity. The disabled look is not a native disabled state.", demo: TextArea_demo },
  { name: "TextInput", category: "inputs", description: "Single-line text field with label, hint or error text, leading and trailing slots, and three sizes.", docs: '`TextInput` is a controlled single-line field. The parent owns `value` and updates it in `onchange`, which receives the new text. Enter calls `onsubmit` with the current text.\n\n```svelte\n<script>\n  import TextInput from \'gpuix-fractalsvelte-ui/TextInput.svelte\';\n  let name = $state(\'\');\n</script>\n\n<TextInput label="Name" placeholder="Your name" hint="Shown under the field" value={name} onchange={(v) => (name = v)} />\n\n<TextInput label="Email" value={email} error="Enter a valid email" onchange={(v) => (email = v)} />\n\n<TextInput size="h-xl" placeholder="Search" onsubmit={(q) => search(q)}>\n  {#snippet leading()}⌕{/snippet}\n</TextInput>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `value` | `string` | `\'\'` |   |\n| `onchange` | `(value: string) => void` | — | Called on every edit with the new text. |\n| `onsubmit` | `(value: string) => void` | — | Called on Enter with the current text. |\n| `placeholder` | `string` | `\'\'` |   |\n| `label` | `string` | `\'\'` | Shown above the field. |\n| `hint` | `string` | `\'\'` | Shown under the field, unless `error` is set. |\n| `error` | `string` | `\'\'` | Shown under the field in the danger colour, in place of `hint`. |\n| `disabled` | `boolean` | `false` | Greys the field and ignores edits. |\n| `size` | `\'h-md\' \\| \'h-lg\' \\| \'h-xl\'` | `\'h-lg\'` | Fractalstyler\'s height steps for the field. |\n| `leading` | `Snippet` | — | Snippet inside the field, before the text. |\n| `trailing` | `Snippet` | — | Snippet inside the field, after the text. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `bg-surface`, `border-strong`, `danger`, `font-sans`, `radius-md`, `ring`, `text-primary`, `text-secondary`, `text-sm`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Enter | Calls `onsubmit` with the current text |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery\'s Demo view renders them.\n\n```svelte\n<script lang="ts">\n\timport TextInput from \'gpuix-fractalsvelte-ui/TextInput.svelte\';\n\tlet name = $state(\'\');\n\tlet site = $state(\'\');\n\tlet submitted = $state(\'\');\n\tlet query = $state(\'\');\n</script>\n\n<div style="display: flex; flex-direction: column; gap: 16px; width: 360px">\n\t<div style="display: flex; flex-direction: row; gap: 8px; align-items: flex-end">\n\t\t<TextInput size="h-md" placeholder="Small" style="flex-grow: 1; flex-basis: 0; min-width: 0" />\n\t\t<TextInput size="h-lg" placeholder="Medium" style="flex-grow: 1; flex-basis: 0; min-width: 0" />\n\t\t<TextInput size="h-xl" placeholder="Large" style="flex-grow: 1; flex-basis: 0; min-width: 0" />\n\t</div>\n\n\t<TextInput\n\t\tlabel="Name"\n\t\tplaceholder="Ada Lovelace"\n\t\thint="Shown on your profile"\n\t\tvalue={name}\n\t\tonchange={(v) => (name = v)}\n\t\tonsubmit={(v) => (submitted = v)}\n\t/>\n\t<div style="color: var(--text-secondary); font-size: var(--text-sm)">submitted: {submitted || \'—\'}</div>\n\n\t<TextInput label="Website" placeholder="example.com" value={site} onchange={(v) => (site = v)}>\n\t\t{#snippet leading()}<div>https://</div>{/snippet}\n\t</TextInput>\n\n\t<TextInput\n\t\tplaceholder="Search notes"\n\t\tvalue={query}\n\t\tonchange={(v) => (query = v)}\n\t>\n\t\t{#snippet trailing()}<div style="font-size: var(--text-xs)">esc</div>{/snippet}\n\t</TextInput>\n\n\t<TextInput label="Email" value="ada@" error="Enter a valid email address" />\n\t<TextInput label="Organisation" value="Analytical Engine Ltd" disabled hint="Managed by your admin" />\n</div>\n```\n\n## GPUI notes\n\n- Clicks on the field, including its padding, focus the inner input, so the whole box is the hit area.\n- The focus ring is a border colour change, since GPUI has no outline.\n- A disabled field uses `readOnly` and reduced opacity. The disabled look is not a native disabled state.\n- The inner input is a fixed height per size, and `leading` and `trailing` sit beside it inside the field.', demo: TextInput_demo },
  { name: "Box", category: "layout", description: "Plain flex column with optional padding, background, border and corner radius.", docs: `\`Box\` is the simplest container: a column with a background, border and radius you choose from a small set of options.

\`\`\`svelte
<script>
  import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
</script>

<Box bg="surface" padding="md" border radius="lg">
  Panel content
</Box>
<Box bg="raised" radius="sm" padding={6} />
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`children\` | \`Snippet\` | — |   |
| \`padding\` | \`'sm' \\| 'md' \\| 'lg' \\| number\` | — | Fractalstyler's padding steps, or px. |
| \`bg\` | \`'surface' \\| 'raised' \\| 'none'\` | \`'none'\` |   |
| \`border\` | \`boolean\` | \`false\` |   |
| \`radius\` | \`'none' \\| 'sm' \\| 'md' \\| 'lg'\` | \`'md'\` |   |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const chip = 'padding: 4px 8px; border-radius: var(--radius-sm); background-color: var(--theme-color-sub); font-size: var(--text-sm); color: var(--theme-color)';
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Background</div>
		<div style="display: flex; flex-direction: row; gap: 12px">
			<Box bg="none" padding="md" border style="flex-grow: 1"><div style={caption}>none</div></Box>
			<Box bg="surface" padding="md" border style="flex-grow: 1"><div style={caption}>surface</div></Box>
			<Box bg="raised" padding="md" style="flex-grow: 1"><div style={caption}>raised</div></Box>
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Radius</div>
		<div style="display: flex; flex-direction: row; gap: 12px">
			{#each ['none', 'sm', 'md', 'lg'] as const as radius}
				<Box bg="raised" padding="sm" {radius} border style="flex-grow: 1; height: 44px; align-items: center; justify-content: center">
					<div style={caption}>{radius}</div>
				</Box>
			{/each}
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Padding</div>
		<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
			<Box bg="surface" padding="sm" border><div style={chip}>sm</div></Box>
			<Box bg="surface" padding="md" border><div style={chip}>md</div></Box>
			<Box bg="surface" padding="lg" border><div style={chip}>lg</div></Box>
			<Box bg="surface" padding={20} border><div style={chip}>20px</div></Box>
		</div>
	</div>
</div>
\`\`\`

## GPUI notes

- \`style\` is appended after the computed padding, so \`style="padding: 0"\` overrides the \`padding\` prop.
- Padding is written as an inline \`padding\` in px, not as a class.`, demo: Box_demo },
  { name: "Card", category: "layout", description: "Surface with a header, body and footer, optionally clickable as a whole.", docs: `\`Card\` groups related content under an optional title and description, with slots for header actions and footer buttons. With \`clickable\` the whole card becomes one action.

\`\`\`svelte
<script>
  import Card from 'gpuix-fractalsvelte-ui/Card.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Card title="Project" description="Last edited 2h ago">
  Body copy for the card.
  {#snippet actions()}
    <Button label="Star" variant="ghost" size="h-md" onclick={star} />
  {/snippet}
  {#snippet footer()}
    <Button label="Open" size="h-md" onclick={open} />
  {/snippet}
</Card>

<Card title="Recent file" clickable onclick={openFile}>Click anywhere to open.</Card>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`children\` | \`Snippet\` | — |   |
| \`title\` | \`string\` | \`''\` |   |
| \`description\` | \`string\` | \`''\` |   |
| \`actions\` | \`Snippet\` | — | Right side of the header, e.g. icon buttons. |
| \`footer\` | \`Snippet\` | — |   |
| \`padding\` | \`'sm' \\| 'md' \\| 'lg' \\| number\` | \`'lg'\` | Spacing scale or px, on all four sides. |
| \`clickable\` | \`boolean\` | \`false\` | Hover highlight, focus ring, and \`onclick\` on click, Enter or Space. |
| \`onclick\` | \`(e: GpuixEvent) => void\` | — |   |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

\`bg-raised\`, \`bg-surface\`, \`border\`, \`radius-lg\`, \`ring\`, \`text-lg\`, \`text-primary\`, \`text-secondary\`, \`text-sm\`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Run \`onclick\` while focused (only when \`clickable\`) |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Card from 'gpuix-fractalsvelte-ui/Card.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let opened = $state(0);
	let starred = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: start">
		<div style="flex-grow: 1; flex-basis: 0; min-width: 0">
			<Card title="Project Atlas" description="Edited 2 hours ago">
				Shared with 4 people. Last build passed on main.
				{#snippet footer()}
					<Button label="Cancel" variant="ghost" size="h-md" />
					<Button label="Open" size="h-md" />
				{/snippet}
			</Card>
		</div>
		<div style="flex-grow: 1; flex-basis: 0; min-width: 0">
			<Card title="Quarterly report" description="Draft · 12 pages">
				{#snippet actions()}
					<Button label={starred ? 'Starred' : 'Star'} variant={starred ? 'themed' : 'ghost'} size="h-md" onclick={() => (starred = !starred)} />
				{/snippet}
				Finance numbers are final. Review the summary before sending.
			</Card>
		</div>
	</div>
	<Card title="Compact" description="padding sm" padding="sm">Tight padding.</Card>
	<Card title="Open a workspace" description="Click the card to open it" clickable onclick={() => opened++}>
		<div style="color: var(--text-secondary)">Opened {opened} times.</div>
	</Card>
</div>
\`\`\`

## GPUI notes

- A clickable card is focusable (\`tabindex\` 0). Its focus ring is a border colour change.
- The \`actions\` and \`footer\` rows sit on a near-transparent fill with an \`onclick\` that does nothing. This stops a button's click from also running the card's \`onclick\`.
- Only the \`clickable\` card gets a \`cursor: pointer\` and hover background.`, demo: Card_demo },
  { name: "Divider", category: "layout", description: "Hairline rule, horizontal or vertical, with an optional centred label.", docs: `\`Divider\` draws a 1px rule. A horizontal divider can carry a centred label; a vertical one cannot.

\`\`\`svelte
<script>
  import Divider from 'gpuix-fractalsvelte-ui/Divider.svelte';
</script>

<Divider />
<Divider label="Advanced" />
<Divider orientation="vertical" />
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`orientation\` | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` |   |
| \`label\` | \`string\` | \`''\` | Shown centred in a horizontal divider. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

\`border\`, \`text-muted\`, \`text-sm\`
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Divider from 'gpuix-fractalsvelte-ui/Divider.svelte';
	const body = 'font-size: var(--text-md); color: var(--text-primary)';
	const muted = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 360px">
	<div style={body}>Profile</div>
	<Divider />
	<div style={muted}>Name, email and avatar.</div>
	<Divider label="Advanced" />
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center; height: 32px">
		<div style={body}>Left</div>
		<Divider orientation="vertical" />
		<div style={body}>Centre</div>
		<Divider orientation="vertical" />
		<div style={body}>Right</div>
	</div>
	<Divider label="Danger zone" />
	<div style={muted}>Deleting a workspace cannot be undone.</div>
</div>
\`\`\`

## GPUI notes

- The rule stretches across the parent's cross axis through \`align-self: stretch\`, so put it in a flex row or column.
- A labelled divider is three elements: two \`flex-grow\` lines around the label.`, demo: Divider_demo },
  { name: "Grid", category: "layout", description: "Equal-width column grid with a spacing gap between cells.", docs: `\`Grid\` lays its children out in a fixed number of equal columns.

\`\`\`svelte
<script>
  import Grid from 'gpuix-fractalsvelte-ui/Grid.svelte';
  import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
</script>

<Grid columns={3} gap="sm">
  {#each items as item}
    <Box bg="raised" radius="sm" padding="md">{item}</Box>
  {/each}
</Grid>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`children\` | \`Snippet\` | — |   |
| \`columns\` | \`1 \\| 2 \\| 3 \\| 4 \\| 5 \\| 6\` | \`2\` | Number of equal-width columns, 1 to 6 (fractalstyler's grid-N classes). |
| \`gap\` | \`'xs' \\| 'sm' \\| 'md' \\| 'bs' \\| 'lg' \\| 'xl' \\| number\` | \`'md'\` | Fractalstyler's gap steps, or px. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Grid from 'gpuix-fractalsvelte-ui/Grid.svelte';
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	const metrics = [
		{ label: 'Revenue', value: '$48.2k' },
		{ label: 'Users', value: '1,284' },
		{ label: 'Retention', value: '62%' },
		{ label: 'Latency', value: '84 ms' },
		{ label: 'Errors', value: '0.2%' },
		{ label: 'Uptime', value: '99.98%' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<Grid columns={3} gap="md">
		{#each metrics as m (m.label)}
			<Box bg="raised" padding="md" radius="md">
				<div style="font-size: var(--text-sm); color: var(--text-secondary)">{m.label}</div>
				<div style="font-size: var(--text-xl); font-weight: 600; color: var(--text-primary)">{m.value}</div>
			</Box>
		{/each}
	</Grid>
	<Grid columns={2} gap="sm">
		{#each ['Inbox', 'Drafts', 'Sent', 'Archive'] as name (name)}
			<Box bg="surface" padding="sm" border radius="sm">
				<div style="padding: 6px 8px; font-size: var(--text-md); color: var(--text-primary)">{name}</div>
			</Box>
		{/each}
	</Grid>
</div>
\`\`\`

## GPUI notes

- \`columns\` is written as a bare number into \`grid-template-columns\`. GPUI reads that as a count of equal tracks; it is not a standard CSS track list.`, demo: Grid_demo },
  { name: "ScrollArea", category: "layout", description: "Vertically scrolling column with a fixed height or a height cap, and a drawn scroll thumb.", docs: "`ScrollArea` wraps its children in a scrolling column. Set `height` for a fixed box or `maxHeight` to shrink to the content up to a cap.\n\n```svelte\n<script>\n  import ScrollArea from 'gpuix-fractalsvelte-ui/ScrollArea.svelte';\n</script>\n\n<ScrollArea maxHeight={160} gap={4}>\n  {#each rows as row}\n    <div>{row}</div>\n  {/each}\n</ScrollArea>\n\n<ScrollArea height={320}>\n  <div>Pinned panel content</div>\n</ScrollArea>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `children` | `Snippet` | — |   |\n| `height` | `number \\| null` | — | Fixed height in px. |\n| `maxHeight` | `number \\| null` | — | Height cap in px; the area shrinks to its content below the cap. |\n| `gap` | `number` | `8` | px between the content's direct children. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\nNone; the component takes its colours from the element it sits in.\n## Keyboard\n\nNone.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport ScrollArea from 'gpuix-fractalsvelte-ui/ScrollArea.svelte';\n\tconst rows = Array.from({ length: 20 }, (_, i) => i + 1);\n\tconst caption = 'font-size: var(--text-sm); color: var(--text-secondary); padding-bottom: 6px';\n\tconst frame = 'width: 200px; padding: 8px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)';\n\tconst line = 'font-size: var(--text-md); color: var(--text-primary)';\n</script>\n\n<div style=\"display: flex; flex-direction: row; gap: 16px; align-items: start\">\n\t<div>\n\t\t<div style={caption}>maxHeight 150</div>\n\t\t<ScrollArea maxHeight={150} gap={4} style={frame}>\n\t\t\t{#each rows as r (r)}<div style=\"height: 22px; {line}\">Message {r}</div>{/each}\n\t\t</ScrollArea>\n\t</div>\n\t<div>\n\t\t<div style={caption}>fixed height 150</div>\n\t\t<ScrollArea height={150} gap={4} style={frame}>\n\t\t\t{#each rows as r (r)}<div style=\"height: 22px; {line}\">Track {r}</div>{/each}\n\t\t</ScrollArea>\n\t</div>\n\t<div>\n\t\t<div style={caption}>short, shrinks to content</div>\n\t\t<ScrollArea maxHeight={150} gap={4} style={frame}>\n\t\t\t<div style=\"height: 22px; {line}\">Only item</div>\n\t\t\t<div style=\"height: 22px; {line}\">Second item</div>\n\t\t</ScrollArea>\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- GPUI paints no scrollbars, so the scroll thumb is drawn by the underlying `Scroller` and dragged on an overlay.\n- The thumb colours are translucent neutral greys set with `set_css_vars`. Those variables are global, so they apply to every scroll column in the window, not just this one.\n- `height` and `maxHeight` are written as inline px. Pass both and `height` is applied first, so `maxHeight` only caps it.", demo: ScrollArea_demo },
  { name: "Spacer", category: "layout", description: "Flexible empty box that takes up the free space in a row or column.", docs: `\`Spacer\` grows to fill the leftover space in its flex parent, pushing siblings apart.

\`\`\`svelte
<script>
  import Spacer from 'gpuix-fractalsvelte-ui/Spacer.svelte';
  import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
</script>

<Stack direction="row" align="center">
  <span>Title</span>
  <Spacer />
  <span>Actions</span>
</Stack>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

None.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Spacer from 'gpuix-fractalsvelte-ui/Spacer.svelte';
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	const title = 'font-size: var(--text-md); font-weight: 600; color: var(--text-primary)';
	const muted = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<Box bg="surface" border radius="md" padding="sm" style="flex-direction: row; gap: 8px; align-items: center">
		<div style="padding: 0 6px; {title}">Atlas</div>
		<Spacer />
		<Button label="Share" variant="ghost" size="h-md" />
		<Button label="Publish" size="h-md" />
	</Box>
	<Box bg="surface" border radius="md" padding="md" style="height: 200px; gap: 8px">
		<div style={title}>Invoice #1042</div>
		<div style={muted}>Issued 3 June · Due 17 June</div>
		<Spacer />
		<div style={muted}>Total due</div>
		<div style="font-size: var(--text-2xl); font-weight: 600; color: var(--text-primary)">$2,480.00</div>
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Spacer />
			<Button label="Pay now" size="h-md" />
		</div>
	</Box>
</div>
\`\`\`

## GPUI notes

- Sizing is \`flex-grow: 1\` only. It works inside a flex row or column, and does nothing in a parent without flex.
- Set a size through \`style\` to keep a minimum gap, since the spacer itself has no minimum.`, demo: Spacer_demo },
  { name: "SplitPane", category: "layout", description: "Two panes divided by a draggable, keyboard-nudgeable grip, side by side or stacked.", docs: "`SplitPane` puts `first` and `second` either side by side (`row`) or stacked (`column`), with a grip between them. Drag the grip, or focus it and press the arrow keys, to resize the first pane.\n\n```svelte\n<script>\n  import SplitPane from 'gpuix-fractalsvelte-ui/SplitPane.svelte';\n  let width = $state(240);\n</script>\n\n<div style=\"height: 400px; display: flex; flex-direction: column\">\n  <SplitPane initial={240} minFirst={120} minSecond={120} onresize={(s) => (width = s)}>\n    {#snippet first()}<div>Sidebar</div>{/snippet}\n    {#snippet second()}<div>Editor</div>{/snippet}\n  </SplitPane>\n</div>\n\n<SplitPane direction=\"column\" initial={160}>\n  {#snippet first()}<div>Top</div>{/snippet}\n  {#snippet second()}<div>Bottom</div>{/snippet}\n</SplitPane>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `first` | `Snippet` | — |   |\n| `second` | `Snippet` | — |   |\n| `direction` | `'row' \\| 'column'` | `'row'` | `row` puts the panes side by side; `column` stacks them. |\n| `initial` | `number` | `240` | First pane's size in px at mount. |\n| `minFirst` | `number` | `80` |   |\n| `minSecond` | `number` | `80` |   |\n| `onresize` | `(size: number) => void` | — | Called with the first pane's size in px while it is dragged or nudged with the arrow keys. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`border`, `ring`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Left / Right (`row`) | Move the divider 10 px while the grip is focused |\n| Up / Down (`column`) | Move the divider 10 px while the grip is focused |\n\nThe grip is focusable (Tab), and its line turns the ring colour while focused or dragged.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport SplitPane from 'gpuix-fractalsvelte-ui/SplitPane.svelte';\n\tconst files = ['index.ts', 'Button.svelte', 'Modal.svelte', 'tokens.ts', 'README.md'];\n\tconst caption = 'font-size: var(--text-sm); color: var(--text-secondary)';\n\tconst pane = 'display: flex; flex-direction: column; flex-grow: 1; background-color: var(--bg-surface); padding: 10px 12px; gap: 4px';\n\tlet width = $state(0);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t<div style=\"display: flex; flex-direction: column; height: 200px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)\">\n\t\t<SplitPane initial={180} minFirst={120} minSecond={160} onresize={(s) => (width = s)}>\n\t\t\t{#snippet first()}\n\t\t\t\t<div style=\"{pane}; background-color: var(--bg-raised)\">\n\t\t\t\t\t<div style=\"font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); padding-bottom: 4px\">FILES</div>\n\t\t\t\t\t{#each files as f (f)}<div style=\"font-size: var(--text-md); color: var(--text-primary)\">{f}</div>{/each}\n\t\t\t\t</div>\n\t\t\t{/snippet}\n\t\t\t{#snippet second()}\n\t\t\t\t<div style={pane}>\n\t\t\t\t\t<div style=\"font-size: var(--text-lg); font-weight: 600; color: var(--text-primary)\">Button.svelte</div>\n\t\t\t\t\t<div style={caption}>Drag the divider, or focus it and use the arrow keys.</div>\n\t\t\t\t</div>\n\t\t\t{/snippet}\n\t\t</SplitPane>\n\t</div>\n\t<div style=\"display: flex; flex-direction: column; height: 150px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)\">\n\t\t<SplitPane direction=\"column\" initial={70} minFirst={50} minSecond={50}>\n\t\t\t{#snippet first()}\n\t\t\t\t<div style=\"{pane}; background-color: var(--bg-raised)\"><div style=\"font-size: var(--text-md); color: var(--text-primary)\">Input</div></div>\n\t\t\t{/snippet}\n\t\t\t{#snippet second()}\n\t\t\t\t<div style={pane}><div style=\"font-size: var(--text-md); color: var(--text-primary)\">Output</div></div>\n\t\t\t{/snippet}\n\t\t</SplitPane>\n\t</div>\n\t<div style={caption}>Top pane width: {width || 180}px</div>\n</div>\n```\n\n## GPUI notes\n\n- GPUI does not capture the pointer. While dragging, an overlay covers the whole split so moves keep arriving, and a move with no button held ends the drag (the release landed elsewhere).\n- Sizes are clamped to the split's painted bounds, which GPUI reports after mount. Before that, only `minFirst` applies.\n- `initial` is read once, at mount. To set the size from outside, keep it in state and track it through `onresize`.", demo: SplitPane_demo },
  { name: "Stack", category: "layout", description: "Flex row or column with spacing, alignment, justification and optional wrapping.", docs: `\`Stack\` lays out its children in a flex row or column with a shared gap and padding. Use it instead of hand-writing flex styles.

\`\`\`svelte
<script>
  import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
</script>

<Stack gap="sm" padding="md">
  <div>First</div>
  <div>Second</div>
</Stack>

<Stack direction="row" align="center" justify="between" gap={12}>
  <span>Label</span>
  <span>Value</span>
</Stack>

<Stack direction="row" wrap gap="md" style="width: 240px">
  <div>Tag</div>
  <div>Tag</div>
</Stack>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`children\` | \`Snippet\` | — |   |
| \`direction\` | \`'row' \\| 'column'\` | \`'column'\` |   |
| \`gap\` | \`'xs' \\| 'sm' \\| 'md' \\| 'bs' \\| 'lg' \\| 'xl' \\| number\` | \`'sm'\` | Fractalstyler's gap steps, or px. |
| \`align\` | \`'start' \\| 'center' \\| 'end' \\| 'stretch'\` | \`'stretch'\` |   |
| \`justify\` | \`'start' \\| 'center' \\| 'end' \\| 'between' \\| 'around'\` | \`'start'\` |   |
| \`wrap\` | \`boolean\` | \`false\` |   |
| \`padding\` | \`'sm' \\| 'md' \\| 'lg' \\| number\` | — | Fractalstyler's padding steps, or px, on all four sides. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

None.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	const chip = 'font-size: var(--text-sm); color: var(--text-primary)';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const tags = ['Design', 'Svelte', 'GPUI', 'Rust', 'Motion', 'Tokens', 'Docs'];
	let justify = $state<'start' | 'center' | 'between'>('between');
</script>

<div style="display: flex; flex-direction: column; gap: 18px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Row, gap md, align center</div>
		<Stack direction="row" gap="md" align="center">
			{#each tags.slice(0, 3) as t (t)}
				<Box bg="raised" radius="sm" padding={6}><div style={chip}>{t}</div></Box>
			{/each}
		</Stack>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Row, justify {justify} (click to cycle)</div>
		<Stack direction="row" justify={justify} align="center" gap="sm" style="padding: 10px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
			<div style="font-size: var(--text-md); font-weight: 600; color: var(--text-primary)">Toolbar</div>
			<Button label="Cycle" variant="outline" size="h-md" onclick={() => (justify = justify === 'between' ? 'center' : justify === 'center' ? 'start' : 'between')} />
		</Stack>
	</div>
	<div style="display: flex; flex-direction: row; gap: 24px; align-items: start">
		<div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1">
			<div style={caption}>Column, gap sm</div>
			<Stack direction="column" gap="sm">
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step one</div></Box>
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step two</div></Box>
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step three</div></Box>
			</Stack>
		</div>
		<div style="display: flex; flex-direction: column; gap: 8px; width: 200px">
			<div style={caption}>Wrap in 200px</div>
			<Stack direction="row" wrap gap="sm">
				{#each tags as t (t)}
					<Box bg="raised" radius="sm" padding={6}><div style={chip}>{t}</div></Box>
				{/each}
			</Stack>
		</div>
	</div>
</div>
\`\`\`

## GPUI notes

- Gap and padding are written as inline px, so \`style\` can override them by appearing later in the same declaration list.
- \`align\` and \`justify\` map to class names (\`al-*\`, \`jc-*\`) rather than inline styles.`, demo: Stack_demo },
  { name: "Breadcrumbs", category: "navigation", description: "Trail of ancestor pages, with the last item marked as the current page.", docs: "`Breadcrumbs` shows where you are. Items with an `onclick` are links; the last item is the current page and is never a link.\n\n```svelte\n<script>\n  import Breadcrumbs from 'gpuix-fractalsvelte-ui/Breadcrumbs.svelte';\n</script>\n\n<Breadcrumbs\n  items={[\n    { label: 'Home', onclick: goHome },\n    { label: 'Projects', onclick: goProjects },\n    { label: 'Fractal' }\n  ]}\n/>\n<Breadcrumbs size=\"sm\" separator=\"›\" items={[{ label: 'Settings' }, { label: 'Billing' }]} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `items` | `{ label: string; onclick?: () => void }[]` | — | Ancestors with an `onclick` are links; the last item is the current page. |\n| `separator` | `string` | `'/'` |   |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Fractalstyler's text sizes. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `radius-sm`, `ring`, `text-lg`, `text-md`, `text-muted`, `text-primary`, `text-secondary`, `text-sm`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Tab | Moves between links |\n| Enter, Space | Runs the focused link's `onclick` |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Breadcrumbs from 'gpuix-fractalsvelte-ui/Breadcrumbs.svelte';\n\tlet visited = $state('none');\n\tconst go = (name: string) => () => (visited = name);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 16px; align-items: start\">\n\t<Breadcrumbs\n\t\titems={[\n\t\t\t{ label: 'Workspace', onclick: go('Workspace') },\n\t\t\t{ label: 'Projects', onclick: go('Projects') },\n\t\t\t{ label: 'Fractal UI' }\n\t\t]}\n\t/>\n\t<Breadcrumbs\n\t\tsize=\"sm\"\n\t\tseparator=\"›\"\n\t\titems={[{ label: 'Settings', onclick: go('Settings') }, { label: 'Keyboard' }]}\n\t/>\n\t<Breadcrumbs\n\t\tsize=\"lg\"\n\t\tseparator=\"→\"\n\t\titems={[{ label: 'Docs', onclick: go('Docs') }, { label: 'Components' }]}\n\t/>\n\t<div style=\"color: var(--text-secondary)\">last visited: {visited}</div>\n</div>\n```\n\n## GPUI notes\n\n- Links are focusable only when they have an `onclick`, so the current page is skipped by Tab.\n- Don't name a class `link`: this renderer treats it as a reserved name and paints the text green.", demo: Breadcrumbs_demo },
  { name: "Menu", category: "navigation", description: "Dropdown of actions anchored to a trigger, with shortcuts, variants, disabled items and separators.", docs: `\`Menu\` opens a panel of actions beside its trigger, using \`Popover\`. The parent owns \`open\` and handles \`onopenchange\`. Selecting an item runs its \`onselect\` and closes the menu.

\`\`\`svelte
<script>
  import Menu from 'gpuix-fractalsvelte-ui/Menu.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Menu
  {open}
  onopenchange={(o) => (open = o)}
  items={[
    { label: 'Rename', shortcut: '⌘R', onselect: rename },
    { label: 'Duplicate', shortcut: '⌘D', onselect: duplicate },
    { separator: true },
    { label: 'Archive', disabled: true, onselect: archive },
    { label: 'Delete', variant: 'danger', onselect: remove }
  ]}
>
  {#snippet trigger()}<Button label="Actions" size="h-sm" />{/snippet}
</Menu>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`items\` | \`Entry[]\` | — |   |
| \`trigger\` | \`Snippet\` | — | The trigger's content. Keep it free of its own \`onclick\`, or the trigger's click never reaches the menu. |
| \`open\` | \`boolean\` | \`false\` |   |
| \`onopenchange\` | \`(open: boolean) => void\` | — |   |
| \`side\` | \`'top' \\| 'bottom'\` | \`'bottom'\` |   |
| \`align\` | \`'start' \\| 'center' \\| 'end'\` | \`'start'\` |   |
| \`style\` | \`string \\| null\` | — | Inline CSS for the panel, e.g. \`min-width: 220px\`. |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

\`bg-raised\`, \`border\`, \`danger\`, \`danger-soft\`, \`font-mono\`, \`info\`, \`radius-md\`, \`radius-sm\`, \`ring\`, \`success\`, \`text-md\`, \`text-muted\`, \`text-primary\`, \`text-xs\`, \`theme-color\`, \`warning\`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space, Down | On the focused trigger: open the menu, with the first item highlighted |
| Down, Up | Move the highlight; skips separators and disabled items, and wraps |
| Enter | Pick the highlighted item |
| Escape | Close without picking |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Menu from 'gpuix-fractalsvelte-ui/Menu.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let open = $state(false);
	let picked = $state('nothing');
	const pick = (name: string) => () => (picked = name);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 24px; align-items: start">
		<Menu
			{open}
			onopenchange={(o) => (open = o)}
			style="min-width: 220px"
			items={[
				{ label: 'Rename', shortcut: '⌘R', onselect: pick('Rename') },
				{ label: 'Duplicate', shortcut: '⌘D', onselect: pick('Duplicate') },
				{ label: 'Share…', onselect: pick('Share') },
				{ separator: true },
				{ label: 'Archive', disabled: true, onselect: pick('Archive') },
				{ label: 'Delete', shortcut: '⌫', variant: 'danger', onselect: pick('Delete') }
			]}
		>
			{#snippet trigger()}<Button label="Actions" variant="outline" />{/snippet}
		</Menu>
		<Menu side="top" items={[{ label: 'Above the trigger', onselect: pick('Above') }]}>
			{#snippet trigger()}<Button label="Open upward" variant="outline" />{/snippet}
		</Menu>
		<div style="color: var(--text-secondary); padding-top: 8px">picked: {picked}</div>
	</div>
</div>
\`\`\`

## GPUI notes

- The trigger must not carry its own \`onclick\`; a child's click handler would stop the trigger's click from reaching the menu. A \`Button\` with no \`onclick\` works.
- The panel is styled inline, because the \`Popover\` panel otherwise reads its colours from \`--popover-*\` variables that this library does not set.
- Highlight follows the pointer as well as the arrow keys.`, demo: Menu_demo },
  { name: "NavList", category: "navigation", description: "Vertical sidebar list with section headings, optional icons and badges.", docs: "`NavList` is a sidebar of sections and items. The parent owns `value` and handles `onchange`. An item can carry an `icon` snippet and a short `badge` text.\n\n```svelte\n<script>\n  import NavList from 'gpuix-fractalsvelte-ui/NavList.svelte';\n  let value = $state('inbox');\n  const sections = [\n    { title: 'Mail', items: [\n      { id: 'inbox', label: 'Inbox', badge: '12' },\n      { id: 'drafts', label: 'Drafts' }\n    ] },\n    { title: 'Account', items: [\n      { id: 'billing', label: 'Billing', disabled: true }\n    ] }\n  ];\n</script>\n\n<NavList {sections} {value} onchange={(id) => (value = id)} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `sections` | `{ title?: string; items: Item[] }[]` | — |   |\n| `value` | `string` | — | The active item's id. |\n| `onchange` | `(id: string) => void` | — |   |\n| `size` | `'h-md' \\| 'h-lg' \\| 'h-xl'` | `'h-lg'` | Fractalstyler's height steps for each item. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `radius-full`, `radius-md`, `ring`, `text-muted`, `text-primary`, `text-secondary`, `text-xs`, `theme-color`, `theme-color-sub`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Up, Down | Select and focus the previous or next enabled item; wraps at the ends |\n| Enter, Space | Select the focused item |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport NavList from 'gpuix-fractalsvelte-ui/NavList.svelte';\n\tlet value = $state('inbox');\n\tconst sections = [\n\t\t{\n\t\t\ttitle: 'Mail',\n\t\t\titems: [\n\t\t\t\t{ id: 'inbox', label: 'Inbox', badge: '12', icon: inbox },\n\t\t\t\t{ id: 'drafts', label: 'Drafts', badge: '2' },\n\t\t\t\t{ id: 'starred', label: 'Starred' }\n\t\t\t]\n\t\t},\n\t\t{\n\t\t\ttitle: 'Account',\n\t\t\titems: [\n\t\t\t\t{ id: 'general', label: 'General', icon: gear },\n\t\t\t\t{ id: 'billing', label: 'Billing', disabled: true }\n\t\t\t]\n\t\t}\n\t];\n</script>\n\n{#snippet inbox()}<text>✉</text>{/snippet}\n{#snippet gear()}<text>⚙</text>{/snippet}\n\n<div style=\"display: flex; flex-direction: row; gap: 32px\">\n\t<div style=\"width: 220px\"><NavList {sections} {value} onchange={(id) => (value = id)} /></div>\n\t<div style=\"width: 180px\"><NavList {sections} value=\"general\" size=\"h-md\" /></div>\n</div>\n```\n\n## GPUI notes\n\n- Icon snippets inherit the row's colour, so a `<text>` glyph follows the active accent.\n- Like `Tabs`, focus moves with `focus_element`, which only a live window honours. Headless tests call `focus()` for the same step.", demo: NavList_demo },
  { name: "Pagination", category: "navigation", description: "Page controls with previous and next buttons and a windowed run of page numbers around the current page.", docs: "`Pagination` shows page numbers around the current page, with ellipses for the gaps. The parent owns `page` and handles `onchange`.\n\n```svelte\n<script>\n  import Pagination from 'gpuix-fractalsvelte-ui/Pagination.svelte';\n  let page = $state(1);\n</script>\n\n<Pagination {page} total={24} onchange={(p) => (page = p)} />\n<Pagination {page} total={5} siblings={2} size=\"h-sm\" onchange={(p) => (page = p)} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `page` | `number` | — | The current page, from 1. |\n| `total` | `number` | — |   |\n| `siblings` | `number` | `1` | Pages shown either side of the current one. |\n| `onchange` | `(page: number) => void` | — |   |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-md'` | Fractalstyler's height steps for the buttons. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`text-muted`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Tab | Moves between the controls |\n| Enter, Space | Goes to the focused page, or to previous or next |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Pagination from 'gpuix-fractalsvelte-ui/Pagination.svelte';\n\tlet page = $state(1);\n\tlet wide = $state(7);\n\tlet small = $state(2);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 16px; align-items: start\">\n\t<Pagination {page} total={24} onchange={(p) => (page = p)} />\n\t<Pagination page={wide} total={24} siblings={2} onchange={(p) => (wide = p)} />\n\t<Pagination page={small} total={5} size=\"h-sm\" onchange={(p) => (small = p)} />\n\t<Pagination page={3} total={3} size=\"h-lg\" />\n\t<div style=\"color: var(--text-secondary)\">page {page}</div>\n</div>\n```\n\n## GPUI notes\n\n- Built from `Button`, so the controls share its focus ring and disabled behaviour.\n- Page buttons get a minimum width matching the height, so one-digit and two-digit pages line up.", demo: Pagination_demo },
  { name: "Tabs", category: "navigation", description: "Switch between sibling views with an underline or a segmented pill control.", docs: "`Tabs` shows one panel at a time. The parent owns `value` and handles `onchange`; the optional `children` snippet receives the active id and renders the panel below.\n\n```svelte\n<script>\n  import Tabs from 'gpuix-fractalsvelte-ui/Tabs.svelte';\n  let value = $state('overview');\n  const items = [\n    { id: 'overview', label: 'Overview' },\n    { id: 'activity', label: 'Activity' },\n    { id: 'billing', label: 'Billing', disabled: true }\n  ];\n</script>\n\n<Tabs {items} {value} onchange={(id) => (value = id)}>\n  {#snippet children(id)}<div>Showing {id}</div>{/snippet}\n</Tabs>\n<Tabs {items} {value} variant=\"pill\" size=\"h-md\" onchange={(id) => (value = id)} />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `items` | `{ id: string; label: string; disabled?: boolean }[]` | — |   |\n| `value` | `string` | — | The active tab's id. |\n| `onchange` | `(id: string) => void` | — |   |\n| `variant` | `'line' \\| 'pill'` | `'line'` | `line` underlines the active tab; `pill` is a segmented control. |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg' \\| 'h-xl'` | `'h-bs'` | Fractalstyler's height steps for each tab. |\n| `children` | `Snippet<[string]>` | — | The panel under the tabs, given the active id. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `bg-surface`, `border`, `radius-md`, `ring`, `text-primary`, `text-secondary`, `theme-color`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Left, Right | Select and focus the previous or next enabled tab; wraps at the ends |\n| Enter, Space | Select the focused tab |\n\nOnly the active tab is in the tab order, so Tab moves past the whole row.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Tabs from 'gpuix-fractalsvelte-ui/Tabs.svelte';\n\tlet line = $state('overview');\n\tlet pill = $state('day');\n\tlet small = $state('code');\n\tconst items = [\n\t\t{ id: 'overview', label: 'Overview' },\n\t\t{ id: 'activity', label: 'Activity' },\n\t\t{ id: 'billing', label: 'Billing', disabled: true },\n\t\t{ id: 'settings', label: 'Settings' }\n\t];\n\tconst periods = [\n\t\t{ id: 'day', label: 'Day' },\n\t\t{ id: 'week', label: 'Week' },\n\t\t{ id: 'month', label: 'Month' }\n\t];\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 24px; width: 420px\">\n\t<Tabs {items} value={line} onchange={(id) => (line = id)}>\n\t\t{#snippet children(id)}<div style=\"color: var(--text-secondary)\">Showing {id}.</div>{/snippet}\n\t</Tabs>\n\t<div style=\"display: flex; flex-direction: row; gap: 16px; align-items: center\">\n\t\t<Tabs items={periods} value={pill} variant=\"pill\" onchange={(id) => (pill = id)} />\n\t\t<Tabs items={periods} value={small} variant=\"pill\" size=\"h-md\" onchange={(id) => (small = id)} />\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- The focus ring is a border colour change, since GPUI has no outline.\n- The line underline is a 2 px child bar, because GPUI cannot set a single border side's colour.\n- Disabled tabs drop their hover rule rather than overriding it, using the `rest` class.", demo: Tabs_demo },
  { name: "ContextMenu", category: "overlays", description: "Wraps a region and opens a menu of actions on right click or ctrl+click.", docs: "`ContextMenu` wraps any region. A right click, or ctrl+click on macOS, opens a menu at the pointer. The menu is drawn through `Portal` and closes on choice, scrim click, right click or Escape.\n\n```svelte\n<script>\n  import ContextMenu, { type MenuEntry } from 'gpuix-fractalsvelte-ui/ContextMenu.svelte';\n\n  const items: MenuEntry[] = [\n    { label: 'Copy', onselect: copy },\n    { label: 'Paste', onselect: paste },\n    { separator: true },\n    { label: 'Delete', danger: true, onselect: remove }\n  ];\n</script>\n\n<ContextMenu {items}>\n  <div>Right-click here</div>\n</ContextMenu>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `items` | `MenuEntry[]` | — |   |\n| `children` | `Snippet` | — | The region that opens the menu on a right click, or ctrl+click on macOS. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `bg-sunken`, `border`, `danger`, `radius-md`, `radius-sm`, `text-md`, `text-muted`, `text-primary`\n## Keyboard\n\nHandled while the menu is open. Keys are read window-wide, so focus does not matter.\n\n| Key | Action |\n| --- | --- |\n| Down, Up | Move the highlight, skipping separators and disabled items |\n| Enter | Choose the highlighted item |\n| Escape | Close without choosing |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport ContextMenu, { type MenuEntry } from 'gpuix-fractalsvelte-ui/ContextMenu.svelte';\n\tlet last = $state('none');\n\tconst pick = (name: string) => () => (last = name);\n\tconst items: MenuEntry[] = [\n\t\t{ label: 'Cut', onselect: pick('Cut') },\n\t\t{ label: 'Copy', onselect: pick('Copy') },\n\t\t{ label: 'Paste', onselect: pick('Paste') },\n\t\t{ separator: true },\n\t\t{ label: 'Rename', onselect: pick('Rename') },\n\t\t{ label: 'Duplicate', disabled: true, onselect: pick('Duplicate') },\n\t\t{ separator: true },\n\t\t{ label: 'Delete', danger: true, onselect: pick('Delete') }\n\t];\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t<ContextMenu\n\t\t{items}\n\t\tstyle=\"height: 150px; align-items: center; justify-content: center; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg)\"\n\t>\n\t\t<div style=\"font-size: var(--text-md); color: var(--text-primary)\">Right-click anywhere in this panel</div>\n\t</ContextMenu>\n\t<div style=\"font-size: var(--text-sm); color: var(--text-secondary)\">last action: {last}</div>\n</div>\n```\n\n## GPUI notes\n\n- The menu's position is read once, when it opens, from the window size, and clamped so it stays inside the window. The window is assumed not to resize while it is open.\n- Right click arrives as `onauxclick` and is checked with `e.isRightClick`. ctrl+click arrives as an ordinary `onclick` with `e.modifiers.ctrl`.\n- The region has `hitbox=\"self\"`, so clicks on its children still open the menu.\n- The menu has its own empty `onclick`, so clicks on it don't reach the scrim and close it.", demo: ContextMenu_demo },
  { name: "Drawer", category: "overlays", description: "Panel that slides in from the left, right or bottom over a scrim, with title, body and footer.", docs: "`Drawer` renders through `Portal` and slides its panel in from an edge. The parent owns `open`; the drawer only asks to close through `onclose`.\n\n```svelte\n<script>\n  import Drawer from 'gpuix-fractalsvelte-ui/Drawer.svelte';\n  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';\n  let open = $state(false);\n</script>\n\n<Button label=\"Settings\" onclick={() => (open = true)} />\n<Drawer {open} side=\"right\" size=\"sm\" title=\"Settings\" onclose={() => (open = false)}>\n  Settings body.\n  {#snippet footer()}\n    <Button label=\"Apply\" onclick={apply} />\n  {/snippet}\n</Drawer>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `open` | `boolean` | `false` |   |\n| `onclose` | `() => void` | — | Called on scrim click, Escape or the ✕ button; the parent sets `open = false`. |\n| `side` | `'left' \\| 'right' \\| 'bottom'` | `'right'` | The edge the panel slides in from. |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Width for `left` and `right`, height for `bottom`. |\n| `title` | `string` | `''` |   |\n| `dismissable` | `boolean` | `true` | `false` ignores scrim clicks and Escape. |\n| `children` | `Snippet` | — |   |\n| `footer` | `Snippet` | — | Action row, right-aligned. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-extra`, `bg-raised`, `bg-sunken`, `bg-surface`, `border`, `radius-sm`, `text-lg`, `text-primary`, `text-secondary`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Escape | Close, while open and `dismissable` |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Button from 'gpuix-fractalsvelte-ui/Button.svelte';\n\timport Drawer from 'gpuix-fractalsvelte-ui/Drawer.svelte';\n\ttype Side = 'left' | 'right' | 'bottom';\n\tlet open = $state(false);\n\tlet locked = $state(false);\n\tlet side = $state<Side>('right');\n\tlet size = $state<'sm' | 'md' | 'lg'>('sm');\n\tlet applied = $state(0);\n\tconst show = (s: Side) => {\n\t\tside = s;\n\t\topen = true;\n\t};\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Button label=\"Left\" variant=\"outline\" onclick={() => show('left')} />\n\t\t<Button label=\"Right\" onclick={() => show('right')} />\n\t\t<Button label=\"Bottom\" variant=\"outline\" onclick={() => show('bottom')} />\n\t\t<Button label=\"Locked\" variant=\"outline\" onclick={() => (locked = true)} />\n\t\t<div style=\"flex-grow: 1\"></div>\n\t\t<div style=\"font-size: var(--text-sm); color: var(--text-secondary)\">applied {applied}×</div>\n\t</div>\n\t<div style=\"font-size: var(--text-sm); color: var(--text-secondary)\">Size for left and right drawers: sm, md, lg. Escape or a scrim click closes.</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px\">\n\t\t{#each ['sm', 'md', 'lg'] as const as s}\n\t\t\t<Button label={s} size=\"h-md\" variant={size === s ? 'primary' : 'outline'} onclick={() => (size = s)} />\n\t\t{/each}\n\t</div>\n\t<Drawer open={locked} side=\"left\" size=\"sm\" title=\"Locked\" dismissable={false} onclose={() => (locked = false)}>\n\t\tEscape and the scrim do nothing here.\n\t\t{#snippet footer()}<Button label=\"Close\" onclick={() => (locked = false)} />{/snippet}\n\t</Drawer>\n\t<Drawer {open} {side} {size} title=\"Settings\" onclose={() => (open = false)}>\n\t\t<div style=\"font-size: var(--text-md); color: var(--text-primary)\">Workspace</div>\n\t\t<div>Choose the defaults used for new projects, including the theme, font size and autosave interval.</div>\n\t\t<div>Changes apply to every window once you press Apply.</div>\n\t\t{#snippet footer()}\n\t\t\t<Button label=\"Cancel\" variant=\"ghost\" onclick={() => (open = false)} />\n\t\t\t<Button label=\"Apply\" onclick={() => { applied++; open = false; }} />\n\t\t{/snippet}\n\t</Drawer>\n</div>\n```\n\n## GPUI notes\n\n- The Escape listener is registered only while the drawer is open and dismissable.\n- The scrim fades in and the panel slides in through `motion`. Durations are 0.2 s.\n- The panel has an empty `onclick`, so clicks inside it don't reach the scrim.\n- `style` is appended after the size's width or height, so it can override them.", demo: Drawer_demo },
  { name: "Modal", category: "overlays", description: "Centred dialog over a scrim, with title, body and footer actions.", docs: `\`Modal\` renders through \`Portal\`, so it paints over everything wherever you place it. The parent owns \`open\`; the modal only asks to close through \`onclose\`.

\`\`\`svelte
<script>
  import Modal from 'gpuix-fractalsvelte-ui/Modal.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Button label="Delete" variant="danger" onclick={() => (open = true)} />
<Modal {open} onclose={() => (open = false)} title="Delete file?" size="sm">
  This cannot be undone.
  {#snippet footer()}
    <Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
    <Button label="Delete" variant="danger" onclick={remove} />
  {/snippet}
</Modal>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`open\` | \`boolean\` | \`false\` |   |
| \`onclose\` | \`() => void\` | — | Called on scrim click, Escape or the close button; the parent sets \`open = false\`. |
| \`title\` | \`string\` | \`''\` |   |
| \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Dialog width: sm 360, md 480, lg 640. |
| \`dismissable\` | \`boolean\` | \`true\` | \`false\` ignores scrim clicks and Escape. |
| \`children\` | \`Snippet\` | — |   |
| \`footer\` | \`Snippet\` | — | Action row, right-aligned. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

\`bg-extra\`, \`bg-raised\`, \`bg-sunken\`, \`bg-surface\`, \`border\`, \`radius-lg\`, \`radius-sm\`, \`text-lg\`, \`text-primary\`, \`text-secondary\`
## Keyboard

| Key | Action |
| --- | --- |
| Escape | Close (when \`dismissable\`) |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Modal from 'gpuix-fractalsvelte-ui/Modal.svelte';
	let open = $state(false);
	let small = $state(false);
</script>

<div style="display: flex; flex-direction: row">
	<Button label="Open modal" onclick={() => (open = true)} />
	<Button label="Small, not dismissable" variant="outline" onclick={() => (small = true)} />
</div>
<Modal {open} onclose={() => (open = false)} title="Publish changes?">
	Your edits will be visible to everyone with access.
	{#snippet footer()}
		<Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
		<Button label="Publish" onclick={() => (open = false)} />
	{/snippet}
</Modal>
<Modal open={small} onclose={() => (small = false)} title="Locked" size="sm" dismissable={false}>
	Escape and the scrim do nothing here.
	{#snippet footer()}
		<Button label="Close" onclick={() => (small = false)} />
	{/snippet}
</Modal>
\`\`\`

## GPUI notes

- A dialog needs an \`onclick\` of its own so clicks inside it don't reach the scrim; the component handles this.
- There is no enter/exit animation yet.`, demo: Modal_demo },
  { name: "Popover", category: "overlays", description: "Floating panel anchored to a trigger, or to window coordinates, that closes on outside press or Escape.", docs: `\`Popover\` shows \`content\` beside its trigger while \`open\` is true. The parent owns \`open\`; the popover only asks to close through \`onclose\`. The trigger's own click handler toggles \`open\`, because presses on the trigger are not treated as outside presses.

\`\`\`svelte
<script>
  import Popover from 'gpuix-fractalsvelte-ui/Popover.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
  let picked = $state('none');
  const choose = (name: string) => { picked = name; open = false; };
</script>

<Popover {open} onclose={() => (open = false)} side="bottom" align="start">
  <Button label="Menu" variant="outline" onclick={() => (open = !open)} />
  {#snippet content()}
    <div onclick={() => choose('Rename')}>Rename</div>
    <div onclick={() => choose('Duplicate')}>Duplicate</div>
  {/snippet}
</Popover>

<div>picked: {picked}</div>
\`\`\`

Pass \`position={{ x, y }}\` (window coordinates) instead of a trigger to hang the panel at a point, such as the pointer.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`open\` | \`boolean\` | — |   |
| \`onclose\` | \`() => void\` | — | A press outside the panel and its trigger, or Escape. |
| \`children\` | \`Snippet\` | — | The trigger; it toggles \`open\` itself. |
| \`content\` | \`Snippet\` | — |   |
| \`side\` | \`'top' \\| 'right' \\| 'bottom' \\| 'left'\` | \`'bottom'\` |   |
| \`align\` | \`'start' \\| 'center' \\| 'end'\` | \`'start'\` |   |
| \`gap\` | \`number\` | \`4\` |   |
| \`position\` | \`{ x: number; y: number } \\| null\` | — | Window coordinates to hang from instead of the trigger. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

| Key | Action |
| --- | --- |
| Escape | Calls \`onclose\` while open (listened window-wide only while open) |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Popover from 'gpuix-fractalsvelte-ui/Popover.svelte';
	let which = $state<'actions' | 'share' | 'sort' | null>(null);
	let last = $state('none');
	let pinned = $state<{ x: number; y: number } | null>(null);
	const choose = (name: string) => {
		last = name;
		which = null;
	};
	const row = 'padding: 6px 10px; border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--text-md)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={which === 'actions'} onclose={() => (which = null)}>
			<Button label="Actions" variant="outline" onclick={() => (which = which === 'actions' ? null : 'actions')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Rename')}>Rename</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Duplicate')}>Duplicate</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Move to…')}>Move to…</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'share'} onclose={() => (which = null)} side="right" align="start">
			<Button label="Share" variant="themed" onclick={() => (which = which === 'share' ? null : 'share')} />
			{#snippet content()}
				<div style="display: flex; flex-direction: column; gap: 8px; padding: 6px; width: 200px">
					<div style="font-size: var(--text-md); font-weight: 600; color: var(--text-primary)">Share link</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary)">Anyone with the link can view.</div>
					<Button label="Copy link" size="h-md" full onclick={() => choose('Copied link')} />
				</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'sort'} onclose={() => (which = null)} side="top" align="end">
			<Button label="Sort" variant="secondary" onclick={() => (which = which === 'sort' ? null : 'sort')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Name')}>Name</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Date modified')}>Date modified</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Size')}>Size</div>
			{/snippet}
		</Popover>
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={pinned !== null} onclose={() => (pinned = null)} position={pinned}>
			<Button label="Panel at the pointer" variant="secondary" onclick={(e) => (pinned = pinned ? null : { x: e.x ?? 0, y: e.y ?? 0 })} />
			{#snippet content()}<div style={row} onclick={() => choose('Pinned item')}>Pinned at the click</div>{/snippet}
		</Popover>
	</div>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">last choice: {last}</div>
</div>
\`\`\`

## GPUI notes

- The panel is a fixed 1px border, 4px padding and 160px minimum width. Override width or padding through \`style\`.
- Outside-press detection uses the trigger's painted bounds, so a press on the trigger reaches its own click handler rather than closing the panel first.
- Use \`position\` for a menu opened at the pointer, with no trigger element to anchor to.`, demo: Popover_demo },
  { name: "Toast", category: "overlays", description: "Stacked notifications shown bottom-right, raised with the toast() function and dismissed by timer or close button.", docs: `\`Toast\` renders the notification stack for the \`toast()\` queue. Mount one \`Toast\` once in the app, then call \`toast()\` from anywhere. The queue is module-level state, so every call shows in that one stack.

\`\`\`svelte
<script>
  import Toast from 'gpuix-fractalsvelte-ui/Toast.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  import { toast } from 'gpuix-fractalsvelte-ui/toast.svelte.ts';
</script>

<Button label="Save" onclick={() => toast('Project saved', { title: 'Saved', variant: 'success' })} />
<Button label="Upload" variant="danger" onclick={() => toast('Upload failed', { variant: 'danger', duration: 0 })} />

<Toast />
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`style\` | \`string \\| null\` | — | Inline CSS for the stack, which sits bottom-right by default. |
| \`testid\` | \`string \\| null\` | — |   |
## toast()

\`toast(message, options)\` adds a toast and returns its numeric id. \`dismiss(id)\` removes one early. Both come from \`gpuix-fractalsvelte-ui/toast.svelte.ts\`, not \`Toast.svelte\`.

| Argument / option | Type | Default | Notes |
| --- | --- | --- | --- |
| \`message\` | \`string\` | — | Required. Body text. |
| \`title\` | \`string\` | \`''\` | Bold line above the message. Omitted when empty. |
| \`variant\` | \`'secondary' \\| 'themed' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'\` | \`'secondary'\` | Colour of the left bar. |
| \`duration\` | \`number\` | \`4000\` | Milliseconds until it dismisses itself. \`0\` keeps it until closed. |

\`dismiss(id: number)\` clears the toast's timer and removes it. Closing a toast from its ✕ button does the same.

\`toasts\` is the reactive array behind the stack, exported from the same module if you need to read the queue.

## Tokens

\`bg-raised\`, \`bg-sunken\`, \`border\`, \`border-strong\`, \`danger\`, \`info\`, \`radius-md\`, \`radius-sm\`, \`success\`, \`text-md\`, \`text-primary\`, \`text-secondary\`, \`text-sm\`, \`theme-color\`, \`warning\`
## Keyboard

None. The ✕ button is a pointer target only.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Toast from 'gpuix-fractalsvelte-ui/Toast.svelte';
	import { toast, toasts, dismiss } from 'gpuix-fractalsvelte-ui/toast.svelte.ts';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Accent" variant="themed" onclick={() => toast('A new version is ready to install.', { title: 'Update', variant: 'themed' })} />
		<Button label="Neutral" variant="secondary" onclick={() => toast('Changes are saved to this device.', { title: 'Saved' })} />
		<Button label="Success" variant="success" onclick={() => toast('Your export finished in 4 seconds.', { title: 'Export complete', variant: 'success' })} />
		<Button label="Warn" variant="warning" onclick={() => toast('Storage is 90% full.', { title: 'Heads up', variant: 'warning' })} />
		<Button label="Danger" variant="danger" onclick={() => toast('The upload stopped. Check your connection.', { title: 'Upload failed', variant: 'danger', duration: 0 })} />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Clear all" variant="ghost" size="h-md" onclick={() => toasts.forEach((t) => dismiss(t.id))} />
		<div style="font-size: var(--text-sm); color: var(--text-secondary)">{toasts.length} showing · the danger toast stays until closed</div>
	</div>
	<Toast />
</div>
\`\`\`

## GPUI notes

- The stack is 320px wide and sits 16px from the bottom-right corner of the window. It renders through \`Portal\`, so placement in the tree does not matter.
- Toasts fade in over 0.2s on mount. There is no fade-out, so a dismissed toast disappears at once.
- Timers run in the JavaScript side. A \`duration: 0\` toast will sit in the stack until its ✕ is pressed or \`dismiss\` is called.`, demo: Toast_demo },
  { name: "Tooltip", category: "overlays", description: "Short hover hint beside a trigger, shown after a delay and hidden when the pointer leaves.", docs: `\`Tooltip\` shows \`content\` next to its trigger after the pointer has rested on it for \`delay\` milliseconds. The trigger is a snippet that receives hover handlers, which it must spread onto its element so hover is tracked.

\`\`\`svelte
<script>
  import Tooltip from 'gpuix-fractalsvelte-ui/Tooltip.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Tooltip content="Save (cmd-s)" side="bottom">
  {#snippet children(hover)}
    <div {...hover}>Save</div>
  {/snippet}
</Tooltip>

<Tooltip content="Delete" open={confirming}>
  {#snippet children(hover)}
    <div {...hover}><Button label="Delete" variant="danger" /></div>
  {/snippet}
</Tooltip>
\`\`\`

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| \`children\` | \`Snippet<[{ onmouseenter: () => void; onmouseleave: () => void }]>\` | — | The trigger; spread the handlers it receives onto it so hover still works. |
| \`content\` | \`string \\| Snippet\` | — |   |
| \`side\` | \`'top' \\| 'right' \\| 'bottom' \\| 'left'\` | \`'top'\` |   |
| \`align\` | \`'start' \\| 'center' \\| 'end'\` | \`'center'\` |   |
| \`gap\` | \`number\` | \`6\` |   |
| \`delay\` | \`number\` | \`300\` | ms of hover before the tip shows. |
| \`open\` | \`boolean \\| null\` | — | Forces the tip shown or hidden; \`null\` leaves it to hover. |
| \`style\` | \`string \\| null\` | — |   |
| \`testid\` | \`string \\| null\` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

None.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

\`\`\`svelte
<script lang="ts">
	import Tooltip from 'gpuix-fractalsvelte-ui/Tooltip.svelte';
	const trigger = 'padding: 6px 12px; border-radius: var(--radius-sm); background-color: var(--bg-raised); color: var(--text-primary); font-size: var(--text-md)';
	const hover = 'background-color: var(--border)';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 24px; padding-top: 44px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: center">
		{#each ['top', 'right', 'bottom', 'left'] as const as side}
			<Tooltip content={\`Shown on the \${side}\`} {side} delay={150}>
				{#snippet children(h)}
					<div {...h} style={trigger} {hover}>{side}</div>
				{/snippet}
			</Tooltip>
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Tooltip content="Save (⌘S)" delay={150}>
			{#snippet children(h)}
				<div {...h} style={trigger} {hover}>Save</div>
			{/snippet}
		</Tooltip>
		<Tooltip content="Forced open" open={true} side="bottom">
			{#snippet children(h)}
				<div {...h} style={trigger} {hover}>Pinned</div>
			{/snippet}
		</Tooltip>
		<div style={caption}>Hover the buttons. "Pinned" is forced open.</div>
	</div>
</div>
\`\`\`

## GPUI notes

- A trigger with its own listener would cover the wrapper's hover, so the trigger must receive the handlers and spread them itself.
- Hover is tracked per source (wrapper, trigger, tip). Leaving the trigger hides the tip after an 80 ms grace period, which lets the pointer cross the gap onto the tip.
- The tip hangs from explicit corners rather than GPUI's \`align: center\`, which lands half a layer off.
- Clicks on the trigger still reach its own handlers, since the tip is only hover-driven.`, demo: Tooltip_demo },
  { name: "Alert", category: "feedback", description: "Inline status message with a variant, optional title and a dismiss control.", docs: "`Alert` shows a message in a tinted box with a coloured dot. Pass `onclose` to add a ✕ control; the parent removes the alert when it runs.\n\n```svelte\n<script>\n  import Alert from 'gpuix-fractalsvelte-ui/Alert.svelte';\n  let saved = $state(true);\n</script>\n\n{#if saved}\n  <Alert title=\"Saved\" variant=\"success\" onclose={() => (saved = false)}>Your changes are live.</Alert>\n{/if}\n<Alert variant=\"danger\">Sync failed: the server did not respond.</Alert>\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `title` | `string` | `''` |   |\n| `variant` | `'info' \\| 'secondary' \\| 'success' \\| 'warning' \\| 'danger'` | `'info'` | Fractalstyler's status names. |\n| `children` | `Snippet` | — | Body content under the title. |\n| `onclose` | `() => void` | — | Shows a dismiss button; the parent removes the alert. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `border-strong`, `danger`, `danger-soft`, `info`, `info-soft`, `radius-full`, `radius-md`, `radius-sm`, `ring`, `success`, `success-soft`, `text-primary`, `text-secondary`, `text-sm`, `warning`, `warning-soft`\n## Keyboard\n\n| Key | Action |\n| --- | --- |\n| Enter, Space | Dismiss, while the ✕ control is focused |\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Alert from 'gpuix-fractalsvelte-ui/Alert.svelte';\n\timport Button from 'gpuix-fractalsvelte-ui/Button.svelte';\n\tlet shown = $state(true);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px; width: 460px\">\n\t{#if shown}\n\t\t<Alert title=\"Export complete\" variant=\"success\" onclose={() => (shown = false)}>Saved 12 files to ~/Documents/export.</Alert>\n\t{/if}\n\t<Alert title=\"Update available\" variant=\"info\">Version 1.4 adds faster search.</Alert>\n\t<Alert title=\"Disk almost full\" variant=\"warning\">Free some space before exporting.</Alert>\n\t<Alert title=\"Sync failed\" variant=\"danger\">The server did not respond. Try again.</Alert>\n\t<Alert variant=\"secondary\">Plain note without a title.</Alert>\n\t{#if !shown}\n\t\t<Button label=\"Show again\" size=\"h-md\" variant=\"outline\" onclick={() => (shown = true)} />\n\t{/if}\n</div>\n```\n\n## GPUI notes\n\n- The ✕ is a focusable `div`, not a button. Its focus ring is a border colour change, since GPUI has no outline.\n- The ✕ has its own `onclick`, so clicking it does not reach any ancestor handlers.", demo: Alert_demo },
  { name: "Avatar", category: "feedback", description: "Circle or square user image, falling back to initials from a name.", docs: "`Avatar` shows a picture when `src` is set, and otherwise the initials of `name` on a tinted background.\n\n```svelte\n<script>\n  import Avatar from 'gpuix-fractalsvelte-ui/Avatar.svelte';\n</script>\n\n<Avatar name=\"Ada Lovelace\" />\n<Avatar name=\"Grace Hopper\" size=\"lg\" shape=\"square\" />\n<Avatar name=\"Linus\" src=\"/avatars/linus.png\" size=\"sm\" />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `name` | `string` | `''` | Initials come from the first and last word. |\n| `src` | `string \\| null` | — | Image path or URL; the initials show while it is unset. |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` |   |\n| `shape` | `'circle' \\| 'square'` | `'circle'` |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`theme-color`, `theme-color-sub`\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Avatar from 'gpuix-fractalsvelte-ui/Avatar.svelte';\n\tconst PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'];\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 16px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 12px; align-items: center\">\n\t\t<Avatar name=\"Ada Lovelace\" size=\"sm\" />\n\t\t<Avatar name=\"Ada Lovelace\" />\n\t\t<Avatar name=\"Ada Lovelace\" size=\"lg\" />\n\t\t<Avatar name=\"Ada Lovelace\" size=\"lg\" shape=\"square\" />\n\t\t<Avatar name=\"Grace Hopper\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAgElEQVR4nA3JIQFFMQhA0R/n1VgNGqAxa4CZXgMaoDGEwNwwf8ee3ycsQQQTjhBCCSP8PmUpophylFBKGX2xWRvZ2OZsYlOb2S+c5YhjznHCKWf8xWVd5GKXc4lLXea+CFYggQUniKCCiRfJSiSx5CSRVDL5olmNNNacJppqpvkDd6t6gRN3ZoUAAAAASUVORK5CYII=\" size=\"lg\" />\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each PEOPLE as person}\n\t\t\t<Avatar name={person} />\n\t\t{/each}\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- The image is drawn with `objectfit=\"cover\"` inside a root that sets `overflow: hidden`, so it is clipped to the circle or square.\n- When `src` is set the initials are not rendered, and the component has no fallback if the image fails to load.", demo: Avatar_demo },
  { name: "Badge", category: "feedback", description: "Small pill label for counts, statuses and tags, in five variants and three variants.", docs: "`Badge` is a non-interactive pill. Use `label` for plain text, or pass children for rich content.\n\n```svelte\n<script>\n  import Badge from 'gpuix-fractalsvelte-ui/Badge.svelte';\n</script>\n\n<Badge label=\"New\" variant=\"themed\" />\n<Badge label=\"3 errors\" variant=\"danger\" />\n<Badge label=\"Draft\" size=\"h-sm\" />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `children` | `Snippet` | — | Content; `label` is the plain-text shorthand. |\n| `label` | `string` | `''` |   |\n| `variant` | `'secondary' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'secondary'` | Fractalstyler's status names, drawn as a tinted pill. |\n| `size` | `'sm' \\| 'md'` | `'md'` |   |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `danger`, `danger-soft`, `info`, `info-soft`, `radius-full`, `success`, `success-soft`, `text-secondary`, `text-sm`, `text-xs`, `warning`, `warning-soft`\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Badge from 'gpuix-fractalsvelte-ui/Badge.svelte';\n\tconst VARIANTS = ['secondary', 'info', 'success', 'warning', 'danger'] as const;\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t{#each VARIANTS as variant}\n\t\t\t<Badge {variant} label={variant} />\n\t\t{/each}\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Badge size=\"sm\" label=\"Small\" />\n\t\t<Badge size=\"md\" label=\"Medium\" />\n\t\t<Badge variant=\"success\" label=\"Live\" />\n\t\t<Badge variant=\"danger\" label=\"3 errors\" />\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- Each variant is its own class (`.badge.danger`), because GPUI has no nesting.\n- The base rule sets a transparent border, so only the `outline` variant shows a border.", demo: Badge_demo },
  { name: "Kbd", category: "feedback", description: "Keyboard shortcut caps for a chord such as cmd+k, drawn with macOS glyphs.", docs: "`Kbd` displays a shortcut. It is display only: it does not bind the key. Wire the shortcut with `on_window_key` yourself.\n\n```svelte\n<script>\n  import Kbd from 'gpuix-fractalsvelte-ui/Kbd.svelte';\n</script>\n\n<Kbd keys=\"cmd+k\" />\n<Kbd keys=\"shift+enter\" size=\"h-sm\" />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `keys` | `string` | `''` | A chord such as `cmd+k` or `shift+enter`; each part becomes one cap. |\n| `size` | `'h-sm' \\| 'h-md'` | `'h-md'` | Fractalstyler's height steps. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `border-strong`, `height-md`, `radius-sm`, `text-secondary`\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Kbd from 'gpuix-fractalsvelte-ui/Kbd.svelte';\n\tconst SHORTCUTS = [\n\t\t['Command palette', 'cmd+k'],\n\t\t['Save', 'cmd+s'],\n\t\t['Find in page', 'cmd+shift+f'],\n\t\t['Send message', 'shift+enter'],\n\t\t['Close dialog', 'esc']\n\t];\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 12px\">\n\t{#each SHORTCUTS as [action, keys]}\n\t\t<div style=\"display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: space-between\">\n\t\t\t<div style=\"color: var(--text-secondary)\">{action}</div>\n\t\t\t<Kbd {keys} />\n\t\t</div>\n\t{/each}\n\t<div style=\"display: flex; flex-direction: row; gap: 16px; align-items: center\">\n\t\t<Kbd keys=\"cmd+k\" size=\"h-sm\" />\n\t\t<Kbd keys=\"up\" size=\"h-sm\" />\n\t\t<Kbd keys=\"down\" size=\"h-sm\" />\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- Each cap has a 2px bottom border, which gives the key its raised look.\n- `+` splits the chord, so the literal `+` key cannot be shown.", demo: Kbd_demo },
  { name: "Progress", category: "feedback", description: "Horizontal progress bar for a known percentage, or an indeterminate sweep.", docs: "`Progress` shows how far a task has got, or that it is busy when the length is unknown.\n\n```svelte\n<script>\n  import Progress from 'gpuix-fractalsvelte-ui/Progress.svelte';\n  let value = $state(40);\n</script>\n\n<Progress {value} />\n<Progress {value} variant=\"success\" size=\"h-md\" />\n<Progress indeterminate />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `value` | `number` | `0` | 0 to 100; out-of-range values are clamped. |\n| `indeterminate` | `boolean` | `false` | Ignores `value` and sweeps a segment back and forth. |\n| `variant` | `'themed' \\| 'secondary' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'themed'` | Fractalstyler's colour names. |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Bar thickness: 4, 6 or 8 px. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`bg-raised`, `danger`, `info`, `radius-full`, `success`, `text-secondary`, `theme-color`, `warning`\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Progress from 'gpuix-fractalsvelte-ui/Progress.svelte';\n\timport Button from 'gpuix-fractalsvelte-ui/Button.svelte';\n\tlet value = $state(35);\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 14px; width: 420px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 8px; align-items: center\">\n\t\t<Button label=\"-10\" size=\"h-md\" variant=\"outline\" onclick={() => (value = Math.max(0, value - 10))} />\n\t\t<Button label=\"+10\" size=\"h-md\" variant=\"outline\" onclick={() => (value = Math.min(100, value + 10))} />\n\t\t<div style=\"color: var(--text-secondary)\">{value}%</div>\n\t</div>\n\t<Progress {value} size=\"sm\" />\n\t<Progress {value} />\n\t<Progress {value} size=\"lg\" variant=\"success\" />\n\t<Progress {value} variant=\"warning\" />\n\t<Progress {value} variant=\"danger\" />\n\t<Progress indeterminate />\n</div>\n```\n\n## GPUI notes\n\n- The determinate fill is `width` as a percentage, which GPUI allows on `width`.\n- Indeterminate mode runs a 30 ms interval that re-renders the component while `indeterminate` is true. The timer is cleared when it turns off or the component unmounts.\n- The track has `overflow: hidden`, so the fill is clipped to its rounded ends.", demo: Progress_demo },
  { name: "Spinner", category: "feedback", description: "Indeterminate loading indicator drawn as a ring of fading dots.", docs: "`Spinner` shows ongoing work with no progress value. It draws eight dots in a ring and steps the bright lead dot around it on a timer.\n\n```svelte\n<script>\n  import Spinner from 'gpuix-fractalsvelte-ui/Spinner.svelte';\n</script>\n\n<Spinner />\n<Spinner size=\"h-sm\" />\n<Spinner size=\"h-lg\" variant=\"success\" testid=\"saving\" />\n```\n\n## Props\n\n| Prop | Type | Default | Notes |\n| --- | --- | --- | --- |\n| `size` | `'h-sm' \\| 'h-md' \\| 'h-bs' \\| 'h-lg'` | `'h-bs'` | Fractalstyler's height steps; the ring fits that size. |\n| `variant` | `'themed' \\| 'secondary' \\| 'info' \\| 'success' \\| 'warning' \\| 'danger'` | `'themed'` | Dot colour, in fractalstyler's names. |\n| `style` | `string \\| null` | — |   |\n| `testid` | `string \\| null` | — |   |\n## Tokens\n\n`danger`, `height-bs`, `height-lg`, `height-md`, `height-sm`, `info`, `radius-full`, `success`, `text-secondary`, `theme-color`, `warning`\n## Keyboard\n\nNone.\n\n## Examples\n\nEvery variant, size and state, exactly as the gallery's Demo view renders them.\n\n```svelte\n<script lang=\"ts\">\n\timport Spinner from 'gpuix-fractalsvelte-ui/Spinner.svelte';\n\tconst VARIANTS = ['themed', 'secondary', 'success', 'warning', 'danger'] as const;\n</script>\n\n<div style=\"display: flex; flex-direction: column; gap: 16px\">\n\t<div style=\"display: flex; flex-direction: row; gap: 20px; align-items: center\">\n\t\t<Spinner size=\"h-sm\" />\n\t\t<Spinner size=\"h-md\" />\n\t\t<Spinner size=\"h-lg\" />\n\t</div>\n\t<div style=\"display: flex; flex-direction: row; gap: 20px; align-items: center\">\n\t\t{#each VARIANTS as variant}\n\t\t\t<Spinner {variant} size=\"h-lg\" />\n\t\t{/each}\n\t</div>\n</div>\n```\n\n## GPUI notes\n\n- GPUI has no looping motion, so the animation is a 90 ms timer that moves the lead dot. Each dot is absolutely positioned with a stepped opacity.\n- The timer runs while the spinner is mounted. Unmount it when the work is done.", demo: Spinner_demo }
];

// gallery/ThemeSheet.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root76 = from_tree([
  ["div", { class: "pill svelte-g0vg6f" }, " "],
  " ",
  ["div", { class: "pill svelte-g0vg6f" }, "soft"]
], 1);
var root_148 = from_tree([
  [
    "div",
    { class: "swatch svelte-g0vg6f" },
    ["div", { class: "chip svelte-g0vg6f" }],
    " ",
    ["div", { class: "name svelte-g0vg6f" }, " "],
    " ",
    ["div", { class: "value svelte-g0vg6f" }, " "]
  ]
]);
var root_237 = from_tree([
  [
    "div",
    { class: "group svelte-g0vg6f" },
    ["div", { class: "label svelte-g0vg6f" }, " "],
    " ",
    ["div", { class: "row svelte-g0vg6f" }]
  ]
]);
var root_318 = from_tree([
  [
    "div",
    { class: "swatch svelte-g0vg6f" },
    ["div", { class: "chip svelte-g0vg6f" }],
    " ",
    ["div", { class: "name svelte-g0vg6f" }, " "],
    " ",
    ["div", { class: "value svelte-g0vg6f" }, " "]
  ]
]);
var root_49 = from_tree([
  [
    "div",
    {
      style: "display: flex; flex-direction: row; align-items: center; gap: 12px"
    },
    [
      "div",
      { class: "value svelte-g0vg6f", style: "width: 110px" },
      " "
    ],
    " ",
    ["div", null, "The quick brown fox"]
  ]
]);
var root_56 = from_tree([
  [
    "div",
    { style: "display: flex; flex-direction: column; gap: 20px" },
    [
      "div",
      {
        style: "display: flex; flex-direction: row; align-items: center; gap: 12px"
      },
      ["div", { style: "color: var(--text-secondary)" }, " "],
      " ",
      ["div", { style: "flex-grow: 1" }],
      " ",
      ,
    ],
    " ",
    [
      "div",
      { class: "preview svelte-g0vg6f" },
      [
        "div",
        { class: "card svelte-g0vg6f" },
        ["div", null, " "],
        " ",
        [
          "div",
          { style: "display: flex; flex-direction: row; gap: 12px" },
          ["div", null, "Ink"],
          " ",
          ["div", null, "Muted ink"],
          " ",
          ["div", null, "Faint ink"]
        ],
        " ",
        [
          "div",
          { style: "display: flex; flex-direction: row; gap: 6px" }
        ]
      ]
    ],
    " ",
    ,
    " ",
    [
      "div",
      { class: "group svelte-g0vg6f" },
      ["div", { class: "label svelte-g0vg6f" }, "Radii"],
      " ",
      ["div", { class: "row svelte-g0vg6f" }]
    ],
    " ",
    [
      "div",
      { class: "group svelte-g0vg6f" },
      ["div", { class: "label svelte-g0vg6f" }, " "],
      " ",
      [
        "div",
        { style: "display: flex; flex-direction: column; gap: 6px" }
      ]
    ]
  ]
]);
function ThemeSheet($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let active = prop($$props, "active", 3, false);
  const groups = [
    {
      title: "Surfaces",
      keys: ["bg", "bg-surface", "bg-raised", "bg-sunken", "bg-extra"]
    },
    {
      title: "Text",
      keys: ["text-primary", "text-secondary", "text-muted"]
    },
    { title: "Lines", keys: ["border", "border-strong", "ring"] },
    {
      title: "Accent",
      keys: [
        "theme-color",
        "theme-color-alt",
        "text-theme",
        "theme-color-sub"
      ]
    },
    {
      title: "Success",
      keys: ["success", "success-hover", "success-soft"]
    },
    {
      title: "Warn",
      keys: ["warning", "warning-hover", "warning-soft"]
    },
    {
      title: "Danger",
      keys: ["danger", "danger-hover", "danger-soft"]
    },
    { title: "Info", keys: ["info", "info-hover", "info-soft"] }
  ];
  const radii = [
    "radius-0",
    "radius-sm",
    "radius-md",
    "radius-bs",
    "radius-lg",
    "radius-full"
  ];
  const sizes = [
    "text-xs",
    "text-sm",
    "text-md",
    "text-lg",
    "text-xl",
    "text-2xl"
  ];
  const t = user_derived(() => $$props.theme.tokens);
  var div = root_56();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var text = only_child(div_2);
  var node = sibling(div_2, 4);
  {
    let $0 = user_derived(() => active() ? "Applied" : "Apply theme");
    let $1 = user_derived(() => active() ? "secondary" : "primary");
    Button(node, {
      get label() {
        return get($0);
      },
      get variant() {
        return get($1);
      },
      get disabled() {
        return active();
      },
      get onclick() {
        return $$props.onapply;
      },
      get testid() {
        return `apply-${$$props.theme.name ?? ""}`;
      }
    });
  }
  reset(div_1);
  var div_3 = sibling(div_1, 2);
  var div_4 = child(div_3);
  var div_5 = child(div_4);
  var text_1 = only_child(div_5, true);
  var div_6 = sibling(div_5, 2);
  var div_7 = child(div_6);
  var div_8 = sibling(div_7, 2);
  var div_9 = sibling(div_8, 2);
  reset(div_6);
  var div_10 = sibling(div_6, 2);
  each(div_10, 20, () => ["theme-color", "success", "warning", "danger"], index, ($$anchor, tone) => {
    var fragment = root76();
    var div_11 = first_child(fragment);
    var text_2 = only_child(div_11, true);
    var div_12 = sibling(div_11, 2);
    template_effect(() => {
      set_style(div_11, `background-color: ${get(t)[tone] ?? ""}; color: ${get(t)["text-inverse"] ?? ""}`);
      set_text(text_2, tone);
      set_style(div_12, `background-color: ${get(t)[`${tone}-soft`] ?? ""}; color: ${get(t)[tone] ?? ""}`);
    });
    append($$anchor, fragment);
  });
  reset(div_10);
  reset(div_4);
  reset(div_3);
  var node_1 = sibling(div_3, 2);
  each(node_1, 17, () => groups, (g) => g.title, ($$anchor, g) => {
    var div_13 = root_237();
    var div_14 = child(div_13);
    var text_3 = only_child(div_14, true);
    var div_15 = sibling(div_14, 2);
    each(div_15, 20, () => get(g).keys, (k) => k, ($$anchor, k) => {
      var div_16 = root_148();
      var div_17 = child(div_16);
      var div_18 = sibling(div_17, 2);
      var text_4 = only_child(div_18, true);
      var div_19 = sibling(div_18, 2);
      var text_5 = only_child(div_19, true);
      reset(div_16);
      template_effect(() => {
        set_attribute2(div_16, "testId", `swatch-${$$props.theme.name ?? ""}-${k ?? ""}`);
        set_style(div_17, `background-color: ${get(t)[k] ?? ""}`);
        set_text(text_4, k);
        set_text(text_5, get(t)[k]);
      });
      append($$anchor, div_16);
    });
    reset(div_15);
    reset(div_13);
    template_effect(() => set_text(text_3, get(g).title));
    append($$anchor, div_13);
  });
  var div_20 = sibling(node_1, 2);
  var div_21 = sibling(child(div_20), 2);
  each(div_21, 20, () => radii, (k) => k, ($$anchor, k) => {
    var div_22 = root_318();
    var div_23 = child(div_22);
    var div_24 = sibling(div_23, 2);
    var text_6 = only_child(div_24, true);
    var div_25 = sibling(div_24, 2);
    var text_7 = only_child(div_25, true);
    reset(div_22);
    template_effect(() => {
      set_style(div_23, `background-color: ${get(t)["theme-color-sub"] ?? ""}; border-color: ${get(t)["theme-color"] ?? ""}; border-width: 1px; border-radius: ${get(t)[k] ?? ""}`);
      set_text(text_6, k);
      set_text(text_7, get(t)[k]);
    });
    append($$anchor, div_22);
  });
  reset(div_21);
  reset(div_20);
  var div_26 = sibling(div_20, 2);
  var div_27 = child(div_26);
  var text_8 = only_child(div_27);
  var div_28 = sibling(div_27, 2);
  each(div_28, 20, () => sizes, (k) => k, ($$anchor, k) => {
    var div_29 = root_49();
    var div_30 = child(div_29);
    var text_9 = only_child(div_30);
    var div_31 = sibling(div_30, 2);
    reset(div_29);
    template_effect(() => {
      set_text(text_9, `${k ?? ""} · ${get(t)[k] ?? ""}`);
      set_style(div_31, `font-size: ${get(t)[k] ?? ""}; font-family: ${get(t)["font-sans"] ?? ""}`);
    });
    append($$anchor, div_29);
  });
  reset(div_28);
  reset(div_26);
  reset(div);
  template_effect(($0) => {
    set_text(text, `${$$props.theme.dark ? "Dark" : "Light"} theme · ${$0 ?? ""} tokens`);
    set_style(div_3, `background-color: ${get(t).bg ?? ""}; border-color: ${get(t).border ?? ""}; border-radius: ${get(t)["radius-lg"] ?? ""}`);
    set_style(div_4, `background-color: ${get(t)["bg-surface"] ?? ""}; border-color: ${get(t).border ?? ""}; border-radius: ${get(t)["radius-md"] ?? ""}`);
    set_style(div_5, `color: ${get(t)["text-primary"] ?? ""}; font-size: ${get(t)["text-lg"] ?? ""}; font-weight: 600`);
    set_text(text_1, $$props.theme.name);
    set_style(div_7, `color: ${get(t)["text-primary"] ?? ""}`);
    set_style(div_8, `color: ${get(t)["text-secondary"] ?? ""}`);
    set_style(div_9, `color: ${get(t)["text-muted"] ?? ""}`);
    set_text(text_8, `Type · ${get(t)["font-sans"] ?? ""} / ${get(t)["font-mono"] ?? ""}`);
  }, [() => Object.keys(get(t)).length]);
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-g0vg6f", [{ classes: ["preview"], tag: null, pseudo: null, style: { display: "flex", padding: 20, borderWidth: 1 } }, { classes: ["card"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 10, padding: 16, borderWidth: 1, flexGrow: 1 } }, { classes: ["pill"], tag: null, pseudo: null, style: { paddingTop: 2, paddingRight: 8, paddingBottom: 2, paddingLeft: 8, borderRadius: 999, fontSize: 12, fontWeight: 500 } }, { classes: ["group"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 8 } }, { classes: ["label"], tag: null, pseudo: null, css: "font-size: var(--text-xs); font-weight: 600; color: var(--text-muted)" }, { classes: ["row"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 12 } }, { classes: ["swatch"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", gap: 4, width: 112 } }, { classes: ["chip"], tag: null, pseudo: null, css: "height: 48px; border-radius: var(--radius-md); border-width: 1px; border-color: var(--border)" }, { classes: ["name"], tag: null, pseudo: null, css: "font-size: var(--text-sm); font-weight: 500; color: var(--text-primary)" }, { classes: ["value"], tag: null, pseudo: null, css: "font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-secondary)" }]);

// gallery/src/components/AppShell.svelte
init_renderer2();
init_custom_renderer();
init_client();

// gallery/src/state/appShell.svelte.ts
init_client();
var STORAGE_KEY = "appshell:layout";
var SIDEBAR_DEFAULTS = { left: 260, right1: 280, right2: 240 };
var SIDEBAR_CLAMPS = {
  left: { min: 160, max: 480 },
  right1: { min: 200, max: 520 },
  right2: { min: 160, max: 400 }
};
function clampWidth(id, width) {
  const { min, max } = SIDEBAR_CLAMPS[id];
  return Math.round(Math.min(max, Math.max(min, width)));
}
function loadPersisted() {
  if (typeof localStorage === "undefined")
    return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

class AppShellState {
  #headerVisible = state(true);
  get headerVisible() {
    return get(this.#headerVisible);
  }
  set headerVisible(value) {
    set(this.#headerVisible, value, true);
  }
  #footerVisible = state(true);
  get footerVisible() {
    return get(this.#footerVisible);
  }
  set footerVisible(value) {
    set(this.#footerVisible, value, true);
  }
  trafficLightsPadding = 80;
  #leftW = state(proxy(SIDEBAR_DEFAULTS.left));
  get leftW() {
    return get(this.#leftW);
  }
  set leftW(value) {
    set(this.#leftW, value, true);
  }
  #right1W = state(proxy(SIDEBAR_DEFAULTS.right1));
  get right1W() {
    return get(this.#right1W);
  }
  set right1W(value) {
    set(this.#right1W, value, true);
  }
  #right2W = state(proxy(SIDEBAR_DEFAULTS.right2));
  get right2W() {
    return get(this.#right2W);
  }
  set right2W(value) {
    set(this.#right2W, value, true);
  }
  #leftCollapsed = state(false);
  get leftCollapsed() {
    return get(this.#leftCollapsed);
  }
  set leftCollapsed(value) {
    set(this.#leftCollapsed, value, true);
  }
  #right1Collapsed = state(true);
  get right1Collapsed() {
    return get(this.#right1Collapsed);
  }
  set right1Collapsed(value) {
    set(this.#right1Collapsed, value, true);
  }
  #right2Collapsed = state(true);
  get right2Collapsed() {
    return get(this.#right2Collapsed);
  }
  set right2Collapsed(value) {
    set(this.#right2Collapsed, value, true);
  }
  #isResizing = state(false);
  get isResizing() {
    return get(this.#isResizing);
  }
  set isResizing(value) {
    set(this.#isResizing, value, true);
  }
  #persistScheduled = false;
  constructor() {
    const p = loadPersisted();
    if (typeof p.leftW === "number")
      this.leftW = clampWidth("left", p.leftW);
    if (typeof p.right1W === "number")
      this.right1W = clampWidth("right1", p.right1W);
    if (typeof p.right2W === "number")
      this.right2W = clampWidth("right2", p.right2W);
    if (typeof p.leftCollapsed === "boolean")
      this.leftCollapsed = p.leftCollapsed;
    if (typeof p.right1Collapsed === "boolean")
      this.right1Collapsed = p.right1Collapsed;
    if (typeof p.right2Collapsed === "boolean")
      this.right2Collapsed = p.right2Collapsed;
    if (typeof p.headerVisible === "boolean")
      this.headerVisible = p.headerVisible;
    if (typeof p.footerVisible === "boolean")
      this.footerVisible = p.footerVisible;
  }
  getWidth(id) {
    if (id === "left")
      return this.leftW;
    if (id === "right1")
      return this.right1W;
    return this.right2W;
  }
  isCollapsed(id) {
    if (id === "left")
      return this.leftCollapsed;
    if (id === "right1")
      return this.right1Collapsed;
    return this.right2Collapsed;
  }
  isOpen(id) {
    return !this.isCollapsed(id);
  }
  toggleLeft() {
    this.leftCollapsed = !this.leftCollapsed;
    this.schedulePersist();
  }
  toggleRight1() {
    this.right1Collapsed = !this.right1Collapsed;
    this.schedulePersist();
  }
  toggleRight2() {
    this.right2Collapsed = !this.right2Collapsed;
    this.schedulePersist();
  }
  toggleHeader() {
    this.headerVisible = !this.headerVisible;
    this.schedulePersist();
  }
  toggleFooter() {
    this.footerVisible = !this.footerVisible;
    this.schedulePersist();
  }
  resize(id, width) {
    const next = clampWidth(id, width);
    if (id === "left")
      this.leftW = next;
    else if (id === "right1")
      this.right1W = next;
    else if (id === "right2")
      this.right2W = next;
    this.schedulePersist();
  }
  resetWidth(id) {
    this.resize(id, SIDEBAR_DEFAULTS[id]);
  }
  startResize(id, event) {
    if (event?.preventDefault)
      event.preventDefault();
    this.isResizing = true;
    const startX = typeof event?.clientX === "number" ? event.clientX : event?.x ?? event?.position?.x ?? 0;
    const startW = this.getWidth(id);
    const isInverted = id === "right1" || id === "right2";
    const onMove = (e) => {
      const currentX = typeof e?.clientX === "number" ? e.clientX : e?.x ?? e?.position?.x ?? 0;
      const delta = currentX - startX;
      const targetW = isInverted ? startW - delta : startW + delta;
      this.resize(id, targetW);
    };
    const onUp = () => {
      this.isResizing = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
  }
  handleHeaderDoubleClick() {
    if (typeof globalThis !== "undefined" && typeof globalThis.__native_toggle_maximize === "function") {
      globalThis.__native_toggle_maximize();
    }
  }
  schedulePersist() {
    if (this.#persistScheduled)
      return;
    this.#persistScheduled = true;
    queueMicrotask(() => {
      this.#persistScheduled = false;
      this.persist();
    });
  }
  persist() {
    if (typeof localStorage === "undefined")
      return;
    try {
      const snapshot = {
        leftW: this.leftW,
        right1W: this.right1W,
        right2W: this.right2W,
        leftCollapsed: this.leftCollapsed,
        right1Collapsed: this.right1Collapsed,
        right2Collapsed: this.right2Collapsed,
        headerVisible: this.headerVisible,
        footerVisible: this.footerVisible
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {}
  }
}
var appshell = new AppShellState;

// gallery/src/icons/panelLeft.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root77 = from_tree([["svg", { class: "icon svelte-cv1xd0" }]], 4);
function PanelLeft($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const SOURCE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34315 4.34315 3 6 3ZM9 3V21"/> </svg>';
  var svg = root77();
  set_attribute2(svg, "source", SOURCE);
  append($$anchor, svg);
  $$pop_renderer();
}
define_styles("svelte-cv1xd0", [{ classes: ["icon"], tag: null, pseudo: null, style: { width: 16, height: 16 } }]);

// gallery/src/icons/panelRight.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root78 = from_tree([["svg", { class: "icon svelte-cv1xd0" }]], 4);
function PanelRight($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const SOURCE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34315 4.34315 3 6 3ZM15 3V21"/> </svg>';
  var svg = root78();
  set_attribute2(svg, "source", SOURCE);
  append($$anchor, svg);
  $$pop_renderer();
}
define_styles("svelte-cv1xd0", [{ classes: ["icon"], tag: null, pseudo: null, style: { width: 16, height: 16 } }]);

// gallery/src/icons/panelRight2.svelte
init_renderer2();
init_custom_renderer();
init_client();
init_renderer2();
var root79 = from_tree([["svg", { class: "icon svelte-cv1xd0" }]], 4);
function PanelRight2($$anchor) {
  var $$pop_renderer = push_renderer(renderer_default);
  const SOURCE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M9 3H6C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H9V3ZM18 3C19.6569 3 21 4.34315 21 6M21 18C21 19.6569 19.6569 21 18 21M13 3H14M13 21H14M21 10.5V13.5"/> </svg>';
  var svg = root79();
  set_attribute2(svg, "source", SOURCE);
  append($$anchor, svg);
  $$pop_renderer();
}
define_styles("svelte-cv1xd0", [{ classes: ["icon"], tag: null, pseudo: null, style: { width: 16, height: 16 } }]);

// gallery/src/components/AppShell.svelte
init_renderer2();
var root80 = from_tree([
  [
    "div",
    {
      class: "btn-icon el-variant ghost el-shape square el-size h-md",
      role: "button",
      tabindex: "0"
    },
    ,
  ]
]);
var root_149 = from_tree([
  [
    "div",
    {
      class: "btn-icon el-variant ghost el-shape square el-size h-md",
      role: "button",
      tabindex: "0"
    },
    ,
  ]
]);
var root_238 = from_tree([
  [
    "div",
    {
      class: "btn-icon el-variant ghost el-shape square el-size h-md",
      role: "button",
      tabindex: "0"
    },
    ,
  ]
]);
var root_319 = from_tree([
  [
    "div",
    { class: "row ycenter wfull" },
    ["div", { class: "row ycenter gap-bs" }, ,],
    " ",
    ["div", { class: "row ycenter grow" }, ,],
    " ",
    ["div", { class: "row ycenter gap-bs" }, , " ", ,]
  ]
]);
var root_410 = from_tree([
  [
    "div",
    { class: "box hfull br relative" },
    ["div", { class: "hfull wfull box", style: "width: 100%" }, ,],
    " ",
    ["div", { class: "resizer resizer-right svelte-1fyrezu" }]
  ]
]);
var root_57 = from_tree([
  [
    "div",
    { class: "box hfull bl relative" },
    ["div", { class: "resizer resizer-left svelte-1fyrezu" }],
    " ",
    ["div", { class: "hfull wfull box", style: "width: 100%" }, ,]
  ]
]);
var root_64 = from_tree([
  [
    "div",
    { class: "box hfull bl relative" },
    ["div", { class: "resizer resizer-left svelte-1fyrezu" }],
    " ",
    ["div", { class: "hfull wfull box", style: "width: 100%" }, ,]
  ]
]);
var root_73 = from_tree([["div", { class: "row wfull state-surface ycenter" }, ,]]);
var root_82 = from_tree([
  [
    "div",
    { class: "fs-app-shell svelte-1fyrezu" },
    ,
    " ",
    [
      "div",
      { class: "row hfull" },
      ,
      " ",
      ["div", { class: "box hfull grow" }, ,],
      " ",
      ,
      " ",
      ,
    ],
    " ",
    ,
  ]
]);
function AppShell($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  const press = (fn) => (e) => {
    if (e.key === "enter" || e.key === "space")
      fn();
  };
  var div = root_82();
  var node = child(div);
  {
    var consequent_4 = ($$anchor) => {
      var div_1 = root_319();
      var div_2 = child(div_1);
      var node_1 = child(div_2);
      {
        var consequent = ($$anchor) => {
          var div_3 = root80();
          var event_handler = user_derived(() => press(() => appshell.toggleLeft()));
          var node_2 = child(div_3);
          PanelLeft(node_2, {});
          reset(div_3);
          event("click", div_3, () => appshell.toggleLeft());
          event("keydown", div_3, function(...$$args) {
            get(event_handler)?.apply(this, $$args);
          });
          append($$anchor, div_3);
        };
        if_block(node_1, ($$render) => {
          if ($$props.sidebarLeft)
            $$render(consequent);
        });
      }
      reset(div_2);
      var div_4 = sibling(div_2, 2);
      var node_3 = child(div_4);
      {
        var consequent_1 = ($$anchor) => {
          var fragment = comment();
          var node_4 = first_child(fragment);
          snippet(node_4, () => validate_snippet_renderer(renderer_default, $$props.headerCenter));
          append($$anchor, fragment);
        };
        if_block(node_3, ($$render) => {
          if ($$props.headerCenter)
            $$render(consequent_1);
        });
      }
      reset(div_4);
      var div_5 = sibling(div_4, 2);
      var node_5 = child(div_5);
      {
        var consequent_2 = ($$anchor) => {
          var div_6 = root_149();
          var event_handler_1 = user_derived(() => press(() => appshell.toggleRight1()));
          var node_6 = child(div_6);
          PanelRight(node_6, {});
          reset(div_6);
          event("click", div_6, () => appshell.toggleRight1());
          event("keydown", div_6, function(...$$args) {
            get(event_handler_1)?.apply(this, $$args);
          });
          append($$anchor, div_6);
        };
        if_block(node_5, ($$render) => {
          if ($$props.sidebarRight1)
            $$render(consequent_2);
        });
      }
      var node_7 = sibling(node_5, 2);
      {
        var consequent_3 = ($$anchor) => {
          var div_7 = root_238();
          var event_handler_2 = user_derived(() => press(() => appshell.toggleRight2()));
          var node_8 = child(div_7);
          PanelRight2(node_8, {});
          reset(div_7);
          event("click", div_7, () => appshell.toggleRight2());
          event("keydown", div_7, function(...$$args) {
            get(event_handler_2)?.apply(this, $$args);
          });
          append($$anchor, div_7);
        };
        if_block(node_7, ($$render) => {
          if ($$props.sidebarRight2)
            $$render(consequent_3);
        });
      }
      reset(div_5);
      reset(div_1);
      template_effect(() => set_style(div_1, `padding-left: ${appshell.trafficLightsPadding ?? ""}px;`));
      append($$anchor, div_1);
    };
    if_block(node, ($$render) => {
      if (appshell.headerVisible)
        $$render(consequent_4);
    });
  }
  var div_8 = sibling(node, 2);
  var node_9 = child(div_8);
  {
    var consequent_5 = ($$anchor) => {
      var div_9 = root_410();
      var div_10 = child(div_9);
      var node_10 = child(div_10);
      snippet(node_10, () => validate_snippet_renderer(renderer_default, $$props.sidebarLeft));
      reset(div_10);
      var div_11 = sibling(div_10, 2);
      reset(div_9);
      template_effect(($0) => set_style(div_9, `width: ${$0 ?? ""}px;`), [() => appshell.getWidth("left")]);
      event("mousedown", div_11, (e) => appshell.startResize("left", e));
      append($$anchor, div_9);
    };
    var d = user_derived(() => $$props.sidebarLeft && appshell.isOpen("left"));
    if_block(node_9, ($$render) => {
      if (get(d))
        $$render(consequent_5);
    });
  }
  var div_12 = sibling(node_9, 2);
  var node_11 = child(div_12);
  snippet(node_11, () => validate_snippet_renderer(renderer_default, $$props.center));
  reset(div_12);
  var node_12 = sibling(div_12, 2);
  {
    var consequent_6 = ($$anchor) => {
      var div_13 = root_57();
      var div_14 = child(div_13);
      var div_15 = sibling(div_14, 2);
      var node_13 = child(div_15);
      snippet(node_13, () => validate_snippet_renderer(renderer_default, $$props.sidebarRight1));
      reset(div_15);
      reset(div_13);
      template_effect(($0) => set_style(div_13, `width: ${$0 ?? ""}px;`), [() => appshell.getWidth("right1")]);
      event("mousedown", div_14, (e) => appshell.startResize("right1", e));
      append($$anchor, div_13);
    };
    var d_1 = user_derived(() => $$props.sidebarRight1 && appshell.isOpen("right1"));
    if_block(node_12, ($$render) => {
      if (get(d_1))
        $$render(consequent_6);
    });
  }
  var node_14 = sibling(node_12, 2);
  {
    var consequent_7 = ($$anchor) => {
      var div_16 = root_64();
      var div_17 = child(div_16);
      var div_18 = sibling(div_17, 2);
      var node_15 = child(div_18);
      snippet(node_15, () => validate_snippet_renderer(renderer_default, $$props.sidebarRight2));
      reset(div_18);
      reset(div_16);
      template_effect(($0) => set_style(div_16, `width: ${$0 ?? ""}px;`), [() => appshell.getWidth("right2")]);
      event("mousedown", div_17, (e) => appshell.startResize("right2", e));
      append($$anchor, div_16);
    };
    var d_2 = user_derived(() => $$props.sidebarRight2 && appshell.isOpen("right2"));
    if_block(node_14, ($$render) => {
      if (get(d_2))
        $$render(consequent_7);
    });
  }
  reset(div_8);
  var node_16 = sibling(div_8, 2);
  {
    var consequent_8 = ($$anchor) => {
      var div_19 = root_73();
      var node_17 = child(div_19);
      snippet(node_17, () => validate_snippet_renderer(renderer_default, $$props.footer));
      reset(div_19);
      append($$anchor, div_19);
    };
    if_block(node_16, ($$render) => {
      if (appshell.footerVisible && $$props.footer)
        $$render(consequent_8);
    });
  }
  reset(div);
  append($$anchor, div);
  $$pop_renderer();
  pop();
}
define_styles("svelte-1fyrezu", [{ classes: ["fs-app-shell"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", width: "100%", height: "100%" } }, { classes: ["resizer"], tag: null, pseudo: null, style: { position: "absolute", top: 0, bottom: 0, width: 6, cursor: "col-resize" } }, { classes: ["resizer-right"], tag: null, pseudo: null, style: { right: 0 } }, { classes: ["resizer-left"], tag: null, pseudo: null, style: { left: 0 } }]);

// gallery/Gallery.svelte
init_renderer2();
var root81 = from_tree([
  [
    "div",
    {
      class: "app-header xbetween wfull ycenter row bg-panel",
      style: "height: 48px"
    },
    ["div", null, "GPUIX Fractalsvelte UI"]
  ]
]);
var root_150 = from_tree([["div", null, " "]]);
var root_239 = from_tree([["div", { class: "cat svelte-gva9fg" }, " "], " ", ,], 1);
var root_320 = from_tree([["div", null, " "]]);
var root_411 = from_tree([
  ,
  ,
  " ",
  ["div", { class: "cat svelte-gva9fg" }, "themes"],
  " ",
  ,
], 1);
var root_58 = from_tree([["div", null, " "]]);
var root_65 = from_tree([
  [
    "div",
    { class: "side svelte-gva9fg" },
    ,
    " ",
    ["div", { class: "themes svelte-gva9fg" }]
  ]
]);
var root_74 = from_tree([
  [
    "div",
    { class: "side svelte-gva9fg" },
    "Right panel 1 (empty)"
  ]
]);
var root_83 = from_tree([
  [
    "div",
    { class: "side svelte-gva9fg" },
    "Right panel 2 (empty)"
  ]
]);
var root_9 = from_tree([
  ["div", { class: "title svelte-gva9fg" }, " "],
  " ",
  [
    "div",
    { class: "desc svelte-gva9fg" },
    "Every token in the theme, with its value."
  ],
  " ",
  ["div", { class: "stage svelte-gva9fg" }, ,]
], 1);
var root_10 = from_tree([["div", { class: "stage svelte-gva9fg" }, ,]]);
var root_11 = from_tree([["div", { class: "stage docs svelte-gva9fg" }, ["markdown"]]]);
var root_1210 = from_tree([
  ["div", { class: "title svelte-gva9fg" }, " "],
  " ",
  ["div", { class: "desc svelte-gva9fg" }, " "],
  " ",
  [
    "div",
    { class: "views svelte-gva9fg" },
    ["div", { testId: "view-demo" }, "Demo"],
    " ",
    ["div", { testId: "view-docs" }, "Docs"]
  ],
  " ",
  ,
], 1);
var root_1310 = from_tree([["div", { class: "main svelte-gva9fg" }, ,]]);
function Gallery($$anchor, $$props) {
  var $$pop_renderer = push_renderer(renderer_default);
  push($$props, true);
  let theme = state(proxy(themes.light));
  let current = state(proxy(demos[0]?.name ?? ""));
  const active = user_derived(() => demos.find((d) => d.name === get(current)));
  let view = state("demo");
  const t = user_derived(() => get(theme).tokens);
  const docTheme = user_derived(() => ({
    appearance: get(theme).dark ? "dark" : "light",
    bg: get(t)["bg-surface"],
    border: get(t).border,
    text: get(t)["text-primary"],
    textMuted: get(t)["text-secondary"],
    textFaint: get(t)["text-muted"],
    accent: get(t)["theme-color"],
    codeText: get(t)["text-primary"],
    codeWash: get(t)["bg-raised"],
    fontSans: get(t)["font-sans"],
    fontMono: get(t)["font-mono"]
  }));
  const sheet = user_derived(() => get(current).startsWith("theme:") ? themes[get(current).slice(6)] : null);
  const categories = user_derived(() => [...new Set(demos.map((d) => d.category))]);
  var fragment = comment();
  var node = first_child(fragment);
  ThemeProvider(node, {
    get theme() {
      return get(theme);
    },
    children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
      var fragment_1 = comment();
      var node_1 = first_child(fragment_1);
      {
        const headerCenter = renderer_snippet(renderer_default, ($$anchor) => {
          var div = root81();
          append($$anchor, div);
        });
        const sidebarLeft = renderer_snippet(renderer_default, ($$anchor) => {
          var div_1 = root_65();
          var node_2 = child(div_1);
          Scroller(node_2, {
            gap: 2,
            pad: "0 8px 12px 8px",
            children: renderer_snippet(renderer_default, ($$anchor, $$slotProps) => {
              var fragment_2 = root_411();
              var node_3 = first_child(fragment_2);
              each(node_3, 16, () => get(categories), (category) => category, ($$anchor, category) => {
                var fragment_3 = root_239();
                var div_2 = first_child(fragment_3);
                var text = only_child(div_2, true);
                var node_4 = sibling(div_2, 2);
                each(node_4, 17, () => demos.filter((d) => d.category === category), (d) => d.name, ($$anchor, d) => {
                  var div_3 = root_150();
                  let classes;
                  var text_1 = only_child(div_3, true);
                  template_effect(() => {
                    classes = set_class(div_3, 0, "item svelte-gva9fg", null, classes, { sel: get(d).name === get(current) });
                    set_attribute2(div_3, "testId", `nav-${get(d).name ?? ""}`);
                    set_text(text_1, get(d).name);
                  });
                  event("click", div_3, () => set(current, get(d).name, true));
                  append($$anchor, div_3);
                });
                template_effect(() => set_text(text, category));
                append($$anchor, fragment_3);
              });
              var node_5 = sibling(node_3, 4);
              each(node_5, 17, () => Object.values(themes), (th) => th.name, ($$anchor, th) => {
                var div_4 = root_320();
                let classes_1;
                var text_2 = only_child(div_4, true);
                template_effect(() => {
                  classes_1 = set_class(div_4, 0, "item svelte-gva9fg", null, classes_1, { sel: get(current) === `theme:${get(th).name}` });
                  set_attribute2(div_4, "testId", `nav-theme-${get(th).name ?? ""}`);
                  set_text(text_2, get(th).name);
                });
                event("click", div_4, () => set(current, `theme:${get(th).name}`));
                append($$anchor, div_4);
              });
              append($$anchor, fragment_2);
            }),
            $$slots: { default: true }
          });
          var div_5 = sibling(node_2, 2);
          each(div_5, 21, () => Object.values(themes), (th) => th.name, ($$anchor, th) => {
            var div_6 = root_58();
            let classes_2;
            var text_3 = only_child(div_6, true);
            template_effect(() => {
              classes_2 = set_class(div_6, 0, "chip svelte-gva9fg", null, classes_2, { sel: get(th).name === get(theme).name });
              set_attribute2(div_6, "testId", `theme-${get(th).name ?? ""}`);
              set_text(text_3, get(th).name);
            });
            event("click", div_6, () => set(theme, get(th), true));
            append($$anchor, div_6);
          });
          reset(div_5);
          reset(div_1);
          append($$anchor, div_1);
        });
        const sidebarRight1 = renderer_snippet(renderer_default, ($$anchor) => {
          var div_7 = root_74();
          append($$anchor, div_7);
        });
        const sidebarRight2 = renderer_snippet(renderer_default, ($$anchor) => {
          var div_8 = root_83();
          append($$anchor, div_8);
        });
        const center = renderer_snippet(renderer_default, ($$anchor) => {
          var div_9 = root_1310();
          var node_6 = child(div_9);
          {
            var consequent = ($$anchor) => {
              var fragment_4 = root_9();
              var div_10 = first_child(fragment_4);
              var text_4 = only_child(div_10, true);
              var div_11 = sibling(div_10, 4);
              var node_7 = child(div_11);
              {
                let $0 = user_derived(() => get(sheet).name === get(theme).name);
                ThemeSheet(node_7, {
                  get theme() {
                    return get(sheet);
                  },
                  get active() {
                    return get($0);
                  },
                  onapply: () => set(theme, get(sheet), true)
                });
              }
              reset(div_11);
              template_effect(() => set_text(text_4, get(sheet).name));
              append($$anchor, fragment_4);
            };
            var consequent_2 = ($$anchor) => {
              var fragment_5 = root_1210();
              var div_12 = first_child(fragment_5);
              var text_5 = only_child(div_12, true);
              var div_13 = sibling(div_12, 2);
              var text_6 = only_child(div_13, true);
              var div_14 = sibling(div_13, 2);
              var div_15 = child(div_14);
              let classes_3;
              var div_16 = sibling(div_15, 2);
              let classes_4;
              reset(div_14);
              var node_8 = sibling(div_14, 2);
              {
                var consequent_1 = ($$anchor) => {
                  var div_17 = root_10();
                  var node_9 = child(div_17);
                  key(node_9, () => get(active).name, ($$anchor) => {
                    var fragment_6 = comment();
                    var node_10 = first_child(fragment_6);
                    component(node_10, () => get(active).demo, ($$anchor, active_demo) => {
                      active_demo($$anchor, {});
                    });
                    append($$anchor, fragment_6);
                  });
                  reset(div_17);
                  append($$anchor, div_17);
                };
                var alternate = ($$anchor) => {
                  var div_18 = root_11();
                  var markdown = only_child(div_18);
                  template_effect(() => {
                    set_attribute2(div_18, "testId", `docs-${get(active).name ?? ""}`);
                    set_attribute2(markdown, "source", get(active).docs);
                    set_attribute2(markdown, "theme", get(docTheme));
                  });
                  append($$anchor, div_18);
                };
                if_block(node_8, ($$render) => {
                  if (get(view) === "demo")
                    $$render(consequent_1);
                  else
                    $$render(alternate, -1);
                });
              }
              template_effect(() => {
                set_text(text_5, get(active).name);
                set_text(text_6, get(active).description);
                classes_3 = set_class(div_15, 0, "chip svelte-gva9fg", null, classes_3, { sel: get(view) === "demo" });
                classes_4 = set_class(div_16, 0, "chip svelte-gva9fg", null, classes_4, { sel: get(view) === "docs" });
              });
              event("click", div_15, () => set(view, "demo"));
              event("click", div_16, () => set(view, "docs"));
              append($$anchor, fragment_5);
            };
            if_block(node_6, ($$render) => {
              if (get(sheet))
                $$render(consequent);
              else if (get(active))
                $$render(consequent_2, 1);
            });
          }
          reset(div_9);
          append($$anchor, div_9);
        });
        AppShell(node_1, {
          headerCenter,
          sidebarLeft,
          sidebarRight1,
          sidebarRight2,
          center,
          $$slots: {
            headerCenter: true,
            sidebarLeft: true,
            sidebarRight1: true,
            sidebarRight2: true,
            center: true
          }
        });
      }
      append($$anchor, fragment_1);
    }),
    $$slots: { default: true }
  });
  append($$anchor, fragment);
  $$pop_renderer();
  pop();
}
define_styles("svelte-gva9fg", [{ classes: ["side"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; width: 220px; height: 100%; min-height: 0; background-color: var(--bg-surface); border-right-width: 1px; border-color: var(--border)" }, { classes: ["cat"], tag: null, pseudo: null, css: "padding: 12px 8px 4px 8px; font-size: var(--text-xs); color: var(--text-muted); font-weight: 600" }, { classes: ["item"], tag: null, pseudo: null, css: "padding: 6px 8px; border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer" }, { classes: ["item"], tag: null, pseudo: "hover", css: "background-color: var(--bg-raised)" }, { classes: ["themes"], tag: null, pseudo: null, css: "display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; padding: 12px; border-top-width: 1px; border-color: var(--border)" }, { classes: ["chip"], tag: null, pseudo: null, css: "padding: 3px 8px; border-radius: var(--radius-full); font-size: var(--text-xs); color: var(--text-secondary); background-color: var(--bg-raised); cursor: pointer" }, { classes: ["main"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "column", flexGrow: 1, paddingTop: 32, paddingRight: 40, paddingBottom: 32, paddingLeft: 40, gap: 6, overflow: "scroll" } }, { classes: ["title"], tag: null, pseudo: null, css: "font-size: var(--text-2xl); font-weight: 700" }, { classes: ["desc"], tag: null, pseudo: null, css: "color: var(--text-secondary); padding-bottom: 20px" }, { classes: ["views"], tag: null, pseudo: null, style: { display: "flex", flexDirection: "row", gap: 4, marginBottom: 14 } }, { classes: ["stage"], tag: null, pseudo: null, css: "display: flex; flex-direction: column; padding: 24px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg)" }, { classes: ["item", "sel"], tag: null, pseudo: null, css: "background-color: var(--theme-color-sub); color: var(--theme-color)" }, { classes: ["chip", "sel"], tag: null, pseudo: null, css: "background-color: var(--theme-color); color: var(--text-theme)" }, { classes: ["stage", "docs"], tag: null, pseudo: null, style: { alignItems: "stretch" } }]);

// gallery/web.ts
render2(Gallery, { title: "gpuix-fractalsvelte-ui gallery", width: 1100, height: 760 });
