export class Injector {
  static mapValue(key: string, value: any, override: boolean = false) {
    if (!key || key === "") {
      throw new Error(`inject value fail!,key must be defined.`);
    }

    if (this.isMapped(key) && !override) {
      throw new Error(`inject value fail!,key=${key} is already injected.`);
    }

    this.valueMap[key] = value;
  }

  static destroy() {
    this.valueMap = {};
  }

  static isMapped(key: string): boolean {
    return Boolean(this.valueMap[key]);
  }

  static getInject(key: string) {
    if (!this.isMapped(key)) {
      //throw new Error(`${key} haven't been injected.`);
      return null;
    }

    return this.valueMap[key];
  }

  private static valueMap: { [key: string]: any } = {};
}

export function inject(target, prop): PropertyDescriptor {
  return {
    get() {
      return Injector.getInject(prop);
    },
    set() {},
    enumerable: true,
    configurable: false
  };
}
