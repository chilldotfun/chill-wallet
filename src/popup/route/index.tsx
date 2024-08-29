import React, { lazy } from 'react';

import Index from '@/popup/pages/Index/index';
import About from '@/popup/pages/Setting/About';
import type { RouteObject } from 'react-router-dom';

const routes = [
  {
    path: '/',
    element: <Index></Index>
  }
];

export default routes;
