// vi: ft=html
import { updateDom } from '../lib/dom.js';
import { proxify } from '../lib/proxy.js';

// <style>
const getStyles = () => (`
    :host { display: block; }
    .container {
        aspect-ratio: 3/4;

        border: 2px solid var(--fg-col);
        width: calc(56.25svh - 8px);
        margin: 0 auto;

        display:  grid;
        grid-template-columns: 2fr 1fr;
    }

    @media (aspect-ratio < 0.57) {
        .container {
            width: 100%;
        }
    }
`);
// </style>

const getTemplate = (values) => (`
    <section class="container">
        <block-heap class="block-heap" board:="${values.board}"></block-heap>
        <status-component
            class="status"
            score="${values.score}"
            level="${values.level}"
            lines="${values.lines}"
            nextblock="${values.nextblock}"
        >
        </status-component>
    </section>
`);

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(getStyles());

// <script>
export class Display extends HTMLElement {
    static register(name='display-component') {
        if (!customElements.get(name)) {
            customElements.define(name, Display);
        }
    }
    static observedAttributes = ['board', 'score', 'level', 'lines', 'nextblock'];
    #values = {
        board: '[[]]',
        score: 312,
        level: 0,
        lines: 0,
        nextblock: '[[]]',
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#values = proxify(this, this.#values);
    }

    connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        this.render();
    }

    attributeChangedCallback(prop, oldValue, newValue) {
        this.#values[prop] = newValue;
    }

    render() {
        updateDom(this.shadowRoot, getTemplate(this.#values));
    }
}
// </script>
