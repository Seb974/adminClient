import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCardBody, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import OrderDetailsItem from './orderDetailsItem';
import { getPreparedOrder } from 'src/helpers/checkout';
import OrderActions from 'src/services/OrderActions';
import { getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import PackageList from './packageList';

const OrderDetails = ({ orders = null, order, setOrders = null, isDelivery = false, id = order.id, toggleDetails }) => {

    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [viewedOrder, setViewedOrder] = useState(null);
    const [displayedOrder, setDisplayedOrder] = useState(null);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (isDefinedAndNotVoid(orders) && JSON.stringify(displayedOrder) !== JSON.stringify(order)) {
            const newDisplayedOrder = orders.find(o => o.id === id);
            const currentOrder = {
                ...newDisplayedOrder,
                items: newDisplayedOrder.items.map(item => ({
                    ...item, 
                    preparedQty: (isDefined(item.preparedQty) ? item.preparedQty : ""), 
                    isAdjourned: (isDefined(item.isAdjourned) ? item.isAdjourned : false)
                }))
            };
            setDisplayedOrder(newDisplayedOrder);
            setViewedOrder(currentOrder);
        }
    }, [orders]);

    const onOrderChange = currentOrder => {
        const newOrders = orders.map(order => order.id === currentOrder.id ? currentOrder : order);
        setViewedOrder(currentOrder);
        setOrders(newOrders);
    };

    const onSubmit = e => {
        const preparedOrder = getPreparedOrder(viewedOrder, currentUser);
        OrderActions
            .update(viewedOrder.id, preparedOrder)
            .then(response => {
                setOrders(orders.filter(o => o.id !== response.data.id));
                // toggleDetails(response.data.id, e);
            })
            .catch(error => console.log(error));
    };

    const handlePackagesChange = ({ currentTarget }) => {
        const updatedPackage = viewedOrder.packages.find(p => p.id === getInt(currentTarget.name));
        setViewedOrder({...viewedOrder, packages: viewedOrder.packages.map(p => p.id === updatedPackage.id ? {...updatedPackage, quantity: currentTarget.value} : p)});
    };

    return (
        <>
            { !isDefined(viewedOrder) ? <></> : 
                viewedOrder.items.map((item, index) => {
                    if (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser) || (!isAdmin && item.product.seller.users.find(user => user.id == currentUser.id) !== undefined)) {
                        return(
                            <CCardBody key={ item.id }>
                                <CRow className="text-center mt-0">
                                    <CCol md="1">{""}</CCol>
                                </CRow>
                                <CRow>
                                    <CCol md="1">{""}</CCol>
                                    <CCol md="10">
                                        <OrderDetailsItem
                                            item={ item }
                                            order={ viewedOrder }
                                            setOrder={ onOrderChange } 
                                            total={ order.items.length } 
                                            index={ index }
                                            isDelivery={ isDelivery }
                                        />
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        );
                    } else return <></>
                })
            }
            { !isDefined(viewedOrder) || !isDefinedAndNotVoid(viewedOrder.packages) ? <></> : viewedOrder.packages.map((_pack, i) => {
                if (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser)) {
                    return(
                        <CCardBody key={ i }>
                            <CRow className="text-center mt-0">
                                <CCol md="1">{""}</CCol>
                            </CRow>
                            <CRow>
                                <CCol md="1">{""}</CCol>
                                <CCol md="10">
                                    <PackageList _package={ _pack } total={ viewedOrder.packages.length } index={ i } handleQtyChange={ handlePackagesChange } order={ viewedOrder } setOrders={ setOrders } orders={ orders }/>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    );
                }
            })}
            <CRow className="text-center mt-0">
                <CCol md="1">{""}</CCol>
            </CRow>
            { isDefined(viewedOrder) && isDefined(viewedOrder.message) && viewedOrder.message.length > 0 && 
                <CCardBody>
                    <CRow className="text-center mt-0">
                        <CCol md="1">{""}</CCol>
                    </CRow>
                    <CRow>
                        <CCol md="1">{""}</CCol>
                        <CCol md="10">
                            <p style={{ color: 'darkslategrey'}}><b>Message du client :</b><br/>{ viewedOrder.message }</p>
                        </CCol>
                    </CRow>
                </CCardBody>
            }
            { !isDelivery &&
                <CRow className="mt-2 mb-5 d-flex justify-content-center">
                    <CButton size="sm" color="success" onClick={ onSubmit }><CIcon name="cil-plus"/>Terminer</CButton>
                </CRow>
            }
        </>
    );
}
 
export default OrderDetails;