import { useState, useEffect, useRef } from 'react';
import { Button, message, Table, Popconfirm } from 'antd';
import { JsonParse } from '@mapzone/utils';
import { BizModal, BizProTableProps } from '@/components';
import { DMap, XMap, MMap, ScBase } from '@mapzone/icons';
import { getTableActions } from '@/constants';
import ImportModal from '../import-modal';
import { getCloudLayerList, deleteCloudLayer, addMyLayer } from '../service';
import type { Key } from 'react';
import type { RndModalProps } from '@mapzone/types';
import type { TCloudLayer } from '../../types';

import './index.less';

export type TServerDataModalProps = Omit<RndModalProps, 'onOk' | 'onCancel'> & {
  onOk: (layerIds: Key[]) => void;
  onCancel: () => void;
};

export default (props: TServerDataModalProps) => {
  const { onCancel, onOk, open, ...restProps } = props;

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [layerDataList, setLayerDataList] = useState<TCloudLayer[]>([]);
  const [selectKeys, setSelectKeys] = useState<Key[]>([]);
  const selectLayersRef = useRef<TCloudLayer[]>([]);

  const getMyCloudLayerList = async () => {
    setLoading(true);
    const res = await getCloudLayerList();
    setLoading(false);
    if (!res?.success) {
      message.error(`获取我的云图层列表出错，${res.msg}`);
      return;
    }
    setLoading(false);
    const list = res.datas.list.map((c) => {
      const { C_DATAINFO, ...rest } = c;
      return {
        ...rest,
        C_DATAINFO: JsonParse(C_DATAINFO),
      };
    });
    setLayerDataList(list);
  };

  const onDeleteCloudLayer = async (id: number) => {
    const res = await deleteCloudLayer({ id });
    if (!res?.success) {
      message.error(`删除云图层出错，${res.msg}`);
      return;
    }
    getMyCloudLayerList();
    setSelectKeys(selectKeys.filter((s) => s !== id));
    selectLayersRef.current = selectLayersRef.current.filter((s) => s.I_ID !== id);
    message.success('删除云图层成功');
  };

  const importModalShow = () => {
    setImportModalOpen(true);
  };

  const importModalCancel = () => {
    setImportModalOpen(false);
  };

  const handleImport = async () => {
    importModalCancel();
    getMyCloudLayerList();
  };

  const handleOk = async () => {
    const res = await addMyLayer({
      cloudIds: selectKeys,
    });
    if (!res?.success) {
      message.error(`添加云图层失败，${res.msg}`);
      return;
    }
    const layerNames = selectLayersRef.current.map((s) => s.C_DATANAME).join(',');
    message.success(`数据"${layerNames}"已经添加到地图`);
    onOk(selectKeys);
  };

  const handleCancel = () => {
    setSelectKeys([]);
    selectLayersRef.current = [];
    onCancel();
  };

  useEffect(() => {
    if (open) {
      getMyCloudLayerList();
    }
    return () => {
      setSelectKeys([]);
      selectLayersRef.current = [];
      setLayerDataList([]);
    };
  }, [open]);

  const columns: BizProTableProps<TCloudLayer>['columns'] = [
    {
      title: '类型',
      dataIndex: 'C_TABLETYPE',
      key: 'C_TABLETYPE',
      render: (val) => {
        switch (val) {
          case 'Point':
            return <DMap />;
          case 'LineString':
            return <XMap />;
          default:
            return <MMap />;
        }
      },
    },
    {
      title: '图层名称',
      dataIndex: 'C_DATANAME',
      key: 'C_DATANAME',
    },
    {
      title: '导入时间',
      dataIndex: 'D_CREATETIME',
      key: 'D_CREATETIME',
    },
    {
      title: '数量',
      dataIndex: 'num',
      key: 'num',
      render: (_, record) => record.C_DATAINFO.num,
    },
    {
      ...getTableActions(),
      render: (_, record) => (
        <Popconfirm title="确定删除该云图层吗？" onConfirm={() => onDeleteCloudLayer(record.I_ID)}>
          <ScBase />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <BizModal
        title={
          <>
            <span>我的云图层</span>
            <Button className="shape-import-btn" key="import" type="primary" onClick={importModalShow}>
              导入shp数据
            </Button>
          </>
        }
        rndProps={{ disableDragging: false, enableResizing: false }}
        maskClosable={false}
        width={800}
        onOk={handleOk}
        okText="添加"
        okButtonProps={{ disabled: selectKeys.length === 0 }}
        closable={false}
        onCancel={handleCancel}
        open={open}
        className="my-data-server-data-modal"
        {...restProps}
      >
        <Table
          rowKey="I_ID"
          loading={{
            spinning: loading,
            delay: 1500,
          }}
          columns={columns as any}
          dataSource={layerDataList}
          rowSelection={{
            selectedRowKeys: selectKeys,
            onChange: (keys, rows) => {
              setSelectKeys(keys);
              selectLayersRef.current = rows;
            },
          }}
          pagination={false}
        />
      </BizModal>
      <ImportModal open={importModalOpen} onOk={handleImport} onCancel={importModalCancel} />
    </>
  );
};
