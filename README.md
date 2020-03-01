## Ice-work
ice-work是一个超轻量级的typescript与javascript框架。框架仅仅提供有些用来简化你程序的工具，并没有限定你将如何组织你的代码。你可以自由的使用它。
ice的名字来源于inject,command,event三个单词。分别代表框架提供三种主要功能：依赖注入，命令处理，事件机制。
## Inject
依赖注入。你可以在任何一个类的属性前面使用一个装饰器，用来注入你事先已经产生依赖的对象。
比如：
```typescript
//其他地方
Inject.mapValue('prop',"hello world");

//a.ts

class A{
    @inject
    prop:string

    print(){
        console.log(this.prop);
    }
}

let a = new A();
a.print();  
```

如果调用对象的A的print()方法，你将可以在控制台里看到"hello world"的输出。这使得你可以自由的将一个对象注入到另一个对象里面去，而不是用构造函数，或者公开属性这种办法来获取另一个对象实例。
你唯一要注意的是，在使用被注入的对象（以上代码中的class A 的prop属性)的之前，要确保对象已经被注入，否则你将得到一个错误。

## Command
命令。一条命令代表一段逻辑代码的集合。
理论上，我们可以把代码写在任何地方，只要程序运行正常。但是聪明的程序，总是尽量将做好一个事情的所有代码放在一起。这样做将使代码变得更易读，更好去维护。比如
```typescript

class A{
    dosomething(){
        console.log("I have finish this 1st part.");
    }
}
class B {
    dosomething(){
        console.log("I have finish this 2st part.");
    }
}

Inject.mapValue("a",new A());
Inject.mapValue("b",new B());

class DoAllJobCommand extends Command{
    @inject
    private a:A;
    @inject
    private b:B;

    excute(){
        this.a.dosomething();
        this.b.dosomething();
        console.log("all done.")
    }
}

class Test{
    @command(DoAllJobCommand)
    private command:ICommand;

    doit(){
        command.excute();
    }
}

let test = new Test();
test.doit();
```

当执行Test对象中的doit()方法，DoAllJobCommand.excute()将自动执行。这样，你就可以将一系列的相关操作全部都放到一个Command里。一个Command对应要完成一件事情的全部操作的合集。
你不是必须使用command，毕竟在实际使用中，你有自己的考量。

## Event
事件机制。作为一个javascript程序，一定不会对事件陌生。但是这里的事件会有点点不一样。例如：
```typescript
//事件发送者
class A{
    @eventDispatcher()
    private dispatcher:IEventDispatcher;

    send(){
        this.dispatcher.dispatch("hello")
    }
}

//事件接收者
@eventBind
class B{
    @eventListener("hello")
    onHello(){
        console.log("say hello");
    }
}
```
首先，你可以在任何位置发送事件，只需要注册一个dispatcher，你具备发送事件的能力。dispatcher.dispatch("hello")，可以发送一个名字叫"hello"的事件。你也可以传递数据，比如dispatcher.dispatch("hello",data)。在侦听的地方，首先。你要在class上加上@eventBind装饰器，其次在侦听的方法上面加上@eventListenenr()装饰器，其中第一参数，就是你需要侦听的事件名字。如果你需要接受数据，可以用方法的参数中接受。你不必担心this的指向问题，框架已经帮你解决来这个问题。
你甚至可以指定作用空间。比如注册事件发送者@eventDispathcer("ui")，就指定了一个名字叫ui的作用空间。注册侦听器@eventListener("hello","ui")，第二参数就指定了作用空间。只有相同的作用空间对应的事件才会响应。默认情况下，所有的事件都注册到一个叫root的空间下，也就是说@eventDispatcher()等同于@eventDispathcher("root")