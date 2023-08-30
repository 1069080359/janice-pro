import { Upload, UploadProps, message } from 'antd';
import { BizUploadButtonProps } from './types';
import { excelImport } from '@/services';
import type { FsFC } from '@mapzone/types';

export const uploadAccept = '.xlsx,.xls';

const BizUploadButton: FsFC<BizUploadButtonProps> = (props) => {
  const { dataName, inStorage, tableRef } = props;
  const params = {
    tableName: dataName,
    inStorage,
  };

  const handleBeforeUpload = async (file: any) => {
    const res = await excelImport({ param: JSON.stringify(params), file });
    if (res.code === '1000') {
      message.success('导入成功');
      tableRef?.current?.reload();
    } else {
      message.error(res.msg);
    }
  };
  const fileProps: UploadProps = {
    ...props,
    itemRender: () => '',
  };

  const uploadConfig: UploadProps = {
    name: '导入',
    multiple: false,
    accept: uploadAccept,
    ...props,
  };
  return <Upload beforeUpload={handleBeforeUpload} {...{ ...uploadConfig, ...fileProps }} />;
};

export default BizUploadButton;
