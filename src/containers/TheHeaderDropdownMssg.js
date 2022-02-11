import React, { useContext } from 'react';
import { CBadge, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CImg } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { Link } from 'react-router-dom';
import MessageContext from 'src/contexts/MessageContext';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

const TheHeaderDropdownMssg = () => {

  const messageLimit = 10;
  const { messages, setMessages } = useContext(MessageContext);

  return (
    <CDropdown
      inNav
      className="c-header-nav-item mx-2"
      direction="down"
    >
      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <CIcon name="cil-envelope-open" />
            { messages.length > 0 && messages.filter(m => !m.isRead).length && <CBadge shape="pill" color="info">{messages.filter(m => !m.isRead).length}</CBadge> }
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem
          header
          tag="div"
          color="light"
        >
          { isDefinedAndNotVoid(messages) ? <strong>Vous avez {messages.filter(m => !m.isRead).length} messages non lus</strong> : <strong>Vous n'avez pas de nouveaux messages</strong> }
        </CDropdownItem>
        { isDefinedAndNotVoid(messages) && 
          messages.filter(m => !m.isRead)
                  .filter((m, i) => i < messageLimit)
                  .sort((a, b) => (a.sentAt > b.sentAt) ? -1 : 1)
                  .map((message, key) => {
                      return (
                          <CDropdownItem key={ key } href={"/#/apps/email/messages/" + message.id}>
                              <div className="message" style={{ width: "100%" }}>
                                <div className="pt-3 mr-3 float-left">
                                  <div className="c-avatar">
                                    <CIcon name="cil-user"/>
                                  </div>
                                </div>
                                <div>
                                  <small className="text-muted">{ message.name }</small>
                                  <small className="text-muted float-right mt-1">{ (new Date(message.sentAt)).toLocaleString() }</small>
                                </div>

                                <div className="text-truncate font-weight-bold">{ message.subject }</div>
                                <div className="small text-muted text-truncate">
                                  { message.message.slice(0, 120) }
                                </div>
                              </div>
                          </CDropdownItem>
                      );
                  })
        }
        {/* <CDropdownItem href="#" className="text-center border-top" style={{ width: "100%", margin: 'auto' }}>
          <Link to="/apps/email/inbox" style={{ width: "100%", margin: 'auto' }}>
            <strong>Voir tous les messages</strong>
          </Link>
          </CDropdownItem> */}
          <CDropdownItem href="/#/apps/email/inbox" className="d-flex justify-content-center border-top" style={{ width: "100%", margin: 'auto' }}>
              <div className="text-center text-primary "><strong>Voir tous les messages</strong></div>
          </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default TheHeaderDropdownMssg