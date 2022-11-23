import Signal from './Signal';

class SignalManager {
  // 创建信号源·状态
  static createState = (initState = Object.create(null)) => {
    // 函数式处理
    if (initState instanceof Function) {
      return initState() || Object.create(null);
    }

    // 类型警告
    if (typeof initState !== 'object') {
      const type = typeof initState;
      console.warn(
        `请确保信号状态源为引用类型,当前类型为'${type}',后续变更将不会响应!`
      );
    }

    return initState;
  };

  constructor(initState, autoDestroy) {
    this.createSignal('global', initState, 'global', autoDestroy);
  };

  // 信号列表
  _signal = new Map();

  // 获取信号源
  getSignal = (signalName, ..._arguments) => {
    const signal = this._signal.get(signalName);
    if (signal) {
      return signal.value(..._arguments);
    };

    console.warn('Signal is undefined!');
    return [undefined, () => null];
  };

  // 配置信号
  createSignal = (signalName, initState = Object.create(null), key, autoDestroy = true) => {
    const historySignal = this._signal.get(signalName);
    if (historySignal) {
      historySignal.initHook();
      return [historySignal.state, historySignal.setState, historySignal];
    };

    // 信号状态
    const signalState = SignalManager.createState(initState);

    // 信号
    const signal = new Signal({
      state: signalState,
      name: signalName,
      manager: this,
      key,
      autoDestroy
    });

    // 记录
    this._signal.set(signalName, signal);

    return [signal.state, signal.setState, signal];
  };

  // 销毁信号
  destroySignal = (name) => {
    this._signal.delete(name);
  };

  // 全局信号
  global = (computed) => {
    return this.getSignal('global', computed);
  };

  destroy = () => {
    this._signal.forEach((signalName) => {
      this.destroySignal(signalName);
    });
  };
}

export default SignalManager;
