/** 文件大小转换 */
export const formatBytes = (bytes: number, decimals?: number) => {
  if (!bytes) return '0 Bytes';
  var k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/** 去掉文本左右空格 */
export const trim = (s: string) => {
  return s.replace(/(^\s*)|(\s*$)/g, '');
};
