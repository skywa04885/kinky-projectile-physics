import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

import './index.css';

const rootElement = document.getElementById('react');
const root = createRoot(rootElement);

root.render(<App />);