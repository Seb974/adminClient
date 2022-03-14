import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaxActions from 'src/services/TaxActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import CatalogActions from 'src/services/CatalogActions';
import { isDefinedAndNotVoid, getFloat } from 'src/helpers/utils';
import CatalogTax from 'src/components/taxPages/catalogTax';

const TaxPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultCatalog = {id: -1, name: "", percent: 0};
    const [editing, setEditing] = useState(false);
    const [tax, setTax] = useState({ name: "" });
    const [errors, setErrors] = useState({ name: "" });
    const [catalogs, setCatalogs] = useState([]);
    const [catalogOptions, setCatalogOptions] = useState([defaultCatalog]);

    useEffect(() => {
        fetchCatalogs();
        fetchTax(id);
    }, []);

    useEffect(() => fetchTax(id), [id]);

    useEffect(() => {
        if (isDefinedAndNotVoid(catalogs)) {
            let newCatalogOptions = [...catalogOptions];
            let defaultOption = catalogOptions.findIndex(option => option.id === -1);
            if (defaultOption !== -1) {
                newCatalogOptions[defaultOption] = {...catalogs[0], percent: newCatalogOptions[defaultOption].percent };
                setCatalogOptions(newCatalogOptions);
            }
        }
    }, [catalogs, tax]);


    const fetchTax = id => {
        if (id !== "new") {
            setEditing(true);
            TaxActions.find(id)
                .then( response => {
                    const { catalogTaxes, ...tax } = response; 
                    setTax(tax);
                    if (catalogTaxes.length > 0) {
                        setCatalogOptions(catalogTaxes.map(catalog => {
                            return {...catalog.catalog, percent: (catalog.percent * 100).toFixed(3)}; 
                        }));
                    }
                })
                .catch(error => history.replace("/components/taxes"));
        }
    };

    const fetchCatalogs = () => {
        CatalogActions.findAll()
            .then(response => setCatalogs(response))
            .catch(error => history.replace("/components/taxes"));
    };

    const handleChange = ({ currentTarget }) => setTax({...tax, [currentTarget.name]: currentTarget.value});

    const handleAdd = e => {
        e.preventDefault();
        if (catalogOptions.length < catalogs.length) {
            let next = catalogs.findIndex(catalog => catalogOptions.find(selection => selection.id === catalog.id) === undefined);
            setCatalogOptions(catalogOptions => {
                return [...catalogOptions, {...catalogs[next], percent: 0}];
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const taxToWrite = {...tax, catalogTaxes: catalogOptions.map(catalog => ({catalog: catalog['@id'], percent: (getFloat(catalog.percent) / 100) }))};
        const request = !editing ? TaxActions.create(taxToWrite) : TaxActions.update(id, taxToWrite);
        request.then(response => {
                    setErrors({name: ""});
                    history.replace("/components/taxes");
                })
               .catch( ({ response }) => {
                    const { violations } = response.data;
                    if (violations) {
                        const apiErrors = {};
                        violations.forEach(({propertyPath, message}) => {
                            apiErrors[propertyPath] = message;
                        });
                        setErrors(apiErrors);
                    }
               });
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une taxe" : "Modifier la taxe " + tax.name }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ tax.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la taxe"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <hr className="mt-5"/>
                            <CLabel htmlFor="name" className="mb-1">Taux</CLabel>
                            { catalogOptions.map((catalog, index) => {
                                return <CatalogTax 
                                            key={ catalog.id } 
                                            index={ index }
                                            details={ catalog } 
                                            options={ catalogOptions } 
                                            catalogs={ catalogs }
                                            setCatalogOptions={ setCatalogOptions }
                                        />
                                })
                            }
                            <CRow className="mt-4 mr-1 d-flex justify-content-start ml-1">
                                <CButton size="sm" color="warning" onClick={ handleAdd }><CIcon name="cil-plus"/> Ajouter un taux</CButton>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/taxes" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default TaxPage;