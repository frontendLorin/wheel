import React, { memo } from 'react';
import styles from './style.less';

const App = () => {
  return <div className={styles.home}>Hom</div>;
};

export default memo(App);
