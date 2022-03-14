import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Select from '../forms/Select';
import ProductSearch from '../forms/ProductSearch';
import Roles from 'src/config/Roles';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';

const Item = ({ item, items, setItems, handleChange, handleDelete, total, index, editing, order = null, user = null, userGroups }) => {

    const defaultTraceability = { number: "", endDate: new Date(), quantity: 0, id: new Date().getTime()};
    const [batches, setBatches] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const [product, setProduct] = useState(item.product);
    const [variation, setVariation] = useState(item.variation);
    const [size, setSize] = useState(item.size);

    useEffect(() => {
        if (isDefinedAndNotVoid(item.product) && (!isDefined(product) || product.id !== item.product.id)) {
            setProduct(item.product);
            setVariation(item.variation);
            setSize(item.size);
        }
    }, [item]);

    useEffect(() => {
            const newItem = {...item, product, variation, size, price: getUserPrice(product), unit: getUnit(product)};
            const newItems = items.map(i => i.count === newItem.count ? newItem : i);
            setItems(newItems);

    }, [product, variation, size]);

    useEffect(() => {
        const newItem = {...item, price: getUserPrice(product)};
        const newItems = items.map(i => i.count === newItem.count ? newItem : i);
        setItems(newItems);
    }, [userGroups]);

    useEffect(() => getBatchesOptions(), [product]);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        if (!isDefinedAndNotVoid(item.traceabilities))
            getTraceabilities();
    }, []);

    useEffect(() => getTraceabilities(), [order.status, product, batches]);

    const getTraceabilities = () => {
        if (isDefined(product) && product.needsTraceability && isDefinedAndNotVoid(batches) && editing) {
            if (!['ABORTED', 'WAITING', 'ON_PAYMENT'].includes(order.status)) {
                const newItem = {...item, traceabilities: [{...defaultTraceability, number: batches[0].number}]};
                const newItems = items.map(i => i.id !== newItem.id ? i : newItem);
                setItems(newItems);
            } else {
                setItems(items.map(i => i.id !== item.id ? i : {...item, traceabilities: []}));
            }
        }
    };

    const getUserPrice = product => {
        if (isDefined(product)) {
            const prices = product.prices
                                .filter(p => p.priceGroup.userGroup.filter(g => userGroups.includes(g.value)).length > 0)
                                .map(p => getFloat(p.amount));
            const userPrice = Math.min.apply(Math, prices);
            return isDefined(userPrice) ? userPrice : 0;
        }
        return 0;
    };

    const getUnit = product => isDefined(product) ? product.unit : "U";

    const onChange = ({ currentTarget }) => handleChange({...item, [currentTarget.id]: currentTarget.value});

    const handleBatchChange = ({ currentTarget }, traceability) => {
        const {initialQty, quantity, ...batch} = batches.find(b => b.number === currentTarget.value);
        const newTraceabilities = item.traceabilities.map(t => t.id !== traceability.id ? t : {...batch, quantity: t.quantity});
        const newItems = items.map(i => i.id === parseInt(item.id) ? ({...item, traceabilities: newTraceabilities}) : i);
        setItems(newItems);
    };

    const getBatchesOptions = () => {
        if (isDefined(product) && product.needsTraceability ) {
            let newBatches = [];
            const stock = product.stocks.find(s => isDefined(s.platform));
            if (isDefined(stock) && isDefinedAndNotVoid(stock.batches))
                newBatches = (getCompiledBatches(stock.batches)).sort((a, b) => (new Date(a.endDate) > new Date(b.endDate)) ? 1 : -1);
            setBatches(newBatches);
            return newBatches;
        }
    };

    const getCompiledBatches = batches => {
        if (isDefinedAndNotVoid(batches)) {
            const batchesNumbers = [...new Set(batches.map(b => b.number))];
            return batchesNumbers.map(b => {
                const currentBatchNumber = batches.filter(batch => batch.number === b);
                return currentBatchNumber.length <= 1 ? currentBatchNumber[0] : getFormattedMultipleBatches(b, batches, currentBatchNumber);
            });
        }
        return [];
    };

    const getFormattedMultipleBatches = (number, batches, currentBatchNumber) => {
        const sumQty = getBatchQuantity(number, batches);
        const sumInitQty = getBatchInitialQuantity(number, batches);
        const smallestEndDate = getBatchDate(number, batches);
        return {number, initialQty: sumInitQty, quantity: sumQty, endDate: smallestEndDate, originals: currentBatchNumber};
    };

    const getBatchQuantity = (number, batches) => {
        const quantity = batches.reduce((sum, curr) => {
            return sum += curr.number === number ? curr.quantity : 0;
        }, 0);
        return parseFloat(quantity.toFixed(2));
    };

    const getBatchInitialQuantity = (number, batches) => {
        const quantity = batches.reduce((sum, curr) => {
            return sum += curr.number === number ? curr.initialQty : 0;
        }, 0);
        return parseFloat(quantity.toFixed(2));
    };

    const getBatchDate = (number, batches) => {
        return batches.reduce((minDate, curr) => {
            return minDate = curr.number === number && (!isDefined(minDate) || new Date(curr.endDate) < minDate) ? new Date(curr.endDate) : minDate;
        }, null);
    };

    const getBatchMaxQuantity = number => {
        const batch = batches.find(b => b.number === number);
        return isDefined(batch) ? batch.quantity : 0;
    };

    const onBatchQuantityChange = ({ currentTarget }, traceability) => {
        const newQty = currentTarget.value;
        const newTraceability = ['DELIVERED','SHIPPED', 'COLLECTABLE'].includes(order.status) ?
            {...traceability, quantity: newQty} : {...traceability, initialQty: newQty, quantity: newQty};
        const newTraceabilities = item.traceabilities.map(t => t.id !== newTraceability.id ? t : newTraceability);
        updateTotalPreparated(newTraceabilities, currentTarget.name);
    };

    const updateTotalPreparated = (traceabilities, itemId) => {
        const total = traceabilities.reduce((sum, curr) => {
            return sum += parseFloat(curr.quantity);
        }, 0);
        const newItem = ['DELIVERED','SHIPPED', 'COLLECTABLE'].includes(order.status) ?
            {...item, traceabilities, deliveredQty: total} : {...item, traceabilities, preparedQty: total};
        const newItems = items.map(i => i.id === parseInt(itemId) ? newItem : i);
        setItems(newItems);
    };

    const handleDeleteTraceability = (traceability) => {
        const newTraceabilities = item.traceabilities.filter(t => t.id !== traceability.id);
        updateTotalPreparated(newTraceabilities, item.id);
    };

    const handleAddTraceability = ({ currentTarget }) => {
        const usedBatches = item.traceabilities.map(t => t.number);
        const newBatch = batches.find(b => !usedBatches.includes(b.number));
        const batchToAdd = isDefined(newBatch) ? newBatch : batches[0];
        const usedBatchesTotal = item.traceabilities.reduce((sum, curr) => {
            return sum += parseFloat(curr.quantity);
        }, 0);
        const quantityToAdd = item.orderedQty - usedBatchesTotal > 0 ? item.orderedQty - usedBatchesTotal : 0;
        const newTraceability = { number: batchToAdd.number, endDate: new Date(batchToAdd.endDate), quantity: quantityToAdd, id: new Date().getTime()};
        updateTotalPreparated([...item.traceabilities, newTraceability], item.id);
    };

    return !isDefined(item) ? <></> : (
        <>
        <CRow>
            <CCol xs="12" sm="8">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}</CLabel>
                    <ProductSearch 
                        product={ product } setProduct={ setProduct }
                        variation={ variation } setVariation={ setVariation }
                        size={ size } setSize={ setSize }
                    />
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name">Prix
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="price"
                            type="number"
                            name={ item.count }
                            value={ item.price }
                            onChange={ onChange }
                            disabled={ !isAdmin }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>€</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="1" className="d-flex align-items-center justify-content-start mt-2">
                <CButton 
                    name={ item.count }
                    size="sm" 
                    color="danger" 
                    onClick={ handleDelete }
                    disabled={ total <= 1 }
                >
                    <CIcon name="cil-trash"/>
                </CButton>
            </CCol>
        </CRow>
        <CRow>
            <CCol xs="12" sm="3">
                <Select name={ item.count } id="unit" value={ item.unit } label="U commande" onChange={ onChange }>
                    <option value="U">U</option>
                    <option value="Kg">Kg</option>
                </Select>
            </CCol>
            <CCol xs="12" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name">Quantité
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="orderedQty"
                            type="number"
                            name={ item.count }
                            value={ item.orderedQty }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ item.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            { editing && isDefined(item.product) &&
                <>
                    <CCol xs="12" sm="3">
                        <CFormGroup>
                            <CLabel htmlFor="name">Préparé
                            </CLabel>
                            <CInputGroup>
                                <CInput
                                    id="preparedQty"
                                    type="number"
                                    name={ item.count }
                                    value={ item.preparedQty }
                                    onChange={ onChange }
                                    disabled={ ['ON_PAYMENT', 'WAITING', 'ABORTED'].includes(order.status) }
                                />
                                <CInputGroupAppend>
                                    <CInputGroupText>{ item.product.unit }</CInputGroupText>
                                </CInputGroupAppend>
                            </CInputGroup>
                        </CFormGroup>
                    </CCol>
                    <CCol xs="12" sm="3">
                        <CFormGroup>
                            <CLabel htmlFor="name">Livré
                            </CLabel>
                            <CInputGroup>
                                <CInput
                                    id="deliveredQty"
                                    type="number"
                                    name={ item.count }
                                    value={ item.deliveredQty }
                                    onChange={ onChange }
                                    disabled={ !['DELIVERED', 'SHIPPED', 'COLLECTABLE'].includes(order.status) }
                                />
                                <CInputGroupAppend>
                                    <CInputGroupText>{ item.product.unit }</CInputGroupText>
                                </CInputGroupAppend>
                            </CInputGroup>
                        </CFormGroup>
                    </CCol>
                </>
            }
        </CRow>
        { isDefinedAndNotVoid(item.traceabilities) && 
            <>
                { item.traceabilities.map((t, i) => {
                        return (<CRow className="d-flex justify-content-end" key={ i }>
                            <CCol xs="12" sm="3">
                                <CFormGroup>
                                    <CLabel htmlFor="name">{"Lot"}
                                    </CLabel>
                                    <CSelect custom id="product" value={ !isDefinedAndNotVoid(batches) || batches.map(b => b.number).includes(t.number) ? t.number : batches[0].number } onChange={ e => handleBatchChange(e, t) }>
                                        { isDefinedAndNotVoid(batches) ? batches.map(b => <option key={ b.number } value={ b.number }>{ b.number }</option>) : 
                                            <option value={ t.number }>{ t.number }</option>
                                        }
                                    </CSelect>
                                </CFormGroup>
                            </CCol>
                            <CCol xs="12" sm="3">
                                <CFormGroup>
                                    <CInputGroup>
                                        <Flatpickr
                                            disabled
                                            name={ item.id }
                                            value={ [ new Date(t.endDate) ] }
                                            className={`form-control mt-4`}
                                            options={{
                                                dateFormat: "d/m/Y",
                                                locale: French,
                                            }}
                                        />
                                    </CInputGroup>
                                </CFormGroup>
                            </CCol>
                            <CCol xs="12" sm="2">
                                <CFormGroup>
                                    <CLabel htmlFor="name">En stock</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            type={"number"}
                                            name={ item.id }
                                            value={ getBatchMaxQuantity(t.number) }
                                            disabled={ true }
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>{ item.product.unit }</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CFormGroup>
                            </CCol>
                            <CCol xs="12" sm="2">
                                <CFormGroup>
                                    <CLabel htmlFor="name">{ "Quantité" }</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            id="preparedQty"
                                            type="number"
                                            name={ item.id }
                                            value={ t.quantity }
                                            onChange={ e => onBatchQuantityChange(e, t) }
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>{ item.product.unit }</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CFormGroup>
                            </CCol>
                            { i === item.traceabilities.length - 1 ?
                                <CCol xs="2" sm="2" md="2" className="d-flex align-items-center mt-2">
                                    { item.traceabilities.length > 1 &&
                                        <CButton className="mr-2" color="danger" onClick={ e => handleDeleteTraceability(t) } style={{ height: '38px', width: '38px' }}><i className="fas fa-trash"></i></CButton>
                                    }
                                    <CButton 
                                        className="ml-4" 
                                        color="warning" 
                                        onClick={ handleAddTraceability } 
                                        style={{ height: '38px', width: '38px' }}
                                        disabled={ item.traceabilities.length >= batches.length }
                                    >
                                        <span style={{ fontWeight: 'bold', fontSize: '1.3em' }}>+</span>
                                    </CButton>
                                </CCol>
                                : <CCol xs="2" sm="2" md="2" className="d-flex align-items-center mt-2">
                                    { item.traceabilities.length > 1 &&
                                        <CButton color="danger" onClick={ e => handleDeleteTraceability(t) } style={{ height: '38px', width: '38px' }}><i className="fas fa-trash"></i></CButton>
                                    }
                                </CCol>
                            }
                        </CRow>)
                    })
                }
            </>
        }
        </>
    );
}
 
export default Item;