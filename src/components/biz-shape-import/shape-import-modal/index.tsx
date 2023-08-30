import { useReducer } from 'react';
import { Button, Form, /* AutoComplete, */ message, Radio } from 'antd';
import { readShapeFiles2JSON, ShapeUpload, writeShapeZip, getShapeEncoding } from '@mapzone/shape-kit';
import { BizCompanyTreeSelect, BizModal } from '@/components';
import { getWebAppConfig } from '@/utils';
import { reducer, initialState } from './reducer';
import { json2Features } from './utils';
import { shapeImport } from '../services';
import type { SimpleGeometry } from 'ol/geom';
// import type { AutoCompleteProps } from 'antd';
import type { RndModalProps, TExportFormat } from '@mapzone/types';
import type { TShapeUploadStatus, TShapeUploadProps, TZipFile } from '@mapzone/types';
import BizProjectSelect from '@/components/biz-project-select';

// const encodingOptions: AutoCompleteProps['options'] = [
//   { label: 'utf-8', value: 'utf-8' },
//   { label: 'gbk', value: 'gbk' },
// ];

type ShapeImportParams = {
  zipfile: Blob;
  param?: string;
  /** 单位 */
  company: string;
  /** 项目 */
  project: string;
  /** 导入 */
  appendOrReset: string;
};

export type ShapeImportModalProps = Omit<RndModalProps, 'onOk' | 'onCancel'> &
  Pick<TShapeUploadProps, 'allowMaxSize'> & {
    /** 允许最大的shape数量，大于0生效 */
    allowFeatureCount?: number;
    onOk: () => void;
    onCancel: () => void;
    /** 业务表名 */
    tableName: string;
    /**
     * 管理单位字段名
     * @default company
     */
    dwFieldKey?: string;
    /**
     * 所属项目字段名
     * @default project
     */
    xmFieldKey?: string;
    /** 额外参数 */
    extraParams?: Record<string, any>;
  };

type TNoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';

const shapeTipKey = 'shapeTipKey';
const defaultExportFormat: TExportFormat = 'geojson';

const prefixCls = 'shape-import-modal';

