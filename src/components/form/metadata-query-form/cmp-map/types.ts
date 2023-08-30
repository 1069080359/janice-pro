export type BizRequestOptionsType = {
  label: string;
  value: string;
  /** 渲染的节点类型 */
  optionType?: 'optGroup' | 'option';
  [key: string]: any;
};

export type BizFieldRequestData = () => Promise<BizRequestOptionsType[]>;

export type BizFieldProps = {
  fieldKey?: string;
  /** 从服务器读取选项 */
  request?: BizFieldRequestData;
};

export type BaseCmpProps = {
  range?: boolean;
};
