import React, { useContext, useEffect, useState } from 'react'
import { CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CInvalidFeedback, CRow, CFormGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import AuthContext from 'src/contexts/AuthContext'
import AuthActions from 'src/services/AuthActions'
import { useTranslation } from 'react-i18next'
import PlatformContext from 'src/contexts/PlatformContext'
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils'
import { Spinner } from 'react-bootstrap'
import api from 'src/config/api'

const Login = ({ history }) => {

  const { setIsAuthenticated } = useContext(AuthContext);
  const { platform } = useContext(PlatformContext);
  const [credentials, setCredentials] = useState({username: '', password: ''});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (error.length > 0)
        setError("");
  }, [credentials]);

  const handleChange = ({currentTarget}) => setCredentials({...credentials, [currentTarget.name]: currentTarget.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    AuthActions
        .authenticate(credentials)
        .then(response => {
            setError("");
            setIsAuthenticated(true);
            setLoading(false);
            history.push('/');
        })
        .catch(error => {
          setError("Paramètres de connexion invalides");
          setLoading(false);
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
                      { isDefined(platform) && isDefinedAndNotVoid(platform.logos) && isDefined(platform.logos.find(l => l.type === "LOGO_STRETCHED_DARK")) &&
                          <img 
                              src={ (platform.logos.find(l => l.type === "LOGO_STRETCHED_DARK")).image.imgPath }
                              alt={ isDefined(platform) ? platform.name : "LOGO" } 
                              width={ 175 }
                              loading="lazy"
                            />
                      }
                    </h1>
                    <p className="text-muted mt-0 text-center">{ t("login.text-muted.label") }</p>
                    <CFormGroup className="mt-4">
                      <CInputGroup className="mb-3">
                        <CInputGroupPrepend>
                          <CInputGroupText>@
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
                        <CInvalidFeedback>{ error }</CInvalidFeedback>
                      </CInputGroup>
                    </CFormGroup>
                    <CFormGroup className="mt-4">
                      <CInputGroup className="mb-4">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-lock-locked" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput 
                            type="password" 
                            id="password"
                            name="password"
                            placeholder={ t("login.password.label") }
                            value={ credentials.password }
                            invalid={ error.length > 0 }
                            onChange={ handleChange }
                            autoComplete="current-password"
                            required
                        />
                      </CInputGroup>
                    </CFormGroup>
                    <CRow>
                      <CCol xs="6" className="mt-4">
                        <CButton type="submit" color="success" className="px-4" style={{ minWidth: '114px' }}>
                            { loading ?
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />
                              </>
                              : t("login.button.label")
                             }
                        </CButton>
                      </CCol>
                      <CCol xs="6" className="text-right mt-4">
                        <CButton color="link" className="px-0" style={{ color: "#2a2b36" }}>{ t("login.forgot-pwd.label") }</CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white py-5 d-md-down-none" style={{ width: '44%', backgroundColor: "#2a2b36"}}>  
                <CCardBody className="text-center">
                  <div>
                    { isDefined(platform) && isDefinedAndNotVoid(platform.logos) && isDefined(platform.logos.find(l => l.type === "LOGO_FULL_LIGHT")) &&
                          <img 
                              src={ (platform.logos.find(l => l.type === "LOGO_FULL_LIGHT")).image.imgPath }
                              alt={ isDefined(platform) ? platform.name : "LOGO" } 
                              width={ 300 }
                              loading="lazy"
                            />
                    }
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
