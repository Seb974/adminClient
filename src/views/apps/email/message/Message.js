import React, { useEffect, useState } from 'react'
import { CForm, CButton, CFormGroup, CTextarea } from '@coreui/react'
import MessageActions from 'src/services/MessageActions';
import { isDefined } from 'src/helpers/utils';

const Message = ({ match, history }) => {

  const { id = "new" } = match.params;
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => fetchMessage(id), []);
  useEffect(() => fetchMessage(id), [id]);

  const fetchMessage = id => {
    if (id !== "new") {
        setEditing(true);
        MessageActions.find(id)
            .then( data => {
                MessageActions.update(id, {...data, isRead: true});
                setMessage(data);
                if (isDefined(data.response && data.response.length > 0))
                    setResponse(data.response);
              })
            .catch(error => history.replace("/apps/email/inbox"));
    }
  };

  const handleChange = ({ currentTarget }) => setResponse(currentTarget.value);

  const handleSubmit = e => {
      e.preventDefault();
      MessageActions
          .update(id, {...message, response})
          .then(response => {
              history.replace("/apps/email/inbox");
          });
  };

  return !isDefined(message) ? <></> : (
    <>
      <div className="c-messages">
        <div className="c-message p-3">
            <div className="c-message-details" style={{ width: "100%"}}>

              <div className="c-message-headers">
                <div className="c-message-headers-from">{ message.name }<small className="ml-2"><i>{ message.email }</i></small></div>
                <div className="c-message-headers-date">{ (new Date(message.sentAt)).toLocaleString() }</div>
                <div className="c-message-headers-subject">{ message.subject }</div>
              </div>

              <hr />
              <div className="c-message-body">{ message.message }</div>
              <hr />

              <CForm className="mt-3" onSubmit={ handleSubmit }>
                <CFormGroup>
                  <CTextarea 
                    rows="12" 
                    placeholder="Click here to reply"
                    value={ response }
                    onChange={ handleChange }
                  />
                </CFormGroup>
                <CFormGroup>
                  <CButton color="success" tabIndex="3" type="submit" disabled={ isDefined(message.replied) && message.replied }>
                        Send message
                  </CButton>
                </CFormGroup>
              </CForm>
            </div>
        </div>
      </div>
    </>
  )
}

export default Message
