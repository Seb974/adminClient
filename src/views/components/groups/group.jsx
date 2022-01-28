import 'flatpickr/dist/themes/material_blue.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GroupActions from 'src/services/GroupActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput,  CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined } from 'src/helpers/utils';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';

const Group = ({ match, history }) => {

    const today = new Date();
    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [group, setGroup] = useState({ label: "", hasAdminAccess: false, hasShopAccess: true, subjectToTaxes: true, dayInterval: 0, onlinePayment: true, hourLimit: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 0), soldOutNotification: false});
    const [errors, setErrors] = useState({label: "", hasAdminAccess: "", hasShopAccess: "", subjectToTaxes: "", onlinePayment: "", dayInterval: "", hourLimit: ""});

    useEffect(() => fetchGroup(id), []);
    useEffect(() => fetchGroup(id), [id]);

    const handleChange = ({ currentTarget }) => setGroup({...group, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setGroup({...group, [currentTarget.name]: !group[currentTarget.name]});

    const fetchGroup = id => {
        if (id !== "new") {
            setEditing(true);
            GroupActions.find(id)
                .then( response => {
                    const newGroup = {
                        ...response,
                        hasAdminAccess: isDefined(response.hasAdminAccess) ? response.hasAdminAccess : group.hasAdminAccess,
                        hasShopAccess: isDefined(response.hasShopAccess) ? response.hasShopAccess : group.hasShopAccess,
                        subjectToTaxes: isDefined(response.subjectToTaxes) ? response.subjectToTaxes : group.subjectToTaxes,
                        onlinePayment: isDefined(response.onlinePayment) ? response.onlinePayment : group.onlinePayment,
                        dayInterval: isDefined(response.dayInterval) ? response.dayInterval : group.dayInterval,
                        hourLimit: isDefined(response.hourLimit) ? new Date(response.hourLimit) : group.hourLimit,
                        soldOutNotification: isDefined(response.soldOutNotification) ? response.soldOutNotification : group.soldOutNotification
                    };
                    setGroup(newGroup);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/groups");
                });
        }
    }

    const onDateChange = dateTime => {
        setGroup({...group, hourLimit: dateTime[0]});
    };

    const getFormattedTime = dateTime => {
        const date = new Date(dateTime);
        return date.getHours() + ':' + date.getMinutes() + ':' + 0;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const groupToWrite = !isDefined(group.priceGroup) ? 
            {...group, hourLimit: getFormattedTime(group.hourLimit), dayInterval: parseInt(group.dayInterval)} : 
            {...group, priceGroup: group.priceGroup['@id'], hourLimit: getFormattedTime(group.hourLimit), dayInterval: parseInt(group.dayInterval)};
        const request = !editing ? GroupActions.create(groupToWrite) : GroupActions.update(id, groupToWrite);
        request.then(response => {
                    setErrors({label: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/groups");
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
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un groupe d'utilisateur" : "Modifier le groupe " + group.label }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow className="mx-1">
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="label">Nom</CLabel>
                                        <CInput
                                            id="label"
                                            name="label"
                                            value={ group.label }
                                            onChange={ handleChange }
                                            placeholder="Nom du groupe"
                                            invalid={ errors.label.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.label }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="3" className="d-flex align-items-center">
                                    <CFormGroup row className="mb-0 mt-4 d-flex align-items-center">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="hasAdminAccess" color="dark" shape="pill" variant="opposite" checked={ group.hasAdminAccess } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Accès admin
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="3" className="d-flex align-items-center">
                                    <CFormGroup row className="mb-0 mt-4 d-flex align-items-center">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="hasShopAccess" color="dark" shape="pill" variant="opposite" checked={ group.hasShopAccess } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Accès au shop
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            { !group.hasShopAccess ? <></> : 
                                <>
                                    <hr className="mx-3 my-4"/>
                                    <CRow className="mb-5 ml-1">
                                        <CCol xs="12" sm="12" md="4" className="d-flex align-items-center">
                                            <CFormGroup row className="mb-0 mt-4 d-flex align-items-center">
                                                <CCol xs="3" sm="2" md="3">
                                                    <CSwitch name="subjectToTaxes" color="dark" shape="pill" variant="opposite" checked={ group.subjectToTaxes } onChange={ handleCheckBoxes }/>
                                                </CCol>
                                                <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                                    Soumis à la TVA
                                                </CCol>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="4" className="d-flex align-items-center">
                                            <CFormGroup row className="mb-0 mt-4 d-flex align-items-center">
                                                <CCol xs="3" sm="2" md="3">
                                                    <CSwitch name="onlinePayment" color="dark" shape="pill" variant="opposite" checked={ group.onlinePayment } onChange={ handleCheckBoxes }/>
                                                </CCol>
                                                <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                                    Paiement sur site
                                                </CCol>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="4" className="d-flex align-items-center">
                                            <CFormGroup row className="mb-0 mt-4 d-flex align-items-center">
                                                <CCol xs="3" sm="2" md="3">
                                                    <CSwitch name="soldOutNotification" color="dark" shape="pill" variant="opposite" checked={ group.soldOutNotification } onChange={ handleCheckBoxes }/>
                                                </CCol>
                                                <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                                    Notification de rupture
                                                </CCol>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                    <CRow className="mt-4 mx-1">
                                        <CCol xs="12" sm="12" md="6">
                                            <CFormGroup>
                                                <CLabel htmlFor="label">Décalage de la livraison (J)</CLabel>
                                                <CInput
                                                    type="number"
                                                    min="0"
                                                    max="31"
                                                    name="dayInterval"
                                                    value={ group.dayInterval }
                                                    onChange={ handleChange }
                                                />
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="6">
                                            <label htmlFor="hourLimit" className="date-label">Heure limite de commande</label>
                                            <Flatpickr
                                                name="hourLimit"
                                                value={ group.hourLimit }
                                                onChange={ onDateChange }
                                                className="form-control"
                                                options={{
                                                    enableTime: true,
                                                    noCalendar: true,
                                                    dateFormat: "H:i",
                                                    time_24hr: true,
                                                    locale: French,
                                                }}
                                            />
                                        </CCol>
                                    </CRow>
                                </>
                            }

                            <CRow className="mt-5 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/groups" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Group;