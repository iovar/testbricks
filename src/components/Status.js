// vi: ft=html
import { updateDom } from '../lib/dom.js';
import { proxify } from '../lib/proxy.js';

// <style>
const getStyles = () => (`
    :host {
        display: block;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        text-align: center;
    }

    .block-heap {
        width: calc(80% + 8px);
        border: 4px solid;
        overflow: hidden;
    }

    .number-block {
        text-transform: uppercase;
        background: var(--fg-col);
        color: var(--bg-col);
        border-radius: 4px;
        padding: 4px 16px;
    }
`);
// </style>

const getTemplate = (values) => (`
    <section class="container">
        <h3 class="number-block score"><small>Score</small> <br />${values.score} </h3>
        <h3 class="number-block level"><small>Level</small> <br />${values.level}</h3>
        <h3 class="number-block lines"><small>Lines</small> <br />${values.lines}</h3>
        <block-heap class="block-heap" board:="${values.nextblock}"></block-heap>
    </section>
`);

// <script>

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(getStyles());

export class StatusComponent extends HTMLElement {
    static register(name='status-component') {
        if (!customElements.get(name)) {
            customElements.define(name, StatusComponent);
        }
    }
    static observedAttributes = ['score', 'level', 'lines', 'nextblock'];

    #values = {
        score: 0,
        level: 0,
        lines: 0,
        nextblock: '[[]]',
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.#values = proxify(this, this.#values);
    }

    connectedCallback() {
        this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
        this.render();
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        this.#values[attr] = newValue;
    }

    render() {
        updateDom(this.shadowRoot, getTemplate(this.#values));
    }
}

// </script>
