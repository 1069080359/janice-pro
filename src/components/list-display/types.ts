export type ListDisplayProps = {
  list: LietItem[];
  className?: string;
  onRow?: (record: LietItem) => void;
};

export type LietItem = {
  PK_UID: number;
  C_MESSAGEID: string;
  C_TYPE: string;
  C_LEVEL: number;
  C_TITLE: string;
  C_CONTENT: string;
  I_USERID: number;
  C_USEREALNAME: string;
  DT_SEND_TIME: string;
  C_FJ: string;
  C_CONTENTTXT: string;
  C_BTTP: string;
  C_SFGK: number;
};
