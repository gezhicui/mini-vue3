// vue3
import { createApp } from '../../lib/mini-vue3.esm.js';
import { App } from './App.js';

const rootContainer = document.getElementById('app');
createApp(App).mount(rootContainer);
