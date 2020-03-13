export function command(Command) {
    return function (target, propertyKey) {
        target[propertyKey] = {
            execute: function (...args) {
                let handler = new Command();
                handler.execute.apply(null, args);
            }
        };
    };
}
export function commandExecutor(Command) {
    return function (target, propertyKey, decriptor) {
        let fun = decriptor.value;
        if (typeof fun !== "function") {
            return;
        }
        decriptor.value = (...args) => {
            fun(...args);
            let command = new Command(...args);
            command.execute(...args);
        };
    };
}
