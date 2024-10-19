// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/webview-bun/build/libwebview.dll
var require_libwebview = __commonJS((exports, module) => {
  module.exports = "./libwebview-x569zfta.dll";
});

// node_modules/webview-bun/build/libwebview.dylib
var require_libwebview2 = __commonJS((exports, module) => {
  module.exports = "./libwebview-yvy5xxrv.dylib";
});

// src/index.ts
import _ from "lodash";

// node_modules/webview-bun/src/ffi.ts
import { dlopen, FFIType, ptr } from "bun:ffi";
function encodeCString(value) {
  return ptr(new TextEncoder().encode(value + "\0"));
}
var instances = [];
var lib_file;
if (process.env.WEBVIEW_PATH) {
  lib_file = await import(process.env.WEBVIEW_PATH);
} else if (process.platform === "win32") {
  lib_file = await Promise.resolve().then(() => __toESM(require_libwebview(), 1));
} else if (process.platform === "linux") {
  lib_file = await import(`../build/libwebview-${process.arch}.so`);
} else if (process.platform === "darwin") {
  lib_file = await Promise.resolve().then(() => __toESM(require_libwebview2(), 1));
} else {
  throw `unsupported platform: ${process.platform}-${process.arch}`;
}
var lib = dlopen(lib_file.default, {
  webview_create: {
    args: [FFIType.i32, FFIType.ptr],
    returns: FFIType.ptr
  },
  webview_destroy: {
    args: [FFIType.ptr],
    returns: FFIType.void
  },
  webview_run: {
    args: [FFIType.ptr],
    returns: FFIType.void
  },
  webview_terminate: {
    args: [FFIType.ptr],
    returns: FFIType.void
  },
  webview_get_window: {
    args: [FFIType.ptr],
    returns: FFIType.ptr
  },
  webview_set_title: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  webview_set_size: {
    args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.void
  },
  webview_navigate: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  webview_set_html: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  webview_init: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  webview_eval: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  webview_bind: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.function, FFIType.ptr],
    returns: FFIType.void
  },
  webview_unbind: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void
  },
  webview_return: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.ptr],
    returns: FFIType.void
  }
});
// node_modules/webview-bun/src/webview.ts
import { CString, FFIType as FFIType2, JSCallback } from "bun:ffi";
class Webview {
  #handle = null;
  #callbacks = new Map;
  get unsafeHandle() {
    return this.#handle;
  }
  get unsafeWindowHandle() {
    return lib.symbols.webview_get_window(this.#handle);
  }
  set size({ width, height, hint }) {
    lib.symbols.webview_set_size(this.#handle, width, height, hint);
  }
  set title(title) {
    lib.symbols.webview_set_title(this.#handle, encodeCString(title));
  }
  constructor(debugOrHandle = false, size = { width: 1024, height: 768, hint: 0 /* NONE */ }, window = null) {
    this.#handle = typeof debugOrHandle === "bigint" || typeof debugOrHandle === "number" ? debugOrHandle : lib.symbols.webview_create(Number(debugOrHandle), window);
    if (size !== undefined)
      this.size = size;
    instances.push(this);
  }
  destroy() {
    for (const callback of this.#callbacks.keys())
      this.unbind(callback);
    lib.symbols.webview_terminate(this.#handle);
    lib.symbols.webview_destroy(this.#handle);
    this.#handle = null;
  }
  navigate(url) {
    lib.symbols.webview_navigate(this.#handle, encodeCString(url));
  }
  setHTML(html) {
    lib.symbols.webview_set_html(this.#handle, encodeCString(html));
  }
  run() {
    lib.symbols.webview_run(this.#handle);
    this.destroy();
  }
  bindRaw(name, callback, arg = null) {
    const callbackResource = new JSCallback((seqPtr, reqPtr, arg2) => {
      const seq = seqPtr ? new CString(seqPtr) : "";
      const req = reqPtr ? new CString(reqPtr) : "";
      callback(seq, req, arg2);
    }, {
      args: [FFIType2.pointer, FFIType2.pointer, FFIType2.pointer],
      returns: FFIType2.void
    });
    this.#callbacks.set(name, callbackResource);
    lib.symbols.webview_bind(this.#handle, encodeCString(name), callbackResource.ptr, arg);
  }
  bind(name, callback) {
    this.bindRaw(name, (seq, req) => {
      const args = JSON.parse(req);
      let result;
      let success;
      try {
        result = callback(...args);
        success = true;
      } catch (err) {
        result = err;
        success = false;
      }
      if (result instanceof Promise) {
        result.then((r) => this.return(seq, success ? 0 : 1, JSON.stringify(r)));
      } else {
        this.return(seq, success ? 0 : 1, JSON.stringify(result));
      }
    });
  }
  unbind(name) {
    lib.symbols.webview_unbind(this.#handle, encodeCString(name));
    this.#callbacks.get(name)?.close();
    this.#callbacks.delete(name);
  }
  return(seq, status, result) {
    lib.symbols.webview_return(this.#handle, encodeCString(seq), status, encodeCString(result));
  }
  eval(source) {
    lib.symbols.webview_eval(this.#handle, encodeCString(source));
  }
  init(source) {
    lib.symbols.webview_init(this.#handle, encodeCString(source));
  }
}
// src/index.ts
async function wvWorker({ config } = { config: defaultConfig }) {
  try {
    const bindMethods = _.map(config?.actions, (fn, key) => {
      return `wv.bind("${key}", ${fn});`;
    });
    const blob = new Blob(_.flatten(_.concat([
      `declare var self: Worker;`,
      `import { SizeHint, Webview } from "webview-bun";`,
      `import _ from "lodash";`,
      `const wv = new Webview(true, {
              width: ${config?.width},
              height: ${config?.height},
              hint: ${config?.hint},
          });`
    ], _.isArray(bindMethods) ? bindMethods : [], [
      `wv.title = '${config?.title || "New Window"}';`,
      `wv.setHTML('${config?.html}');`,
      `wv.navigate('${config?.navigationUrl}');`,
      `wv.run();`
    ])), {
      type: "application/typescript"
    });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl, { type: "module" });
    worker.addEventListener("open", () => {
      console.log("New worker.");
    });
    worker.addEventListener("error", (error) => {
      console.log("Worker error.", error);
    });
    return worker;
  } catch (error) {
    console.error(error);
    return error;
  }
}
var defaultConfig = {
  width: 800,
  height: 600,
  hint: 0 /* NONE */,
  title: "New Window",
  html: undefined,
  navigationUrl: undefined,
  actions: {}
};
export {
  wvWorker
};
