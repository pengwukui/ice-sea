export interface ICommand {
    execute(...args: any[]): any;
}
interface ICommandConstruct {
    new (...args: any[]): ICommand;
}
export declare function command(Command: ICommandConstruct): (target: any, propertyKey: string) => void;
export declare function commandExecutor(Command: ICommandConstruct): (target: any, propertyKey: any, decriptor: PropertyDescriptor) => void;
export {};
