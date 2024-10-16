import _ from "lodash";
import { SizeHint } from "webview-bun";

// console.log("Hello via Bun!");

export default () =>
  (
    width: Number = 800,
    height: Number = 600,
    hint: SizeHint = SizeHint.MIN,
    title: string = "New Window",
    html: string | undefined = undefined,
    url: string | undefined = undefined,
    actions?: { [K: string]: Function }
  ): Worker => {
    const bindMethods = _.map(actions, (fn, key) => {
      return `wv.bind("${key}", ${fn});`;
    });
    console.table(bindMethods);
    const blob = new Blob(
      _.flatten(
        _.concat(
          [
            `declare var self: Worker;`,
            `import { SizeHint, Webview } from "webview-bun";`,
            `import _ from "lodash";`,
            `const wv = new Webview(true, {
                width: ${width},
                height: ${height},
                hint: ${hint},
            });`,
          ],
          _.isArray(bindMethods) ? bindMethods : [],
          [
            `wv.title = '${title}';`,
            `wv.setHTML('${html}');`,
            `wv.navigate('${url}');`,
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
  };

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
