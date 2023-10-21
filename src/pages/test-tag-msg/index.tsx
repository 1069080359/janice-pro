import { sendMsg } from '@/utils/cross-tag-msg';

const addObj = {
  a: '1',
  b: '2',
};

const TestTagMsg = () => {
  const onClick = () => {
    // 两个标签页之间的内存是隔离的，所以在使用 BroadcastChannel 方法时，不可能把内存地址发送过去，所以必须克隆一份对象
    sendMsg('add', addObj);
  };

  return <div onClick={onClick}>test-tag-msg</div>;
};

export default TestTagMsg;
