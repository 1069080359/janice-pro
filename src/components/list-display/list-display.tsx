import { Card, List, Typography } from 'antd';
import type { ListProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { ListDisplayProps, LietItem } from './types';
import './style.less';

const prefixCls = 'mz-list-card';
const { Title } = Typography;
const ListDisplay: FsFC<ListDisplayProps> = (props) => {
  const { list, className, onRow } = props;

  const onRowClick = (row: LietItem) => {
    if (typeof onRow === 'function') {
      onRow(row);
    }
  };

  const renderItem: ListProps<LietItem>['renderItem'] = (item) => {
    return (
      <List.Item.Meta
        title={
          <div className="row-item" onClick={() => onRowClick(item)}>
            <Title level={4} className="title" ellipsis>
              {item.C_TITLE}
            </Title>
            <Title level={5} className="date">
              {item.DT_SEND_TIME}
            </Title>
          </div>
        }
      />
    );
  };

  return (
    <Card className={`${prefixCls} ${className}`} bordered={false}>
      <List dataSource={list} renderItem={renderItem} />
    </Card>
  );
};

export default ListDisplay;
