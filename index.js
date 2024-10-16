import $9N3Qk$lodash from "lodash";
import {SizeHint as $9N3Qk$SizeHint} from "webview-bun";



var // console.log("Hello via Bun!");
$c3f6c693698dc7cd$export$2e2bcd8739ae039 ////////////////////////////////////////////////////////
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
 = ()=>(width = 800, height = 600, hint = (0, $9N3Qk$SizeHint).MIN, title = "New Window", html, url, actions)=>{
        const bindMethods = (0, $9N3Qk$lodash).map(actions, (fn, key)=>{
            return `wv.bind("${key}", ${fn});`;
        });
        console.table(bindMethods);
        const blob = new Blob((0, $9N3Qk$lodash).flatten((0, $9N3Qk$lodash).concat([
            `declare var self: Worker;`,
            `import { SizeHint, Webview } from "webview-bun";`,
            `import _ from "lodash";`,
            `const wv = new Webview(true, {
                width: ${width},
                height: ${height},
                hint: ${hint},
            });`
        ], (0, $9N3Qk$lodash).isArray(bindMethods) ? bindMethods : [], [
            `wv.title = '${title}';`,
            `wv.setHTML('${html}');`,
            `wv.navigate('${url}');`,
            `wv.run();`
        ])), {
            type: "application/typescript"
        });
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl, {
            type: "module"
        });
        worker.addEventListener("open", ()=>{
            console.log("New worker.");
        });
        worker.addEventListener("error", (error)=>{
            console.log("Worker error.", error);
        });
        return worker;
    };


export {$c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.js.map
