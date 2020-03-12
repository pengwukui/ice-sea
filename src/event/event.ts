import { Injector } from "../inject/inject";
//import "reflect-metadata";

const EVENT_LISTENER_SYMBOL_KEY = "$eventListener";
const EVENT_DISPATCHER_KEY = "event_dispatcher_";

export class EventDispatcher implements IEventDispatcher {
    private eventMap: Map<string, Set<EventData>> = new Map();
    public dispatch(event: string, data?: any): void {
        let events = this.eventMap.get(event)
        if (!events) {
            return;
        }
        events.forEach(eventData => {
            eventData.handler(data);
            if (eventData.once) {
                events.delete(eventData)
            }
        });
    }

    public addEventListener(
        event: string,
        handler: IEventHandler,
        once?: boolean
    ): void {
        let data: EventData = {
            type: event,
            dispatcher: this,
            data: null,
            once: once,
            handler: handler
        };

        let set = this.eventMap.get(event);
        if (!set) {
            set = new Set();
            this.eventMap.set(event, set);
        }
        set.add(data);
    }
    public removeEventListener(event: string, handler: IEventHandler): void {
        let events = this.eventMap.get(event);
        if (!events) {
            return;
        }

        events.forEach((data) => {
            if (data.handler === handler) {
                events.delete(data)
            }
        })
    }

    public removeEventListeners(event: string): void {
        this.eventMap.delete(event)
    }
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

/**
 * bind a event dispatcher.if not exist,then create one.
 * @param channel channel as namespace,defualt is 'root'
 */
export function eventDispatcher(channel: string = "root") {
    return function (target: any, propertyKey: string) {
        let injectName = EVENT_DISPATCHER_KEY + channel;
        let dispatcher = Injector.getInject(injectName);
        if (!dispatcher) {
            dispatcher = new EventDispatcher();
            Injector.mapValue(injectName, dispatcher);
        }

        target[propertyKey] = dispatcher;
    };
}

/**
 * auto diapacher an event,when this method called.
 * @param event the event name
 * @param channel channel as namespace,defualt is 'root'
 */
export function eventPublisher(event: string, channel: string = 'root') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let fun = descriptor.value;
        if (typeof fun !== "function") {
            return;
        }
        let injectName = EVENT_DISPATCHER_KEY + channel
        let disp: IEventDispatcher = Injector.getInject(injectName);
        if (!disp) {
            //make sure this dispatcher is available.
            disp = new EventDispatcher();
            Injector.mapValue(injectName, disp);
        }

        descriptor.value = (...args) => {
            let result = fun(...args);
            disp.dispatch(event, result)
        }
    }
}

/**
 * bind event listeners
 * @param constructor
 */
export function eventBind<T extends { new(...args: any[]): {} }>(
    constructor: T
) {
    let symbol = Symbol.for(EVENT_LISTENER_SYMBOL_KEY)
    if (!constructor.prototype[symbol]) { return }
    let _eventBindList = constructor.prototype[symbol] || [];
    delete constructor.prototype[symbol];

    return class extends constructor {
        constructor(...args) {
            super(...args);

            for (const item of _eventBindList) {
                let { event, dispatcher, funKey, once } = item;
                let disp: IEventDispatcher;
                let injectName = EVENT_DISPATCHER_KEY + dispatcher;
                disp = Injector.getInject(injectName);
                if (!disp) {
                    //make sure this dispatcher is available.
                    disp = new EventDispatcher();
                    Injector.mapValue(injectName, disp);
                }

                if (disp) {
                    disp.addEventListener(event, this[funKey].bind(this), once);
                }
            }
        }
    };
}

/**
 * add event listener,make sure add the class decorator [@eventBind]
 * @param event event name
 * @param dispatcher the event dispather namespace
 * @param once if true,event bind will auto removed after one handler
 */
export function eventListener(
    event: string,
    dispatcher: string = "root",
    once: boolean = false
) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        let obj = {
            event,
            dispatcher: dispatcher || "root",
            funKey: propertyKey,
            once
        };

        let symbol = Symbol.for(EVENT_LISTENER_SYMBOL_KEY);
        let eventListenerList = target[symbol] || [];
        eventListenerList.push(obj)
        target[symbol] = eventListenerList
        //Reflect.defineMetadata("event-" + propertyKey, obj, target);
    };
}
