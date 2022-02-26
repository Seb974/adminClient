import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ProductsContext from 'src/contexts/ProductsContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Select from '../forms/Select';
import Roles from 'src/config/Roles';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';

const Item = ({ item, items, setItems, handleChange, handleDelete, total, index, editing, order = null }) => {

    const defaultTraceability = { number: "", endDate: new Date(), quantity: 0, id: new Date().getTime()};
    const [batches, setBatches] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const { products } = useContext(ProductsContext);
    const [variants, setVariants] = useState([]);
    const { settings, currentUser } = useContext(AuthContext);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getPrice();
        getUnit();
        getBatchesOptions();
        if (!isDefinedAndNotVoid(item.traceabilities))
            getTraceabilities();
        if (isDefined(item.product.variations))
            setVariants(item.product.variations);
    }, []);

    useEffect(() => getPrice(), [settings]);

    useEffect(() => getTraceabilities(), [order.status, item.product, batches])

    const getTraceabilities = () => {
        if (item.product.needsTraceability && isDefinedAndNotVoid(batches)) {
            if (!['ABORTED', 'WAITING', 'ON_PAYMENT'].includes(order.status)) {
                const newItem = {...item, traceabilities: [{...defaultTraceability, number: batches[0].number}]};
                const newItems = items.map(i => i.id !== newItem.id ? i : newItem);
                setItems(newItems);
            } else {
                setItems(items.map(i => i.id !== item.id ? i : {...item, traceabilities: []}));
            }
        }
    };

    const onChange = ({ currentTarget }) => handleChange({...item, [currentTarget.id]: currentTarget.value});

    const handleBatchChange = ({ currentTarget }, traceability) => {
        const {initialQty, quantity, ...batch} = batches.find(b => b.number === currentTarget.value);
        const newTraceabilities = item.traceabilities.map(t => t.id !== traceability.id ? t : {...batch, quantity: t.quantity});
        const newItems = items.map(i => i.id === parseInt(item.id) ? ({...item, traceabilities: newTraceabilities}) : i);
        setItems(newItems);
    };

    const getBatchesOptions = () => {
        if (item.product.needsTraceability && !['ABORTED', 'WAITING', 'ON_PAYMENT'].includes(order.status)) {
            let newBatches = [];
            const stock = item.product.stocks.find(s => isDefined(s.platform));
            if (isDefined(stock) && isDefinedAndNotVoid(stock.batches))
                newBatches = stock.batches;

            setBatches(newBatches);
            return newBatches;
        }
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

    const onProductChange = ({ currentTarget }) => {
        const selection = products.find(product => parseInt(product.id) === parseInt(currentTarget.value));
        const newVariants = isDefined(selection.variations) ? selection.variations : null;
        const selectedVariant = isDefinedAndNotVoid(newVariants) ? newVariants[0] : null;
        const selectedSize = isDefined(selectedVariant) && isDefinedAndNotVoid(selectedVariant.sizes) ? selectedVariant.sizes[0] : null;
        handleChange({...item, product: selection, variation: selectedVariant, size: selectedSize, price: getProductPrice(selection), unit: selection.unit});
        setVariants(isDefined(selection.variations) ? selection.variations : null);
    };

    const onVariantChange = ({ currentTarget }) => {
        const ids = currentTarget.value.split("-");
        const selectedVariant = item.product.variations.find(variation => variation.id === parseInt(ids[0]));
        const selectedSize = selectedVariant.sizes.find(size => size.id === parseInt(ids[1]));
        handleChange({...item, variation: selectedVariant, size: selectedSize});
    };

    const getPrice = () => {
        const productPrice = item.product.prices.find(price => price.priceGroup.id === settings.priceGroup.id).amount;
        onChange({currentTarget: {id: "price", value: productPrice}});
    }

    const getUnit = () => onChange({currentTarget: {id: "unit", value: item.product.unit}});

    const getProductPrice = product => {
        return product.prices.find(price => price.priceGroup.id === settings.priceGroup.id).amount;
    };

    const getVariantName = (variantName, sizeName) => {
        const isVariantEmpty = variantName.length === 0 || variantName.replace(" ","").length === 0;
        const isSizeEmpty = sizeName.length === 0 || sizeName.replace(" ","").length === 0;
        return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    };

    return !isDefined(item) || !isDefined(item.product) ? <></> : (
        <>
        <CRow>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom id="product" value={ item.product.id } onChange={ onProductChange }>
                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Variante"}
                    </CLabel>
                    <CSelect custom name="variant" id="variant" disabled={ !variants || variants.length <= 0 } onChange={ onVariantChange } value={ isDefined(item.variation) && isDefined(item.size) ? item.variation.id + "-" + item.size.id : "0"}>
                        { !isDefinedAndNotVoid(variants) ? <option key="0" value="0">-</option> : 
                            variants.map((variant, index) => {
                                return variant.sizes.map((size, i) => <option key={ (index + "" + i) } value={variant.id + "-" + size.id}>{ getVariantName(variant.color, size.name) }</option>);
                            })
                        }
                    </CSelect>
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
            { editing &&
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
                                            // disabled={ isDelivery }
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