import { useReducer } from 'react';
import { Form, Input, AutoComplete, message } from 'antd';
import { readShapeFiles2JSON, ShapeUpload, writeShapeZip, getShapeEncoding } from '@mapzone/shape-kit';
import { InputColorPicker } from '@mapzone/color-picker';
import { BizModal } from '@/components';
import { getWebAppConfig } from '@/utils';
import { reducer, initialState } from './reducer';
import { getPropFieldsByLayerData, initLayerPropertiesId, json2Features, formatLayerId, getPrefix } from '../utils';
import { defaultExportFormat } from '../../const';
import { addCloudLayer } from '../service';
import useMyDataDb from '../../hooks/use-db';
import { defaultColors } from '../../const';
import type { SimpleGeometry } from 'ol/geom';
import type { AutoCompleteProps } from 'antd';
import type { RndModalProps } from '@mapzone/types';
import type { TShapeUploadStatus, TZipFile } from '@mapzone/types';
import type { TShapeUpload } from '../../types';

const encodingOptions: AutoCompleteProps['options'] = [
  { label: 'utf-8', value: 'utf-8' },
  { label: 'gbk', value: 'gbk' },
];

export type TImportModalProps = Omit<RndModalProps, 'onOk' | 'onCancel'> & {
  onOk: () => void;
  onCancel: () => void;
};

type TNoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';
const shapeTipKey = 'shapeTipKey';

const prefixCls = 'import-shape-modal';

export default (props: TImportModalProps) => {
  const { onCancel, onOk, ...restProps } = props;
  const [form] = Form.useForm();
  const db = useMyDataDb();
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
      shapeUploadStatus: { validateStatus: 'error', help: '请选择要导入的shp文件' },
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

  const uploadShape = async (data: TShapeUpload, jsonData: any) => {
    updateMessage('shp 文件上传中', 'loading', 0);
    const formDat = new FormData();
    formDat.append('dataName', data.name);
    formDat.append('remark', data.remark || '');
    formDat.append('tabletype', data.geometryType);
    formDat.append('tableFields', JSON.stringify(data.tableFields));
    formDat.append('num', `${data.featureCount}`);
    formDat.append('zipfile', data.shapeZip, `${data.name}-shape.zip`);
    formDat.append('geojson', data.jsonZip, `${data.name}-geojson.zip`);
    formDat.append('style', JSON.stringify(data.style));

    const res = await addCloudLayer(formDat);
    if (!res.success) {
      updateMessage(`上传shp失败，${res.msg}`);
      return;
    }
    updateMessage(`上传shp成功`, 'success');
    const cloudId = res.datas[0];
    if (cloudId) {
      const id = formatLayerId(cloudId);
      await db.localLayerDatas.add({
        id,
        JSON: jsonData,
        format: exportFormat,
      });
    }
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

    const layerData = await readShapeFiles2JSON(orginFileList, exportFormat, values.encoding).catch((err: Error) => {
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

    const tableFields = getPropFieldsByLayerData(layerData.jsonData, exportFormat);
    if (!tableFields.includes('PK_UID')) {
      layerData.jsonData = initLayerPropertiesId(getPrefix(), layerData.jsonData, exportFormat);
      tableFields.push('PK_UID');
    }

    const fileName = values.name;
    const zipFileList: TZipFile[] = orginFileList.map((f) => ({
      name: f.name,
      data: f,
    }));
    const shapeZip = await writeShapeZip(zipFileList, fileName);
    if (!shapeZip) {
      updateMessage('shp数据处理失败，请联系管理员');
      return;
    }

    const jsonBlob = new Blob([JSON.stringify(layerData.jsonData)], {
      type: 'application/json',
    });
    const jsonZipFileList = [{ name: `${fileName}.json`, data: jsonBlob }];
    const jsonZip = await writeShapeZip(jsonZipFileList, fileName);
    if (!jsonZip) {
      updateMessage('json数据处理失败，请联系管理员');
      return;
    }

    const uploadShapeData: TShapeUpload = {
      name: values.name,
      remark: values.remark,
      geometryType: layerData.fmtGeometryType,
      featureCount: features.length,
      shapeZip,
      jsonZip,
      tableFields,
      style: { color: values.layerColor, width: 1, fillColor: 'rgba(255,255,255,0)' },
    };
    uploadShape(uploadShapeData, layerData.jsonData);
  };

  return (
    <BizModal
      title="导入shp数据"
      rndProps={{ disableDragging: false, enableResizing: false }}
      maskClosable={false}
      width={600}
      destroyOnClose
      className={prefixCls}
      onCancel={handleCancel}
      onOk={handleOk}
      cancelButtonProps={{ loading }}
      okButtonProps={{ loading }}
      {...restProps}
    >
      <Form labelCol={{ span: 5 }} form={form} initialValues={{ encoding: 'utf-8', layerColor: '#00bbd3' }}>
        <Form.Item label="" required {...shapeUploadStatus}>
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

        <Form.Item
          name="name"
          label="图层名称"
          rules={[
            { required: true, message: '请输入图层名称！' },
            { type: 'string', max: 50, message: '图层名称不能超过50个字符' },
          ]}
        >
          <Input autoFocus placeholder="请输入图层名称" />
        </Form.Item>
        <Form.Item name="encoding" label="属性编码字符集" hasFeedback rules={[{ required: true, message: '请选择或输入属性编码字符集！' }]}>
          <AutoComplete placeholder="请选择或输入属性编码字符集" options={encodingOptions} />
        </Form.Item>

        <Form.Item name="layerColor" label="图层颜色" rules={[{ required: true, message: '请选择图层颜色！' }]}>
          <InputColorPicker presetColors={defaultColors} />
        </Form.Item>

        <Form.Item name="remark" label="备注" rules={[{ type: 'string', max: 50, message: '备注不能超过100个字符' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </BizModal>
  );
};
