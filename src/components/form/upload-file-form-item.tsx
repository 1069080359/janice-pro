import { useEffect, useState } from 'react';
import { message } from 'antd';
import { uuidV4 } from '@mapzone/utils';
import { getFileList } from '@mapzone/map-services';
import { delFileServlet, uploadFileServlet } from '@/services';
import { BizUploadViewer, downloadFileUrl } from '../biz-upload-viewer';
import { ModalTips } from '@/utils/modal-tips';
import BizFormItem from './form-item';
import type { FsFC } from '@mapzone/types';
import type { UploadFile, FormProps, FormItemProps } from 'antd';

type UploadFileFormItemProps = {
  /** item name 默认的 值(MZGUID)，如果不传 在上传的时候会自动创建 */
  itemNameValue?: string;
  /** form item 属性 */
  itemProps: FormItemProps;
  form: FormProps['form'];
};

const UploadFileFormItem: FsFC<UploadFileFormItemProps> = (props) => {
  const { form, itemProps, itemNameValue = '' } = props;
  const itemName = itemProps.name as string;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const setFile = (data: any) => {
    const file = {
      ...data,
      url: downloadFileUrl(), // 样式修改
      uid: data.PK_UID,
      name: data.FILE_NAME,
    };
    return file;
  };

  const customFile = async (option: { file: Blob | string }) => {
    const access = itemNameValue || uuidV4().replace(/-/g, '');
    const params = { mzguid: access, file: option.file, tableName: 'LYJY' };
    const { status, data } = await uploadFileServlet(params);
    if (!status) {
      message.error(data);
      if (fileList.length === 0) {
        form!.setFieldValue(itemName, undefined);
      }
      return;
    }
    const fileData = Array.isArray(data) ? data[0] : data;
    if (fileData) {
      const file = setFile(fileData);
      setFileList([...fileList, file]);
      form!.setFieldValue(itemName, access);
    }
  };

  /** 删除 */
  const onUploadRemove = async (file: UploadFile): Promise<void | boolean> => {
    return await new Promise(() => {
      ModalTips({
        title: '确定要删除文件吗？',
        onOk() {
          if (fileList && fileList.length > 0) {
            if (file.uid) {
              delFileServlet(file.uid).then((res) => {
                const { status, data } = res;
                if (!status) {
                  message.error(data);
                  return;
                }
                const filterFile = fileList.filter((i) => i.uid !== file.uid);
                setFileList([...filterFile]);
                if (filterFile.length === 0) {
                  form!.setFieldValue(itemName, undefined);
                }
              });
            }
          }
        },
      });
    });
  };

  const getFiles = () => {
    if (itemNameValue) {
      getFileList(itemNameValue).then((res) => {
        if (res.success) {
          const files = res.datas.map((f) => {
            const file = setFile(f);
            return file;
          });
          setFileList(files);
        }
      });
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  /** 文件 */
  const uploadConfig = {
    listType: 'text',
    accept: '.pdf,.PDF,',
    fileList: fileList,
    customRequest: customFile,
    onRemove: onUploadRemove,
  };

  return (
    <BizFormItem {...itemProps}>
      <BizUploadViewer {...uploadConfig} listType="text" />
    </BizFormItem>
  );
};

export default UploadFileFormItem;
