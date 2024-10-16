import { SizeHint, Webview } from "webview-bun";

const wv = new Webview(true, {
  height: 600,
  width: 800,
  hint: SizeHint.MIN,
});
wv.title = "NRD Global";
wv.run();
