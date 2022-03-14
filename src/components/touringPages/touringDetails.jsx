import React, { useEffect, useState } from 'react';
import { CButton, CCardBody, CCol, CRow } from '@coreui/react';
import OrderActions from 'src/services/OrderActions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import TouringActions from 'src/services/TouringActions';
import TouringModal from './touringModal';

const TouringDetails = ({ tourings, touring, setTourings, isAdmin, handleSubmit }) => {

    const [ordererOrders, setOrderedOrders] = useState([]);

    useEffect(() => getOrderedOrders(), []);
    useEffect(() => getOrderedOrders(), [touring]);

    const getOrderedOrders = () => {
        const orders = isDefinedAndNotVoid(touring) && isDefinedAndNotVoid(touring.orderEntities) ? 
            touring.orderEntities.sort((a, b) => (a.deliveryPriority > b.deliveryPriority) ? 1 : -1) : [];
        const trip = orders.reduce((unique, order) => {
            return unique.find(o => isForSameClient(order, o)) !== undefined ? unique : [...unique, order];
        }, []);
        const selectedTouring = trip.map(order => ({...order, relatedOrders: orders.filter(o => isForSameClient(order, o)).sort((a, b) => (a.id > b.id) ? 1 : -1) }));
        setOrderedOrders(selectedTouring);
    };

    const isForSameClient = (order1, order2) => {
        return  order1.name === order2.name &&
                JSON.stringify(order1.metas.position) === JSON.stringify(order2.metas.position);
    };

    const onSubmit = () => {
        handleSubmit(touring);
    };

    const handleOrderDelete = order => {
        TouringActions
            .update(touring.id, {
                ...touring,
                deliverer: isDefined(touring.deliverer) ? touring.deliverer['@id'] : null,
                orderEntities: touring.orderEntities.filter(o => o.id !== order.id)
            })
            .then(response => {
                OrderActions.update(order.id, {
                    ...order,
                    touring: null,
                    status: "PREPARED",
                    deliveryPriority: null,
                    metas: order.metas['@id'],
                    items: order.items.map(item => item['@id']),
                    user: isDefined(order.user) ? order.user['@id'] : null,
                    catalog: isDefined(order.catalog) ? order.catalog['@id'] : null,
                    promotion: isDefined(order.promotion) ? order.promotion['@id'] : null,
                    appliedCondition: isDefined(order.appliedCondition) ? order.appliedCondition['@id'] : null,
                })
            })
            .then(response => {
                const newTourings = tourings.map(elt => {
                    return elt.id === touring.id ? {...touring, orderEntities: touring.orderEntities.filter(o => o.id !== order.id)} : elt}
                );
                setTourings(newTourings);
            });
    };

    return !isDefinedAndNotVoid(touring) ? <></> : (
        <>
            { ordererOrders.map((order, index) => { 
                return(
                    <CCardBody className="mt-0 mb-0">
                        { order.relatedOrders.length <= 1 ?
                        <CRow className="mt-0 mb-0">
                            <CCol md="2" className="d-flex justify-content-end align-items-start"><b>{ order.deliveryPriority }</b></CCol>
                            <CCol md="8">
                                    <CRow>
                                        <CCol md="7">
                                            <p className="mb-0">{ order.name } - <small>{ order.metas.phone }</small></p>
                                            <p className="mt-0"><small>{ order.metas.address }</small></p>
                                        </CCol>
                                        <CCol md="5" className="d-flex align-items-center justify-content-center">
                                            <TouringModal touring={ touring } order={ order } tourings={ tourings } setTourings={ setTourings }/>
                                            <CButton size="sm" color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + order.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                            <CButton size="sm" color="danger" disabled={ !isAdmin } onClick={ () => handleOrderDelete(order) } className="mx-1 my-1"><i className="fas fa-times"></i></CButton>
                                        </CCol>
                                    </CRow>
                            </CCol>
                            <CCol md="2">{" "}</CCol>
                        </CRow>
                        : 
                            <>
                                <CRow className="mt-0 mb-0">
                                    <CCol md="2" className="d-flex justify-content-end align-items-start"><b>{ order.deliveryPriority }</b></CCol>
                                    <CCol md="8">
                                            <CRow>
                                                <CCol md="7">
                                                    <p className="mb-0">{ order.name } - <small>{ order.metas.phone }</small></p>
                                                    <p className="mt-0"><small>{ order.metas.address }</small></p>
                                                </CCol>
                                            </CRow>
                                    </CCol>
                                    <CCol md="2">{" "}</CCol>
                                </CRow>
                                { order.relatedOrders.map(oItem => {
                                    return (
                                        <CRow className="mt-0 mb-0">
                                            <CCol md="2" className="d-flex justify-content-end align-items-start"><b></b></CCol>
                                            <CCol md="8">
                                                    <CRow>
                                                        <CCol md="7" className="d-flex align-items-center justify-content-start">
                                                            <p className="mb-0 ml-5">
                                                                { oItem.isRemains ? "-  Reste à livrer N°" : "-  Commande N°" + oItem.id.toString().padStart(10, '0') }
                                                            </p>
                                                        </CCol>
                                                        <CCol md="5" className="d-flex align-items-center justify-content-center">
                                                            <TouringModal touring={ touring } order={ oItem } tourings={ tourings } setTourings={ setTourings }/>
                                                            <CButton size="sm" color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + oItem.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                            <CButton size="sm" color="danger" disabled={ !isAdmin } onClick={ () => handleOrderDelete(oItem) } className="mx-1 my-1"><i className="fas fa-times"></i></CButton>
                                                        </CCol>
                                                    </CRow>
                                            </CCol>
                                            <CCol md="2">{" "}</CCol>
                                        </CRow>
                                    )})
                                }
                            </>
                        }
                    </CCardBody>
                );
            })}
            <CRow className="mt-2 mb-5">
                <CCol md="2">{ " " }</CCol>
                <CCol md="8" className="text-center">
                    <CRow>
                        <CCol md="8">
                            <CButton size="sm" color="success" onClick={ onSubmit } style={{width: '140px', height: '35px'}}><i className="fas fa-check mr-2"></i>Terminer</CButton>
                        </CCol>
                        <CCol md="4">{" "}</CCol>
                    </CRow>
                </CCol>
                <CCol md="2">{ " " }</CCol>
            </CRow>
        </>
    );
}
 
export default TouringDetails;