import React from 'react';
import { CButton, CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import Select from 'src/components/forms/Select';
import CIcon from '@coreui/icons-react';

const CatalogTax = ({ index, details, options, catalogs, setCatalogOptions }) => {

    const handleCatalogChange = ({ currentTarget }) => {
        const { name, value } = currentTarget;
        let index = parseInt(name);
        let newCatalogOptions = [...options];
        let newCatalog = catalogs.find(catalog => catalog.id === parseInt(value));
        newCatalogOptions[index] = {id: newCatalog.id, name: newCatalog.name};
        setCatalogOptions(newCatalogOptions);
    };

    const handlePercentChange = ({ currentTarget }) => {
        const { name, value } = currentTarget;
        const index = parseInt(name);
        let newCatalogOptions = [...options];
        newCatalogOptions[index] = {...newCatalogOptions[index], percent: value};
        setCatalogOptions(newCatalogOptions);
    };

    const handleDelete = ({ currentTarget }) => {
        let newCatalogOptions = [...options].filter((catalog, i) => parseInt(i) !== parseInt(currentTarget.name));
        setCatalogOptions(newCatalogOptions);
    };

    return (
        <>
            <CRow className="mt-4 mr-1 d-flex justify-content-start">
                <CCol xs="12" sm="5">
                    <CFormGroup>
                        <Select name={ index } label="Catalogue" value={ details.id } onChange={ handleCatalogChange }>
                            { catalogs
                                .filter(catalog => options.find(option => catalog.id === option.id) === undefined || catalog.id === details.id )
                                .map(catalog => <option key={ catalog.id } value={ catalog.id }>{ catalog.name }</option>)
                            }
                        </Select>

                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="5">
                    <CFormGroup>
                        <CLabel htmlFor="sku">Taux</CLabel>
                        <CInputGroup>
                            <CInput
                                type="number"
                                name={ index }
                                value={ details.percent }
                                onChange={ handlePercentChange }
                                placeholder="taux à appliquer"
                                required
                            />
                            <CInputGroupAppend>
                                <CInputGroupText>%</CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
                { options.length > 1 &&
                    <CCol xs="12" sm="2" className="d-flex align-items-center mt-2">
                        <CButton 
                            name={ index }
                            size="sm"
                            color="danger"
                            onClick={ handleDelete }
                        >
                            <CIcon name="cil-trash"/>
                        </CButton>
                    </CCol>
                }
            </CRow>
        </>
    );
}
 
export default CatalogTax;