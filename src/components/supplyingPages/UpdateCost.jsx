import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { Spinner } from 'react-bootstrap';
import { getFloat, isDefined, isDefinedAndNotVoid } from '../../helpers/utils';
import { CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText } from '@coreui/react';
import ProductActions from 'src/services/ProductActions';

const UpdateCost = ({ name, product, supplier, items, setItems }) => {

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cost, setCost] = useState({product, supplier, value: 0});

    useEffect(() => getCost(), []);
    useEffect(() => getCost(), [product]);

    const getCost = () => {
        const newCost = getAssociatedCost(product, supplier);
        setCost(newCost);
        if (!isDefinedAndNotVoid(product.costs) || product.costs.findIndex(c => c.supplier.id === supplier.id) === -1) {
            const newItems = items.map(i => i.product.id === product.id ? {...i, product: {...product, costs: [...product.costs, newCost]}} : i);
            setItems(newItems);
        }
    };

    const getAssociatedCost = (product, supplier) => {
        const cost = product.costs.find(c => c.supplier.id === supplier.id);
        return isDefined(cost) ? cost : { product, supplier, value: 0};
    };

    const handleShow = e => {
        e.preventDefault();
        setShow(true)
    };

    const handleClose = () => {
        setLoading(false);
        setShow(false)
    };

    const handleChange = (e) => {
        const newCost = {...cost, value: e.currentTarget.value};
        setCost(newCost);
        const existingCost = product.costs.findIndex(p => p.supplier.id === supplier.id) !== -1;
        const updatedProduct = {
            ...product, 
            costs: existingCost ? 
                product.costs.map(c => c.supplier.id === supplier.id ? newCost : c) : 
                [...product.costs, newCost]
        };
        const newItems = items.map(i => i.product.id === product.id ? {...i, product: updatedProduct} : i);
        setItems(newItems);
    };

    const handleSubmit = e => {
        e.preventDefault();
        const productToUpdate = getProductToUpdate();
        ProductActions.update(productToUpdate.id, productToUpdate)
                      .then(response => {
                            setShow(false);
                      });
    };

    const getProductToUpdate = () => {
        return {
            ...product,
            costs: product.costs.map(({product, supplier, value, ...cost}) => {
                return {...cost, supplier: supplier['@id'], value: getFloat(value)}
            })
        };
    };

    return (
        <>
            <a href="#" onClick={ handleShow }>{ name }</a>
            <Modal show={ show } onHide={ handleClose } backdrop="static" size="md" aria-labelledby="contained-modal-title-vcenter" centered id="cost-modal">
                <Modal.Header closeButton={ !loading }>
                    <Modal.Title>{ supplier.name }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { loading ? 
                        <div className="row">
                            <div className="col-md-12 text-center">
                                <Spinner animation="border" variant="danger"/>
                            </div>
                        </div>
                    :
                        <Form id="payment-form" onSubmit={ handleSubmit } className="d-flex flex-column justify-content-center">
                            <Form.Row className="d-flex justify-content-between my-2">
                                <CFormGroup className="ml-2">
                                    <label>
                                        <span className="mx-2">{ name }</span>
                                    </label>
                                </CFormGroup>
                                <CFormGroup>
                                    <CInputGroup>
                                        <CInput
                                            type="number"
                                            value={ cost.value }
                                            onChange={ handleChange }
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CFormGroup>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={ Col } md={ 12 } className="text-center" >
                                    {
                                        <Button id="submit" variant="primary" type="submit" size="lg">
                                            <span id="button-text">Valider</span>
                                        </Button>
                                    }
                                </Form.Group>
                            </Form.Row>
                        </Form> 
                    }
                </Modal.Body>
            </Modal>
        </>
    );
}

export default UpdateCost;