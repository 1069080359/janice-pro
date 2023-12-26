import { useState, useEffect, useRef } from 'react';
import { Button, message, Table, Tabs, Space, InputNumber, Modal, Form, DatePicker, Popconfirm } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import moment from 'moment';
import { exportFile } from 'table-xlsx';
import { intervalTime } from './utils';
import { recordFormat, prefixCls, xuhao } from './const';
import storage, { storageKey } from './storage';

const BabyFeedingRecord = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [valueNum, setValueNum] = useState<number>(undefined);

  const [open, setOpen] = useState<boolend>(false);
  const [form] = Form.useForm();

  const setStorageData = (data: any[]) => {
    const sortData = data.toSorted((x, y) => y.sort - x.sort);
    setDataSource(sortData);
    storage.setItem(storageKey, sortData);
  };

  const onDeleteConfirm = (record: any) => {
    const newData = dataSource.filter((item) => item.key !== record.key);
    setStorageData(newData);
  };

  const columns: BizProTableProps<any>['columns'] = [
    { ...xuhao },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '喂配方奶(ml)',
      dataIndex: 'breasts',
      key: 'breasts',
    },
    {
      title: '喂水(ml)',
      dataIndex: 'water',
      key: 'water',
    },
    {
      title: '距离上一次间隔时间',
      dataIndex: 'sort',
      key: 'sort',
      render: (_, record, index) => {
        const preRecprd = dataSource[index + 1];
        if (!preRecprd) {
          return '暂无';
        }
        return intervalTime(preRecprd.sort, record.sort);
      },
    },
    {
      title: '删除',
      dataIndex: 'sc',
      key: 'sc',
      render: (_, record) => (
        <Popconfirm title="确定删除该云图层吗？" onConfirm={() => onDeleteConfirm(record)}>
          <Button key="sc1" size="small" type="link" icon={<InboxOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const items = [
    {
      label: '表格数据',
      key: '1',
      children: <Table rowKey="key" scroll={{ y: 850 }} columns={columns as any} dataSource={dataSource} pagination={false} />,
    },
  ];

  const onAdd = (type: string) => {
    if (!valueNum) {
      message.info('输入喂奶/水量(ml)');
      return;
    }
    const addItem = {
      [type]: valueNum,
      ...recordFormat(),
    };
    const newData = [addItem, ...dataSource];
    setStorageData(newData);
    setValueNum(undefined);
  };

  const onAdds = () => {
    setOpen(true);
  };

  const okHandle = async () => {
    const values = await form.validateFields().catch(() => {});
    if (!values) {
      return;
    }
    const keyTime = moment(values.time).format('HH:mm:ss');
    const date = moment(values.date).format('YYYY-MM-DD');
    const dateTime = moment(`${date} ${keyTime}`).valueOf();
    if (!values.breasts && !values.water) {
      message.info('请输入喂奶/水量(ml)');
      return;
    }
    const addItem = {
      ...values,
      date,
      time: keyTime,
      key: keyTime,
      sort: dateTime,
    };
    const newData = [addItem, ...dataSource];
    setStorageData(newData);
    setOpen(false);
    form.resetFields();
  };

  /** 导出表格 */
  const onExportExcel = () => {
    const fileName = `${moment().format('YYYY-MM-DD')} - 喂奶/水数据`;
    exportFile({
      useRender: true,
      fileName: `${fileName}.xlsx`,
      columns: columns as any,
      dataSource: dataSource as any,
    });
  };

  const OperationsSlot: any = {
    left: null,
    right: (
      <Space>
        <Button key="1" size="small" icon={<InboxOutlined />} onClick={onAdds}>
          过时间后的喂奶/水，追加
        </Button>
        <InputNumber style={{ width: '200px' }} value={valueNum} onChange={setValueNum} placeholder="输入喂奶/水量(ml)" />
        <Button key="1" size="small" icon={<InboxOutlined />} onClick={() => onAdd('breasts')}>
          喂奶
        </Button>
        <Button key="2" size="small" icon={<InboxOutlined />} onClick={() => onAdd('water')}>
          喂水
        </Button>
        <Button key="dc" size="small" icon={<InboxOutlined />} type="primary" onClick={onExportExcel}>
          导出表格
        </Button>
      </Space>
    ),
  };

  const init = () => {
    const initData = storage.getItem(storageKey);
    if (!initData) {
      return;
    }
    setStorageData(initData);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <Tabs className={`${prefixCls}-tabs`} items={items} tabBarExtraContent={OperationsSlot} />

      <Modal title="按时间添加" visible={open} onCancel={() => setOpen(false)} onOk={okHandle}>
        <Form form={form}>
          <Form.Item label="日期" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="时间" name="time" rules={[{ required: true }]}>
            <DatePicker.TimePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="喂奶" name="breasts">
            <InputNumber style={{ width: '100%' }} placeholder="输入喂奶/水量(ml)" />
          </Form.Item>
          <Form.Item label="喂水" name="water">
            <InputNumber style={{ width: '100%' }} placeholder="输入喂奶/水量(ml)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BabyFeedingRecord;
