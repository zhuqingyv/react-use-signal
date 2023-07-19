import { useEffect, useState } from 'react';

// 字符串为空
export const isEmptyString = (string) => {
  if (string === null) return true;
  if (string === undefined) return true;
  if (string === '') return true;
  if (typeof string !== 'string') return true;
  return false;
};

/**
 * 更安全的获取值
 *
 * @param { any } props 要获取的数据源(支持原始数据)
 * @param { string } key 获取链
 * @param { any } defaultValue 获取失败以后默认值
 * @example getData(window, 'a.b.c', '') // => ''
 * @example getData({a: {name: 'a'}}, 'a.name', '') // => 'a'
 */
export const getData = (props, key, defaultValue) => {
  try {
    // 空值直接返回
    if (isEmptyString(key)) return props;

    const prop = key.split('.').reduce((current, propsKey) => {
      return current[propsKey];
    }, props);

    if (prop === undefined) {
      if (prop === defaultValue) {
        return prop;
      }
      return defaultValue;
    }

    return prop;
  } catch {
    return defaultValue;
  }
};

export const setData = (props, key, value) => {
  return new Promise((resolve, reject) => {
    try {
      const propList = key.split('.');
  
      propList.reduce((current, propsKey, i) => {
        if (i === propList.length - 1) {
          current[propsKey] = value;
        };
        return current[propsKey];
      }, props);
  
      resolve(props);
    } catch (error) {
      reject(error);
    };
  });
};

export default class Signal {
  // 获取路径值
  static getPropsString = (..._arguments) => {
    const { length } = _arguments;
    if (length === 1 && !isEmptyString(_arguments[0])) {
      return _arguments[0];
    }
    return undefined;
  };

  // 空对象
  static defaultObject = () => Object.create(null);

  static getData = getData;

  static setData = setData;

  state = null;
  name = null;
  subscribers = null;
  manager = null;
  key = null;

  // real set state
  _setState = null;
  // updating
  _updater = null;
  // memo updating
  _updateCache = Object.create(null);
  // memo current change
  _currentChangeTimer = null;
  _currentChangeLoop = new Map();

  // memo deep register
  _deepRegister = new Map();
  _willUpdateDeepRegisterList = new Set();
  _willUpdateDeepRegisterUpdater = null;

  constructor({ state, name, manager, key, autoDestroy }) {
    this.state = state;
    this.name = name;
    this.manager = manager;
    this.key = key;
    this.autoDestroy = autoDestroy;
    this.subscribers = new Map();
    if (autoDestroy) this.initHook();
  };

  // 初始化Hook
  initHook = () => {
    useEffect(() => {
      return () => {
        this.onDestroy();
      }
    }, [])
  };

  // 返回具体值
  value = (..._arguments) => {
    const { length } = _arguments;
    // Hooks Proxy (React Hooks 一定要这么写,太辣鸡)
    const { propsString, updater } = this.registe(..._arguments);
    if (length === 1) {
      const [props] = _arguments;

      // const [storeState, setStoreState] = useSignal('app', () => { ... });
      if (props instanceof Function) {
        // merge state
        const newValue = props(this.state);
        return [newValue, this.setState, updater, this];
      }

      // const [storeState, setStoreState] = useSignal('app', 'data.visible');
      // setStateDeep
      if (!isEmptyString(props)) {
        const newValue = getData(this.state, propsString);
        return [newValue, async(value) => {
          this.setStateDeep(propsString, value, [propsString]);
          return this.updateDeepRegister();
        }, updater, this];
      };
    };

    // const [storeState, setStoreState] = useSignal('app', 'data.visible', () => { ... });
    if (length === 2) {
      const computed = _arguments[1];
      const newValue = computed(getData(this.state, propsString));
      return [newValue, async(value) => {
        this.setStateDeep(propsString, value, [propsString]);
        return this.updateDeepRegister();
      }, updater, this];
    };

    return [this.state, this.setState, updater, this];
  };

