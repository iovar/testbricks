function throttle(callback, duration = 30) {
    let timer = -1;
    return () => {
        if (timer < 0) {
            timer = window.setTimeout(() => (callback(), timer = -1), duration);
        }
    }
}

export const proxify = (context, target) => {
    const render = context.render && throttle(() => context.render());
    const handler = {
        set(target, prop, value) {
            if (prop.endsWith(':')) {
                target[prop.slice(0, -1)] = JSON.parse(value);
            } else if (prop.startsWith('on')) {
                context.removeEventListener(prop.slice(2), target[prop]);
                target[prop] = (event) => (context.getRootNode()?.host || window)[value](event);
                context.addEventListener(prop.slice(2), target[prop]);
            } else {
                target[prop] = value;
            }
            render && !prop.startsWith('on') && render();
            return true;
        },
        get(target, prop) {
            return prop.endsWith(':') ? target[prop.slice(0, -1)] : target[prop];
        }
    };
    return new Proxy(target, handler);
};
