import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CityActions from 'src/services/CityActions';
import ZoneActions from 'src/services/ZoneActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const Zone = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [cities, setCities] = useState([]);
    const [viewedCities, setViewedCities] = useState([]);
    const [zone, setZone] = useState({ name: "", cities: [] });
    const [errors, setErrors] = useState({ name: "", cities: "" });

    useEffect(() => {
        fetchCities();
        fetchZone(id);
    }, []);

    useEffect(() => fetchZone(id), [id]);

    useEffect(() => {
        if (isDefinedAndNotVoid(cities) && !isDefinedAndNotVoid(viewedCities)) {
            const allowedCities = cities.filter(city => !isDefined(city.zone) || zone.id === city.zone.id);
            setViewedCities(getFormattedCities(allowedCities));
        }
    }, [zone, cities]);

    const handleCitiesChange = selectedCities => {
        const newCities = cities.filter(city => selectedCities.findIndex(selection => selection.value === city['@id']) !== -1);
        setZone(zone => ({...zone, cities: newCities}));
    };

    const handleChange = ({ currentTarget }) => setZone({...zone, [currentTarget.name]: currentTarget.value});

    const fetchZone = id => {
        if (id !== "new") {
            setEditing(true);
            ZoneActions.find(id)
                .then( response => {
                    const zoneCities = isDefinedAndNotVoid(response.cities) ? response.cities : [];
                    setZone({...response, cities: zoneCities});
                })
                .catch(error => history.replace("/components/zones"));
        }
    }

    const fetchCities = () => {
        CityActions
            .findAll()
            .then(response => setCities(response))
            .catch(error => history.replace("/components/zones"));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedZone = {...zone, cities: zone.cities.map(city => city['@id'])};
        const request = !editing ? ZoneActions.create(formattedZone) : ZoneActions.update(id, formattedZone);

        request.then(response => {
                    setErrors({name: ""});
                    history.replace("/components/zones");
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

    const getFormattedCities = cities => {
        return cities.map(city => ({value: city['@id'], label: city.zipCode + " - " + city.name, isFixed: false}));
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une zone" : "Modifier la zone '" + zone.name + "'" }</h3>
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
                                            value={ zone.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la zone"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="cities" label="Villes" value={ getFormattedCities(zone.cities) } error={ errors.cities } onChange={ handleCitiesChange } data={ viewedCities }/>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/zones" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Zone;