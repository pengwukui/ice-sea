export class Injector {
    static mapValue(key, value, override = false) {
        if (!key || key === "") {
            throw new Error(`inject value fail!,key must be defined.`);
        }
        if (this.isMapped(key) && !override) {
            throw new Error(`inject value fail!,key=${key} is already injected.`);
        }
        this.valueMap.set(key, value);
    }
    static mapClass(key, clazz) {
        if (typeof clazz !== "function") {
            throw new Error(`inject value fail!,it's not a class.`);
        }
        if (this.isMapped(key)) {
            throw new Error(`inject value fail!,key=${key} is already injected.`);
        }
        this.classMap.set(key, clazz);
    }
    static destroy() {
        this.valueMap.clear();
        this.valueMap = null;
        this.classMap.clear();
        this.classMap = null;
    }
    static isMapped(key) {
        return this.valueMap.has(key) || this.classMap.has(key);
    }
    static getInject(key) {
        if (this.valueMap.has(key)) {
            return this.valueMap.get(key);
        }
        else if (this.classMap.has(key)) {
            let clazz = this.classMap.get(key);
            return new clazz();
        }
        return null;
    }
}
Injector.valueMap = new Map();
Injector.classMap = new Map();
export function inject(target, prop) {
    Object.defineProperty(target, prop, {
        get() {
            return Injector.getInject(prop);
        },
        set() { },
        enumerable: true,
        configurable: false
    });
}
export function injectClass(...params) {
    return function (target, prop) {
        return {
            get() {
                let clazz = Injector.getInject(prop);
                if (clazz) {
                    return new clazz(...params);
                }
                else {
                    return null;
                }
            },
            set() { },
            enumerable: true,
            configurable: false
        };
    };
}
export function injects(config) {
    if (!Array.isArray(config)) {
        return;
    }
    return function classDecorator(constructor) {
        for (const key of config) {
            inject(constructor.prototype, key);
        }
    };
}
