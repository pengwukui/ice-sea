export function command(Command) {
    return function (target, propertyKey) {
        target[propertyKey] = {
            excute: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var handler = new Command();
                handler.excute.apply(null, args);
            }
        };
    };
}
