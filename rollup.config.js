import postcss from "postcss";
import cssModules from "postcss-modules";

const outDir = process.env.OUT_DIR  || 'dist';

export default [
  {
    input: `${__dirname}/src/index.js`,
    output: [{ format: "esm", file: `${outDir}/index.mjs` }],
    plugins: [styles({ output: "styles.css" })],
  },
];

function styles() {
  const filter = (id) => id.endsWith(".css");

  const styleProcessor = postcss([cssModules({ getJSON() {} })]);

  const cssByFile = {};

  return {
    name: "styles",

    async transform(source, id) {
      if (!filter(id)) {
        return null;
      }

      const postCssOutput = await styleProcessor
        .process(source, { from: id })
        .then((result) => ({
          css: result.css,
          tokens: result.messages.find(({ plugin, type }) => {
            return plugin === "postcss-modules" && type === "export";
          }).exportTokens,
        }));

      cssByFile[id] = postCssOutput.css;

      const properties = JSON.stringify(postCssOutput.tokens, null, 2);
      return `export default ${properties};`;
    },

    generateBundle(_generateOptions, bundles) {
      // Items are added to cssByFile based on the order that transforms are
      // resolved. This may change between runs so we can't rely on it.
      // The contents of the emitted css file should use the order in which the
      // files were referenced in the compiled javascript, which can be obtained
      // by looking at bundles[].modules.
      // Note this.getModuleIds() returns contents in a different order, so that
      // can't be used

      // In v1 this contains all modules in the bundle
      // In v2 it no longer includes `component-with-global-styles.css` which has no exports
      const bundleModuleIds = Object.values(bundles).flatMap((bundle) =>
        Object.keys(bundle.modules)
      );

      const styleIdsNotReferencedInModuleIds = Object.keys(cssByFile).filter(
        (id) => !bundleModuleIds.includes(id)
      );

      if (styleIdsNotReferencedInModuleIds.length) {
        const formatedMissingIds = styleIdsNotReferencedInModuleIds.join("\n");
        this.warn(
          `Uh-oh, cssByFile contains ids not present in bundleModuleIds. Missing:\n${formatedMissingIds} `
        );

        // Using this.moduleIds instead of this.getModuleIds() because it works in both v1 and v2
        console.log({bundleModuleIds, moduleIds: Array.from(this.moduleIds)})
      }

      const css = bundleModuleIds
        .filter((id) => id in cssByFile)
        .map((id) => cssByFile[id])
        .join("\n\n");

      // Regular css file
      this.emitFile({ type: "asset", fileName: "index.css", source: css });
    },
  };
}
