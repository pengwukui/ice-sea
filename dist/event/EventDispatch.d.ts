export declare class EventDispatcher implements IEventDispatcher {
    private eventMap;
    dispatch(event: string, data?: any): void;
    addEventListener(event: string, handler: IEventHandler, once?: boolean): void;
    removeEventListener(event: string, handler: IEventHandler): void;
    removeEventListeners(event: string): void;
}
export interface IEventDispatcher {
    dispatch(event: string, data?: any): void;
    addEventListener(event: string, handler: IEventHandler, once?: boolean): void;
    removeEventListener(event: string, handler: IEventHandler): void;
    removeEventListeners(event: string): void;
}
export interface IEventHandler {
    (event: EventData): void;
}
export interface EventData {
    type: string;
    dispatcher: IEventDispatcher;
    data: any;
    once: boolean;
    handler: IEventHandler;
}
export declare function eventDispatcher(name?: string): (target: any, propertyKey: string) => void;
export declare function eventBind<T extends {
    new (...args: any[]): {};
}>(constructor: T): {
    new (...args: any[]): {};
} & T;
export declare function eventListener(event: string, dispatcher?: string, once?: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
