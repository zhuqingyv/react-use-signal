import logo from './logo.svg';
import './App.css';
import React from 'react';
import { useSignal, createSignal, initSingalManager } from 'react-use-signal';

initSingalManager({ showChild1: true, showChild2: true, showChild3: true }, false);

const Child = () => {
  const [count] = useSignal('app', 'count');
  console.log('render Child1');
  return (
    <div className='box'>
      <span className='title'>I am child (1)</span>
      <span className='des'>我依赖名为 app 的Signal!</span>
      <span className='value'>count: <span>{count}</span></span>
    </div>
  );
};

const Child2 = () => {
  const [count] = useSignal('app', 'count');
  const [ showChild3 ] = useSignal('global', 'showChild3');
  console.log('render Child2');
  return (
    <div className='box'>
      <span className='title'>I am child (2)</span>
      <span className='des'>我依赖名为 app 的Signal!</span>
      <span className='value'>count: <span>{count}</span></span>
      <div className='child-container'>
        <div className='child-box'>
          {showChild3 && <Child3 />}
        </div>
      </div>
    </div>
  );
};

const Child3 = () => {
  const [count] = useSignal('deep', 'count');
  console.log('render Child3');
  return (
    <div className='box'>
      <span className='title'>I am child (3)</span>
      <span className='des'>我依赖名为 deep 的Signal!</span>
      <span className='value'>count: <span>{count}</span></span>
    </div>
  );
};

const add = (count, setCount) => {
  setCount({ count: count + 1 });
};

const Button = ({ onClick, text }) => {
  return (
    <div
      onClick={onClick}
      className="button"
    >
      { text }
    </div>
  )
};

function App() {
  const [ globalState, setGlobalState ] = useSignal();
  const [ appState, seAppState ] = createSignal('app', { count: 0 }, 'app');
  const [ deepState, setDeepState ] = createSignal('deep', { count: 0 }, 'deep');
  const { showChild1, showChild2, showChild3 } = globalState;
  console.log('render App');
  return (
    <div className='box'>
      <img src={logo} style={{ width: 50 }} alt="" />
      <span className='title'>I am App! ID:{Math.random()}</span>
      <span className='des'>我创建一个名为 app 的Signal!</span>

      <Button onClick={() => add(appState.count, seAppState)} text="Click Me to add app.count!" />
      <Button onClick={() => add(deepState.count, setDeepState)} text="Click Me to add deep.count!" />
      <Button onClick={() => setGlobalState({ showChild1: !showChild1 })} text={`Click Me to ${showChild1 ? 'show' : 'hidden'} showChild1`} />
      <Button onClick={() => setGlobalState({ showChild2: !showChild2 })} text={`Click Me to ${showChild2 ? 'show' : 'hidden'} showChild2`} />
      <Button onClick={() => setGlobalState({ showChild3: !showChild3 })} text={`Click Me to ${showChild3 ? 'show' : 'hidden'} showChild3`} />

      <div className='child-container'>
        <div className='child-box'>
          {showChild1 && <Child />}
          {showChild2 && <Child2 />}
        </div>
      </div>
    </div>
  );
};

export default App;
