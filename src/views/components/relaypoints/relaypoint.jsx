import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import GroupActions from 'src/services/GroupActions';
import RelaypointActions from 'src/services/RelaypointActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CTextarea, CSwitch, CInputGroup, CInputGroupAppend, CInputGroupText } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, isDefined, getNumericOrNull, isDefinedAndNotVoid } from 'src/helpers/utils';
import Condition from 'src/components/conditions/condition';
import { getWeekDays } from 'src/helpers/days';
import TaxActions from 'src/services/TaxActions';
import AddressPanel from 'src/components/userPages/AddressPanel';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';

const Relaypoint = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [groups, setGroups] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const initialInformations =  AddressPanel.getInitialInformations();
    const  defaultDays = getWeekDays().filter(day => day.value !== 0);
    const [informations, setInformations] = useState(initialInformations);
    const defaultCondition = {userGroups: [], days: defaultDays, price: "", tax: {}, minForFree: "", count: 0};
    const defaultErrors = {name:"", phone: "", address: "", address2: "", zipcode: "", city: "", position: "", informations: "", available: "", private: "", accessCode: "", discount: "" };
    const [relaypoint, setRelaypoint] = useState({ name: "", informations: "", conditions: [defaultCondition], available: true, private: false, accessCode: "", discount: "" });
    const [managers, setManagers] = useState([]);
    const [errors, setErrors] = useState(defaultErrors);

    useEffect(() => {
        fetchGroups();
        fetchTaxes();
        fetchRelaypoint(id);
    }, []);

    useEffect(() => fetchRelaypoint(id), [id]);

    const onPhoneChange = ({ currentTarget }) => setInformations({...informations, phone: currentTarget.value});
    const handleChange = ({ currentTarget }) => setRelaypoint({...relaypoint, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setRelaypoint({...relaypoint, [currentTarget.name]: !relaypoint[currentTarget.name]});
    const handleAddRule = () => setRelaypoint({...relaypoint, conditions: [...relaypoint.conditions, {...defaultCondition, count: relaypoint.conditions[relaypoint.conditions.length -1].count + 1}]});

    const handleDeleteRule = ({currentTarget}) => {
        const condition = relaypoint.conditions.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setRelaypoint({...relaypoint, conditions: relaypoint.conditions.filter(element => parseInt(element.count) !== parseInt(condition.count))});
    };

    const fetchRelaypoint = id => {
        if (id !== "new") {
            setEditing(true);
            RelaypointActions.find(id)
                .then( response => {
                    const {metas, ...dbRelaypoint} = response;
                    setRelaypoint({
                        ...dbRelaypoint,
                        discount: isDefined(dbRelaypoint.promotion) ? dbRelaypoint.promotion.discount * 100 : "",
                        conditions : !isDefined(response.conditions) ? [] : response.conditions.map((condition, i) => ({...condition, count: i})) 
                    });
                    setInformations(metas);
                    if (isDefinedAndNotVoid(response.managers))
                        setManagers(response.managers);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/relaypoints");
                });
        }
    };

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => setGroups(response.map(group => ({...group, isFixed: false}))))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/relaypoints");
            });
    };

    const fetchTaxes = () => {
        TaxActions
            .findAll()
            .then(response => setTaxes(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/relaypoints");
            });
    };

    const getFormattedRelaypoint = () => {
        const discountValue = getNumericOrNull(relaypoint.discount);
        return {
            ...relaypoint,
            discount: isDefined(discountValue) ? parseFloat((discountValue / 100).toFixed(3)) : null,
            accessCode: isDefined(relaypoint.accessCode) && relaypoint.accessCode.length > 0 ? relaypoint.accessCode : null,
            metas: {...informations, isRelaypoint: true},
            conditions: relaypoint.conditions.map(condition => {
                return {
                    ...condition,
                    price: getNumericOrNull(condition.price),
                    minForFree: getNumericOrNull(condition.minForFree),
                    tax : condition.tax['@id'], 
                    userGroups: condition.userGroups.map(group => group['@id']),
                    isRelaypoint: true
                }
            }),
            promotion: isDefined(discountValue) ? getPromotionToWrite(discountValue) : null,
            managers: managers.map(manager => manager['@id'])
        };
    };

    const getPromotionToWrite = (discountValue) => {
        return {
            ...relaypoint.promotion,
            code: "relaypoint",
            percentage: true,
            discount: parseFloat((discountValue / 100).toFixed(3)),
            maxUsage: null,
            used: null,
            endsAt: null
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const relaypointToWrite = getFormattedRelaypoint();
        const request = !editing ? RelaypointActions.create(relaypointToWrite) : RelaypointActions.update(id, relaypointToWrite);
        request.then(response => {
                    setErrors(defaultErrors);
                    //TODO : Flash notification de succès
                    history.replace("/components/relaypoints");
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

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un point relais</h3>
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
                                            value={ relaypoint.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du point relais"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Téléphone</CLabel>
                                        <CInput
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={ informations.phone }
                                            onChange={ onPhoneChange }
                                            placeholder="N° de téléphone"
                                            invalid={ errors.phone.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.phone }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <h4 className="ml-3 mt-3">Adresse</h4>
                            </CRow>
                            <AddressPanel informations={ informations } setInformations={ setInformations } errors={ errors } />
                            <CRow className="mt-0 mb-3">
                                <CCol xs="12" md="12">
                                    <CLabel htmlFor="textarea-input">Informations sur le point relais</CLabel>
                                    <CTextarea name="informations" id="informations" rows="5" placeholder="horaires..." onChange={ handleChange } value={ relaypoint.informations }/>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Code d'accès</CLabel>
                                        <CInput
                                            id="accessCode"
                                            name="accessCode"
                                            value={ relaypoint.accessCode }
                                            onChange={ handleChange }
                                            placeholder="Code d'accès"
                                            invalid={ errors.accessCode.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.accessCode }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Remise</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                type="number"
                                                id="discount"
                                                name="discount"
                                                value={ relaypoint.discount }
                                                onChange={ handleChange }
                                                placeholder=" "
                                                invalid={ errors.discount.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>%</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.discount }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CFormGroup row>
                                <CCol xs="6" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex justify-content-start align-items-center">
                                        <CCol xs="4" sm="4" md="4">
                                            <CSwitch name="available" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ relaypoint.available } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="8" sm="8" md="8" className="col-form-label">Disponible</CCol>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="6" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end align-items-center">
                                        <CCol xs="4" sm="4" md="4">
                                            <CSwitch name="private" className="mr-1" color="danger" shape="pill" checked={ relaypoint.private } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="8" sm="8" md="8" className="col-form-label">Privé</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CFormGroup>
                            { relaypoint.conditions.map((condition, index) => {
                                return <Condition
                                            key={ index }
                                            entity={ relaypoint }
                                            condition={ condition } 
                                            groups={ groups }
                                            taxes={ taxes }
                                            setEntity={ setRelaypoint }
                                            handleDeleteRule={ handleDeleteRule }
                                            errors={ errors }
                                            total={ relaypoint.conditions.length }
                                            index={ index }
                                        />
                            })}
                            <hr className="mt-5"/>
                            <CRow className="mt-4">
                                <CCol xs="12" sm="12">
                                    <CButton size="sm" color="warning" onClick={ handleAddRule }><CIcon name="cil-plus"/> Ajouter une règle</CButton>
                                </CCol>
                            </CRow>
                            <UserSearchMultiple users={ managers } setUsers={ setManagers }/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/relaypoints" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Relaypoint;