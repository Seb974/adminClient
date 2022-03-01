import React from 'react';
import { CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import { isDefined } from 'src/helpers/utils';

const PackageList = ({ _package, total, index, orderView = false }) => {

    return !isDefined(_package) ? <></> : (
        <CRow>
            <CCol xs="12" sm={orderView ? "4" : "3"}>
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>{"Colis " + (total > 1 ? index + 1 : "")}</CLabel>
                    <CInput id="name" name={ _package.id }  value={ _package.container.name } disabled={ true } style={{ color: 'darkgoldenrod' }}/>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>{"Capacité réelle"}</CLabel>
                    <CInput id="capacity" name={ _package.id }  value={ (_package.container.max - _package.container.tare).toFixed(2) + " Kg" } disabled={ true } style={{ color: 'darkgoldenrod' }}/>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="2">
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>Commandé
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="orderedQty"
                            type="number"
                            name={ _package.id }
                            value={ _package.quantity }
                            disabled={ true }
                            style={{ color: 'darkgoldenrod' }}
                        />
                        <CInputGroupAppend>
                            <CInputGroupText style={{ color: 'darkgoldenrod' }}>{ "U" }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="2">
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>A Préparer</CLabel>
                    <CInputGroup>
                        <CInput
                            id="preparedQty"
                            type="number"
                            name={ _package.id }
                            value={ _package.quantity }
                            disabled={ true }
                            style={{ color: 'darkgoldenrod' }}
                        />
                        <CInputGroupAppend>
                            <CInputGroupText style={{ color: 'darkgoldenrod' }}>{ "U" }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
        </CRow>
    );
}
 
export default PackageList;