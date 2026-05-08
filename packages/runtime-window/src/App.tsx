
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from './app/store';
import { drawerSlice } from './ui/drawer';

import { DrawerToggleButton } from './components/DrawerToggleButton';
import { ShortcutItem } from './components/ShortcutItem';
import { consoleSlice } from './ui/console';
import { ScrollBox } from './components/ScrollBox';
import { useMediaQuery } from './app/media';

export const App = () => {
  const defaultDrawerOpen = useMediaQuery('(min-width: 40rem)');
  const drawerIsOpen = useSelector((state: RootState) => state.drawer.open) ?? defaultDrawerOpen;
  const direction = useSelector((state: RootState) => state.direction.direction);
  const scrollOffset = useSelector((state: RootState) => state.console.scrollOffset);
  const config = useSelector((state: RootState) => state.config);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(drawerSlice.actions.unsetDrawerState());
  }, [defaultDrawerOpen]);

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <div id="app" className={drawerIsOpen ? 'app-drawer-open' : 'app-drawer-closed'}>
      <div id="app-top-bar">
        <div id="app-top-bar-side">
          <DrawerToggleButton />
          <div id="app-top-bar-branding">
            <img id="app-top-bar-branding-logo" src={config.site_config.branding_logo_url} alt="logo"/>
          </div>
        </div>
        <div id="app-top-bar-main">
          {config.site_config.site_name}
        </div>
      </div>
      <ScrollBox id="app-main" onScrollOffsetChange={(offset) => consoleSlice.actions.scrollTo({ offset })} scrollOffset={scrollOffset} scrollOrigin='start'>
        <div id="app-main-inner">
          <slot name="main"></slot>
        </div>
        <footer id="app-main-footer">
          <slot name="footer"></slot>
        </footer>
      </ScrollBox>
      <div id="app-overlay" onClick={() => dispatch(drawerSlice.actions.closeDrawer())}></div>
      <div id="app-drawer">
        <div id="app-drawer-shortcuts">
          <>
            {
              config.shortcuts.map(
                shortcut =>
                  <ShortcutItem selected={!!(shortcut.selected ?? false)} href={shortcut.url} icon={shortcut.icon} text={shortcut.title} />
              )
            }
          </>
        </div>
        <div id="app-drawer-navigation">
          <h1 id="app-drawer-heading">{config.site_config.site_short_name}</h1>
          <slot name="nav"></slot>
        </div>
      </div>
    </div>
  );
};
