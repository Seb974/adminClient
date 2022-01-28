import React from 'react';

import { CCol, CRow } from '@coreui/react';
import { useEffect } from 'react';
import SupplierActions from 'src/services/SupplierActions';
import { useState } from 'react';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import SelectMultiple from '../forms/SelectMultiple';

const Suppliers = ({ product, setProduct }) => {

    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => getSuppliers(), []);

    useEffect(() => {
        if (isDefinedAndNotVoid(suppliers)) {
            setProduct(product => ({...product, suppliers: suppliers.map(s => ({value: s['@id'], label: s.name, isFixed: false})) }));
        }
    }, [suppliers]);

    const getSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => setSuppliers(response));
    };

    const handleSuppliersChange = suppliers => setProduct(product => ({...product, suppliers}));

    return (
        <CRow className="mb-3">
            <CCol xs="12" sm="12">
                <SelectMultiple name="suppliers" label="Fournisseurs" value={ product.suppliers } onChange={ handleSuppliersChange } data={ suppliers.map(supplier => ({value: supplier['@id'], label: supplier.name, isFixed: false})) }/>
            </CCol>
        </CRow>
    );
}

export default Suppliers;