import React, { useEffect } from 'react';
import { CCol, CFormGroup, CInputFile, CLabel, CRow } from "@coreui/react";
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const Logos = ({ owner, setOwner }) => {

    useEffect(() => console.log(owner.logos), [owner]);

    const handleImageChange = ({ currentTarget }) => {
        const existingLogo = isDefinedAndNotVoid(owner.logos) ? owner.logos.find(l => l.type === currentTarget.name) : undefined;
        if (isDefined(existingLogo))
            setOwner({...owner, logos: owner.logos.map(l => l.type !== existingLogo.type ? l : {...existingLogo, image: currentTarget.files[0]})});
        else 
            setOwner({...owner, logos: [...owner.logos, {type: currentTarget.name, image: currentTarget.files[0]}]});
    };

    return (
        <>
            <CFormGroup row className="ml-1 mt-4 mb-0">
                <CLabel>Logos complets</CLabel>
            </CFormGroup>
            <CRow>
                <CCol xs="12" sm="6" md="6">
                    <CFormGroup row className="ml-1 mt-4 mb-0">
                        <CLabel>Clair</CLabel>
                    </CFormGroup>
                    <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                        <CCol xs="12" md="12">
                            <CInputFile name="LOGO_FULL_LIGHT" custom id="custom-file-input" onChange={ handleImageChange } />
                            <CLabel htmlFor="custom-file-input" variant="custom-file">
                                {!isDefinedAndNotVoid(owner.logos) || owner.logos.findIndex(l => l.type == "LOGO_FULL_LIGHT") == -1 ?
                                    "Choose file..." :
                                    isDefined((owner.logos.find(l => l.type == "LOGO_FULL_LIGHT")).image.filePath) ? 
                                        (owner.logos.find(l => l.type == "LOGO_FULL_LIGHT")).image.filePath : 
                                        (owner.logos.find(l => l.type == "LOGO_FULL_LIGHT")).image.name 
                                }
                            </CLabel>
                        </CCol>
                    </CFormGroup >
                </CCol>
                <CCol xs="12" sm="6" md="6">
                    <CFormGroup row className="ml-1 mt-4 mb-0">
                        <CLabel>Sombre</CLabel>
                    </CFormGroup>
                    <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                        <CCol xs="12" md="12">
                            <CInputFile name="LOGO_FULL_DARK" custom id="custom-file-input" onChange={ handleImageChange } />
                            <CLabel htmlFor="custom-file-input" variant="custom-file">
                                {!isDefinedAndNotVoid(owner.logos) || owner.logos.findIndex(l => l.type == "LOGO_FULL_DARK") == -1 ?
                                    "Choose file..." :
                                    isDefined((owner.logos.find(l => l.type == "LOGO_FULL_DARK")).image.filePath) ? 
                                        (owner.logos.find(l => l.type == "LOGO_FULL_DARK")).image.filePath : 
                                        (owner.logos.find(l => l.type == "LOGO_FULL_DARK")).image.name 
                                }
                            </CLabel>
                        </CCol>
                    </CFormGroup >
                </CCol>
            </CRow>
            <hr/>

            <CFormGroup row className="ml-1 mt-4 mb-0">
                <CLabel>Logos Horizontaux</CLabel>
            </CFormGroup>
            <CRow>
                <CCol xs="12" sm="6" md="6">
                    <CFormGroup row className="ml-1 mt-4 mb-0">
                        <CLabel>Clair</CLabel>
                    </CFormGroup>
                    <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                        <CCol xs="12" md="12">
                            <CInputFile name="LOGO_STRETCHED_LIGHT" custom id="custom-file-input" onChange={ handleImageChange } />
                            <CLabel htmlFor="custom-file-input" variant="custom-file">
                                {!isDefinedAndNotVoid(owner.logos) || owner.logos.findIndex(l => l.type == "LOGO_STRETCHED_LIGHT") == -1 ?
                                    "Choose file..." :
                                    isDefined((owner.logos.find(l => l.type == "LOGO_STRETCHED_LIGHT")).image.filePath) ? 
                                        (owner.logos.find(l => l.type == "LOGO_STRETCHED_LIGHT")).image.filePath : 
                                        (owner.logos.find(l => l.type == "LOGO_STRETCHED_LIGHT")).image.name 
                                }
                            </CLabel>
                        </CCol>
                    </CFormGroup >
                </CCol>
                <CCol xs="12" sm="6" md="6">
                    <CFormGroup row className="ml-1 mt-4 mb-0">
                        <CLabel>Logo horizontal sombre</CLabel>
                    </CFormGroup>
                    <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                        <CCol xs="12" md="12">
                            <CInputFile name="LOGO_STRETCHED_DARK" custom id="custom-file-input" onChange={ handleImageChange } />
                            <CLabel htmlFor="custom-file-input" variant="custom-file">
                                {!isDefinedAndNotVoid(owner.logos) || owner.logos.findIndex(l => l.type == "LOGO_STRETCHED_DARK") == -1 ?
                                    "Choose file..." :
                                    isDefined((owner.logos.find(l => l.type == "LOGO_STRETCHED_DARK")).image.filePath) ? 
                                        (owner.logos.find(l => l.type == "LOGO_STRETCHED_DARK")).image.filePath : 
                                        (owner.logos.find(l => l.type == "LOGO_STRETCHED_DARK")).image.name 
                                }
                            </CLabel>
                        </CCol>
                    </CFormGroup >
                </CCol>
            </CRow>
            <hr/>

            <CRow>
                <CCol xs="12" sm="12" md="12">
                    <CFormGroup row className="ml-1 mt-4 mb-0">
                        <CLabel>Logo carré</CLabel>
                    </CFormGroup>
                    <CFormGroup row className="ml-1 mr-1 mt-0 mb-3">
                        <CCol xs="12" md="12">
                            <CInputFile name="LOGO_SQUARE" custom id="custom-file-input" onChange={ handleImageChange } />
                            <CLabel htmlFor="custom-file-input" variant="custom-file">
                                {!isDefinedAndNotVoid(owner.logos) || owner.logos.findIndex(l => l.type == "LOGO_SQUARE") == -1 ?
                                    "Choose file..." :
                                    isDefined((owner.logos.find(l => l.type == "LOGO_SQUARE")).image.filePath) ? 
                                        (owner.logos.find(l => l.type == "LOGO_SQUARE")).image.filePath : 
                                        (owner.logos.find(l => l.type == "LOGO_SQUARE")).image.name 
                                }
                            </CLabel>
                        </CCol>
                    </CFormGroup >
                </CCol>
            </CRow>
        </>
    );
};

export default Logos;