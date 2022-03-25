import React from 'react';
import { CCol, CLabel, CRow, CFormGroup, CInput, CInputGroup, CSwitch } from '@coreui/react';

const ChronopostAccount = ({ platform, handleChange, handleCheckBox }) => {

    return (
        <>
            <CRow>
                <CFormGroup row className="ml-1 mt-2 mb-0">
                    <CCol xs="12" sm="12" md="12">
                        <CLabel><h5><a href="https://www.chronopost.fr/fr/plateformes-e-commerce" target="_blank">Compte Chronopost</a></h5></CLabel>
                    </CCol>
                </CFormGroup>
            </CRow>
            <CRow>
                <CCol xs="12" sm="12" md="6" className="my-3">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="hasChronopostLink" className="mr-1" color="danger" shape="pill" checked={ platform.hasChronopostLink } onChange={ handleCheckBox }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Connexion à Chronopost
                        </CCol>
                    </CFormGroup>
                </CCol>
            </CRow>
            { platform.hasChronopostLink && 
                <>
                    <CRow>
                        <CCol xs="12" sm="12" md="6" className="mt-2">
                            <CFormGroup>
                                <CLabel htmlFor="name">Numéro de compte</CLabel>
                                <CInputGroup>
                                    <CInput
                                        id="chronopostNumber"
                                        name="chronopostNumber"
                                        value={ platform.chronopostNumber }
                                        onChange={ handleChange }
                                        placeholder="Numéro de compte Chronopost"
                                    />
                                </CInputGroup>
                            </CFormGroup>
                        </CCol>
                        <CCol xs="12" sm="12" md="6" className="mt-2">
                            <CFormGroup>
                                <CLabel htmlFor="name">Mot de passe</CLabel>
                                <CInputGroup>
                                    <CInput
                                        id="chronopostPassword"
                                        name="chronopostPassword"
                                        value={ platform.chronopostPassword }
                                        onChange={ handleChange }
                                        placeholder="Mot de passe Chronopost"
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
 
export default ChronopostAccount;