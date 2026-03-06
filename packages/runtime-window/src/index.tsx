import React from 'react';
import { createRoot } from 'react-dom/client';
import css from './index.css';
import commonCss from './common.css';
import rootCss from './root.css';
import { App } from './App';
import store from './app/store';
import { Provider } from 'react-redux';
import { directionSlice, Direction } from './ui/direction';
import { varsToStyleSheet, createStyleSheet } from './app/stylesheet';
import { config } from './app/config';

const shadowRoot = document.body.attachShadow({mode: 'closed'});
const googleFontLink = document.createElement('link');
googleFontLink.rel = 'stylesheet';
googleFontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Noto+Sans+JP:wght@100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900';
shadowRoot.append(googleFontLink);
const rootElement = document.createElement('div');
rootElement.id = 'root';
shadowRoot.append(rootElement);

document.adoptedStyleSheets = [
  varsToStyleSheet(config.css_vars),
  createStyleSheet(commonCss),
  createStyleSheet(rootCss),
];

shadowRoot.adoptedStyleSheets = [
  varsToStyleSheet(config.css_vars),
  createStyleSheet(commonCss),
  createStyleSheet(css),
];

const root = createRoot(rootElement);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

const _debugUtils = {
  setDirection(direction: Direction) {
    store.dispatch(directionSlice.actions.setDirection({ direction }));
  },
};

declare global {
  var debugUtils: typeof _debugUtils;
}

globalThis.debugUtils = _debugUtils;
