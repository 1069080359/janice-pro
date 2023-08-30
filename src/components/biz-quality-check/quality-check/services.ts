import { appRequest, requestController } from '@mapzone/request';
import { formatDataByResultDisplaySetting } from './utils';
import type { ApiRes, QualityCheckWorkScopeItem } from '@mapzone/types';
import type {
  QueryQualityCheckRuleResultParams,
  QueryQualityCheckRuleResultRes,
  ExecuteQualityCheckRuleRes,
  ExecuteQualityCheckRuleParams,
  DataDermissionsRes,
  QueryQualityCheckRulesParams,
  QueryQualityCheckRulesRes,
} from './types';

export const getUserWorkRange = (pid?: string | number) => {
  return appRequest.get<ApiRes<QualityCheckWorkScopeItem[]>>(`/userResouces/getUserWorkRange?pid=${pid ?? ''}`);
};
// 查询质检结果列表（包含质检错误数量）
export const queryQualityCheckRuleResult = async (data: QueryQualityCheckRuleResultParams) => {
  const res = await appRequest.post<QueryQualityCheckRuleResultRes>('/datacheck/result', { data });
  if (res.success) {
    res.datas = formatDataByResultDisplaySetting(res.datas);
  }
  return res;
};
// 检查数据质检规则（查看数据质检结果）
export const executeQualityCheckRule = (data: ExecuteQualityCheckRuleParams) => {
  return appRequest.post<ExecuteQualityCheckRuleRes>('/datacheck/execute', {
    data,
  });
};

export const getDataDermissions = requestController((props = {}) => {
  return appRequest.post<DataDermissionsRes>('/dataPermission/queryPermissionTagsByTableName', {
    ...props,
    requestType: 'form',
  });
});

export const queryQualityCheckRuleSetting = async (data: QueryQualityCheckRulesParams) => {
  const res = await appRequest.post<QueryQualityCheckRulesRes>('/datacheck/findByPaging', {
    data,
  });
  if (res.success) {
    res.datas.data = formatDataByResultDisplaySetting(res.datas.data);
  }
  return res;
};
