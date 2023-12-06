// vi: ft=html
import { clsj, updateDom } from '../lib/dom.js';
import { proxify } from '../lib/proxy.js';

// <style>
const getStyles = () => (`
    :host {
        display: flex;
    }

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
        overflow: hidden;
        font-size: 32px;
        appearance: none;
        line-height: 100%;
        padding: 0;
    }

    .container, .button {
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
    }

    .button.active {
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
                 class="button ${clsj({ active: values.pressed === index })}"
                 onMouseDown="this.getRootNode().host.onDown(${index})"
                 onMouseUp="this.getRootNode().host.onUp(${index})"
             >${label}</button>
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
    #keydown = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#values = proxify(this, this.#values);
        this.#keydown = ({ code, shiftKey }) => {
            let pressed = -1;

            if (code === 'ArrowLeft') {
                pressed = 0;
            } else if (code === 'ArrowDown') {
                pressed = 1;
            } else if (code === 'ArrowRight') {
                pressed = 2;
            } else if ((code === 'Space' && shiftKey) || (code === 'ArrowUp' && !shiftKey) || code === 'KeyL') {
                pressed = 3;
            } else if ((code === 'Space' && !shiftKey) || (code === 'ArrowUp' && shiftKey) || code === 'KeyR') {
                pressed = 4;
            }

            if (pressed < 0) {
                return;
            }
            this.dispatchEvent(new CustomEvent('press', {
                detail: { pressed }
            }));
        };
    }

    connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesSheet];
        this.render();
        window.addEventListener('keydown', this.#keydown);
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.#keydown);
    }

    attributeChangedCallback(prop, oldValue, newValue) {
        this.#values[prop] = newValue;
    }

    render() {
        updateDom(this.shadowRoot, getTemplate(this.#values));
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
