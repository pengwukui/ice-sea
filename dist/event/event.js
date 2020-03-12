var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Injector } from "../inject/inject";
//import "reflect-metadata";
var EVENT_LISTENER_SYMBOL_KEY = "$eventListener";
var EVENT_DISPATCHER_KEY = "event_dispatcher_";
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
        this.eventMap = new Map();
    }
    EventDispatcher.prototype.dispatch = function (event, data) {
        var events = this.eventMap.get(event);
        if (!events) {
            return;
        }
        events.forEach(function (eventData) {
            eventData.handler(data);
            if (eventData.once) {
                events.delete(eventData);
            }
        });
    };
    EventDispatcher.prototype.addEventListener = function (event, handler, once) {
        var data = {
            type: event,
            dispatcher: this,
            data: null,
            once: once,
            handler: handler
        };
        var set = this.eventMap.get(event);
        if (!set) {
            set = new Set();
            this.eventMap.set(event, set);
        }
        set.add(data);
    };
    EventDispatcher.prototype.removeEventListener = function (event, handler) {
        var events = this.eventMap.get(event);
        if (!events) {
            return;
        }
        events.forEach(function (data) {
            if (data.handler === handler) {
                events.delete(data);
            }
        });
    };
    EventDispatcher.prototype.removeEventListeners = function (event) {
        this.eventMap.delete(event);
    };
    return EventDispatcher;
}());
export { EventDispatcher };
/**
 * bind a event dispatcher.if not exist,then create one.
 * @param channel channel as namespace,defualt is 'root'
 */
export function eventDispatcher(channel) {
    if (channel === void 0) { channel = "root"; }
    return function (target, propertyKey) {
        var injectName = EVENT_DISPATCHER_KEY + channel;
        var dispatcher = Injector.getInject(injectName);
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
export function eventPublisher(event, channel) {
    if (channel === void 0) { channel = 'root'; }
    return function (target, propertyKey, descriptor) {
        var fun = descriptor.value;
        if (typeof fun !== "function") {
            return;
        }
        var injectName = EVENT_DISPATCHER_KEY + channel;
        var disp = Injector.getInject(injectName);
        if (!disp) {
            //make sure this dispatcher is available.
            disp = new EventDispatcher();
            Injector.mapValue(injectName, disp);
        }
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var result = fun.apply(void 0, args);
            disp.dispatch(event, result);
        };
    };
}
/**
 * bind event listeners
 * @param constructor
 */
export function eventBind(constructor) {
    var symbol = Symbol.for(EVENT_LISTENER_SYMBOL_KEY);
    if (!constructor.prototype[symbol]) {
        return;
    }
    var _eventBindList = constructor.prototype[symbol] || [];
    delete constructor.prototype[symbol];
    return /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.apply(this, args) || this;
            for (var _a = 0, _eventBindList_1 = _eventBindList; _a < _eventBindList_1.length; _a++) {
                var item = _eventBindList_1[_a];
                var event = item.event, dispatcher = item.dispatcher, funKey = item.funKey, once = item.once;
                var disp = void 0;
                var injectName = EVENT_DISPATCHER_KEY + dispatcher;
                disp = Injector.getInject(injectName);
                if (!disp) {
                    //make sure this dispatcher is available.
                    disp = new EventDispatcher();
                    Injector.mapValue(injectName, disp);
                }
                if (disp) {
                    disp.addEventListener(event, _this[funKey].bind(_this), once);
                }
            }
            return _this;
        }
        return class_1;
    }(constructor));
}
/**
 * add event listener,make sure add the class decorator [@eventBind]
 * @param event event name
 * @param dispatcher the event dispather namespace
 * @param once if true,event bind will auto removed after one handler
 */
export function eventListener(event, dispatcher, once) {
    if (dispatcher === void 0) { dispatcher = "root"; }
    if (once === void 0) { once = false; }
    return function (target, propertyKey, descriptor) {
        var obj = {
            event: event,
            dispatcher: dispatcher || "root",
            funKey: propertyKey,
            once: once
        };
        var symbol = Symbol.for(EVENT_LISTENER_SYMBOL_KEY);
        var eventListenerList = target[symbol] || [];
        eventListenerList.push(obj);
        target[symbol] = eventListenerList;
        //Reflect.defineMetadata("event-" + propertyKey, obj, target);
    };
}
