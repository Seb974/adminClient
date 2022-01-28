import React from 'react';
import { CCol, CFormGroup, CInputFile, CLabel } from '@coreui/react';
import { isDefined } from 'src/helpers/utils';

const Image = ({ entity, setEntity, isLandscape = false, sizes = "", imageName = "image", tip = "", handleChange = null, iteration = null }) => {

    const handleImageChange = ({ currentTarget }) => {
        if (!isDefined(handleChange))
            setEntity({...entity, [imageName]: currentTarget.files[0]});
        else
            handleChange(currentTarget.files[0], iteration);
    };

    return (
        <>
            <CFormGroup row className="ml-1 mt-4 mb-0">
                <CLabel>Image { tip }<small className="ml-2"><i>{ isLandscape ? "Paysage" : "Portrait" } { sizes }</i></small></CLabel>
            </CFormGroup>
            <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                <CCol xs="12" md="12">
                    {/* <CLabel>Image</CLabel> */}
                    <CInputFile name={ imageName } custom id="custom-file-input" onChange={ handleImageChange } />
                    <CLabel htmlFor="custom-file-input" variant="custom-file">
                        { entity[imageName] === null || entity[imageName] === undefined ?
                            "Choose file..." :
                            entity[imageName].filePath !== undefined ? 
                                entity[imageName].filePath :
                                entity[imageName].name 
                        }
                    </CLabel>
                </CCol>
            </CFormGroup >
        </>
    );
}
 
export default Image;