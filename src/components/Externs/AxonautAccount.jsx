import React from 'react';
import { CCol, CLabel, CRow,  CFormGroup, CInput, CInputGroup, CSwitch } from '@coreui/react';

const AxonautAccount = ({ platform, handleChange, handleCheckBox }) => {

    return (
        <>
            <CRow>
                <CFormGroup row className="ml-1 mt-2 mb-0">
                    <CCol xs="12" sm="12" md="12">
                        <CLabel><h5><a href="https://axonaut.com/" target="_blank">Compte Axonaut</a></h5></CLabel>
                    </CCol>
                </CFormGroup>
            </CRow>
            <CRow>
                <CCol xs="12" sm="12" md="6" className="my-3">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="hasAxonautLink" className="mr-1" color="danger" shape="pill" checked={ platform.hasAxonautLink } onChange={ handleCheckBox }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Connexion à Axonaut
                        </CCol>
                    </CFormGroup>
                </CCol>
                {/* { platform.hasAxonautLink && 
                    <CCol xs="12" sm="12" md="6" className="mt-2">
                        <CFormGroup>
                            <CLabel htmlFor="name">Email de la newsletter</CLabel>
                            <CInputGroup>
                                <CInput
                                    id="axonautEmail"
                                    name="axonautEmail"
                                    value={ platform.axonautEmail }
                                    onChange={ handleChange }
                                    placeholder="Email d'envoi de la newsletter"
                                />
                            </CInputGroup>
                        </CFormGroup>
                    </CCol>
                } */}
            </CRow>
            { platform.hasAxonautLink && 
                <>
                    <CRow>
                        <CCol xs="12" sm="12" md="6" className="mt-2">
                            <CFormGroup>
                                <CLabel htmlFor="name">Email de la newsletter</CLabel>
                                <CInputGroup>
                                    <CInput
                                        id="axonautEmail"
                                        name="axonautEmail"
                                        value={ platform.axonautEmail }
                                        onChange={ handleChange }
                                        placeholder="Email d'envoi de la newsletter"
                                    />
                                </CInputGroup>
                            </CFormGroup>
                        </CCol>
                        <CCol xs="12" sm="12" md="6" className="mt-2">
                            <CFormGroup>
                                <CLabel htmlFor="name">Clé</CLabel>
                                <CInputGroup>
                                    <CInput
                                        id="axonautKey"
                                        name="axonautKey"
                                        value={ platform.axonautKey }
                                        onChange={ handleChange }
                                        placeholder="Clé secrète axonautKey"
                                    />
                                </CInputGroup>
                            </CFormGroup>
                        </CCol>
                    </CRow>
                    <hr/>
                </>
            }
        </>
    );
}
 
export default AxonautAccount;