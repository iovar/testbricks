// vi: ft=html
import { updateDom } from '../lib/dom.js';

// <style>
const getStyles = (width, height) => (`
    :host {
        display: block;
    }

    .container {
        display: grid;
        grid-template-rows: repeat(${height}, 1fr);
        grid-template-columns: repeat(${width}, 1fr);
    }

    .block {
        aspect-ratio: 1;
        border: 1px solid var(--bg-col);
        background: var(--fg-col);
        opacity: 0.1;
    }

    .block.active {
        opacity: 1;
    }
`);
// </style>

const getTemplate = (board) => (`
    <section class="container">
        ${board.map((row) => (`
            ${row.map((block) => (`
                <div class="block ${block ? 'active' : ''}"></div>
            `)).join('')}
        `)).join('')}
    </section>
`);

// <script>

export class BlockHeap extends HTMLElement {
    static register(name='block-heap') {
        if (!customElements.get(name)) {
            customElements.define(name, BlockHeap);
        }
    }
    static observedAttributes = ['board:'];
    width = 0;
    height = 0;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'board:' && newValue.length) {
            const board = JSON.parse(newValue);
            const width = board[0].length;
            const height = board.length;

            if (width !== this.width || height !== this.height) {
                this.width = width;
                this.length = length;
                const styleSheet = new CSSStyleSheet();
                styleSheet.replaceSync(getStyles(width, length));
                this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
            }

            this.render(board);
        }
    }

    render(board) {
        updateDom(this.shadowRoot, getTemplate(board));
    }
}

// </script>