  // 注册
  registe = (..._arguments) => {
    // 代理执行hooks
    const updater = useState({})[1];
    // 记录
    const history = this.subscribers.get(updater);

    if (!history) {
      // 绑定路径
      const propsString = Signal.getPropsString(..._arguments);
      this.subscribers.set(updater, {
        propsString,
        updater,
      });

      this.setDeepRegister(propsString, updater);
      this.autoDisRegister(updater);
      return this.subscribers.get(updater);
    };

    this.autoDisRegister(updater);
    this.setCurrentChangeLoop(updater);
    return history;
  };

  // unMounted disRegister
  autoDisRegister = (updater) => {
    useEffect(() => {
      return () => {
        const subscriber = this.subscribers.get(updater);
        this.subscribers.delete(updater);
        this._deepRegister.delete(subscriber?.propsString);
        this._currentChangeLoop.delete(updater);
        return true;
      };
    }, []);
  };

  // for deep performance
  setDeepRegister = (propsString, updater) => {
    if (propsString !== undefined) {
      const deepRegisterList = this._deepRegister.get(propsString);
      // has memo list
      if (deepRegisterList?.size) {
        deepRegisterList.set(updater, true);
        return;
      };

      // init memo
      const memo = new Map();
      this._deepRegister.set(propsString, memo);
      memo.set(updater, true);
    };
  };

  // 更新订阅者
  onUpdate = (updateObject) => {
    const list = Array.from(this.subscribers.values());
    for (let i = 0;i < list.length; i++) {
      const option = list[i];
      const { propsString, updater } = option;
      if (!this._currentChangeLoop.get(updater)) {
        const has = getData(updateObject, propsString) !== undefined;
        if (has) {
          updater(Object.create(null));
        };
      };
    };
  };

  // 注销
  onDestroy = () => {
    this.manager.destroySignal(this.name);
    this.onClear();
    return true;
  };

  // 清理状态
  onClear = () => {
    this.state = null;
    this.name = null;
    this.subscribers.clear();
    // memo updating
    this._updateCache = Object.create(null);
    // memo current change
    this._currentChangeLoop = [];
    this.manager = null;
  };

  // 派发更新
  setState = (objectUpdate = Object.create(null)) => {
    Object.assign(this._updateCache, objectUpdate);

    if (this._updater) return this.updater;

    return this._updater = new Promise((resolve, reject) => {
      try {
        queueMicrotask(() => {
          // merge change
          Object.assign(this.state, this._updateCache);
          this._currentChangeLoop.clear();
          this.onUpdate(this._updateCache);
          resolve(this.state);
        });
      } catch (error) {
        reject(error);
      }
    }).finally(() => {
      // reset updating
      this._updateCache = Object.create(null);
      this._updater = null;
      this._currentChangeLoop.clear();
    });
  };

  // 确保信号更新周期内单一组件渲染一次
  setCurrentChangeLoop = (updater) => {
    const { _currentChangeLoop } = this;
    _currentChangeLoop.set(updater, true);
  };

  // 深度订阅记录变更
  setStateDeep = (propsKey, value, dispatchList = []) => {
    return new Promise(async(resolve, reject) => {
      // set state data
      setData(this.state, propsKey, value).catch((error) => error).then(() => this.state).catch((error) => reject(error));
      try {
        dispatchList.forEach((item) => {
          this._willUpdateDeepRegisterList.add(item)
        });
        resolve(this.state);
      } catch (error) {
        reject(error);
      }
    });
  };

  // 深度订阅触发更新
  updateDeepRegister = () => {
    if (this._willUpdateDeepRegisterUpdater) return this._willUpdateDeepRegisterUpdater;

    this._willUpdateDeepRegisterUpdater = new Promise((resolve, reject) => {
      try {
        queueMicrotask(() => {
          const { _willUpdateDeepRegisterList = [] } = this;
          _willUpdateDeepRegisterList.forEach((key) => {
            // 查找每一项深度订阅
            const deepRegisterList = this._deepRegister.get(key);
            if (deepRegisterList?.size) Array.from(deepRegisterList.keys()).forEach((updater) => updater(Object.create(null)));
          });
          resolve(this.state);
          this._willUpdateDeepRegisterUpdater = null;
          this._willUpdateDeepRegisterList.clear();
          this._currentChangeLoop.clear();
        });
      } catch (error) {
        reject(error);
      }
    });
  };

}
