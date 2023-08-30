import { useEffect, useState, forwardRef } from 'react';
import { Spin } from 'antd';
import { MzDynamicForm } from '@mapzone/form';
import { queryMetadataList } from '@/services';
import { getGroupConfigByMetadataList } from '@/utils';
import type { MzDynamicFormProps, MzDynamicFormRef } from '@mapzone/form';
import type { BizMetadataItem } from '@/types';

export type BizDynamicFormProps = MzDynamicFormProps;

/** 项目自定义自动表单，增加字段分组设置 */
export const BizDynamicForm = forwardRef<MzDynamicFormRef, BizDynamicFormProps>((props, ref) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { dataName, metadataList: propsMetadataList } = props;
  const [metadataList, setMetadataList] = useState<BizMetadataItem[]>([]);
  const [defaultGroupConfig, setDefaultGroupConfig] = useState<Record<string, string[]>>();

  useEffect(() => {
    // 获取默认分组信息
    const groupConfig = getGroupConfigByMetadataList(metadataList);
    setDefaultGroupConfig(groupConfig);
  }, [metadataList]);

  useEffect(() => {
    if (propsMetadataList && propsMetadataList.length > 0) {
      setMetadataList(propsMetadataList);
    } else if (dataName) {
      setLoading(true);
      queryMetadataList(dataName).then((dataList) => {
        setMetadataList(dataList);
      });
      setLoading(false);
    }
    return () => {};
  }, [dataName]);

  if (loading) {
    return <Spin />;
  }

  if (!metadataList.length) {
    return null;
  }

  return <MzDynamicForm groupConfig={defaultGroupConfig} {...props} ref={ref} />;
});
