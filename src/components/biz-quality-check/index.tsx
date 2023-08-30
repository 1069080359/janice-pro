import { useState } from 'react';
import { Button } from 'antd';
import classNames from 'classnames';
import { CloseOutlined } from '@ant-design/icons';
import { RndProvider } from '@mapzone/rnd-provider';
import { QualityCheck } from './quality-check';
import type { FsFC } from '@mapzone/types';
import type { BizQualityCheckProps } from './types';
import './index.less';

const prefixCls = 'quality-check';

/** 质检 */
const BizQualityCheck: FsFC<BizQualityCheckProps> = (props) => {
  const [qualityOpen, setQualityOpen] = useState(false);
  const { layerList } = props;
  const getDefaultSizeAndPosition = () => {
    const mapContainer = document.querySelector('.biz-base-map-container');
    let x = 500;
    if (mapContainer) {
      const { width } = mapContainer.getBoundingClientRect();
      console.log(mapContainer.getBoundingClientRect());
      x = width - 650;
    }
    return { position: { x: x, y: 12 } };
  };

  return (
    <>
      {qualityOpen && (
        <RndProvider
          className={classNames(`${prefixCls}-rnd-provider`, { hidden: !qualityOpen })}
          bounds=".biz-map-container"
          getDefaultSizeAndPosition={getDefaultSizeAndPosition}
          maxHeight={600}
          maxWidth={540}
        >
          <div className="provider-header">
            <div className="title">逻辑检查</div>
            <div className="close" onClick={() => setQualityOpen(false)}>
              <CloseOutlined />
            </div>
          </div>
          <div className="provide-body">
            <QualityCheck layerList={layerList} selectedInfo={{ id: undefined, pid: undefined, zqCode: '200000' }} />
          </div>
        </RndProvider>
      )}
      <Button onClick={() => setQualityOpen(true)}>逻辑检查</Button>
    </>
  );
};

export { BizQualityCheck };
