// vi: ft=html
import { proxify } from '../lib/proxy.js';

// <style>
const getStyles = () => (`
    .container {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-column-gap: 8px;
        padding: 8px;
        container-type: size;
        height: 100%;
    }

    .button {
        height: calc(100% - 16px);
        width: auto;
        aspect-ratio: 1;
        margin: 0 auto;
        background: var(--fg-col);
        color: var(--bg-col);
        border-radius: 100%;
        border: 4px solid var(--fg-col);
        font-size: 32px;
        appearance: none;
    }

    .button:active {
        background: var(--bg-col);
        color: var(--fg-col);
    }

    @container (aspect-ratio < 5) {
        .button {
            height:  auto;
            width: 100%;
            margin: auto 0;
        }
    }
`);
// </style>

const getTemplate = (values) => (`
    <section class="container">
        ${['⇦ ', '⇩ ', '⇨ ', '↺ ', '↻ '].map((label, index) =>(`
            <button
                 class="button ${values.pressed === index ? 'active' : '' }"
                 onMouseDown="this.getRootNode().host.onDown(${index})"
                 onMouseUp="this.getRootNode().host.onUp(${index})"
             > ${label}  </button>
        `)).join('')}
    </section>
`);

// <script>
const stylesSheet = new CSSStyleSheet();
stylesSheet.replaceSync(getStyles());

export class Controls extends HTMLElement {
    static register(name='controls-component') {
        if (!customElements.get(name)) {
            customElements.define(name, Controls);
        }
    }
    static observedAttributes = ['onpress'];
    #values = { pressed: -1 }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#values = proxify(this, this.#values);
    }

    connectedCallback() {
        // add global listeners, remove in dis
        this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesSheet];
        this.render();
    }

    disconnectedCallback() {
        // remove global listeners, remove in dis
    }

    attributeChangedCallback(prop, oldValue, newValue) {
        this.#values[prop] = newValue;
    }

    render() {
        this.shadowRoot.innerHTML = getTemplate(this.#values);
    }

    onDown(pressed) {
        this.#values.pressed = pressed;
        this.dispatchEvent(new CustomEvent('press', {
            detail: { pressed }
        }));
    }

    onUp(released) {
        if (released === this.#values.pressed) {
            this.#values.pressed = -1;
        }
    }
}
// </script>
