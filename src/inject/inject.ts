export class Injector {
    static mapValue(key: string, value: any, override: boolean = false) {
        if (!key || key === "") {
            throw new Error(`inject value fail!,key must be defined.`);
        }

        if (this.isMapped(key) && !override) {
            throw new Error(`inject value fail!,key=${key} is already injected.`);
        }

        this.valueMap.set(key, value)
    }

    static destroy() {
        this.valueMap.clear();
        this.valueMap = null;
    }

    static isMapped(key: string): boolean {
        return this.valueMap.has(key)
    }

    static getInject(key: string) {
        if (!this.isMapped(key)) {
            //throw new Error(`${key} haven't been injected.`);
            return null;
        }

        return this.valueMap.get(key)
    }

    private static valueMap: Map<string, any> = new Map();
}

export function inject(target, prop): PropertyDescriptor {
    return {
        get() {
            return Injector.getInject(prop);
        },
        set() { },
        enumerable: true,
        configurable: false
    };
}
