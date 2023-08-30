import { DomEditor } from '@wangeditor/editor';
import type { IDomEditor } from '@wangeditor/editor';

/** 控制台打印，查看默认 工具 配置,编辑器实例 */
export const getEditorConfig = (editor: IDomEditor) => {
  const toolbar = DomEditor.getToolbar(editor);
  const curToolbarConfig = toolbar?.getConfig();
  console.info('当前菜单排序和分组', curToolbarConfig?.toolbarKeys);
};
