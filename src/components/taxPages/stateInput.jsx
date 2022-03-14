import React from 'react';
import { CCol, CFormGroup, CInput, CLabel, CRow, CButton, CInputGroupAppend, CInputGroupText, CInputGroup } from '@coreui/react';
import CIcon from '@coreui/icons-react';

const StateInput = ({ rate, handleChange, handleDelete }) => {

    return (
        <CRow>
            <CCol xs="12" sm="5">
                <CFormGroup>
                    <CLabel htmlFor="name">Nom réduit</CLabel>
                    <CInput
                        id={ rate.count }
                        name="name"
                        value={ rate.name }
                        onChange={ handleChange }
                        placeholder="Nom réduit du pays"
                        required
                    />

                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="5">
                <CFormGroup>
                    <CLabel htmlFor="sku">Taux</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            id={ rate.count }
                            name="rate"
                            value={ rate.rate }
                            onChange={ handleChange }
                            placeholder="taux à appliquer"
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>%</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="2" className="d-flex align-items-center mt-2">
                <CButton name={ rate.count } size="sm" color="danger" onClick={ handleDelete }><CIcon name="cil-trash"/></CButton>
            </CCol>
        </CRow>
    );
}
 
export default StateInput;