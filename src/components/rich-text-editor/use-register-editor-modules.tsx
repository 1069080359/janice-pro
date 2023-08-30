import { useEffect } from 'react';
import { Boot } from '@wangeditor/editor';
import attachmentModule from '@wangeditor/plugin-upload-attachment';

// 自定义 Hook，用于注册 wangeditor 模块
const useRegisterEditorModules = () => {
  useEffect(() => {
    // 注册模块
    if (Boot.plugins.length < 13) {
      Boot.registerModule(attachmentModule);
    }
  }, []);
};

export default useRegisterEditorModules;
