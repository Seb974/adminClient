import React from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Component from './component';

const Components = ({ components, setComponents, defaultComponent }) => {

    const handleComponentAdd = () => setComponents([...components, {...defaultComponent, count: components[components.length -1].count + 1}]);

    const handleComponentChange = component => {
        const newComponents = components.map(c => c.count !== component.count ? c : component);
        setComponents(newComponents);
    };

    const handleComponentDelete = ({currentTarget}) => setComponents(components.filter(c => c.count !== parseInt(currentTarget.name)));

    return (
        <>
            { components.map((component, index) => {
                return(
                    <>
                        <CRow className="text-center mt-4">
                            <CCol md="1">{""}</CCol>
                            <CCol md="10"><hr/></CCol>
                        </CRow>
                        <CRow>
                            <CCol md="1">{""}</CCol>
                            <CCol md="10">
                                <Component
                                    component={ component } 
                                    setComponents={ setComponents }
                                    components={ components }
                                    handleChange={ handleComponentChange } 
                                    handleDelete={ handleComponentDelete } 
                                    total={ components.length } 
                                    index={ index }
                                />
                            </CCol>
                        </CRow>
                    </>
                );
            })}
            <CRow className="text-center mt-4">
                <CCol md="1">{""}</CCol>
                <CCol md="10"><hr/></CCol>
            </CRow>
            <CRow className="mt-3 d-flex justify-content-center">
                <CButton size="sm" color="info" onClick={ handleComponentAdd }><CIcon name="cil-plus"/> Ajouter un produit</CButton>
            </CRow>
        </>
    );
}
 
export default Components;