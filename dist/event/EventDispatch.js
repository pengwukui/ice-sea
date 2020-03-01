var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
import { Injector } from "../inject/Injector";
import { boundMethod } from "autobind-decorator";
var EventDispatcher = /** @class */ (function() {
  function EventDispatcher() {
    this.eventMap = {};
  }
  EventDispatcher.prototype.dispatch = function(event, data) {
    if (!this.eventMap[event]) {
      return;
    }
    var events = this.eventMap[event];
    for (var index = events.length - 1; index >= 0; index--) {
      var eventData = events[index];
      eventData.data = data || null;
      eventData.handler(data);
      if (eventData.once) {
        events.splice(index, 1);
      }
    }
  };
  EventDispatcher.prototype.addEventListener = function(event, handler, once) {
    var data = {
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
  };
  EventDispatcher.prototype.removeEventListener = function(event, handler) {
    if (!this.eventMap[event]) {
      return;
    }
    var events = this.eventMap[event];
    for (var index = events.length - 1; index >= 0; index--) {
      var eventData = events[index];
      if (eventData.handler == handler) {
        events.splice(index, 1);
        break;
      }
    }
  };
  EventDispatcher.prototype.removeEventListeners = function(event) {
    if (!this.eventMap[event]) {
      return;
    }
    this.eventMap[event] = [];
  };
  return EventDispatcher;
})();
export { EventDispatcher };
export function eventDispatcher(name) {
  if (name === void 0) {
    name = "root";
  }
  return function(target, propertyKey) {
    var injectName = "event_dispatcher_" + name;
    var dispatcher;
    try {
      dispatcher = Injector.getInject(injectName);
    } catch (error) {
      dispatcher = new EventDispatcher();
      Injector.mapValue(injectName, dispatcher);
    }
    target[propertyKey] = dispatcher;
  };
}
export function eventBind(constructor) {
  return /** @class */ (function(_super) {
    __extends(class_1, _super);
    function class_1() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var _this = this;
      var self = (_this = _super.call(this) || this);
      var parent = self.__proto__.__proto__;
      var _eventBindList = parent._eventBindList;
      for (
        var _a = 0, _eventBindList_1 = _eventBindList;
        _a < _eventBindList_1.length;
        _a++
      ) {
        var item = _eventBindList_1[_a];
        var event_1 = item.event,
          dispatcher = item.dispatcher,
          funKey = item.funKey,
          once = item.once;
        var disp = void 0;
        var injectName = "event_dispatcher_" + dispatcher;
        try {
          disp = Injector.getInject(injectName);
        } catch (error) {
          //make sure this dispatcher is available.
          disp = new EventDispatcher();
          Injector.mapValue(injectName, disp);
        }
        if (disp) {
          disp.addEventListener(event_1, _this[funKey].bind(_this), once);
        }
      }
      delete parent._eventBindList;
      return _this;
    }
    return class_1;
  })(constructor);
}
export function eventListener(event, dispatcher, once) {
  if (dispatcher === void 0) {
    dispatcher = "root";
  }
  if (once === void 0) {
    once = false;
  }
  return function(target, propertyKey, descriptor) {
    if (!target._eventBindList) {
      target._eventBindList = [];
    }
    target._eventBindList.push({
      event: event,
      dispatcher: dispatcher,
      funKey: propertyKey,
      once: once
    });
  };
}
