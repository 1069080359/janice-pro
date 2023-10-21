const channel = new BroadcastChannel('sync-update');

export const sendMsg = (type, content) => {
  channel.postMessage({
    type,
    content,
  });
};

export const listenMsg = (callback) => {
  const handler = (e) => {
    callback && callback(e.data);
  };

  channel.addEventListener('message', handler);

  return () => {
    channel.removeEventListener('message', handler);
    channel.close();
  };
};
