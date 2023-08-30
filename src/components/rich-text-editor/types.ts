export type RichTextEditorProps = {
  /** 编辑器内容 */
  value?: string;
  /** 更改编辑器内容 */
  onChange?: (editor: string) => void;
};

export type InsertFnType = (url: string, alt: string, href: string) => void;
