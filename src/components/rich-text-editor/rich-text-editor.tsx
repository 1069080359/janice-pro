import React, { useState, useEffect } from 'react';
import { useUpdateEffect } from 'ahooks';
import { message } from 'antd';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { uuidV4 } from '@mapzone/utils';
import { imguploadFileServlet } from '@/services';
import { getPicturePreviewPath } from '../biz-upload-viewer';
import useRegisterEditorModules from './use-register-editor-modules';
import { editorConfig, toolbarConfig } from './const';
// import { getEditorConfig } from './utiles';
import type { IEditorConfig } from '@wangeditor/editor';
import type { IDomEditor } from '@wangeditor/editor';
import type { FsFC } from '@mapzone/types';
import type { InsertFnType, RichTextEditorProps } from './types';
import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import './style.less';

const prefixCls = 'rich-text-editor';

const RichTextEditor: FsFC<RichTextEditorProps> = (props) => {
  useRegisterEditorModules();
  const { value, onChange } = props;
  // editor 实例
  const [editorInstance, setEditorInstance] = useState<IDomEditor | null>(null);
  // 编辑器内容
  const [htmlValue, setHtmlValue] = useState('');

  const setStringValue = (str: string = '') => {
    if (typeof onChange === 'function') {
      onChange(str);
    }
    setHtmlValue(str);
  };

  const _onChange = (editor: IDomEditor) => {
    const strValue = editor.getHtml();
    setStringValue(strValue);
    // getEditorConfig(editor);
  };

  /** 自定义上传附件，暂时不弄了 */
  const customUploadAttachment: Partial<IEditorConfig> = {
    // 在编辑器中，点击选中“附件”节点时，要弹出的菜单
    hoverbarKeys: {
      attachment: {
        menuKeys: ['downloadAttachment'], // “下载附件”菜单
      },
    },
    MENU_CONF: {
      // “上传附件”菜单的配置
      uploadAttachment: {
        server: '/api/upload', // 服务端地址
        timeout: 5 * 1000, // 5s
        maxFileSize: 10 * 1024 * 1024, // 10M
        //自定义上传
        customUpload(file: File, insertFn: any) {
          console.log('customUpload', file);

          return new Promise((resolve) => {
            // 插入一个文件，模拟异步
            setTimeout(() => {
              const src = `https://www.w3school.com.cn/i/movie.ogg`;
              insertFn(`customUpload-${file.name}`, src);
              resolve('ok');
            }, 500);
          });
        },
        onBeforeUpload(file: File) {
          console.log('onBeforeUpload', file);
          return file; // 上传 file 文件
          // return false // 会阻止上传
        },
        onProgress(progress: number) {
          console.log('onProgress', progress);
        },
        onSuccess(file: File, res: any) {
          console.log('onSuccess', file, res);
        },
        onFailed(file: File, res: any) {
          alert(res.message);
          console.log('onFailed', file, res);
        },
        onError(file: File, err: Error, res: any) {
          alert(err.message);
          console.error('onError', file, err, res);
        },
        // // 上传成功后，用户自定义插入文件
        // customInsert(res: any, file: File, insertFn: Function) {
        //   console.log('customInsert', res)
        //   const { url } = res.data || {}
        //   if (!url) throw new Error(`url is empty`)

        //   // 插入附件到编辑器
        //   insertFn(`customInsert-${file.name}`, url)
        // },
      },
    },
  };

  /** 自定义上传图片 */
  const customUploadImage: Partial<IEditorConfig> = {
    MENU_CONF: {
      uploadImage: {
        // 自定义上传
        async customUpload(file: File, insertFn: InsertFnType) {
          const mzguid = uuidV4().replace(/-/g, '');
          const params = { mzguid, file };
          const { status, data } = await imguploadFileServlet(params);
          if (!status || !data) {
            message.error(data);
            return;
          }
          const fileInfo = {
            uid: data.PK_UID,
            name: data.FILE_NAME,
            url: getPicturePreviewPath(data.ADJUNCT_NAME, data.ADJUNCT_PATH),
            thumbUrl: getPicturePreviewPath(data.ADJUNCT_NAME, data.ADJUNCT_PATH, 'thumb'),
          };
          // 得到图片 url alt href，最后插入图片
          insertFn(fileInfo.url, fileInfo.name, fileInfo.url);
        },
      },
    },
  };

  const defaultConfig: Partial<IEditorConfig> = {
    ...editorConfig,
    ...customUploadAttachment,
    ...customUploadImage,
  };

  const onCreated = (editor: IDomEditor) => {
    setEditorInstance(editor);
  };

  useUpdateEffect(() => {
    setHtmlValue(value || '');
  }, [value]);

  useEffect(() => {
    return () => {
      // 及时销毁 editor
      if (editorInstance === null) return;
      editorInstance.destroy();
      setEditorInstance(null);
    };
  }, []);

  return (
    <>
      <div className={`${prefixCls}-wrapper`}>
        <Toolbar editor={editorInstance} defaultConfig={toolbarConfig} mode="default" className={`${prefixCls}-wrapper-toolbar`} />
        <Editor
          defaultConfig={defaultConfig}
          value={htmlValue}
          onCreated={onCreated}
          onChange={_onChange}
          mode="default"
          className={`${prefixCls}-wrapper-editor-main`}
        />
      </div>
    </>
  );
};

export default RichTextEditor;
