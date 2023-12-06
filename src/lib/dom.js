export const clsj = (obj) => Object.keys(obj).filter(key => obj[key]).join(' ');

export const domDiff = (oldDom, newDom, root = true, replacements = [], removals = [], additions = []) => {
    for (let i = 0; i < oldDom.childNodes.length && i < newDom.childNodes.length; i++) {
        if (oldDom.childNodes[i].isEqualNode(newDom.childNodes[i])) {
            continue;
        }

        if ((oldDom.childNodes[i].localName !== newDom.childNodes[i].localName) || !oldDom.childNodes[i].getAttributeNames) {
            replacements.push([oldDom.childNodes[i], newDom.childNodes[i]])
        } else if ((oldDom.childNodes[i].childNodes.length || newDom.childNodes[i].childNodes.length) && !customElements.get(oldDom.childNodes[i].localName)) {
            domDiff(oldDom.childNodes[i], newDom.childNodes[i], false, replacements, removals, additions);
        }

        if (oldDom.childNodes[i].getAttributeNames) {
            const oldAttr = oldDom.childNodes[i].getAttributeNames();
            const newAttr = newDom.childNodes[i].getAttributeNames();
            const removed = oldAttr.filter((a) => !newAttr.includes(a));
            const sameAttrs = !removed.length && newAttr.length === oldAttr.length && oldAttr.every((a) => oldDom.childNodes[i].getAttribute(a) === newDom.childNodes[i].getAttribute(a));

            if (!sameAttrs) {
                removed.forEach((a) => oldDom.childNodes[i].removeAttribute(a));
                newAttr.forEach((a) => oldDom.childNodes[i].setAttribute(a, newDom.childNodes[i].getAttribute(a)));
            }
        }
    }

    if (oldDom.childNodes.length < newDom.childNodes.length) {
        for (let i = oldDom.childNodes.length; i < newDom.childNodes.length; i++) {
            additions.push([oldDom, newDom.childNodes[i]]);
        }
    } else if (oldDom.childNodes.length > newDom.childNodes.length) {
        for (let i = newDom.childNodes.length; i < oldDom.childNodes.length; i++) {
            removals.push([oldDom, oldDom.childNodes[i]]);
        }
    }

    if (root) {
        removals.forEach((r) => r[0].removeChild(r[1]));
        additions.forEach((a) => a[0].appendChild(a[1]));
        replacements.forEach((r) => r[0].replaceWith(r[1]));
    }
}

export const updateDom = (root, templateString) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(templateString, 'text/html')
    const newBody = doc.getElementsByTagName('body')[0];

    domDiff(root, newBody);
}
