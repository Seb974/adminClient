import React, { useContext } from 'react'
import MessageContext from 'src/contexts/MessageContext'
import { isDefinedAndNotVoid } from 'src/helpers/utils'

const Inbox = () => {

  const { messages, setMessages } = useContext(MessageContext);

  return (
    <>
      <div className="c-messages">
        { isDefinedAndNotVoid(messages) && 
           messages
              .sort((a, b) => a.sentAt > b.sentAt ? -1 : 1)
              .map(message => {
            return (
                <a className="c-message" href={ "#/apps/email/messages/" + message.id }>
                    <div className="c-message-details" style={{ width: "100%" }}>
                        <div className="c-message-headers">
                            <div className="c-message-headers-from">{ message.name }<small className="ml-2"><i>{ message.email }</i></small></div>
                            <div className="c-message-headers-date">{ (new Date(message.sentAt)).toLocaleString() }</div>
                            <div className="c-message-headers-subject" style={{color: message.isRead ? "black" : "blue"}}>{ message.subject }</div>
                        </div>
                        <div className="c-message-body">{ message.message }</div>
                    </div>
                </a>
            );
        })}
      </div>
    </>
  )
}

export default Inbox
