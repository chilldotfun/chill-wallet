import ReactDOM from 'react-dom';
import React from 'react';
import { App } from './app';

const rootEl = document.createElement('div');
document.body.appendChild(rootEl);

ReactDOM.render(<App />, rootEl);
