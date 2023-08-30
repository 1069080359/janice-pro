import { useEffect, useState } from 'react';
import { Coordinate, format } from 'ol/coordinate';
import type { IFsMap } from '@mapzone/map-kit';
import type { FsFC } from '@mapzone/types';
import type { MapBrowserEvent } from 'ol';

export type BizMapMousePositionProps = {
  fsMap: IFsMap;
};

export const BizMapMousePosition: FsFC<BizMapMousePositionProps> = (props) => {
  const { fsMap } = props;
  const [coordinateStrs, setCoordinateStrs] = useState<string[]>();

  const formatCoords = (coords: Coordinate, fractionDigits: number = 4) => {
    return format(coords, '{x}|{y}', fractionDigits).split('|');
  };

  const onMouseMove = (e: MapBrowserEvent<UIEvent>) => {
    setCoordinateStrs(formatCoords(e.coordinate));
  };

  useEffect(() => {
    if (fsMap) {
      fsMap.olMap.on('pointermove', onMouseMove);
    }
    return () => {
      if (fsMap) {
        fsMap.olMap.un('pointermove', onMouseMove);
      }
    };
  }, [fsMap]);

  if (!coordinateStrs) {
    return null;
  }

  return (
    <div className="map-mouse-position">
      经度：{coordinateStrs[0]} 纬度：{coordinateStrs[1]}
    </div>
  );
};
