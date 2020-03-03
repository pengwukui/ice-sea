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
  let prototype = constructor.prototype;
  if (!prototype.hasOwnProperty("_eventBindList")) {
    return;
  }

  //取出原型链中数据
  let _eventBindList = prototype._eventBindList;
  //删除原型链中数据，防止污染
  delete prototype._eventBindList;
  return class extends constructor {
    constructor(...args) {
      super();

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
    }
  };
}

/**
 *
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
    if (!target.hasOwnProperty("_eventBindList")) {
      target._eventBindList = [];
    }

    //将数据保存在原型链中
    target._eventBindList.push({
      event,
      dispatcher,
      funKey: propertyKey,
      once
    });
  };
}
