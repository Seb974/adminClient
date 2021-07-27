import React from 'react';
import { CCol, CFormGroup, CInputFile, CLabel } from '@coreui/react';

const Image = ({ entity, setEntity, isLandscape = false, sizes = "" }) => {

    const handleImageChange = ({ currentTarget }) => setEntity({...entity, image: currentTarget.files[0]});

    return (
        <>
            <CFormGroup row className="ml-1 mt-4 mb-0">
                <CLabel>Image <small className="ml-2"><i>{ isLandscape ? "Paysage" : "Portrait" } { sizes }</i></small></CLabel>
            </CFormGroup>
            <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                <CCol xs="12" md="12">
                    <CLabel>Image</CLabel>
                    <CInputFile name="image" custom id="custom-file-input" onChange={ handleImageChange }/>
                    <CLabel htmlFor="custom-file-input" variant="custom-file">
                        { entity.image === null || entity.image === undefined ?
                            "Choose file..." :
                            entity.image.filePath !== undefined ? 
                                entity.image.filePath :
                                entity.image.name 
                        }
                    </CLabel>
                </CCol>
            </CFormGroup >
        </>
    );
}
 
export default Image;