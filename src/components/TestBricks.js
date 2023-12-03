// vi: ft=html
import { proxify } from '../lib/proxy.js';
import { MAX_LEVEL, startGame } from '../game/game.js';

 //   <style>
const getStyles = () => (`
    :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: 100%;
        padding-top: 35px;
    }

    .game-container {
        display: grid;
        grid-template-rows: 3fr 1fr;
        grid-gap: 8px;
        height: 100%;
    }
`);
//    </style>

const getTemplate = (values) => (`
    <section class="game-container">
        <display-component
            board="${values.board}"
            nextblock="${values.nextblock}"
            score="${values.score}"
            level="${values.level}"
            lines="${values.lines}"
        ></display-component>
        <controls-component onpress="onPress"></controls-component> </section>
`);

// <script>
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(getStyles());

export class TestBricks extends HTMLElement {
    static register(name='test-bricks') {
        if (!customElements.get(name)) {
            customElements.define(name, TestBricks);
        }
    }
    static observedAttributes = ['level:'];

    #values = {
        play: null,
        board: "[[]]",
        nextblock: "[[]]",
        level: 0,
        score: 0,
        lines: 0,
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
        this.shadowRoot.innerHTML = getTemplate(this.#values);
    }

    onPress(event) {
        const { pressed } = event.detail;

        if (this.#values.play) {
            const event = this.#values.play(pressed);
            this.play(event.value, this.#values.level);
        } else if (pressed >=0 && pressed < 3) {
            this.startGame();
        } else if (pressed === 3) {
            this.setAttribute('level:', this.#values.level < 1 ? MAX_LEVEL : this.#values.level - 1)
        } else if (pressed === 4) {
            this.setAttribute('level:', this.#values.level > MAX_LEVEL - 1 ? 0 : this.#values.level + 1)
        }
    }

    play(event, level) {
        if (!event) {
            return;
        }
        const { board, score, lines, nextBlock, gameOver } = event;
        this.#values.board = JSON.stringify(board);
        this.#values.nextblock = JSON.stringify(nextBlock);
        this.#values.score = score;
        this.#values.level = level;
        this.#values.lines = lines;

        if (gameOver) {
            this.#values.play = null;
        }
    }

    startGame() {
        const { level } = this.#values;
        const { play } = startGame(level, (event, newLevel) => this.play(event.value, newLevel));
        this.#values.play = play;
    }
}
// </script>
