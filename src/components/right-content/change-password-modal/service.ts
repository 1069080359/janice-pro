import { appRequest, requestController } from '@mapzone/request';

type Res = {
  result: 'success' | 'error';
  data: 'true';
};

export const checkOldPwd = requestController<Res, { old: string }>((props) => appRequest.post('/modifyPwd/check.do', props), {
  requestType: 'form',
});

export const resetPwd = (params: { oldPwd: string; newPwd: string }) => {
  const data = {
    p1: params.oldPwd,
    p2: params.newPwd,
  };
  return appRequest.post<Res>('/modifyPwd/reset.do', {
    data,
    requestType: 'form',
  });
};
