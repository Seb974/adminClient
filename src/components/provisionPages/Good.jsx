import React, { useContext, useEffect, useState } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Select from '../forms/Select';
import Roles from 'src/config/Roles';
import ProductSearch from '../forms/ProductSearch';

const Good = ({ provision, good, goods, setGoods, handleChange, handleDelete, total, index, editing }) => {

    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const [product, setProduct] = useState(good.product);
    const [variation, setVariation] = useState(good.variation);
    const [size, setSize] = useState(good.size);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);

    useEffect(() => {
        if (isDefinedAndNotVoid(good.product) && (!isDefined(product) || product.id !== good.product.id)) {
            setProduct(good.product);
            setVariation(good.variation);
            setSize(good.size);
        }
    }, [good]);

    useEffect(() => {
            const newGood = {...good, product, variation, size, unit: getUnit(product)};
            const newGoods = goods.map(i => i.count === newGood.count ? newGood : i);
            setGoods(newGoods);

    }, [product, variation, size]);

    const getUnit = product => isDefined(product) ? product.unit : "U";

    const onChange = ({ currentTarget }) => handleChange({...good, [currentTarget.id]: currentTarget.value});

    return !isDefined(good) ? <></> : (
        <>
        <CRow>
            <CCol xs="12" sm="8">
                <CFormGroup>
                    <CLabel htmlFor="name">{"Produit " + (total > 1 ? index + 1 : "")}</CLabel>
                    <ProductSearch 
                        product={ product } setProduct={ setProduct }
                        variation={ variation } setVariation={ setVariation }
                        size={ size } setSize={ setSize }
                        seller={ provision.seller }
                        supplier={ provision.supplier }
                    />
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">Prix
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="price"
                            type="number"
                            name={ good.count }
                            value={ good.price }
                            onChange={ onChange }
                            disabled={ provision.status !== "RECEIVED" }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>€/{ good.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
        </CRow>
        <CRow>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">Quantité
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="quantity"
                            type="number"
                            name={ good.count }
                            value={ good.quantity }
                            onChange={ onChange }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ good.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="4">
                <CFormGroup>
                    <CLabel htmlFor="name">Quantité reçue
                    </CLabel>
                    <CInputGroup>
                        <CInput
                            id="received"
                            type="number"
                            name={ good.count }
                            value={ good.received }
                            onChange={ onChange }
                            disabled={ provision.status !== "RECEIVED" }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ good.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CFormGroup>
            </CCol>
            <CCol xs="12" sm="3">
                <Select name={ good.count } id="unit" value={ good.unit } label="Unité" onChange={ onChange }>
                    <option value="U">U</option>
                    <option value="Kg">Kg</option>
                </Select>
            </CCol>
            <CCol xs="12" sm="1" className="d-flex align-items-center justify-content-end mt-2">
                <CButton 
                    name={ good.count }
                    size="sm" 
                    color="danger" 
                    onClick={ handleDelete }
                    disabled={ total <= 1 }
                >
                    <CIcon name="cil-trash"/>
                </CButton>
            </CCol>
        </CRow>
        </>
    );
}
 
export default Good;