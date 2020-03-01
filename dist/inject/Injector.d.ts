export declare class Injector {
    static mapValue(key: string, value: any, override?: boolean): void;
    static destroy(): void;
    static isMapped(key: string): boolean;
    static getInject(key: string): any;
    private static valueMap;
}
export declare function inject(target: any, prop: any): any;
