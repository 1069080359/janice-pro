import { Button, Space, Typography } from 'antd';
import type { EditorDisplayDetailsProps } from './types';

import './style.less';
import { FsFC } from '@mapzone/types';

const { Title, Text } = Typography;
const prefixCls = 'editor-display-details';

const EditorDisplayDetails: FsFC<EditorDisplayDetailsProps> = (props) => {
  const { detailInfo, onBack } = props;

  const onClickBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    }
  };

  if (!detailInfo) {
    onClickBack();
    return null;
  }
  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-header`}>
        <div className={`${prefixCls}-header-title`}>
          <Text />
          <Title level={2} className="bold-title">
            {detailInfo.C_TITLE}
          </Title>
          {typeof onBack === 'function' ? (
            <Button type="text" onClick={onClickBack}>
              返回
            </Button>
          ) : (
            <Text />
          )}
        </div>
        <Space>
          {detailInfo.C_USEREALNAME && <Text>{detailInfo.C_USEREALNAME}</Text>}
          {detailInfo.DT_SEND_TIME && <Text>{detailInfo.DT_SEND_TIME}</Text>}
        </Space>
      </div>
      {detailInfo.C_CONTENT && <div className={`${prefixCls}-content`} dangerouslySetInnerHTML={{ __html: detailInfo.C_CONTENT }} />}
    </div>
  );
};

export default EditorDisplayDetails;
