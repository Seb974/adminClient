import React, { useContext, useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import { getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import ContainerContext from 'src/contexts/ContainerContext';

const PackageList = ({ _package, total, index, orderView = false, handleQtyChange = null, order = null, setOrders, orders = [] }) => {

    const { settings } =  useContext(AuthContext);
    const { containers } = useContext(ContainerContext);
    const [orderedQty, setOrderedQty] = useState(0);

    useEffect(() => setOrderedQty(_package.quantity), []);

    const handleChange = e => {
        if (isDefined(handleQtyChange))
            handleQtyChange(e);
    };

    const handleContainerChange = ({ currentTarget }) => {
        const newContainer = containers.find(c => c.id === getInt(currentTarget.value));
        const newOrder = {...order, packages: order.packages.map(p => p.id === _package.id ? {..._package, container: newContainer} : p)}
        const newOrders = orders.map(o => o.id === newOrder.id ? newOrder : o);
        setOrders(newOrders);
    };

    return !isDefined(_package) ? <></> : (
        <CRow>
            <CCol xs="12" sm={orderView ? "4" : "3"}>
                <CFormGroup>
                    <CLabel htmlFor="name" style={{ color: 'darkgoldenrod' }}>{"Colis " + (total > 1 ? index + 1 : "")}</CLabel>
                    {/* <CInput id="name" name={ _package.id } value={ _package.container.name } disabled={ true } style={{ color: 'darkgoldenrod' }}/> */}
                    <CSelect custom name={ _package.id } id="container" value={ isDefined(_package.container) ? _package.container.id : 0 } onChange={ handleContainerChange } >        // disabled={ isDefined(order) && (order.catalog.deliveredByChronopost || isDefined(order.paymentId) ) }
                        { isDefinedAndNotVoid(containers) ?
                            containers.map(c => <option key={ c.id } value={ c.id }>{ c.name }</option>) :
                            <option value={ _package.container.id }>{ _package.container.name }</option>
                        }
                    </CSelect>
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
                            value={ orderedQty }
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
                            onChange={ handleChange }
                            disabled={ isDefined(order) && order.catalog.deliveredByChronopost }
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