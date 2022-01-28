import React, { useState, useEffect, useContext } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CValidFeedback } from '@coreui/react';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import ContainerContext from 'src/contexts/ContainerContext';

const PackageList = ({ _package, total, index, orderView = false }) => {

    const { containers } = useContext(ContainerContext);

    return !isDefined(_package) ? <></> : (
        <CRow>
            <CCol xs="12" sm={orderView ? "4" : "3"}>
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>{"Colis " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom id="container" value={ _package.container.id } disabled={ true }>
                        { containers.map(c => <option key={ c.id } value={ c.id }>{ c.name }</option>) }
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>{"Capacité réelle"}
                    </CLabel>
                    <CSelect custom name="capacity" id="capacity" disabled={ true } value={ "0" }>
                            <option key="0" value="0">{ (_package.container.max - _package.container.tare).toFixed(2) + " Kg" }</option> 
                    </CSelect>
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
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ "U" }</CInputGroupText>
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
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ "U" }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
        </CRow>
    );
}
 
export default PackageList;