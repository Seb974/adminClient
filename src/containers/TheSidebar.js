import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CCreateElement, CSidebar, CSidebarBrand, CSidebarNav, CSidebarNavDivider, CSidebarNavTitle, CSidebarMinimizer, CSidebarNavDropdown, CSidebarNavItem, } from '@coreui/react'
import AuthContext from 'src/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import navigation from './navigation/navigation';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import PlatformContext from 'src/contexts/PlatformContext'

const TheSidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useContext(AuthContext);
  const { platform } = useContext(PlatformContext);
  const show = useSelector(state => state.sidebarShow);
  const { t, i18n } = useTranslation();
  const [nav, setNav] = useState([]);

  useEffect(() => {
      setAppropriateNavigation()
  }, []);

  useEffect(() => {
      setAppropriateNavigation()
  }, [currentUser, platform]);

  const setAppropriateNavigation = () => {
        setNav(navigation.getNav(t, currentUser, platform));
  };

  return !isDefined(nav) ? <></> : (
    <CSidebar show={show} unfoldable onShowChange={(val) => dispatch({type: 'set', sidebarShow: val })}>
      <CSidebarBrand className="d-md-down-none" to="/">
        { isDefined(platform) && isDefinedAndNotVoid(platform.logos) && isDefined(platform.logos.find(l => l.type === "LOGO_STRETCHED_LIGHT")) && 
          <img 
            src={ (platform.logos.find(l => l.type === "LOGO_STRETCHED_LIGHT")).image.imgPath }
            height={ 45 } 
            alt={ isDefined(platform) ? platform.name : "LOGO" }
            className="c-sidebar-brand-full" 
            name="logo-negative"
            loading="lazy"
          />
        }
        { isDefined(platform) && isDefinedAndNotVoid(platform.logos) && isDefined(platform.logos.find(l => l.type === "LOGO_SQUARE")) &&
          <img 
            src={ (platform.logos.find(l => l.type === "LOGO_SQUARE")).image.imgPath }
            height={ 32 } 
            alt={ isDefined(platform) ? platform.name : "LOGO" }
            className="c-sidebar-brand-minimized" 
            name="sygnet"
            loading="lazy"
          />
        }
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
