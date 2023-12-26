export const storageKey = 'record-storage';

export default {
  setItem(key, val) {
    //设置值
    // let storage = window.localStorage.getItem(Namespace)封装
    let storage = this.getStorage();
    storage[key] = val;
    // debugger：可进入debugger模式
    window.localStorage.setItem(storageKey, JSON.stringify(storage));
  },
  getItem(key) {
    //获取值
    return this.getStorage()[key];
  },
  getStorage() {
    //获取对应命名空间对象
    return JSON.parse(window.localStorage.getItem(storageKey) || '{}');
  },
  clearItem() {
    //删除对应值
    let storage = this.getStorage();
    delete storage[key];
    window.localStorage.setItem(storageKey, JSON.stringify(storage));
  },
  clearAll() {
    //清除所有值
    window.localStorage.clear();
  },
};
