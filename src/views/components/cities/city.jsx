import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import GroupActions from 'src/services/GroupActions';
import CityActions from 'src/services/CityActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, getNumericOrNull, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Condition from 'src/components/conditions/condition';
import { getWeekDays } from 'src/helpers/days';
import TaxActions from 'src/services/TaxActions';
import CatalogContext from 'src/contexts/CatalogContext';

const City = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [groups, setGroups] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const  defaultDays = getWeekDays().filter(day => day.value !== 0);
    const { catalogs } = useContext(CatalogContext);
    const defaultCondition = {userGroups: [], days: defaultDays, price: "", tax: {}, minForFree: "", count: 0};
    const [city, setCity] = useState({ name: "", zipCode: "", conditions: [defaultCondition], catalog: null });
    const [errors, setErrors] = useState({ name: "", zipCode: "", conditions: ""});

    useEffect(() => {
        fetchGroups();
        fetchTaxes();
        fetchCity(id);
    }, []);

    useEffect(() => fetchCity(id), [id]);

    useEffect(() => {
        if (!isDefined(city.catalog) && isDefinedAndNotVoid(catalogs))
            setCity({...city, catalog: catalogs[0]});
    }, [city, catalogs]);

    const handleChange = ({ currentTarget }) => setCity({...city, [currentTarget.name]: currentTarget.value});
    const handleAddRule = () => setCity({...city, conditions: [...city.conditions, {...defaultCondition, count: city.conditions[city.conditions.length -1].count + 1}]});
    const handleDeleteRule = ({currentTarget}) => {
        const condition = city.conditions.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setCity({...city, conditions: city.conditions.filter(element => parseInt(element.count) !== parseInt(condition.count))});
    };

    const fetchCity = id => {
        if (id !== "new") {
            setEditing(true);
            CityActions.find(id)
                .then( response => {
                    setCity({
                        ...response, 
                        conditions : !isDefined(response.conditions) ? [] :
                                     response.conditions.map((condition, i) => ({...condition, count: i})) })
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/cities");
                });
        }
    };

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => setGroups(response.map(group => ({...group, isFixed: false}))))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/cities");
            });
    };

    const fetchTaxes = () => {
        TaxActions
            .findAll()
            .then(response => setTaxes(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/cities");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cityToWrite = {...city, zone: isDefined(city.zone) ? city.zone['@id'] : null, catalog: isDefined(city.catalog) ? city.catalog['@id'] : null, conditions: city.conditions.map(condition => {
            return {
                ...condition,
                price: getNumericOrNull(condition.price),
                minForFree: getNumericOrNull(condition.minForFree),
                tax : condition.tax['@id'], 
                userGroups: condition.userGroups.map(group => group['@id']),
                isRelaypoint: false
            }
        })};
        const request = !editing ? CityActions.create(cityToWrite) : CityActions.update(id, cityToWrite);
        request.then(response => {
                    setErrors({ name: "", zipCode: "", conditions: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/cities");
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
                       //TODO : Flash notification d'erreur
                   }
               });
    };

    const onCatalogChange = ({ currentTarget }) => {
        const newCatalog = catalogs.find(c => c.id === parseInt(currentTarget.value));
        setCity({...city, catalog: isDefined(newCatalog) ? newCatalog : null})
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer une ville</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ city.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la ville"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Code postal</CLabel>
                                        <CInput
                                            id="zipCode"
                                            name="zipCode"
                                            value={ city.zipCode }
                                            onChange={ handleChange }
                                            placeholder="Code postal"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="catalog">Pays associé</CLabel>
                                        <CSelect custom name="catalog" id="catalog" onChange={ onCatalogChange } value={ isDefined(city.catalog) ? city.catalog.id : "0"}>
                                            { catalogs.map((catalog, index) => <option key={ index } value={ catalog.id }>{ catalog.name  }</option>) }
                                        </CSelect>
                                        <CInvalidFeedback>{ errors.catalog }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            { city.conditions.map((condition, index) => {
                                return <Condition
                                            key={ index }
                                            entity={ city }
                                            condition={ condition } 
                                            groups={ groups }
                                            taxes={ taxes }
                                            setEntity={ setCity }
                                            handleDeleteRule={ handleDeleteRule }
                                            errors={ errors }
                                            total={ city.conditions.length }
                                            index={ index }
                                        />
                            })}
                            <hr className="mt-5"/>
                            <CRow className="mt-4">
                                <CCol xs="12" sm="12">
                                    <CButton size="sm" color="warning" onClick={ handleAddRule }><CIcon name="cil-plus"/> Ajouter une règle</CButton>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/cities" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default City;