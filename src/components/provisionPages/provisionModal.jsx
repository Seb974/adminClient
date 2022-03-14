import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { CButton, CCol, CDataTable, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CCollapse, CRow, CFormGroup, CLabel, CTextarea } from '@coreui/react';
import { getFloat, isDefined } from 'src/helpers/utils';
import { Link } from 'react-router-dom';
import ProvisionActions from 'src/services/ProvisionActions';
import Batches from './Batches';

const ProvisionModal = ({ item, provisions, setProvisions }) => {

    const defaultBatch = { number: "", endDate: new Date(), quantity: 0, key: new Date().getTime()};
    const [modalShow, setModalShow] = useState(false);
    const [details, setDetails] = useState([]);
    const [receivedProvision, setReceivedProvision] = useState({
        ...item, 
        isTruckCompliant: isDefined(item.isTruckCompliant) ? item.isTruckCompliant : true,
        temperature: isDefined(item.temperature) ? item.temperature : 0,
        comments: isDefined(item.comments) ? item.comments : "",
        goods: item.goods.map(g => g.product.needsTraceability ? 
            {...g, received: g.quantity, batches: [{...defaultBatch, quantity: g.quantity}] } : 
            {...g, received: g.quantity}
        )
    });

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

    const onProvisionParameterChange =  ({ currentTarget }) => {
        setReceivedProvision({...receivedProvision, [currentTarget.name]: currentTarget.value});
    };

    const onTruckChange = ({ currentTarget }) => {
        setReceivedProvision({...receivedProvision, isTruckCompliant: !receivedProvision.isTruckCompliant});
    };

    const handleSubmit = () => {
        const newProvision = getProvisionToWrite();
        ProvisionActions
            .update(receivedProvision.id, newProvision)
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
            temperature: getFloat(receivedProvision.temperature),
            comments: receivedProvision.comments.length == 0 ? "R.A.S." : receivedProvision.comments,
            goods: receivedProvision.goods.map(g => ({
                ...g,
                product: g.product['@id'],
                variation: isDefined(g.variation) ? g.variation['@id'] : null,
                size: isDefined(g.size) ? g.size['@id'] : null,
                price: getFloat(g.price),
                received: getFloat(g.received),
                batches: getBatchesToWrite(g)
            }))
        };
    };

    const getBatchesToWrite = good => {
        return good.batches.map(({key, ...b}) => {
            const quantity = getFloat(b.quantity);
            return {
                ...b,
                quantity,
                initialQty: quantity
            }
        });
    };

    const updateProvisions = newProvision => {
        const index = provisions.findIndex(p => parseInt(p.id) === parseInt(newProvision.id));
        const newProvisions = provisions.map((p, i) => i !== index ? p : newProvision);
        setProvisions(newProvisions);
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

    const needsControl = () => receivedProvision.goods.filter(g => g.product.needsTraceability).length > 0;

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
                    <CDataTable
                        items={ receivedProvision.goods }
                        fields={ ['Produit', 'Reçu', 'Prix U', 'Lot'] }
                        bordered
                        itemsPerPage={ 15 }
                        pagination
                        hover
                        scopedSlots = {{
                            'Produit':
                                item => <td>
                                            { item.product.needsTraceability ? 
                                                <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                    { getProductName(item.product, item.variation, item.size) }
                                                </Link> :
                                                <>
                                                    { getProductName(item.product, item.variation, item.size)  }
                                                </>
                                            }
                                        </td>
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
                                            <Batches good={ item } provision={ receivedProvision } setProvision={ setReceivedProvision } defaultBatch={ defaultBatch }/>
                                        </CCollapse>
                        }}
                    />
                    { needsControl() && 
                        <>
                            <CRow>
                                <CCol xs="6" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Température</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="temperature"
                                                type="number"
                                                name={ "temperature" }
                                                value={ receivedProvision.temperature }
                                                onChange={ onProvisionParameterChange }
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>°C</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                    </CFormGroup>
                                </CCol>
                                <CCol>
                                    <div className="form-check mt-4 pt-2">
                                        <input className="form-check-input" type="checkbox" checked={ receivedProvision.isTruckCompliant } name="isTruckCompliant" onClick={ onTruckChange } />
                                        <label className="form-check-label" for="flexCheckChecked">
                                            Camion conforme
                                        </label>
                                    </div>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" md="12">
                                    <CLabel htmlFor="textarea-input">Commentaires</CLabel>
                                    <CTextarea name="comments" id="comments" rows="4" placeholder="R.A.S." onChange={ onProvisionParameterChange } value={ receivedProvision.comments } />
                                </CCol>
                            </CRow>
                        </>
                    }
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