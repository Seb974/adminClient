import React, { useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CHeader, CToggler, CHeaderBrand, CHeaderNav } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { TheHeaderDropdownMssg } from './index'
import AuthActions from 'src/services/AuthActions'
import AuthContext from 'src/contexts/AuthContext'
import { Link } from 'react-router-dom'
import '../assets/css/header.css'

const TheHeader = (props) => {
  const dispatch = useDispatch()
  // const asideShow = useSelector(state => state.asideShow)
  const darkMode = useSelector(state => state.darkMode)
  const sidebarShow = useSelector(state => state.sidebarShow)
  const { setIsAuthenticated, setCurrentUser, setSupervisor, setSeller } = useContext(AuthContext);

  const toggleSidebar = () => {
    const val = [true, 'responsive'].includes(sidebarShow) ? false : 'responsive'
    dispatch({type: 'set', sidebarShow: val})
  }

  const toggleSidebarMobile = () => {
    const val = [false, 'responsive'].includes(sidebarShow) ? true : 'responsive'
    dispatch({type: 'set', sidebarShow: val})
  }

  const handleLogout = e => {
    e.preventDefault();
    AuthActions.logout()
               .then(response => {
                   setIsAuthenticated(false);
                   setCurrentUser(AuthActions.getCurrentUser());
                   setSupervisor(null);
                   setSeller(null);
               });
  }

  return (
    <CHeader withSubheader>
      <CToggler inHeader className="ml-md-3 d-lg-none" onClick={toggleSidebarMobile} />
      <CToggler inHeader className="ml-3 d-md-down-none" onClick={toggleSidebar} />
      <CHeaderBrand className="mx-auto d-lg-none" to="/">
        {/* <CIcon name="logo" height="48" alt="Logo"/> */}
        { darkMode ?
          <img src="assets/img/logo/logo_fp_5.png" height={54} alt="logo" className="c-sidebar-brand-full" name="logo-negative"/> :
          <img src="assets/img/logo/logo_fp_4.png" height={54} alt="logo" className="c-sidebar-brand-full" name="logo-positive"/>
        }
      </CHeaderBrand>

      <CHeaderNav className="d-md-down-none mr-auto"></CHeaderNav>

      <CHeaderNav className="px-3">
        <TheHeaderDropdownMssg/>
        <CToggler
          inHeader
          className="ml-3 d-md-down-none c-d-legacy-none mb-1"
          onClick={() => dispatch({type: 'set', darkMode: !darkMode})}
          title="Toggle Light/Dark Mode"
        >
          <CIcon name="cil-moon" className="c-d-dark-none" alt="CoreUI Icons Moon" />
          <CIcon name="cil-sun" className="c-d-default-none" alt="CoreUI Icons Sun" />
        </CToggler>
        <Link to="/" onClick={ handleLogout }><i className="fas fa-power-off mx-3 logout-button" style={{ fontSize: '1.5em'}}></i></Link>
      </CHeaderNav>
    </CHeader>
  )
}

export default TheHeader
