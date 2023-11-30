import { TestBricks } from './components/TestBricks.js'
import { Controls } from './components/Controls.js'
import { Display } from './components/Display.js'
import { BlockHeap } from './components/BlockHeap.js'
import { StatusComponent } from './components/Status.js'

// Try the same with <link
document.getElementById('global-styles').content.querySelectorAll('style').forEach((node) => {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(node.innerText);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];
});

Display.register();
TestBricks.register();
Controls.register();
BlockHeap.register();
StatusComponent.register();
