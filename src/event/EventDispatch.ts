import { Injector } from "../inject/Injector";

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

export function eventDispatcher(name: string = "root") {
  return function(target: any, propertyKey: string) {
    let injectName = "event_dispatcher_" + name;
    let dispatcher;
    try {
      dispatcher = Injector.getInject(injectName);
    } catch (error) {
      dispatcher = new EventDispatcher();
      Injector.mapValue(injectName, dispatcher);
    }

    target[propertyKey] = dispatcher;
  };
}

export function eventBind<T extends { new (...args: any[]): {} }>(
  constructor: T
) {
  return class extends constructor {
    constructor(...args) {
      let self: any = super();
      let parent = self.__proto__.__proto__;
      let _eventBindList = parent._eventBindList;
      for (const item of _eventBindList) {
        let { event, dispatcher, funKey, once } = item;
        let disp: IEventDispatcher;
        let injectName = "event_dispatcher_" + dispatcher;
        try {
          disp = Injector.getInject(injectName);
        } catch (error) {
          //make sure this dispatcher is available.
          disp = new EventDispatcher();
          Injector.mapValue(injectName, disp);
        }

        if (disp) {
          disp.addEventListener(event, this[funKey].bind(this), once);
        }
      }
      delete parent._eventBindList;
    }
  };
}

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
    if (!target._eventBindList) {
      target._eventBindList = [];
    }

    target._eventBindList.push({
      event,
      dispatcher,
      funKey: propertyKey,
      once
    });
  };
}
