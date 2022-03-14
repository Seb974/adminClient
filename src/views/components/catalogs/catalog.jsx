import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CatalogActions from 'src/services/CatalogActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, isDefined } from 'src/helpers/utils';

const Catalog = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const defaultErrors = { name: "", code: "", latitude: "", longitude: "", needsParcel: "", isDefault: "", minLat: "", maxLat: "", minLng: "", maxLng: "", zoom: "" , isActive: false};
    const [catalog, setCatalog] = useState({ name: "", code: "", latitude: "", longitude: "", needsParcel: true, isDefault: false, minLat: "", maxLat: "", minLng: "", maxLng: "", zoom: "", isActive: "" });
    const [errors, setErrors] = useState(defaultErrors);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => fetchCatalog(id), []);
    useEffect(() => fetchCatalog(id), [id]);

    const handleChange = ({ currentTarget }) => setCatalog({...catalog, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setCatalog({...catalog, [currentTarget.name]: !catalog[currentTarget.name]});

    const fetchCatalog = id => {
        if (id !== "new") {
            setEditing(true);
            CatalogActions.findAll()
                .then(response => {
                    const selected = response.find(catalog => catalog.id === parseInt(id));
                    const defaultEnabled = response.find(catalog => catalog.isDefault);
                    if (!isDefined(defaultEnabled) || defaultEnabled.id === selected.id) {
                        setEnabled(true)
                    }
                    setCatalog({
                        ...selected,
                        latitude: selected.center[0],
                        longitude: selected.center[1]
                    });
                })
                .catch(error => history.replace("/components/catalogs"));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const catalogToWrite = getCatalogToWrite();
        const request = !editing ? CatalogActions.create(catalogToWrite) : CatalogActions.update(id, catalogToWrite);
        request.then(response => {
                    setErrors(defaultErrors);
                    history.replace("/components/catalogs");
                })
               .catch( ({ response }) => {
                   if (response) {
                       const { violations } = response.data;
                       if (violations) {
                           const apiErrors = {};
                           violations.forEach(({propertyPath, message}) => {
                               apiErrors[propertyPath] = message;
                           });
                           setErrors(apiErrors);
                       }
                   }
               });
    };

    const getCatalogToWrite = () => {
        return {
            ...catalog, 
            center: [getFloat(catalog.latitude), getFloat(catalog.longitude)],
            minLat: getFloat(catalog.minLat),
            maxLat: getFloat(catalog.maxLat),
            minLng: getFloat(catalog.minLng),
            maxLng: getFloat(catalog.maxLng),
            zoom: Math.round(getFloat(catalog.zoom))
        };
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un colis</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ catalog.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du colis"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="code">Code</CLabel>
                                        <CInput
                                            id="code"
                                            name="code"
                                            value={ catalog.code }
                                            onChange={ handleChange }
                                            placeholder="Nom du colis"
                                            invalid={ errors.code.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.code }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Latitude du centre</CLabel>
                                        <CInput
                                            id="latitude"
                                            name="latitude"
                                            value={ catalog.latitude }
                                            onChange={ handleChange }
                                            placeholder="Latitude"
                                            invalid={ errors.latitude.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.latitude }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Longitude du centre</CLabel>
                                        <CInput
                                            id="longitude"
                                            name="longitude"
                                            value={ catalog.longitude }
                                            onChange={ handleChange }
                                            placeholder="Longitude"
                                            invalid={ errors.longitude.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.longitude }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Zoom</CLabel>
                                        <CInput
                                            id="zoom"
                                            name="zoom"
                                            value={ catalog.zoom }
                                            onChange={ handleChange }
                                            placeholder="Niveau de zoom"
                                            invalid={ errors.zoom.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.zoom }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CLabel>Délimitation GPS</CLabel>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="3">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Latitude min</CLabel>
                                        <CInput
                                            id="minLat"
                                            name="minLat"
                                            value={ catalog.minLat }
                                            onChange={ handleChange }
                                            placeholder="Y min"
                                            invalid={ errors.minLat.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.minLat }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="3">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Latitude max</CLabel>
                                        <CInput
                                            id="maxLat"
                                            name="maxLat"
                                            value={ catalog.maxLat }
                                            onChange={ handleChange }
                                            placeholder="Y max"
                                            invalid={ errors.maxLat.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.maxLat }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="3">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Longitude min</CLabel>
                                        <CInput
                                            id="minLng"
                                            name="minLng"
                                            value={ catalog.minLng }
                                            onChange={ handleChange }
                                            placeholder="X min"
                                            invalid={ errors.minLng.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.minLng }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="3">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Longitude max</CLabel>
                                        <CInput
                                            id="maxLng"
                                            name="maxLng"
                                            value={ catalog.maxLng }
                                            onChange={ handleChange }
                                            placeholder="X max"
                                            invalid={ errors.maxLng.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.maxLng }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="needsParcel" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ catalog.needsParcel } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Envoi par colis</CCol>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isDefault" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ catalog.isDefault } onChange={ handleCheckBoxes } disabled={ !enabled }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Catalogue par défaut</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isActive" className="mr-1" color="danger" shape="pill" variant="opposite" checked={ catalog.isActive } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Activé</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/catalogs" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Catalog;