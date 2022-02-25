import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { CButton, CCol, CCollapse, CDataTable, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CRow } from '@coreui/react';
import ItemDetails from './itemDetails';
import { getFloat, isDefined } from 'src/helpers/utils';
import OrderActions from 'src/services/OrderActions';
import { getDeliveredOrder } from 'src/helpers/checkout';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Traceabilities from './Tracabilities';

const TouringModal = ({ order, touring, tourings, setTourings }) => {

    const [details, setDetails] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [viewedOrder, setViewedOrder] = useState(null);

    useEffect(() => {
        const formattedOrder = getFormattedOrder(order);
        setViewedOrder(formattedOrder);
    }, []);

    const handleSubmit = () => {
        const orderToWrite = getDeliveredOrder(viewedOrder);
        console.log(orderToWrite);
        OrderActions
            .update(order.id, orderToWrite)
            .then(response => {
                const newTouring = touring.orderEntities.map(elt => elt.id === orderToWrite.id ? orderToWrite : elt);
                const newTourings = tourings.map(elt => elt.id === newTouring.id ? newTouring : elt);
                setTourings(newTourings);
                setModalShow(false);
            })
            .catch(error => console.log(error));
    };

    const getFormattedOrder = order => ({...order, items: getFormattedItems(order.items)});
    
    const getFormattedItems = items => {
        return items.map(item => {
            const { deliveredQty, preparedQty, traceabilities } = item;
            return {
                ...item, 
                deliveredQty: isDefined(deliveredQty) ? deliveredQty : preparedQty,
                traceabilities: traceabilities.map(t => {
                    return  { ...t, initialQty: isDefined(t.initialQty) ? t.initialQty : t.quantity };
                })
            }
        });
    };

    const getVariantName = (variantName, sizeName) => {
        const isVariantEmpty = !isDefined(variantName) ||variantName.length === 0 || variantName.replace(" ","").length === 0;
        const isSizeEmpty = !isDefined(sizeName) || sizeName.length === 0 || sizeName.replace(" ","").length === 0;
        return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    };

    const onChange = ({ currentTarget }, item) => {
        const newItem = {...item, deliveredQty: currentTarget.value };
        const newItems = viewedOrder.items.map(elt => elt.id === newItem.id ? newItem : elt);
        setViewedOrder({...viewedOrder, items: newItems});
    };

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index);
        let newDetails = details.slice();
        if (position !== -1) {
            newDetails.splice(position, 1);
        } else {
            newDetails = [...details, index];
        }
        setDetails(newDetails);
    };

    return !isDefined(viewedOrder) ? <></> : (
        <>
            <CButton size="sm" color="dark" onClick={ () => setModalShow(true) } className="mx-1 my-1"><i className="fas fa-undo"></i></CButton>

            <Modal show={ modalShow } onHide={ () => setModalShow(false) } size="md" aria-labelledby="contained-modal-title-vcenter" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Commande de "{ order.name }"
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflow: 'scroll' }}>     {/* maxHeight: '200px', */}
                    <h5>Détail de la livraison</h5>
                        <CDataTable
                            items={ viewedOrder.items }
                            fields={ ['Produit', 'Préparé', 'Livré', 'Lot'] }
                            bordered
                            itemsPerPage={ 15 }
                            pagination
                            hover
                            scopedSlots = {{
                                'Produit':
                                    item => <td>
                                                { item.product.needsTraceability ? 
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        <b>{ item.product.name + ( isDefined(item.variation) && isDefined(item.size) ? " - " + getVariantName(item.variation.color, item.size.name) : "")}</b>
                                                    </Link> :
                                                    <>
                                                        <b>{ item.product.name + ( isDefined(item.variation) && isDefined(item.size) ? " - " + getVariantName(item.variation.color, item.size.name) : "")}</b>
                                                    </>
                                                }
                                            </td>
                                ,
                                'Préparé':
                                    item => <td>
                                                <CInputGroup>
                                                    <CInput
                                                        name="preparedQty"
                                                        value={ item.preparedQty }
                                                        disabled={ true }
                                                    />
                                                    <CInputGroupAppend>
                                                        <CInputGroupText>{ item.unit }</CInputGroupText>
                                                    </CInputGroupAppend>
                                                </CInputGroup>
                                            </td>
                                ,
                                'Livré':
                                    item => <td>
                                                <CInputGroup>
                                                    <CInput
                                                        name="deliveredQty"
                                                        value={ !isNaN(item.deliveredQty) ? item.deliveredQty : 0 }
                                                        onChange={ e => onChange(e, item) }
                                                        disabled={ item.product.needsTraceability }
                                                    />
                                                    <CInputGroupAppend>
                                                        <CInputGroupText>{ item.unit }</CInputGroupText>
                                                    </CInputGroupAppend>
                                                </CInputGroup>
                                            </td>
                                ,
                                'Lot':
                                    item => item.product.needsTraceability ? 
                                            <td>
                                                <CButton color="warning" onClick={ e => { toggleDetails(item.id, e) }} className="mx-1"><i className="fas fa-pen"></i></CButton>
                                            </td>
                                            : <></>
                                ,
                                'details':
                                    item => <CCollapse show={details.includes(item.id)}>
                                                <Traceabilities item={ item } order={ viewedOrder } setOrder={ setViewedOrder }/>
                                            </CCollapse>
                            }}
                        />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <CButton color="success" onClick={ handleSubmit }><i className="fas fa-check mr-2"></i> Valider</CButton>
                    <CButton onClick={() => setModalShow(false)}>Fermer</CButton>
                </Modal.Footer>
            </Modal>
        </>
    );
}
 
export default TouringModal;