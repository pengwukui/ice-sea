var Injector = /** @class */ (function () {
    function Injector() {
    }
    Injector.mapValue = function (key, value, override) {
        if (override === void 0) { override = false; }
        if (!key || key === "") {
            throw new Error("inject value fail!,key must be defined.");
        }
        if (this.isMapped(key) && !override) {
            throw new Error("inject value fail!,key=" + key + " is already injected.");
        }
        this.valueMap.set(key, value);
    };
    Injector.destroy = function () {
        this.valueMap.clear();
        this.valueMap = null;
    };
    Injector.isMapped = function (key) {
        return this.valueMap.has(key);
    };
    Injector.getInject = function (key) {
        if (!this.isMapped(key)) {
            //throw new Error(`${key} haven't been injected.`);
            return null;
        }
        return this.valueMap.get(key);
    };
    Injector.valueMap = new Map();
    return Injector;
}());
export { Injector };
export function inject(target, prop) {
    return {
        get: function () {
            return Injector.getInject(prop);
        },
        set: function () { },
        enumerable: true,
        configurable: false
    };
}
