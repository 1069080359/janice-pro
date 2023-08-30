/** 公司/单位信息 */
export type CompanyInfo = {
  L_ID: number;
  L_PARBH: string;
  L_JB: number;
  L_BH: string;
  C_GLDWNAME: string;

  C_DWCODE: string;
  C_DWNAME: string;

  LYJY: string;
  DW_TYPE: string;
  SORT: string;
  STATUS: string;
  C_JB: string;
  isLeaf: boolean;
  expanded: boolean;
};

/** 政区信息 */
export type RegionInfo = {
  L_ID: number;
  L_PARID: number;
  L_JB: number;
  L_BH: number;
  C_ZQCODE: string;
  C_ZQNAME: string;
  C_ZQSHORTNAME: string;
  L_ZQJB: number;
  T_CJSJ: string;
  T_ZXSJ: string;
  I_ISUSED: number;
  I_ISEDIT: number;
  AREA: string;
  XSL: number;
  children?: RegionInfo[];
  isLeaf: boolean;
  expanded: boolean;
  key: React.Key;
  isLoadChildren?: boolean;
};
