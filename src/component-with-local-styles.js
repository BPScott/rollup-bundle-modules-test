import {nestedWithLocalStyles} from './nested-with-local-styles';

import styles from './component-with-local-styles.css';

export function componentWithLocalStyles() {
    return `componentWithLocalStyles: ${styles.thing} THEN ${nestedWithLocalStyles}`;
}