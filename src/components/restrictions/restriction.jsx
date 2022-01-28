import React, { useEffect } from 'react';
import { CButton, CCol, CFormGroup, CInput, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Select from '../forms/Select';

const Restriction = ({ entity, restriction, catalogs, setEntity, handleDeleteRule, errors, total, index }) => {

    const handleChange = ({ currentTarget }) => setNewRestriction({...restriction, [currentTarget.name]: currentTarget.value});
    const handleCatalogChange = ({ currentTarget }) => setNewRestriction({...restriction, catalog: catalogs.find(c => c.id === parseInt(currentTarget.value))})

    const setNewRestriction = restriction => {
        const newRestrictions = [...entity.restrictions.filter(option => option.count !== restriction.count)];
        setEntity({...entity, restrictions: [...newRestrictions, restriction].sort((a, b) => (a.count > b.count) ? 1 : -1)});
    };

    return (
        <>
            <hr className="mt-4"/>
            <CRow className="mt-0 mb-4">
                <CCol xs="2" sm="2" className="mx-0">
                    <CLabel className="mt-0">{"Restriction N°" + (index + 1) }</CLabel>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" sm="4" className="mx-0">
                    <Select name="catalog" label="Applicable sur le catalogue" value={ restriction.catalog.id } error={ errors.restrictions } onChange={ handleCatalogChange } data={ catalogs }>
                        { catalogs.map(c => <option key={ c.id } value={ c.id }>{ c.name }</option>) }
                    </Select>
                </CCol>
                <CCol xs="12" sm="4" className="mx-0">
                    <CFormGroup>
                        <CLabel htmlFor="name">Quantité</CLabel>
                        <CInput
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={ restriction.quantity }
                            onChange={ handleChange }
                            placeholder="Quantité autorisée"
                        />
                    </CFormGroup>
                </CCol>
                <CCol xs="10" sm="3" className="mx-0">
                    <CFormGroup>
                        <Select name="unit" label="Unité" value={ restriction.unit } error={ errors.restrictions } onChange={ handleChange }>
                            <option value="U">U</option>
                            <option value="Kg">Kg</option>
                        </Select>
                    </CFormGroup>
                </CCol>
                <CCol xs="2" sm="1" className="mt-2 d-flex align-items-center">
                    <CButton name={ restriction.count } size="sm" color="danger" onClick={ handleDeleteRule }>
                        <CIcon name="cil-trash"/>
                    </CButton>
                </CCol>
            </CRow>
        </>
    );
}

export default Restriction;