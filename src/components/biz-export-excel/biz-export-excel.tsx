import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, message } from 'antd';
import { BizExportExcelProps, excelExcelProps } from './types';
import { excelExport } from './services';

//公共excel导出方法
const BizExportExcel = (props: BizExportExcelProps) => {
  const { dataName } = props;
  const exportInternalConfirm = async () => {
    const param: excelExcelProps = {
      tableName: dataName,
      filter: '1=1',
    };
    const res = await excelExport(param);
    if (res.code === '1000') {
      message.success('导出表格成功');
    } else {
      message.success('导出表格失败，请稍后重试');
    }
  };
  return (
    <Popconfirm key="delete" title={`确定导出表格吗？`} onConfirm={exportInternalConfirm}>
      <Button type="primary" icon={<DeleteOutlined />}>
        导出
      </Button>
    </Popconfirm>
  );
};

export default BizExportExcel;
