import React, { useContext } from 'react'
import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarNavItem, CContainer, CCard, CCardBody, CSidebarMinimizer} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { TheAside, TheFooter, TheHeader } from '../../../containers'
import MessageContext from 'src/contexts/MessageContext'
import { isDefinedAndNotVoid } from 'src/helpers/utils'
import { useSelector } from 'react-redux'
import classNames from 'classnames'

const EmailNav = ({children}) => {

  const darkMode = useSelector(state => state.darkMode);
  const classes = classNames('c-app c-default-layout', darkMode && 'c-dark-theme');
  const { messages, setMessages } = useContext(MessageContext);

  return (
    <div className={classes}>
      <CSidebar
        unfoldable
        fixed={true} 
        colorScheme="primary"
      >
        <CSidebarBrand className="d-md-down-none" to="/apps/email">
          <img src="assets/img/logo/logo_navbar_full.png" height={30} alt="logo" className="c-sidebar-brand-full" name="logo-negative"/>
          <img src="assets/img/logo/logo_fp_7.png" height={32} alt="logo" className="c-sidebar-brand-minimized" name="sygnet"/>
        </CSidebarBrand>
        <CSidebarNav>
          <CSidebarNavItem 
            color="success"
            to="/apps/email/compose"
            icon="cil-pencil"
            name="Compose"
          /> 
          { isDefinedAndNotVoid(messages) && messages.filter(m => !m.isRead).length > 0 ?
              <CSidebarNavItem 
                to="/apps/email/inbox"
                icon="cil-inbox"
                name="Inbox"
                badge={{ text: messages.filter(m => !m.isRead).length, color: 'danger' }}
              />
          :
              <CSidebarNavItem 
                to="/apps/email/inbox"
                icon="cil-inbox"
                name="Inbox"
              />
          }
          <CSidebarNavItem
            to="/"
            className="mt-auto"
            icon="cil-speedometer"
            name="Dashboard"
          />
        </CSidebarNav>
        <CSidebarMinimizer/>
      </CSidebar>
      <TheAside/>
      <div className="c-wrapper">
        <TheHeader/>
        <div className="c-body">
          <div className="c-main">
            <CContainer fluid>
              <CCard className="c-email-app">
                <CCardBody>
                  {children}
                </CCardBody>
              </CCard>
            </CContainer>
          </div>
        </div>
        <TheFooter/>
      </div>
    </div>
  )
}

export default EmailNav
