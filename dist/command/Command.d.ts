export interface ICommand {
    excute(...args: any[]): any;
}
interface ICommandConstruct {
    new (): ICommand;
}
export declare function command(Command: ICommandConstruct): (target: any, propertyKey: string) => void;
export {};
