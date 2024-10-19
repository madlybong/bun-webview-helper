import _ from "lodash";
import { SizeHint } from "webview-bun";

export interface WindowConfig {
  width: Number;
  height: Number;
  hint?: SizeHint;
  title?: string;
  html?: string | undefined;
  navigationUrl?: string | undefined;
  actions?: { [K: string]: Function };
}

const defaultConfig: WindowConfig = {
  width: 800,
  height: 600,
  hint: SizeHint.NONE,
  title: "New Window",
  html: undefined,
  navigationUrl: undefined,
  actions: {},
};

// { width }: { width: Number } = { width: 800 },
// { height }: { height: Number } = { height: 600 },
// { hint }: { hint: SizeHint } = { hint: SizeHint.NONE },
// { title }: { title: string } = { title: "New Window" },
// { html }: { html: string | undefined } = { html: undefined },
// { navigationUrl }: { navigationUrl: string | undefined } = {
//   navigationUrl: undefined,
// },
// { actions }: { actions?: { [K: string]: Function } } = {}

export async function wvWorker(
  { config }: { config: WindowConfig } = { config: defaultConfig }
): Promise<Worker | Error> {
  try {
    // console.log("Creating window");

    const bindMethods = _.map(config?.actions, (fn, key) => {
      return `wv.bind("${key}", ${fn});`;
    });
    // console.table(bindMethods);
    const blob = new Blob(
      _.flatten(
        _.concat(
          [
            `declare var self: Worker;`,
            `import { SizeHint, Webview } from "webview-bun";`,
            `import _ from "lodash";`,
            `const wv = new Webview(true, {
              width: ${config?.width},
              height: ${config?.height},
              hint: ${config?.hint},
          });`,
          ],
          _.isArray(bindMethods) ? bindMethods : [],
          [
            `wv.title = '${config?.title || "New Window"}';`,
            `wv.setHTML('${config?.html}');`,
            `wv.navigate('${config?.navigationUrl}');`,
            `wv.run();`,
          ]
        )
      ),
      {
        type: "application/typescript",
      }
    );

    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl, { type: "module" });
    worker.addEventListener("open", () => {
      console.log("New worker.");
    });
    worker.addEventListener("error", (error) => {
      console.log("Worker error.", error);
    });
    return worker;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

////////////////////////////////////////////////////////
//// Check if the thread in blocking ...................
////////////////////////////////////////////////////////

//setInterval(() => {
//  console.log(new Date().toISOString());
//}, 5000);

////////////////////////////////////////////////////////
//// Sample code .......................................
////////////////////////////////////////////////////////

// const press1 = () => {
//   console.log("Triggered from window Press 1");
// };
// const press2 = () => {
//   console.log("Triggered from window Press 2");
// };
// const press3 = () => {
//   console.log("Triggered from window Press 3");
// };

// const wv = newWindow(
//   undefined,
//   undefined,
//   undefined,
//   new Date().toISOString(),
//   `<h1>${new Date().toISOString()}</h1><button onclick="press1();">Click 1</button><button onclick="window.press2();">Click 2</button><button onclick="window.press3();">Click 3</button>`,
//   undefined,
//   { press1: press1, press2: press2, press3: press3 }
// );
