import React from 'react';
import { CCol, CLabel, CRow,  CFormGroup, CInput, CInputGroup, CSwitch } from '@coreui/react';

const TextingHouseAccount = ({ platform, handleChange, handleCheckBox }) => {

    return (
        <>
            <CRow>
                <CFormGroup row className="ml-1 mt-2 mb-0">
                    <CCol xs="12" sm="12" md="12">
                        <CLabel><h5><a href="https://api.textinghouse.com" target="_blank">Compte Texting House</a></h5></CLabel>
                    </CCol>
                </CFormGroup>
            </CRow>
            <CRow>
                <CCol xs="12" sm="12" md="6" className="my-3">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="hasSMSOption" className="mr-1" color="danger" shape="pill" checked={ platform.hasSMSOption } onChange={ handleCheckBox }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Connexion à Texting House
                        </CCol>
                    </CFormGroup>
                </CCol>
            </CRow>
            { platform.hasSMSOption && 
                <>
                    <CRow>
                        <CCol xs="12" sm="12" md="6" className="mt-2">
                            <CFormGroup>
                                <CLabel htmlFor="name">Email d'identification</CLabel>
                                <CInputGroup>
                                    <CInput
                                        id="SMSUser"
                                        name="SMSUser"
                                        value={ platform.SMSUser }
                                        onChange={ handleChange }
                                        placeholder="Email de connexion à l'API SMS"
                                    />
                                </CInputGroup>
                            </CFormGroup>
                        </CCol>
                        <CCol xs="12" sm="12" md="6" className="mt-2">
                            <CFormGroup>
                                <CLabel htmlFor="name">Clé</CLabel>
                                <CInputGroup>
                                    <CInput
                                        id="SMSKey"
                                        name="SMSKey"
                                        value={ platform.SMSKey }
                                        onChange={ handleChange }
                                        placeholder="Mot de passe Texting House"
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
 
export default TextingHouseAccount;