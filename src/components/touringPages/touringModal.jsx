import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { CButton, CCol, CRow } from '@coreui/react';
import ItemDetails from './itemDetails';
import { getFloat, isDefined } from 'src/helpers/utils';
import OrderActions from 'src/services/OrderActions';
import { getDeliveredOrder } from 'src/helpers/checkout';

const TouringModal = ({ order, touring, tourings, setTourings }) => {

    const [modalShow, setModalShow] = useState(false);
    const [viewedOrder, setViewedOrder] = useState({...order, items: order.items.map(item => ({...item, deliveredQty: isDefined(item.deliveredQty) ? item.deliveredQty : item.preparedQty}))});

    const handleSubmit = () => {
        const orderToWrite = getDeliveredOrder(viewedOrder);
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

    return (
        <>
            <CButton size="sm" color="dark" onClick={ () => setModalShow(true) } className="mx-1 my-1"><i className="fas fa-undo"></i></CButton>

            <Modal show={ modalShow } onHide={ () => setModalShow(false) } size="md" aria-labelledby="contained-modal-title-vcenter" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Commande de "{ order.name }"
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '200px', overflow: 'scroll' }}>
                    <h5>Détail de la livraison</h5>
                    { viewedOrder.items.map(item => <ItemDetails key={ item.id } item={ item } order={ viewedOrder } setOrder={ setViewedOrder }/>) }
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