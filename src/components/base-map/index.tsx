import { useRef, useState } from 'react';
import { Map, MapZoomLevel } from '@mapzone/map';
import { BizMapMousePosition } from './mouse-position';
import type { IFsMap } from '@mapzone/map-kit';
import type { FsFC, MapProps } from '@mapzone/types';
import './styles/index.less';

export type BizBaseMapProps = MapProps;

const prefixCls = 'biz-base-map';

const BizBaseMap: FsFC<BizBaseMapProps> = (props) => {
  const { className, onFsMapCreated, children, ...restProps } = props;
  const [internalFsMap, setInternalFsMap] = useState<IFsMap>();
  const divRef = useRef<HTMLDivElement>(null);

  const onInternalFsMapCreated = (fsMap: IFsMap) => {
    setInternalFsMap(fsMap);
    if (onFsMapCreated && fsMap) {
      onFsMapCreated(fsMap);
    }
  };

  return (
    <div className={`${prefixCls}-container`} ref={divRef}>
      <Map className={className} onFsMapCreated={onInternalFsMapCreated} {...restProps} />
      {children}
      {!!internalFsMap && <MapZoomLevel fsMap={internalFsMap} />}
      {!!internalFsMap && <BizMapMousePosition fsMap={internalFsMap} />}
    </div>
  );
};

export { BizBaseMap };
