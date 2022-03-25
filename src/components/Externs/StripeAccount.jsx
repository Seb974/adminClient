import React from 'react';
import { CCol, CLabel, CRow,  CFormGroup, CInput, CInputGroup } from '@coreui/react';

const StripeAccount = ({ platform, handleChange }) => {
    return (
        <>
            <CRow>
                <CFormGroup row className="ml-1 mt-2 mb-0">
                    <CCol xs="12" sm="12" md="12">
                        <CLabel><h5><a href="https://stripe.com/fr" target="_blank">Compte Stripe</a></h5></CLabel>
                    </CCol>
                </CFormGroup>
            </CRow>
            <CRow className="mb-3">
                <CCol xs="12" sm="12" md="6" className="my-2">
                {/* className="mt-4" */}
                    <CFormGroup>
                        <CLabel htmlFor="name">Clé publique</CLabel>
                        <CInputGroup>
                            <CInput
                                id="stripePublicKey"
                                name="stripePublicKey"
                                value={ platform.stripePublicKey }
                                onChange={ handleChange }
                                placeholder="Clé publique Stripe"
                            />
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="12" md="6" className="my-2">
                    {/* className="mt-4" */}
                    <CFormGroup>
                        <CLabel htmlFor="name">Clé privée</CLabel>
                        <CInputGroup>
                            <CInput
                                id="stripePrivateKey"
                                name="stripePrivateKey"
                                value={ platform.stripePrivateKey }
                                onChange={ handleChange }
                                placeholder="Clé privée Stripe"
                            />
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
            </CRow>
            <hr/>
        </>
    );
}
 
export default StripeAccount;