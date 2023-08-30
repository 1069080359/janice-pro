import { useEffect, useState } from 'react';
import { message } from 'antd';
import { uuidV4 } from '@mapzone/utils';
import { ModalTips } from '@/utils/modal-tips';
import { getFileList } from '@mapzone/map-services';
import { delFileServlet, imguploadFileServlet } from '@/services';
import { BizUploadViewer, getPicturePreviewPath } from '../biz-upload-viewer';
import BizFormItem from './form-item';
import type { UploadFile, FormProps, FormItemProps } from 'antd';
import type { FsFC } from '@mapzone/types';

type UploadImageFormItemProps = {
  /** item name 默认的 值(MZGUID)，如果不传 在上传的时候会自动创建 */
  itemNameValue?: string;
  /** form item 属性 */
  itemProps: FormItemProps;
  form: FormProps['form'];
};

const UploadImageFormItem: FsFC<UploadImageFormItemProps> = (props) => {
  const { form, itemProps, itemNameValue = '' } = props;
  const itemName = itemProps.name as string;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const setFile = (data: any) => {
    const file = {
      uid: data.PK_UID,
      name: data.FILE_NAME,
      url: getPicturePreviewPath(data.ADJUNCT_NAME, data.ADJUNCT_PATH),
      thumbUrl: getPicturePreviewPath(data.ADJUNCT_NAME, data.ADJUNCT_PATH, 'thumb'),
    };
    return file;
  };

  /**
   * 自定义图片上传文件
   */
  const customImageFile = async (option: { file: Blob | string }) => {
    const access = itemNameValue || uuidV4().replace(/-/g, '');
    const params = { mzguid: access, file: option.file };
    const { status, data } = await imguploadFileServlet(params);
    if (!status) {
      message.error(data);
      if (fileList.length === 0) {
        form!.setFieldValue(itemName, undefined);
      }
      return;
    }
    const file = setFile(data);
    setFileList([...fileList, file]);
    form!.setFieldValue(itemName, access);
  };

  /** 删除 图片 */
  const onUploadImageRemove = async (file: UploadFile): Promise<void | boolean> => {
    return await new Promise(() => {
      ModalTips({
        title: '确定要删除图片吗？',
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

  const getImageFiles = () => {
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
    getImageFiles();
  }, []);

  /** 图片 */
  const uploadImageConfig = {
    fileList: fileList,
    customRequest: customImageFile,
    onRemove: onUploadImageRemove,
  };
  return (
    <BizFormItem {...itemProps}>
      <BizUploadViewer {...uploadImageConfig} />
    </BizFormItem>
  );
};

export default UploadImageFormItem;
