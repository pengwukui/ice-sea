export interface ICommand {
    excute(...args);
}

interface ICommandConstruct {
    new(): ICommand;
}

export function command(Command: ICommandConstruct) {
    return function (target: any, propertyKey: string) {
        target[propertyKey] = {
            excute: function (...args) {
                let handler: ICommand = new Command();
                handler.excute.apply(null, args);
            }
        };
    };
}
