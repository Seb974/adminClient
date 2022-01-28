import React, { useState } from 'react'
import { CButton, CForm, CFormGroup, CLabel, CInput, CTextarea, CRow, CCol } from '@coreui/react'
import api from 'src/config/api';

const Compose = ({history}) => {

  const [message, setMessage] = useState({email: "", subject: "", message: ""});

  const handleChange = ({ currentTarget }) => setMessage({...message, [currentTarget.name]: currentTarget.value});

  const handleSubmit = async e => {
      e.preventDefault();
      api.post('/api/email/send', message)
         .then(response => {
              history.replace("/apps/email/inbox");
         })
         .catch(error => console.log(error));
  };

  return (
    <>
      <p className="text-center">Nouveau message</p>

      <CForm onSubmit={ handleSubmit }>
        <CRow form className="mb-3">
          <CLabel sm="1" className="col-1 mt-2" htmlFor="email">Pour:</CLabel>
          <CCol sm="11">
            <CInput className="form-control" id="email" name="email" type="email" placeholder="Adresse email" value={ message.email } onChange={ handleChange }/>
          </CCol>
        </CRow>
        <CRow form className="mb-3">
          <CLabel sm="1" className="col-1 mt-2" htmlFor="subject">Sujet:</CLabel>
          <CCol sm="11">
            <CInput className="form-control" id="subject" name="subject" type="text" placeholder="Sujet" value={ message.subject } onChange={ handleChange }/>
          </CCol>
        </CRow>
      
        <CRow>
          <CCol className="ml-auto" sm="11">
            <CFormGroup className="mt-4">
              <CTextarea rows="12" placeholder="Message content" id="message" name="message" value={ message.message } onChange={ handleChange }/>
            </CFormGroup>
            <CFormGroup>
              <CButton color="success" type="submit">Send</CButton>
            </CFormGroup>
          </CCol>
        </CRow>

      </CForm>
            
    </>
  )
}

export default Compose
