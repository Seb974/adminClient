import React from 'react';
import { CCol, CLabel, CRow,  CFormGroup, CInput, CInputGroup } from '@coreui/react';

const ImgixAccount = ({ imageOwner, handleChange }) => {
    return (
        <>
            <CRow>
                <CFormGroup row className="ml-1 mt-2 mb-0">
                    <CCol xs="12" sm="12" md="12">
                        <CLabel><a href="https://imgix.com/pricing" target="_blank">Compte ImgIX</a></CLabel>
                    </CCol>
                </CFormGroup>
            </CRow>
            <CRow>
                <CCol xs="12" sm="12" md="6" className="mt-4">
                    <CFormGroup>
                        <CLabel htmlFor="name">Domaine</CLabel>
                        <CInputGroup>
                            <CInput
                                id="imgDomain"
                                name="imgDomain"
                                value={ imageOwner.imgDomain }
                                onChange={ handleChange }
                                placeholder="Nom de domaine ImgIX"
                            />
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="12" md="6" className="mt-4">
                    <CFormGroup>
                        <CLabel htmlFor="name">Clé</CLabel>
                        <CInputGroup>
                            <CInput
                                id="imgKey"
                                name="imgKey"
                                value={ imageOwner.imgKey }
                                onChange={ handleChange }
                                placeholder="Clé secrète ImgIX"
                            />
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
            </CRow>
            <hr/>
        </>
    );
}
 
export default ImgixAccount;