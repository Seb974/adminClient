import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { CButton, CCol, CDataTable, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CRow } from '@coreui/react';
import { getFloat, isDefined } from 'src/helpers/utils';
import ProvisionActions from 'src/services/ProvisionActions';

const ProvisionModal = ({ item, provisions, setProvisions }) => {

    const [modalShow, setModalShow] = useState(false);
    const [receivedProvision, setReceivedProvision] = useState({...item, goods: item.goods.map(g => ({...g, received: g.quantity}))});      // , price: ""

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, 'color') ? " - " + variation.color : "";
        const sizeName = exists(size, 'name') ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, variable) => {
        return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
    };

    const handleChange = ({ currentTarget }, good) => {
        const index = receivedProvision.goods.findIndex(g => parseInt(g.id) === parseInt(good.id));
        const newGoods = receivedProvision.goods.map((g, i) => i !== index ? g : {...good, [currentTarget.name]: currentTarget.value} );
        setReceivedProvision({...receivedProvision, goods: newGoods})
    };

    const handleSubmit = () => {
        ProvisionActions
            .update(receivedProvision.id, getProvisionToWrite())
            .then(response => {
                updateProvisions(response.data);
                setModalShow(false);
            })
            .catch(error => console.log(error));
    };

    const getProvisionToWrite = () => {
        return {
            ...receivedProvision, 
            seller: receivedProvision.seller['@id'], 
            supplier: receivedProvision.supplier['@id'],
            goods: receivedProvision.goods.map(g => ({
                ...g,
                product: g.product['@id'],
                variation: isDefined(g.variation) ? g.variation['@id'] : null,
                size: isDefined(g.size) ? g.size['@id'] : null,
                price: getFloat(g.price),
                received: getFloat(g.received)
            }))
        };
    };

    const updateProvisions = newProvision => {
        const index = provisions.findIndex(p => parseInt(p.id) === parseInt(newProvision.id));
        const newProvisions = provisions.map((p, i) => i !== index ? p : newProvision);
        setProvisions(newProvisions);
    };

    return (
        <>
            <CButton color="success" onClick={ () => setModalShow(true) } className="mx-1 my-1"><i className="fas fa-check"></i></CButton>

            <Modal show={ modalShow } onHide={ () => setModalShow(false) } size="md" aria-labelledby="contained-modal-title-vcenter" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        { item.supplier.name } pour le { (new Date(item.provisionDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}) }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflow: 'scroll' }}>
                    {/* <h6>Détail</h6> */}
                    <CDataTable
                        items={ receivedProvision.goods }
                        fields={ ['Produit', 'Reçu', 'Prix U'] }
                        bordered
                        itemsPerPage={ 15 }
                        pagination
                        hover
                        scopedSlots = {{
                            'Produit':
                                item => <td>{ getProductName(item.product, item.variation, item.size) }</td>
                            ,
                            'Reçu':
                                item => <td>
                                            <CInputGroup>
                                                <CInput
                                                    name="received"
                                                    type="number"
                                                    value={ item.received }
                                                    onChange={ e => handleChange(e, item) }
                                                    style={{ maxWidth: '180px'}}
                                                />
                                                <CInputGroupAppend>
                                                    <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                </CInputGroupAppend>
                                            </CInputGroup>
                                        </td>
                            ,
                            'Prix U':
                                item => <td>
                                            <CInputGroup>
                                                <CInput
                                                    name="price"
                                                    type="number"
                                                    value={ item.price }
                                                    onChange={ e => handleChange(e, item) }
                                                    style={{ maxWidth: '180px'}}
                                                />
                                                <CInputGroupAppend>
                                                    <CInputGroupText style={{ minWidth: '43px'}}>€/{ item.unit }</CInputGroupText>
                                                </CInputGroupAppend>
                                            </CInputGroup>
                                        </td>
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
 
export default ProvisionModal;