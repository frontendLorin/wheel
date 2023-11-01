import React, { memo } from 'react';
import styles from './style.less';
import { Button } from 'antd';

const App = () => {
  return (
    <div className={styles.home}>
      首页<Button>按钮</Button>
    </div>
  );
};

export default memo(App);
