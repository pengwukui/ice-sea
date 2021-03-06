## ice-sea

ice-sea 是一个超轻量级的 typescript 与 javascript 框架。框架仅仅提供有些用来简化程序的工具，并没有限定将如何组织代码。可以自由的使用它。
ice 的名字来源于 inject,command,event 三个单词。分别代表框架提供三种主要功能：依赖注入，命令处理，事件机制。

## Use

```
npm install ice-sea --save
yarn add ice-sea
```

## Inject

 依赖注入。可以在任何一个属性前面使用 inject 装饰器，用来注入事先已经设定的依赖对象。
比如：

```typescript
//设置依赖
Inject.mapValue("prop", "hello world");

class A {
  @inject //注入对象，注意属性名字要已经注册
  prop: string;

  print() {
    console.log(this.prop);
  }
}

let a = new A();
a.print();
//output:hello world
```

如果调用对象的 `a.print()` 方法，将可以在控制台里看到"hello world"的输出。可以自由的将一个对象注入到另一个对象里面去，而不是用构造函数，或者其他繁琐的方法来获取。
唯一要注意的是，在使用被注入的对象（以上代码中的 class A 的 prop 属性)的之前，要确保对象已经被注入，否则将得到一个错误。

## Command

命令。一条命令代表一段逻辑代码的集合。
理论上可以把代码写在任何地方，只要程序运行正常。但习惯上总是尽量将做好一个事情的所有代码放在一个文件。这样做将使代码变得更易读，更好去维护。比如

```typescript
//module A
class A {
  dosomething() {
    console.log("I have finish the first part.");
  }
}

//module B
class B {
  dosomething() {
    console.log("I have finish the second part.");
  }
}

Inject.mapValue("a", new A());
Inject.mapValue("b", new B());

class DoAllJobCommand extends Command {
  @inject
  private a: A;
  @inject
  private b: B;

  execute(message) {
    this.a.dosomething();
    this.b.dosomething();
    console.log(message);
  }
}

class Test {
  @command(DoAllJobCommand) //注册command
  private command: ICommand;

  doit() {
    command.execute("well done.");
  }
}

let test = new Test();
test.doit();
//output
//I have finish the first part.
//I have finish the second part.
//well done.
```

当执行 Test 对象中的 `doit()` 方法，`DoAllJobCommand.execute()` 将自动执行。这样，就可以将一系列的相关操作全部都放到一个 Command 里。一个 Command 对应要完成一件事情的全部操作的合集。Command 是一个一次性的短时对象，`comand.execute()` 每次执行都会生成一个新的 Command 对象。所以如果一个短时间内频繁的操作，应该考虑放到 Command 的内部实现，防止因为频繁调用 `comand.execute()` 而产生大量对象。

不是必须使用 Command，毕竟在实际使用中，有自己的考量。

## Event

事件机制。作为一个 javascript 程序，一定不会对事件陌生。但是这里的事件会有点点不一样。例如：

```typescript
//事件发送者
class A {
  @eventDispatcher() //注册事件发送器
  private dispatcher: IEventDispatcher;

  send() {
    this.dispatcher.dispatch("hello"); //发送事件
  }
}

//事件接收者
@eventBind //eventBind 必须注册才能与eventListener配合使用。否则无效
class B {
  @eventListener("hello") //注册事件侦听器
  onHello() {
    console.log("say hello");
  }
}
```

发送事件，只需要注册一个 dispatcher。`dispatcher.dispath("hello")`将发送一个名字为'hello'的事件。如果需要传递数据，可以这样：`dispatcher.dispatch("hello",data)`。侦听事件，推荐的做法是：首先，要在 class 上加上@eventBind 装饰器，其次，在侦听器上面加上 `@eventListenenr("hello")` 装饰器，"hello"代表需侦听的事件。还可以在侦听器方法里配置参数，用来接受事件参数。不必担心侦听器的 this 的指向问题，框架已经帮解决来这个问题，this 指向当前对象。

还可以指定作用空间。作用空间类似与命名空间，可以方式不同模块的同名事件互相污染。比如注册事件发送者 `@eventDispathcer("ui")`，就指定了一个名字叫 ui 的作用空间。注册侦听器 `@eventListener("hello","ui")`，第二参数就指定了 ui 作用空间。只有相同的作用空间对应的事件才会响应。默认情况下，所有的事件都注册到一个叫 root 的空间下，也就是说 `@eventDispatcher()` 等同于 `@eventDispathcher("root")`

最好确保 `@eventBind` 与 `@eventListener` 成对出现。否则可能绑定失败，在继承的情况下也要如此。

还有一种方法可以注册事件侦听者。例如:

```typescript
class A {
  @eventDispatcher()
  private dispatcher: IEventDipatcher;

  constructor() {
    this.onMyClick = this.onMyClick.bind(this)
    this.dispatcher.addEventLisenter("myClick", this.onMyClick);
  }

  onClick() {
    this.dispatcher.dispatch("myClick");
    this.dispatcher.removeEventListener(("myClick", this.onMyClick);  //remove eventListenr
  }

  onMyClick() {
    console.log("my click");
  }
}
```

这种方式繁琐一点，有的时候可能会需要灵活控制事件绑定与解绑。但使用装饰器的方式应该足以满足大部分需求。
