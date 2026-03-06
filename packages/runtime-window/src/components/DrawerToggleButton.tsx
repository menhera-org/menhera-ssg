
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { drawerSlice } from '../ui/drawer';
import { RootState } from '../app/store';
import { useMediaQuery } from '../app/media';

export const DrawerToggleButton = () => {
  const defaultDrawerOpen = useMediaQuery('(min-width: 40rem)');
  const drawerIsOpen = useSelector((state: RootState) => state.drawer.open) ?? defaultDrawerOpen;
  const dispatch = useDispatch();

  return (
    <button
      className="app-drawer-toggle-button app-button material-symbols-outlined"
      onClick={() => {
        dispatch(
          drawerIsOpen
          ? drawerSlice.actions.closeDrawer()
          : drawerSlice.actions.openDrawer()
        );
      }}
    >{'menu'}</button>
  );
};