/** Shape 导入 */
const ShapeImportModal = (props: ShapeImportModalProps) => {
  const { onCancel, onOk, allowFeatureCount, tableName, extraParams, dwFieldKey = 'company', xmFieldKey = 'project', ...restProps } = props;
  const [form] = Form.useForm();
  const { appSettings } = getWebAppConfig();

  const exportFormat = defaultExportFormat;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { orginFileList, shapeUploadStatus, loading } = state;

  const onOrginFileListChange = async (newOrginFileList: File[]) => {
    const encoding = await getShapeEncoding(newOrginFileList);
    form.setFieldsValue({ encoding });

    dispatch({
      type: 'update',
      orginFileList: newOrginFileList,
    });
  };

  const onUploadStatusChange = (newStatus: TShapeUploadStatus) => {
    dispatch({
      type: 'update',
      shapeUploadStatus: newStatus,
    });
  };

  const onLayerNameChange = (name: string) => {
    if (!form.getFieldValue('name')) {
      form.setFieldsValue({ name });
    }
  };

  const resetStatus = () => {
    dispatch({
      type: 'update',
      loading: false,
      orginFileList: [],
      shapeUploadStatus: { validateStatus: 'error', help: '请选择要导入的shape文件' },
    });
    form.resetFields();
  };

  const handleCancel = () => {
    resetStatus();
    onCancel();
  };

  const updateMessage = (content: string, type: TNoticeType = 'warning', duration: number = 2) => {
    message[type]({ content, key: shapeTipKey, duration });
  };

  const uploadShape = async (data: ShapeImportParams) => {
    updateMessage('shape 文件上传中', 'loading', 0);
    const params: Record<string, any> = { ...extraParams, tableName };
    params[dwFieldKey] = data.company;
    params[xmFieldKey] = data.project;
    params['appendOrReset'] = data.appendOrReset;
    const formDat = new FormData();
    formDat.append('param', JSON.stringify(params));
    formDat.append('zipFile', data.zipfile, `${tableName}-shape.zip`);

    const res = await shapeImport(formDat);
    if (!res.success) {
      updateMessage(`shape导入失败，${res.msg}`);
      dispatch({
        type: 'update',
        loading: false,
      });
      return;
    }
    updateMessage(`shape导入成功`, 'success');

    resetStatus();
    onOk();
  };

  const handleOk = async () => {
    if (orginFileList.length === 0) {
      onUploadStatusChange({ validateStatus: 'error', help: '请选择shape文件' });
    }
    const values = await form.validateFields().catch(() => {});
    if (!values) {
      return;
    }
    if (shapeUploadStatus.validateStatus === 'error') {
      message.error(shapeUploadStatus.help);
      return;
    }
    updateMessage('数据读取中', 'loading', 0);
    dispatch({
      type: 'update',
      loading: true,
    });

    const layerData = await readShapeFiles2JSON(orginFileList, exportFormat).catch((err: Error) => {
      updateMessage(err.message);
    });
    if (!layerData) {
      return;
    }
    const features = json2Features(layerData.jsonData, exportFormat);
    if (!features || features.length === 0) {
      updateMessage('导入的图层没有数据，请重新选择!', 'error');
      dispatch({
        type: 'update',
        loading: false,
      });
      return;
    }
    if (allowFeatureCount && allowFeatureCount > 0) {
    }
    const feature = features[0];
    const coord = (feature.getGeometry() as unknown as SimpleGeometry).getFirstCoordinate();
    if (coord[0] > 180 || coord[1] > 90) {
      updateMessage('请选择经纬度坐标数据进行导入', 'error');
      dispatch({
        type: 'update',
        loading: false,
      });
      return;
    }

    const zipFileList: TZipFile[] = orginFileList.map((f) => ({ name: f.name, data: f }));
    const zipfile = await writeShapeZip(zipFileList, tableName);
    if (!zipfile) {
      updateMessage('shape数据处理失败，请联系管理员');
      return;
    }

    const uploadShapeData: ShapeImportParams = {
      zipfile,
      company: values.company,
      project: values.project,
      appendOrReset: values.appendOrReset,
    };
    uploadShape(uploadShapeData);
  };

  const footerRender = [
    <Button loading={loading} key="ok" type="primary" onClick={handleOk}>
      确定
    </Button>,
    <Button loading={loading} key="cancel" onClick={handleCancel}>
      取消
    </Button>,
  ];

  return (
    <BizModal
      title="shape导入"
      rndProps={{ disableDragging: false, enableResizing: false }}
      maskClosable={false}
      width={600}
      destroyOnClose
      className={prefixCls}
      onCancel={handleCancel}
      {...restProps}
      footer={footerRender}
    >
      <Form labelCol={{ span: 5 }} form={form} initialValues={{ appendOrReset: '1' }}>
        <Form.Item name="company" label="管理单位" rules={[{ required: true, message: '请选择管理单位' }]}>
          <BizCompanyTreeSelect />
        </Form.Item>
        <Form.Item name="project" label="所属项目" rules={[{ required: true, message: '请选择所属项目' }]}>
          {/* <AutoComplete placeholder="请选择或输入属性编码字符集" options={encodingOptions} /> */}
          <BizProjectSelect placeholder="请选择所属项目" />
        </Form.Item>
        <Form.Item label="Shape文件" required {...shapeUploadStatus}>
          <Form.Item noStyle>
            <ShapeUpload
              allowMaxSize={appSettings.shapeAllowMaxSize}
              orginFileList={orginFileList}
              onOrginFileListChange={onOrginFileListChange}
              onUploadStatusChange={onUploadStatusChange}
              onLayerNameChange={onLayerNameChange}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item name="appendOrReset" label="导入" rules={[{ required: true, message: '请选择数据导入方式' }]}>
          <Radio.Group>
            <Radio value="0">追加</Radio>
            <Radio value="1">覆盖</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </BizModal>
  );
};

export { ShapeImportModal };
