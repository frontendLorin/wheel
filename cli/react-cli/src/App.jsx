import React, { memo, lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const My = lazy(() => import(/* webpackPrefetch: true */ './pages/My'));

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <ul>
          <li>
            <Link to="/home">首页</Link>
          </li>
          <li>
            <Link to="/my">我的</Link>
          </li>
        </ul>
        <Suspense fallback={<div>loading...</div>}>
          <Routes>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/my" element={<My />}></Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default memo(App);
