import SignalManager from './SignalManager';

let signalManager = null;

/**
 * 初始化或检查信号管理器
 * 
 * @param { object | @return {} } initState 初始化 Global state
 * @param { boolean } autoDestroy global state 是否跟随组件自行销毁(是否符合hooks原则)
*/
export const initSingalManager = (initState, autoDestroy = true) => {
  if (!signalManager){
    return signalManager = new SignalManager(initState, autoDestroy);
  };
  return signalManager;
};

/**
 * 使用信号hook
 * 
 * @example const [storeState, setStoreState] = useSignal(); // 全局信号
 * @example const [storeState, setStoreState] = useSignal('global'); // 全局信号
 * @example const [storeState, setStoreState] = useSignal((state) => {}); // 全局信号的计算属性
 * @example const [appStoreState, setStoreState] = useSignal('app'); // 订阅某一个信号
 * @example const [appStoreStateProps, storeStateProps] = useSignal('app', 'visible'); // 订阅某一个信号的某一个属性
 * @example const [appStoreStateProps, storeStateProps] = useSignal('app', () => {}); // 订阅某一个信号的某一个属性的计算属性
 * @example const [appStoreStateProps, storeStateProps] = useSignal('app', 'visible', () => {}); // 订阅某一个信号的某一个属性并且自定义计算属性
 * @example const [appStoreStateProps, storeStateProps] = useSignal('app', `list.${index}`, () => {}); // 订阅某一个信号的某一个属性并且自定义计算属性
*/
export const useSignal = (..._arguments) => {
  initSingalManager();

  // 全局属性
  if (_arguments.length === 0) {
    return signalManager.global();
  };

  // 全局计算属性
  if (_arguments.length === 1) {
    const [computed] = _arguments;
    if (computed instanceof Function) return signalManager.global(computed);
  };

  // 指定信号源
  if (_arguments.length >= 1) {
    return signalManager.getSignal(..._arguments);
  };
};

/**
 * 新增信号
 * 
 * @param { string } signalName 信号名
 * @param { object | @return {} } initState 初始化信号状态
 * @param { any } key 给信号新增一个key值,方便多signal调试
 * @param { boolean } autoDestroy 是否是自动销毁的信号(true: 使用方式要满足Hooks原则, false: 可以在任意位置调用,无视Hooks原则)
*/
export const createSignal = (signalName, initState, key, autoDestroy = true) => {
  initSingalManager({}, autoDestroy);
  return signalManager.createSignal(signalName, initState, key, autoDestroy);
};

/**
 * 获取一个信号
*/
export const getSignal = (signalName) => {
  initSingalManager(Object.create(null), false);
  return signalManager._signal.get(signalName);
};

/**
 * 摧毁信号管理器
*/
export const destroySignalManager = () => {
  if (signalManager?.destroy) {
    signalManager.destroy();
    signalManager = null;
  };
};

export { default as Signal } from './Signal';
export { default as SignalManager } from './SignalManager';