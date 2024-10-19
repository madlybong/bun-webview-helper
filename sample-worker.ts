// import { SizeHint, Webview } from "webview-bun";
import { wvWorker } from "./src";

// const wv = new Webview(true, {
//   height: 600,
//   width: 800,
//   hint: SizeHint.MIN,
// });
// wv.title = "NRD Global";
// wv.run();

(async () => {
  try {
    const win1 = await wvWorker({
      config: { width: 1366, height: 768, navigationUrl: "https://yahoo.com" },
    });
    setInterval(() => {
      console.log(new Date());
    }, 1000);
  } catch (error) {
    console.log(error);
  }
})();
