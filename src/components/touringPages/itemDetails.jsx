import { CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import React from 'react';
import { isDefined } from 'src/helpers/utils';

const ItemDetails = ({ item, order, setOrder }) => {

    const { product, variation, size, preparedQty, unit } = item;

    const getVariantName = (variantName, sizeName) => {
        const isVariantEmpty = !isDefined(variantName) ||variantName.length === 0 || variantName.replace(" ","").length === 0;
        const isSizeEmpty = !isDefined(sizeName) || sizeName.length === 0 || sizeName.replace(" ","").length === 0;
        return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    };

    const onChange = ({ currentTarget }) => {
        const newItem = {...item, deliveredQty: currentTarget.value };
        const newItems = order.items.map(elt => elt.id === newItem.id ? newItem : elt);
        setOrder({...order, items: newItems});
    };

    return (
        <CRow>
            <CCol xs="12" sm="6" className="d-flex align-items-center">
                <b>{ product.name + ( isDefined(variation) && isDefined(size) ? " - " + getVariantName(variation.color, size.name) : "")}</b>
            </CCol>
            <CCol xs="6" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name">Préparé</CLabel>
                    <CInputGroup>
                        <CInput
                            name="preparedQty"
                            value={ preparedQty }
                            disabled={ true }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ product.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="6" sm="3">
                <CFormGroup>
                    <CLabel htmlFor="name">Livré</CLabel>
                    <CInputGroup>
                        <CInput
                            name="deliveredQty"
                            value={ item.deliveredQty }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ product.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
        </CRow>
    );
}
 
export default ItemDetails;