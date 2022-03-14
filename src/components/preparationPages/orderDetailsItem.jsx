import React, { useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect, CSwitch } from '@coreui/react';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';
import ProductSearch from '../forms/ProductSearch';


const OrderDetailsItem = ({ item, order, setOrder, total, index, isDelivery }) => {

    const [displayedProduct, setDisplayedProduct] = useState(item.product);
    const [displayedVariation, setDisplayedVariation] = useState(item.variation);
    const [displayedSize, setDisplayedSize] = useState(item.size);
    const [batches, setBatches] = useState([]);

    useEffect(() => getStock(), [displayedProduct]);

    useEffect(() => setDefaultTraceability(), [batches, item.traceabilities]);

    const getStock = () => {
        const entity = getStockEntity();
        if (isDefined(entity) && isDefinedAndNotVoid(entity.stocks)) {
            const onlineStock = entity.stocks.find(s => isDefined(s.platform));
            if (displayedProduct.needsTraceability && isDefined(onlineStock) && isDefinedAndNotVoid(onlineStock.batches)) {
                const stockBatches = getCompiledBatches(onlineStock.batches);
                const orderedBatches = stockBatches.sort((a, b) => (new Date(a.endDate) > new Date(b.endDate)) ? 1 : -1);
                setBatches(orderedBatches);
            }
        }
    };

    const setDefaultTraceability = () => {
        if (isDefinedAndNotVoid(batches) && !isDefinedAndNotVoid(item.traceabilities) && order.status == "WAITING") {
            const newTraceability = { number: batches[0].number, endDate: new Date(batches[0].endDate), quantity: 0, id: new Date().getTime()};
            const newItems = order.items.map(i => i.id === parseInt(item.id) ? ({...item, traceabilities: [newTraceability]}) : i);
            setOrder({...order, items: newItems});
        }
    }

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

    const getStockEntity = () => {
        if (isDefined(displayedProduct)) {
            const variations = displayedProduct.variations;
            if (isDefined(variations) && isDefined(item.variation)) {
                const variation = variations.find(v => v.id === item.variation.id);
                const sizes = isDefined(variation) && isDefinedAndNotVoid(variation.sizes) && isDefined(item.size) ? variations : [];
                const size = isDefinedAndNotVoid(sizes) ? sizes.find(s => s.id === item.size.id) : null;
                return size;
            }
            return displayedProduct;
        }
    };

    const handleAdjournment = () => {
        const newItems = order.items.map(elt => {
            return elt.id === item.id ? {...item, isAdjourned: !item.isAdjourned} : elt}
        );
        setOrder({...order, items: newItems})
    };

    const onChange = ({ currentTarget }) => {
        if (currentTarget.value.length > 0 && getFloat(currentTarget.value) < (getFloat(item.orderedQty) * 0.8)) {
            const newItems = order.items.map(elt => {
                return elt.id === item.id ? ({...item, [currentTarget.id]: currentTarget.value, isAdjourned: true}) : elt;
            });
            setOrder({...order, items: newItems});
        } else {
            const newItems = order.items.map(elt => {
                return elt.id === item.id ? ({...item, [currentTarget.id]: currentTarget.value, isAdjourned: false}) : elt;
            });
            setOrder({...order, items: newItems});
        }
    };

    const getBatchMaxQuantity = number => {
        const batch = batches.find(b => b.number === number);
        return isDefined(batch) ? batch.quantity : 0;
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

    const handleBatchChange = ({ currentTarget }, traceability) => {
        const {initialQty, quantity, ...batch} = batches.find(b => b.number === currentTarget.value);
        const newTraceabilities = item.traceabilities.map(t => t.id !== traceability.id ? t : {...batch, quantity: t.quantity});
        const newItems = order.items.map(i => i.id === parseInt(item.id) ? ({...item, traceabilities: newTraceabilities}) : i);
        setOrder({...order, items: newItems});
    };

    const handleDeleteTraceability = (traceability) => {
        const newTraceabilities = item.traceabilities.filter(t => t.id !== traceability.id);
        updateTotalPreparated(newTraceabilities, item.id);
    };

    const onBatchQuantityChange = ({ currentTarget }, traceability) => {
        const newTraceabilities = item.traceabilities.map(t => t.id !== traceability.id ? t : {...traceability, quantity : currentTarget.value});
        updateTotalPreparated(newTraceabilities, currentTarget.name);
    };

    const updateTotalPreparated = (traceabilities, itemId) => {
        const total = traceabilities.reduce((sum, curr) => {
            return sum += parseFloat(curr.quantity);
        }, 0);
        const newItems = order.items.map(i => i.id === parseInt(itemId) ? ({...item, traceabilities, preparedQty: total}) : i);
        setOrder({...order, items: newItems});
    };

    return !isDefined(item) || !isDefined(displayedProduct) ? <></> : (
        <>
            <CRow>
                <CCol xs="12" sm="6">
                    <CFormGroup>
                        <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}</CLabel>
                        <ProductSearch
                            product={ displayedProduct } setProduct={ setDisplayedProduct }
                            variation={ displayedVariation } setVariation={ setDisplayedVariation }
                            size={ displayedSize } setSize={ setDisplayedSize }
                            readOnly={ true }
                        />
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="2">
                    <CFormGroup>
                        <CLabel htmlFor="name">Commandé
                        </CLabel>
                        <CInputGroup>
                            <CInput
                                id="orderedQty"
                                type="number"
                                name={ item.id }
                                value={ item.orderedQty }
                                onChange={ onChange }
                                disabled={ true }
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>{ item.unit }</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="2">
                    <CFormGroup>
                        <CLabel htmlFor="name">Préparé</CLabel>
                        <CInputGroup>
                            <CInput
                                id="preparedQty"
                                type="number"
                                name={ item.id }
                                value={ item.preparedQty }
                                onChange={ onChange }
                                disabled={ isDelivery || item.product.needsTraceability }
                                valid={ !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) >= (getFloat(item.orderedQty) * 0.8) }
                                invalid={ !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) < (getFloat(item.orderedQty) * 0.8) }
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>{ displayedProduct.unit }</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
                { isDelivery && ['DELIVERED', 'SHIPPED', 'COLLECTABLE'].includes(order.status) &&
                    <CCol xs="12" sm="2">
                        <CFormGroup>
                            <CLabel htmlFor="name">Livré</CLabel>
                            <CInputGroup>
                                <CInput
                                    id="preparedQty"
                                    type="number"
                                    name={ item.id }
                                    value={ isDefined(item.deliveredQty) ? item.deliveredQty : 0 }
                                    onChange={ onChange }
                                    disabled={ isDelivery || item.product.needsTraceability }
                                    valid={ !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) >= (getFloat(item.orderedQty) * 0.8) }
                                    invalid={ !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) < (getFloat(item.orderedQty) * 0.8) }
                                />
                                <CInputGroupAppend>
                                    <CInputGroupText>{ displayedProduct.unit }</CInputGroupText>
                                </CInputGroupAppend>
                            </CInputGroup>
                        </CFormGroup>
                    </CCol>
                }
                { !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) < (getFloat(item.orderedQty) * 0.8) &&
                    <CCol xs="12" md="2" className="mt-4">
                        <CFormGroup row className="mb-0 d-flex align-items-end justify-content-start">
                            <CCol xs="4" sm="4" md="4">
                                <CSwitch name="new" color="dark" shape="pill" className="mr-0" variant="opposite" checked={ item.isAdjourned } onChange={ handleAdjournment }/>
                            </CCol>
                            <CCol tag="label" xs="8" sm="8" md="8" className="col-form-label ml-0">
                                Relivrer
                            </CCol>
                        </CFormGroup>
                    </CCol>
                }
            </CRow>
            { item.product.needsTraceability && item.traceabilities.map((t, i) => {
                return (<CRow className="d-flex justify-content-end" key={ i }>
                    <CCol xs="12" sm="3">
                        <CFormGroup>
                            <CLabel htmlFor="name">{"Lot"}
                            </CLabel>
                            <CSelect custom id="product" value={ t.number } onChange={ e => handleBatchChange(e, t) } disabled={ isDelivery }>
                                { !isDelivery ? 
                                    batches.map(b => <option key={ b.number } value={ b.number }>{ b.number }</option>) :
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
                                    type={isDelivery ? "text" : "number"}
                                    name={ item.id }
                                    value={ isDelivery ? '-' : getBatchMaxQuantity(t.number) }
                                    disabled={ true }
                                />
                                <CInputGroupAppend>
                                    <CInputGroupText>{ displayedProduct.unit }</CInputGroupText>
                                </CInputGroupAppend>
                            </CInputGroup>
                        </CFormGroup>
                    </CCol>
                    <CCol xs="12" sm="2">
                        <CFormGroup>
                            <CLabel htmlFor="name">{ isDelivery && ['DELIVERED', 'SHIPPED', 'COLLECTABLE'].includes(order.status) ? "Livré" : "Préparé" }</CLabel>
                            <CInputGroup>
                                <CInput
                                    id="preparedQty"
                                    type="number"
                                    name={ item.id }
                                    value={ t.quantity }
                                    onChange={ e => onBatchQuantityChange(e, t) }
                                    disabled={ isDelivery }
                                />
                                <CInputGroupAppend>
                                    <CInputGroupText>{ displayedProduct.unit }</CInputGroupText>
                                </CInputGroupAppend>
                            </CInputGroup>
                        </CFormGroup>
                    </CCol>
                    { i === item.traceabilities.length - 1 && order.status === "WAITING" ?
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
    );
}
 
export default OrderDetailsItem;