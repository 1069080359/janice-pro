import { useState, useEffect } from 'react';
import { simpleRequest } from '@mapzone/request';
import { Markdown } from '@mapzone/markdown';
import './index.less';

const VersionLog = () => {
  const [source, setSource] = useState<string>();

  useEffect(() => {
    simpleRequest
      .get(`${PUBLIC_PATH}config/CHANGELOG.md?t` + Date.now())
      .then((res) => {
        setSource(res);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="versionlog">
      <span className="current-version">
        当前版本：<span className="version-number">v{WEBAPP_VERSION}</span>
      </span>
      {source && <Markdown source={source} />}
    </div>
  );
};
export default VersionLog;
