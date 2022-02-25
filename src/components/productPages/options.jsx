import React, { useContext, useEffect, useState } from 'react';
import { CCol, CFormGroup, CSwitch } from '@coreui/react';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';

const Options = ({ product, setProduct }) => {

    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const handleCheckBoxes = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});

    return (
        <>
            <hr className="my-5"/>
            <CFormGroup row>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="requireDeclaration" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.requireDeclaration } onChange={ handleCheckBoxes }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Déclaration aux douanes
                        </CCol>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="requireLegalAge" className="mr-1" color="danger" shape="pill" checked={ product.requireLegalAge } onChange={ handleCheckBoxes }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Interdit aux -18ans
                        </CCol>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="needsTraceability" className="mr-1" color="danger" shape="pill" checked={ product.needsTraceability } onChange={ handleCheckBoxes }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Gestion des lots
                        </CCol>
                    </CFormGroup>
                </CCol>
            </CFormGroup>
            <hr className="my-5"/>
            <CFormGroup row>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="available" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.available } onChange={ handleCheckBoxes } disabled={ !isAdmin }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Disponible en ligne
                        </CCol>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="storeAvailable" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.storeAvailable } onChange={ handleCheckBoxes } disabled={ !isAdmin }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Disponible en boutique
                        </CCol>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" md="4" className="mt-4">
                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                        <CCol xs="3" sm="2" md="3">
                            <CSwitch name="new" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.new } onChange={ handleCheckBoxes }/>
                        </CCol>
                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                            Nouveauté
                        </CCol>
                    </CFormGroup>
                </CCol>
            </CFormGroup>
        </>
    );
}
 
export default Options;