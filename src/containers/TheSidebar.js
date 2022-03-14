import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CCreateElement, CSidebar, CSidebarBrand, CSidebarNav, CSidebarNavDivider, CSidebarNavTitle, CSidebarMinimizer, CSidebarNavDropdown, CSidebarNavItem, } from '@coreui/react'
import AuthContext from 'src/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import navigation from './navigation/navigation';
import { isDefined } from 'src/helpers/utils'

const TheSidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const show = useSelector(state => state.sidebarShow);
  const { t, i18n } = useTranslation();
  const [nav, setNav] = useState([]);

  useEffect(() => {
      setAppropriateNavigation()
  }, []);

  useEffect(() => {
      setAppropriateNavigation()
  }, [currentUser]);

  const setAppropriateNavigation = () => {
        setNav(navigation.getNav(t, currentUser));
  };

  return !isDefined(nav) ? <></> : (
    <CSidebar show={show} unfoldable onShowChange={(val) => dispatch({type: 'set', sidebarShow: val })}>
      <CSidebarBrand className="d-md-down-none" to="/">
        <img src="assets/img/logo/logo_navbar_full.png" height={30} alt="logo" className="c-sidebar-brand-full" name="logo-negative"/>
        <img src="assets/img/logo/logo_fp_7.png" height={32} alt="logo" className="c-sidebar-brand-minimized" name="sygnet"/>
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement items={ nav } components={{ CSidebarNavDivider, CSidebarNavDropdown, CSidebarNavItem, CSidebarNavTitle }}/>
        <CSidebarNavDivider />
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none"/>
    </CSidebar>
  )
}

export default React.memo(TheSidebar)
