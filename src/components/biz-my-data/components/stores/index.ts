import Dexie from 'dexie';
import type { TMyDataDatabase, TMyDataDatabaseProps } from '../../types';

/**
 * 我的数据
 */
export class MyDataDatabase extends Dexie implements TMyDataDatabase {
  public localLayerDatas: TMyDataDatabase['localLayerDatas'];

  public constructor(props: TMyDataDatabaseProps) {
    const { appName = '', userId = '' } = props;
    super(`myDataDb-${appName}-${userId}`);
    this.version(2).stores({
      localLayerDatas: 'id,JSON,format',
    });
    this.localLayerDatas = this.table('localLayerDatas');
  }
}

export default MyDataDatabase;
