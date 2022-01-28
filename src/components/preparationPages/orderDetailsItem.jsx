import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CValidFeedback } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ProductsContext from 'src/contexts/ProductsContext';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';


const OrderDetailsItem = ({ item, order, setOrder, total, index, isDelivery }) => {

    const { products } = useContext(ProductsContext);
    const [variants, setVariants] = useState([]);
    const [displayedProduct, setDisplayedProduct] = useState(item.product);

    useEffect(() => getDisplayedProduct(), []);
    useEffect(() => getDisplayedProduct(), [products]);

    const getDisplayedProduct = () => {
        if ( products.length > 0) {
            const productToDisplay = products.find(product => product.id === item.product.id);
            setDisplayedProduct(productToDisplay);
            if (isDefined(productToDisplay) && isDefined(productToDisplay.variations))
                setVariants(productToDisplay.variations);
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

    const getVariantName = (variantName, sizeName) => {
        const isVariantEmpty = variantName.length === 0 || variantName.replace(" ","").length === 0;
        const isSizeEmpty = sizeName.length === 0 || sizeName.replace(" ","").length === 0;
        return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    };

    return !isDefined(item) || !isDefined(displayedProduct) ? <></> : (
        <CRow>
            <CCol xs="12" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}
                    </CLabel>
                    <CSelect custom id="product" value={ displayedProduct.id } disabled={ true }>
                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                    </CSelect>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Variante"}
                    </CLabel>
                    <CSelect custom name="variant" id="variant" disabled={ true } value={ isDefined(item.variation) && isDefined(item.size) ? item.variation.id + "-" + item.size.id : "0"}>
                        { !isDefinedAndNotVoid(variants) ? 
                            <option key="0" value="0">-</option> 
                            :
                            variants.map((variant, index) => {
                                return variant.sizes.map((size, i) => 
                                    <option key={ (index + "" + i) } value={variant.id + "-" + size.id}>
                                        { getVariantName(variant.color, size.name) }
                                    </option>
                                );
                            })
                        }
                    </CSelect>
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
                            disabled={ isDelivery }
                            valid={ !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) >= (getFloat(item.orderedQty) * 0.8) }
                            invalid={ !isDelivery && item.preparedQty.toString().length > 0 && getFloat(item.preparedQty) < (getFloat(item.orderedQty) * 0.8) }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ displayedProduct.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
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
    );
}
 
export default OrderDetailsItem;