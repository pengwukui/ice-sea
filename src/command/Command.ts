export interface ICommand {
    execute(...args);
}

interface ICommandConstruct {
    new(...args): ICommand;
}

export function command(Command: ICommandConstruct) {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = {
            execute: function (...args) {
                let handler: ICommand = new Command();
                handler.execute.apply(null, args);
            }
        };
    };
}

export function commandExecutor(Command: ICommandConstruct) {
    return function (target: any, propertyKey, decriptor: PropertyDescriptor) {
        let fun = decriptor.value;
        if (typeof fun !== "function") {
            return;
        }

        decriptor.value = (...args) => {
            fun(...args);
            let command = new Command(...args);
            command.execute(...args)
        }
    }
}