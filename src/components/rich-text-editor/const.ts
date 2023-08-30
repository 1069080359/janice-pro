/**
 * 参考连接 https://www.wangeditor.com/v5/toolbar-config.html#getconfig
 */

import type { IToolbarConfig, IEditorConfig } from '@wangeditor/editor';

/** 隐藏的工具 */
const excludeKeys = [
  'todo', // 代办
  'emotion', // 表情
  'insertLink', // 超链接
  'group-video', // 插入视频 group
  'group-image', // 插入图片 group
  'insertTable', // 插入表格
];

/** 插入新菜单，如自定义扩展的菜单  */
const insertKeys = {
  index: 0, // 插入的位置，基于当前的 toolbarKeys，插入(可插入多个)
  // keys: ['uploadAttachment', 'uploadImage'], // 自定义上传附件,自定义上传图片
  keys: ['uploadImage'], // 自定义上传附件,自定义上传图片
};

// 工具栏配置
export const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys,
  insertKeys,
};

/** 编辑器默认配置 */
export const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
};
