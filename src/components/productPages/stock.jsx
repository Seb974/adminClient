import React from 'react';
import { CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText,  CLabel, CSelect, CSwitch } from '@coreui/react';

const Stock = ({ product, setProduct }) => {

    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});
    const handleStockChange = ({currentTarget}) => setProduct({...product, stock: {...product.stock, [currentTarget.name]: currentTarget.value}});

    return (
        <>
            <hr className="mt-5 mb-5"/>
            <CFormGroup row>
                <CCol xs="12" md="4">
                    <CLabel htmlFor="select">Unité de vente</CLabel>
                    <CSelect custom name="unit" id="unit" value={ product.unit } onChange={ handleChange }>
                        <option value="Kg">Kilogramme</option>
                        <option value="U">Unité</option>
                        <option value="L">Litre</option>
                    </CSelect>
                </CCol>
                <CCol xs="12" md="4">
                    <CLabel htmlFor="select">Poids moyen</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            name="weight" 
                            id="weight" 
                            value={ product.weight } 
                            onChange={ handleChange } 
                            placeholder="Poids en Kg"
                            disabled={ product.unit === "Kg" }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>Kg</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CCol>

                <CCol xs="12" md="4">
                    <CLabel htmlFor="select">Poids sans emballage</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            name="contentWeight" 
                            id="contentWeight" 
                            value={ product.contentWeight } 
                            onChange={ handleChange } 
                            placeholder="Poids en Kg"
                            disabled={ product.unit === "Kg" }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>Kg</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CCol>

                {/* <CCol xs="12" md="4">
                    <CLabel htmlFor="select">Durée de vie</CLabel>
                    <CSelect custom name="productGroup" id="productGroup" value={ product.productGroup } onChange={ handleChange }>
                        <option value="J + 1">J + 1</option>
                        <option value="J + 3">J + 3</option>
                        <option value="J + 6">J + 6</option>
                        <option value="J + 10">J + 10</option>
                    </CSelect>
                </CCol> */}
            </CFormGroup>
            <CFormGroup row>
                <CCol xs="12" md="4" className="mt-4">
                    <CLabel htmlFor="alert">Niveau d'alerte</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            name="alert"
                            id="alert" 
                            value={ product.stock.alert } 
                            onChange={ handleStockChange } 
                            placeholder="Stock d'alerte"
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ product.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CCol>
                <CCol xs="12" md="4" className="mt-4">
                    <CLabel htmlFor="select">Niveau de blocage</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            name="security"
                            id="security" 
                            value={ product.stock.security } 
                            onChange={ handleStockChange } 
                            placeholder="Stock de sécurité"
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>{ product.unit }</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CCol>
                <CFormGroup row className="mt-4 mb-0 ml-1 d-flex align-items-end">
                    <CCol xs="3" sm="3">
                        <CSwitch name="stockManaged" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.stockManaged } onChange={ handleCheckBoxes }/>
                    </CCol>
                    <CCol tag="label" xs="9" sm="9" className="col-form-label">
                        Stock bloquant
                    </CCol>
                </CFormGroup>
            </CFormGroup>
        </>
    );
}
 
export default Stock;