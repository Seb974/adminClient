import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CInvalidFeedback, CRow, CFormGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import AuthContext from 'src/contexts/AuthContext'
import AuthActions from 'src/services/AuthActions'
import { useTranslation } from 'react-i18next'
import PlatformContext from 'src/contexts/PlatformContext'
import { isDefined } from 'src/helpers/utils'
import api from 'src/config/api'

const Login = ({ history }) => {

  const { setIsAuthenticated } = useContext(AuthContext);
  const { platform } = useContext(PlatformContext);
  const [credentials, setCredentials] = useState({username: '', password: ''});
  const [error, setError] = useState("");
  const { t, i18n } = useTranslation()

  const handleChange = ({currentTarget}) => {
      setCredentials({...credentials, [currentTarget.name]: currentTarget.value});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    AuthActions.authenticate(credentials)
               .then(response => {
                   setError("");
                   setIsAuthenticated(true);
                   history.push('/');
                })
               .catch(error => {
                   console.log(error);
                   setError("Paramètres de connexion invalides")
                });
  }

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="8">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={ handleSubmit }>
                    <h1 className="text-center mb-0">
                      {/* { t("login.title.label") } */}
                      <img src="assets/img/logo/logo_fp_4.png" alt={ isDefined(platform) ? platform.name : "" } width={ 150 }/>
                    </h1>
                    <p className="text-muted mt-0 text-center">{ t("login.text-muted.label") }</p>
                    <CFormGroup className="mt-4">
                      <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>@
                            {/* <CIcon name="cil-user" /> */}
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput 
                            type="email" 
                            id="username"
                            name="username"
                            placeholder={ t("login.username.label") }
                            value={ credentials.username }
                            invalid={ error.length > 0 }
                            onChange={ handleChange }
                            autoComplete="username"
                            required
                        />
                      </CInputGroup>
                      <CInvalidFeedback>{ error }</CInvalidFeedback>
                    </CFormGroup>
                    <CFormGroup className="mt-4">
                      <CInputGroup className="mb-4">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-lock-locked" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput type="password" placeholder="Password"
                            type="password" 
                            id="password"
                            name="password"
                            placeholder={ t("login.password.label") }
                            value={ credentials.password }
                            onChange={ handleChange }
                            autoComplete="current-password"
                            required
                        />
                      </CInputGroup>
                    </CFormGroup>
                    <CRow>
                      <CCol xs="6" className="mt-4">
                        <CButton type="submit" color="success" className="px-4">{ t("login.button.label") }</CButton>
                      </CCol>
                      <CCol xs="6" className="text-right mt-4">
                        <CButton color="link" className="px-0" style={{ color: "#2a2b36" }}>{ t("login.forgot-pwd.label") }</CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white py-5 d-md-down-none" style={{ width: '44%', backgroundColor: "#2a2b36"}}>  
              {/* bg-dark */}
                <CCardBody className="text-center">
                  <div>
                    {/* <h2>{ isDefined(platform) ? platform.name : "" }</h2> */}
                    <img src="assets/img/logo/logo_fp_2.png" alt={ isDefined(platform) ? platform.name : "" } width={ 300 }/>
                    <p className="my-3">Accès réservé aux administrateurs.</p>
                    <a href={ api.CLIENT_DOMAIN } target="_blank">
                      <CButton color="success" className="mt-3" active tabIndex={-1}>Aller au site public</CButton>
                    </a>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
