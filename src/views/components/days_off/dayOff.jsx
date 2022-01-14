import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import GroupActions from 'src/services/GroupActions';
import DayOffActions from 'src/services/DayOffActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { getDateFrom, isDefined } from 'src/helpers/utils';

const DayOff = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [groups, setGroups] = useState([]);
    const [dayRange, setDayRange] = useState(false);
    const [dayOff, setDayOff] = useState({ name: "", openedFor: [], date: new Date(), limit: new Date() });
    const [errors, setErrors] = useState({ name: "", openedFor: "", date: "" });

    useEffect(() => {
        fetchGroups();
        fetchDayOff(id);
    }, []);

    useEffect(() => fetchDayOff(id), [id]);

    const handleUsersChange = openedFor => setDayOff(dayOff => ({...dayOff, openedFor}));
    const handleChange = ({ currentTarget }) => setDayOff({...dayOff, [currentTarget.name]: currentTarget.value});
    
    const handleDayRange = ({ currentTarget }) => {
        setDayRange(!dayRange);
        if (!dayRange)
            setDayOff({...dayOff, limit: dayOff.date});
    };
    
    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        if (!dayRange) {
            setDayOff({...dayOff, date: newDate});
        } else if (isDefined(datetime[1])){
            const newLimit = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 9, 0, 0);
            setDayOff({...dayOff, date: newDate, limit: newLimit});
        }
    };

    const fetchDayOff = id => {
        if (id !== "new") {
            setEditing(true);
            DayOffActions.find(id)
                .then( response => {
                    setDayOff({...response, date: new Date(response.date)});
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/days_off");
                });
        }
    }

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => {
                const filteredGroups = response.filter(group => group.dayOff === null || group.dayOff === undefined);
                setGroups(filteredGroups.map(group => ({...group, isFixed: false})));
            })
            .catch(error => history.replace("/components/days_off"));
    };

    const numberOfDays = (from, to) => {
        const hours = to.getTime() - from.getTime();
        return parseInt(hours / (1000 * 3600 * 24));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedOpenedFor = dayOff.openedFor.map(group => group['@id']);
        if ( dayRange && isDefined(dayOff.limit) && dayOff.limit.getTime() > dayOff.date.getTime() ) {
            const days = numberOfDays(dayOff.date, dayOff.limit);
            for (let i = 0; i <= days; i++) {
                let day = getDateFrom(dayOff.date, i);
                let dayRangeMember = {name: dayOff.name, date: day, openedFor: formattedOpenedFor};
                console.log(dayRangeMember);
                DayOffActions
                    .create(dayRangeMember)
                        .then(response => {
                            if (i === days) {
                            setErrors({name: "", date: "", openedFor: ""});
                            history.replace("/components/days_off");
                            }
                        });
            }
        } else {
            const {openedFor, limit, ...settings} = dayOff;
            const formattedDayOff = {...settings, openedFor: formattedOpenedFor};
            const request = !editing ? DayOffActions.create(formattedDayOff) : DayOffActions.update(id, formattedDayOff);
            request.then(response => {
                        setErrors({name: "", date: "", openedFor: ""});
                        //TODO : Flash notification de succès
                        history.replace("/components/days_off");
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
                        //TODO : Flash notification d'erreur
                   });
        }
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? (dayRange ? "Créer une plage de jours fermés" : "Créer un jour fermé") : "Modifier le jour '" + dayOff.name + "'" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="5">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ dayOff.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de l'évènement"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="3" className="mt-4">
                                <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                    <CCol xs="3" sm="2" md="3">
                                        <CSwitch name="new" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ dayRange } onChange={ handleDayRange }/>
                                    </CCol>
                                    <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                        Plage de jours
                                    </CCol>
                                </CFormGroup>
                            </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CFormGroup>
                                        <CLabel htmlFor="date">{dayRange ? "Dates de fermeture" : "Date de fermeture"}</CLabel>
                                        <Flatpickr
                                            name="date"
                                            value={ !dayRange ? dayOff.date : [dayOff.date, dayOff.limit] }
                                            onChange={ onDateChange }
                                            className="form-control form-control-sm"
                                            options={{
                                                mode: dayRange ? "range" : "single",
                                                dateFormat: "d/m/Y",
                                                minDate: 'today',
                                                locale: French,
                                            }}
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="openedFor" label="Reste ouvert pour les utilisateurs" value={ dayOff.openedFor } error={ errors.openedFor } onChange={ handleUsersChange } data={ groups }/>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/days_off" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default DayOff;