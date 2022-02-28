import React, { useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import ProductSearch from 'src/components/forms/ProductSearch';

const Component = ({ component, setComponents, components, handleChange, handleDelete, total, index }) => {

    const [product, setProduct] = useState(component.product);
    const [variation, setVariation] = useState(component.variation);
    const [size, setSize] = useState(component.size);

    useEffect(() => {
        if (isDefinedAndNotVoid(component.product) && (!isDefined(product) || product.id !== component.product.id)) {
            setProduct(component.product);
            setVariation(component.variation);
            setSize(component.size);
        }
    }, [component]);

    useEffect(() => {
            const newComponent = {...component, product: product, variation, size};
            const newComponents = components.map(c => c.count === newComponent.count ? newComponent : c);
            setComponents(newComponents);

    }, [product, variation, size]);

    const onChange = ({ currentTarget }) => {
        handleChange({...component, [currentTarget.id]: currentTarget.value});
    };

    return (
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
            <CCol xs="12" sm="2">
                <CFormGroup>
                    <CLabel htmlFor="name">Quantité
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="quantity"
                            type="number"
                            name={ component.count }
                            value={ component.quantity }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ isDefined(product) ? product.unit : "" }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            { total > 1 && 
                <CCol xs="12" sm="2" className="d-flex align-items-center justify-content-start mt-2">
                    <CButton 
                        name={ component.count }
                        size="sm" 
                        color="danger" 
                        onClick={ handleDelete }
                    >
                        <CIcon name="cil-trash"/>
                    </CButton>
                </CCol>
            }
        </CRow>
    );
}
 
export default Component;