import { Injector } from "../inject/Injector";
import "reflect-metadata";

export class EventDispatcher implements IEventDispatcher {
  private eventMap: { [key: string]: EventData[] } = {};
  public dispatch(event: string, data?: any): void {
    if (!this.eventMap[event]) {
      return;
    }

    let events = this.eventMap[event];
    for (let index = events.length - 1; index >= 0; index--) {
      const eventData = events[index];
      eventData.data = data || null;
      eventData.handler(data);
      if (eventData.once) {
        events.splice(index, 1);
      }
    }
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

    if (!this.eventMap[event]) {
      this.eventMap[event] = [];
    }

    this.eventMap[event].push(data);
  }
  public removeEventListener(event: string, handler: IEventHandler): void {
    if (!this.eventMap[event]) {
      return;
    }

    let events = this.eventMap[event];
    for (let index = events.length - 1; index >= 0; index--) {
      const eventData = events[index];
      if (eventData.handler == handler) {
        events.splice(index, 1);
        break;
      }
    }
  }
  public removeEventListeners(event: string): void {
    if (!this.eventMap[event]) {
      return;
    }

    this.eventMap[event] = [];
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
 * @param name namespace,defualt is 'root'
 */
export function eventDispatcher(name: string = "root") {
  return function(target: any, propertyKey: string) {
    let injectName = "event_dispatcher_" + name;
    let dispatcher = Injector.getInject(injectName);
    if (!dispatcher) {
      dispatcher = new EventDispatcher();
      Injector.mapValue(injectName, dispatcher);
    }

    target[propertyKey] = dispatcher;
  };
}

/**
 * bind event listeners
 * @param constructor
 */
export function eventBind<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  let _eventBindList = [];
  let prototype = constructor.prototype;
  let keys = Reflect.getOwnMetadataKeys(prototype);
  keys.forEach((key: string) => {
    if (key.indexOf("event-") === 0) {
      let data = Reflect.getOwnMetadata(key, prototype);
      Reflect.deleteMetadata(key, prototype);
      _eventBindList.push(data);
    }
  });

  return class extends constructor {
    constructor(...args) {
      super(...args);

      for (const item of _eventBindList) {
        let { event, dispatcher, funKey, once } = item;
        let disp: IEventDispatcher;
        let injectName = "event_dispatcher_" + dispatcher;
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
  return function(
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

    Reflect.defineMetadata("event-" + propertyKey, obj, target);
  };
}
