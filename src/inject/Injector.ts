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
      throw new Error(`${key} haven't been injected.`);
    }

    return this.valueMap[key];
  }

  private static valueMap: { [key: string]: any } = {};
}

export function inject(target, prop): any {
  return {
    get() {
      return Injector.getInject(prop);
    }
  };
}

export function injectValues(values: string[]) {
  return;
}
