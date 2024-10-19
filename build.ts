console.clear();
const buildLib = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  external: ["lodash"],
  plugins: [],
  minify: true,
  target: "bun",
});

if (buildLib.success == true) {
  console.log("Build success. ✔️");
} else {
  console.log(buildLib.logs);
}
