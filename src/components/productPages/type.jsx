import React from 'react';
import { CCol, CFormGroup, CInputRadio, CLabel } from '@coreui/react';
import Components from './components/components';
import Variations from './variations/variations';

const Type = ({product, type, variations, components, defaultComponent, defaultSize, defaultVariation, setProduct, setType, setComponents, setVariations}) => {
    
    const handleProductTypeChange = ({ currentTarget }) => {
        setType(currentTarget.value);
        setProduct({
            ...product,
            isMixed: currentTarget.value === "mixed",
            fullDescription: currentTarget.value !== "mixed" ? product.fullDescription : ""
        });
    };

    return (
        <>
            <CFormGroup row className="ml-1 mt-0 mb-4">
                <CLabel>Type de produit</CLabel>
            </CFormGroup>
            <CFormGroup row>
                <CCol md="1">{""}</CCol>
                <CCol xs="12" md="4">
                    <CFormGroup variant="custom-radio" inline className="d-flex align-items-center">
                        <CInputRadio custom id="inline-radio1" name="inline-radios" value="simple" checked={type === "simple"} onClick={handleProductTypeChange}/>
                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Simple</CLabel>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="4">
                    <CFormGroup variant="custom-radio" inline className="d-flex align-items-center">
                        <CInputRadio custom id="inline-radio2" name="inline-radios" value="with-variations" checked={type === "with-variations"} onClick={handleProductTypeChange}/>
                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Variant</CLabel>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="3">
                    <CFormGroup variant="custom-radio" inline className="d-flex align-items-center">
                        <CInputRadio custom id="inline-radio3" name="inline-radios" value="mixed" checked={type === "mixed"} onClick={handleProductTypeChange}/>
                    <CLabel variant="custom-checkbox" htmlFor="inline-radio3">Composé</CLabel>
                    </CFormGroup>
                </CCol>
            </CFormGroup>
            { type === "with-variations" && (
                <Variations 
                    variations={variations}
                    setVariations={setVariations}
                    defaultSize={defaultSize}
                    defaultVariation={defaultVariation}
                />
            )}
            { type === "mixed" &&
                <Components
                    components={components}
                    setComponents={setComponents}
                    defaultComponent={defaultComponent}
                />
            }
        </>
    );
}
 
export default Type;