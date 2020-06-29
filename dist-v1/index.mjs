function componentWithGlobalStyles() {
    return `componentWithGlobalStyles: This file doesn't import any named styles`;
}

var styles = {
  "nested-thing": "_nested-thing_1gl10_1"
};

function nestedWithLocalStyles() {
    return `nestedWithLocalStyles: ${styles.thing}`;
}

var styles$1 = {
  "thing": "_thing_pv3jd_1"
};

function componentWithLocalStyles() {
    return `componentWithLocalStyles: ${styles$1.thing} THEN ${nestedWithLocalStyles}`;
}

export { componentWithGlobalStyles, componentWithLocalStyles };
