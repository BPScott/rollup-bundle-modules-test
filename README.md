# A repoduction repo showing Rollup v2 not exposing all modules in a bundle

## Root problem

In the `generateBundle` hook you can do the following to get a list of all the modules used within a bundle.

```js
 generateBundle(_generateOptions, bundles) {
    const bundleModuleIds = Object.values(bundles).flatMap((bundle) =>
        Object.keys(bundle.modules)
    );
 }
```

In rollup v1 all modules ids are present in that array.

In rollup v2 this array is missing any modules that have been treeshaken away (due to not having any of their exports be used). I feel that references to these modules should be present.

Without their presence it is not possible to fully understand the order that modules are imported in the bundle.

## Use case

This repo contains a stripped down version of a css handling plugin. It identifies all imported css files, runs them through postcss and css-modules, which gives the files some potential outputs (a single default export which is an object containing namespaced versions of the css class names used in that file, if no classnames are used then a default object is exported). It then builds an output css file based upon the css content referenced in the bundle.

Order is important here - the contents of the generated css file should match the order that the files were referenced - and thus I can't just use `this.moduleIds` as it does not reflect the import order.

## Reproduction steps

- `npm run test-v1` generates the `dist-v1` folder using rollup@1.32.1
- `npm run test-v2` generates the `dist-v2` folder using rollup@2.18.1

Note that the contents of the `dist-v1/index.css` and `dist-v2/index.css` files differ.

`dist-v2/index.css` has omitted the contents of `src/component-with-global-styles.css`. This contents of this file is not used in JS so may be tree-shaken away.

This is because there is no reference to that file in `bundles[].modules`.

Running `npm run test-v2` will result in following debug message (per rollup.config.js line 65):

```
(!) Plugin styles: Uh-oh, cssByFile contains ids not present in bundleModuleIds. Missing:
/Users/ben/projects/rollup-bundle-modules-test/src/component-with-global-styles.css
```


## Expected behavour

Rollup v2 should behave the same as Rollup v1 - `src/component-with-global-styles.css` should be present in the `bundles['index.mjs']` object, which in turn will result in its css content being present in index.css.
