# react-use-signal

![image](https://github.com/zhuqingyv/react-use-signal/blob/main/icon.svg)

# **Des**

为了在React中实现组件之间信息传递，社区出现了五花八门的工具。这些工具无形间增加了开发者的使用成本以及学习成本，所以是时候尝试一个更加轻便的状态管理工具，在不打破以往开发习惯的同时，又能满足开发需要，同时一定程度上解决re-render的问题。

🚫声明：目前此工具只适用于React Hooks，class组件请忽略。

# Use

**基础使用**

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const Child = () => {
 // 使用名为'app'的Signal
 const [state] = useSignal('app');
 return (
  <div>{ state.count }</div>
 );
};

const App = () => {
 // 新增并且初始化一个名为'app'的Signal
 createSignal('app', { count: 0 });
 return (
  <div>
   <Child />
  </div>
 );
};

export default App
```

**函数函数式初始化一个Signal**

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const initApp = () => {
 return {
  count: 0
 };
};

const Child = () => {
 // 使用名为'app'的Signal
 const [state] = useSignal('app');
 return (
  <div>{ state.count }</div>
 );
};

const App = () => {
 // 新增并且初始化一个名为'app'的Signal
 createSignal('app', initApp);
 return (
  <div>
   <Child />
  </div>
 );
};

export default App
```

**初始化一个全局状态(非hooks实现)**

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

// 初始化一个名为 'global' 的 Signal;
// 第二个参数是是否为Hooks实现:
// true: initSingalManager必须满足hooks原则
// false: initSingalManager无须满足hooks原则
// default: true
initSingalManager({ count: 0 }, false);

const Child = () => {
 // 使用名为'global'的Signal;
 // 等同于 useSignal('global');
 const [state] = useSignal();
 return (
  <div>{ state.count }</div>
 );
};

const App = () => {
 return (
  <div>
   <Child />
  </div>
 );
};

export default App
```

🚫注意：initSingalManager 第二个参数不传 或 传 true时，一定要在组件内部声明且符合hooks原则，否则会报错并且打乱React的状态。

**初始化一个非hooks实现的Signal**

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const [state, setState] = createSignal('app', { count: 0 }, 'key', false);

const Child = () => {
 // 使用名为'global'的Signal;
 // 等同于 useSignal('global');
 const [state] = useSignal('app');
 return (
  <div>{ state.count }</div>
 );
};

const App = () => {
 return (
  <div>
   <Child />
  </div>
 );
};

export default App
```

**深度订阅模式**

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const Child = () => {
 // 深度订阅 signal.count
 const [count] = useSignal('app', 'count');
 return (
  <div>count: { count }</div>
 );
};

const ChildNormal = () => {
 // 深度订阅 signal.length
 const [length] = useSignal('app', 'length');
 return (
  <div>length: { length }</div>
 );
}

const App = () => {
 const [state, setState] = createSignal('app', { count: 0, length: 0 });
 
 // 点击以后发现只有 <Child /> 组件更新了
 // 实际上 <ChildNormal /> 与 <Child /> 依赖同一个Signal
 const onAdd = () => {
  setState({ count: state.count + 1 });
 };

 return (
  <div>
   <div onClick={onAdd}>Click to chang count!</div>
   <Child />
   <ChildNormal />
  </div>
 );
};

export default App
```

**计算属性**

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const Child = () => {
 // 深度订阅 signal.count
 const [count] = useSignal('app', 'count', (value) => {
  return `count: ${value}`;
 });
 return (
  // count: 0
  <div>{ count }</div>
 );
};

const ChildNormal = () => {
 // 深度订阅 signal.length
 const [length] = useSignal('app', 'length');
 return (
  <div>length: { length }</div>
 );
}

const App = () => {
 const [state, setState] = createSignal('app', { count: 0, length: 0 });
 
 // 点击以后发现只有 <Child /> 组件更新了
 // 实际上 <ChildNormal /> 与 <Child /> 依赖同一个Signal
 const onAdd = () => {
  setState({ count: state.count + 1 });
 };

 return (
  <div>
   <div onClick={onAdd}>Click to chang count!</div>
   <Child />
   <ChildNormal />
  </div>
 );
};

export default App
```

**高级使用**

🚫注意：如果前面的使用已经可以满足你的需求，就不建议你使用以下的能力，因为这可能会给你的程序带来不可控的因素，所以一切尝试都建立在你足够了解use-signal!

**Hooks扩展**

React的useState有2个参数，这里扩展了四个，多出的两个是use-signal的衍生物

**originalSetState:** 当前组件真实的set方法，来自于 useState

**signal:** Signal 的实例，一切数据流转都依赖他

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const Child = () => {
 const [ state, setState, originalSetState, signal ] = useSignal('app');
 return (
  <div></div>
 );
};

const App = () => {
 createSignal('app', { count: 0 });
 return (
  <div>
   <Child />
  </div>
 )
};

export default App;
```

**class SignalManager**

Des：SignalManager是中心化管理Signal的类，他非常轻，逻辑也非常简单，内部是由一个Map对象维护的。所以，Signal的name其实也可以是一个对象，但是出于语义化考虑，还是建议使用字符串(例:”app“)来命名。

当然你也可以自定义管理者，请往下看Signal类。

```jsx
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

const signalManager = initSingalManager({ count: 0 }, false);
```

**class Signal**

Des: 这就是发布订阅本身

```jsx
import { Signal, SignalManager } from 'react-use-signal';

const mySignal = new Signal({
 state: {},
 name: 'app',
 key: 'app-key',
 manager: new SignalManager(),
 autoDestroy: false // 是否是Hooks实现,是顶层 createSigna('app', {}, autoDestroy) 的底层实现
});
```
