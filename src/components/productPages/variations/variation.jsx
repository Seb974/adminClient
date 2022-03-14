import React from 'react';
import { CButton, CCol, CForm, CFormGroup, CInput, CInputFile, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';

const Variation = ({ variation, handleOptionAdd, handleOptionDelete, handleVariantDelete, handleChange, total, index }) => {

    const handleNameChange = ({ currentTarget }) => handleChange({...variation, name: currentTarget.value});
    const handleImageChange = ({ currentTarget }) => handleChange({...variation, image: currentTarget.files[0]});
    const handleSizeNameChange = ({ currentTarget }) => {
        const option = variation.sizes.find(size => parseInt(size.count) === parseInt(currentTarget.id));
        const filteredOptions = variation.sizes.filter(size => parseInt(size.count) !== parseInt(option.count));
        handleChange({...variation, sizes: [...filteredOptions, {...option, name: currentTarget.value}].sort((a, b) => (a.count > b.count) ? 1 : -1)});
    };

    return (
        <CForm >
            <CRow>
                <CCol xs="12" sm="4">
                    <CFormGroup>
                        <CLabel htmlFor="name">{"Variante " + (total > 1 ? index + 1 : "")}</CLabel>
                        <CInput
                            id="name"
                            name={ variation.count }
                            value={ variation.name }
                            onChange={ handleNameChange }
                            placeholder={"Nom de la variante " + (total > 1 ? index + 1 : "")}
                        />
                    </CFormGroup>
                </CCol>
                <CCol xs="11" md="4" className="mt-4 ml-3 d-flex align-items-flex-end">
                    <CInputFile
                        name={ variation.count }
                        custom id="custom-file-input" 
                        onChange={ handleImageChange }
                    />
                    <CLabel 
                        className="mt-1"
                        htmlFor="custom-file-input" 
                        variant="custom-file"
                    >
                        { variation.image === null || variation.image === undefined ? "Choose file..." : 
                            "..." + (variation.image.filePath !== undefined && variation.image.filePath !== null ? variation.image.filePath.substr(-15) : variation.image.name.substr(-15)) }
                    </CLabel>
                </CCol>
                <CCol xs="12" sm="2" className="d-flex align-items-center justify-content-center mt-2">
                    <CButton 
                        name={ variation.count }
                        size="sm" 
                        color="warning" 
                        onClick={ handleOptionAdd }
                    >
                        <CIcon name="cil-plus"/> Option
                    </CButton>
                </CCol>
                { total > 1 && 
                    <CCol xs="12" sm="1" className="d-flex align-items-center justify-content-end mt-2">
                        <CButton 
                            name={ variation.count }
                            size="sm" 
                            color="danger" 
                            onClick={ handleVariantDelete }
                        >
                            <CIcon name="cil-trash"/>
                        </CButton>
                    </CCol>
                }
            </CRow>
            <CRow>
           { variation.sizes.map((option, i) => {
                return (
                    <>
                        <CCol xs="12" md="4" className={"mt-4" + (i % 2 === 0 ? "" : " ml-5")}>
                            <CLabel htmlFor="name">{"Option " + (variation.sizes.length > 1 ? (i + 1) : "")}</CLabel>
                            <CInput
                                id={ option.count }
                                name={ variation.count }
                                value={ option.name }
                                onChange={ handleSizeNameChange }
                                placeholder={"Nom de l'option " + (variation.sizes.length > 1 ? (i + 1) : "")}
                            />
                        </CCol>
                        { variation.sizes.length > 1 && 
                            <CCol xs="12" sm="1" className="d-flex align-items-start mt-5 ml-2">
                                <CButton
                                    id={ option.count }
                                    name={ variation.count }
                                    className="mt-1"
                                    size="sm" 
                                    color="danger" 
                                    onClick={ handleOptionDelete }
                                >
                                    <CIcon name="cil-trash"/>
                                </CButton>
                            </CCol>
                        }
                    </>
                );
            })} 
            </CRow>
        </CForm>
    );
}
 
export default Variation;