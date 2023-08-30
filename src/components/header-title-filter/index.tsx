import { useEffect } from 'react';
import { useModel } from '@umijs/max';
import { BizCompanyTreeSelect } from '../biz-company-tree-select';
import { BizDictSelect } from '../biz-dict-select';
import './index.less';

/** 顶部筛选区域 */
export const HeaderTitleFilter = () => {
  const { initialState = {}, setInitialState } = useModel('@@initialState');
  const { year, company, userInfo } = initialState;

  const onYearChange = (year: string) => {
    setInitialState((preInitialState) => ({
      ...preInitialState,
      year,
    }));
  };

  const onCompanyChange = (company: string) => {
    setInitialState((preInitialState) => ({
      ...preInitialState,
      company,
    }));
  };

  useEffect(() => {
    if (userInfo) {
      const year = new Date().getFullYear();
      setInitialState((preInitialState) => ({
        ...preInitialState,
        year: `${year}`,
        company: userInfo.original?.dwCode,
      }));
    }
    return () => {};
  }, [userInfo]);

  if (!userInfo) {
    return null;
  }

  return (
    <div className="header-title-filter">
      <BizDictSelect dictDomain="年度" value={year} placeholder="请选择年度" onChange={onYearChange} />
      <BizCompanyTreeSelect value={company} onChange={onCompanyChange} />
    </div>
  );
};
