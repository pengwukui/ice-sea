export declare class Injector {
    static mapValue(key: string, value: any, override?: boolean): void;
    static mapClass(key: string, clazz: {
        new (): any;
    }): void;
    static destroy(): void;
    static isMapped(key: string): boolean;
    static getInject(key: string): any;
    private static valueMap;
    private static classMap;
}
export declare function inject(target: any, prop: any): void;
export declare function injectClass(...params: any[]): (target: any, prop: any) => PropertyDescriptor;
export declare function injects(config: string[]): <T extends new (...args: any[]) => {}>(constructor: T) => void;
