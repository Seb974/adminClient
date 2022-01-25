import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import SupplierActions from 'src/services/SupplierActions';
import SellerActions from '../../../services/SellerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { getDateFrom, getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { getWeekDays } from 'src/helpers/days';


const Supplier = ({ match, history }) => {

    const now = new Date();
    const { id = "new" } = match.params;
    const [isAdmin, setIsAdmin] = useState([]);
    const [editing, setEditing] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const  defaultDays = getWeekDays().filter(day => day.value !== 0);
    const defaultErrors = { name: "", seller: "", email: "", phone: "", provisionMin: "", deliveryMin: "", dayInterval: "", maxHour: "", days: "" };
    const [supplier, setSupplier] = useState({ name: "", seller: null, email: "", phone: "", provisionMin: 0, deliveryMin: 0, dayInterval: 1, maxHour: getDateFrom(now, 0, 12, 0), days: defaultDays});
    const [sellers, setSellers] = useState([]);
    const [errors, setErrors] = useState(defaultErrors);

    useEffect(() => {
        fetchSellers();
        fetchSupplier(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchSupplier(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (!isDefined(supplier.seller) && isDefinedAndNotVoid(sellers)) {
            setSupplier({...supplier, seller: sellers[0]});
        }
    }, [sellers, supplier]);

    const fetchSupplier = id => {
        if (id !== "new") {
            setEditing(true);
            SupplierActions.find(id)
                .then(response => {
                    
                    console.log(new Date(response.maxHour).toLocaleString('fr-FR', { timeZone: timezone}));
                    setSupplier({...response, maxHour: isDefined(response.maxHour) ? new Date(response.maxHour) : supplier.maxHour });        // maxHour: isDefined(response.maxHour) ? getDateFrom(now, 1, response.maxHour.getHours(), response.maxHour.getMinutes()) : supplier.maxHour  .toUTCString()
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/suppliers");
                });
        }
    };

    const fetchSellers = () => {
        SellerActions.findAll()
            .then(response => setSellers(response))
            .catch(error => console.log(error));
    };

    const handleChange = ({ currentTarget }) => setSupplier({...supplier, [currentTarget.name]: currentTarget.value});

    const onHourChange = hour => setSupplier({...supplier, maxHour: hour});

    const handleDaysChange = days => setSupplier({...supplier, days});

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSupplier({...supplier, seller: newSeller });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedSupplier = getFormattedSupplier();
        console.log(formattedSupplier);
        const request = !editing ? SupplierActions.create(formattedSupplier) : SupplierActions.update(id, formattedSupplier);
        request.then(response => {
                    setErrors(defaultErrors);
                    //TODO : Flash notification de succès
                    history.replace("/components/suppliers");
                })
               .catch( error => {
                    const { response } = error;
                    if (isDefined(response)) {
                        const { violations } = response.data;
                        if (violations) {
                            const apiErrors = {};
                            violations.forEach(({propertyPath, message}) => {
                                apiErrors[propertyPath] = message;
                            });
                            setErrors(apiErrors);
                        }
                        //TODO : Flash notification d'erreur
                    } else 
                        console.log(error);
               });
    }

    const getFormattedSupplier = () => {
        return {
            ...supplier, 
            seller: supplier.seller['@id'], 
            provisionMin: getFloat(supplier.provisionMin), 
            deliveryMin: getFloat(supplier.deliveryMin), 
            dayInterval: getInt(supplier.dayInterval),
            maxHour: new Date(supplier.maxHour[0]).toLocaleString('en-EN', { timeZone: timezone})
        };
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un fournisseur" : "Modifier le fournisseur \"" + supplier.name + "\"" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ supplier.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du fournisseur"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                { isDefined(supplier.seller) && 
                                    <CCol xs="12" sm="6">
                                        <Select name="seller" label="Vendeur" value={ supplier.seller.id } onChange={ handleSellerChange }>
                                            { sellers.map(seller => <option key={seller.id} value={ seller.id }>{ seller.name }</option>) }
                                        </Select>
                                    </CCol>
                                }
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="email">Email</CLabel>
                                        <CInput
                                            id="email"
                                            name="email"
                                            value={ supplier.email }
                                            onChange={ handleChange }
                                            placeholder="Email du fournisseur"
                                            invalid={ errors.email.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.email }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="phone">Portable</CLabel>
                                        <CInput
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={ supplier.phone }
                                            onChange={ handleChange }
                                            placeholder="Portable du fournisseur"
                                            invalid={ errors.phone.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.phone }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            <hr className="mx-2"/>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="provisionMin">Minimum de commande</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="provisionMin"
                                                name="provisionMin"
                                                value={ supplier.provisionMin }
                                                onChange={ handleChange }
                                                placeholder="Coût minimum de commande"
                                                invalid={ errors.provisionMin.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.provisionMin }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="deliveryMin">Minimum pour livraison</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="deliveryMin"
                                                name="deliveryMin"
                                                value={ supplier.deliveryMin }
                                                onChange={ handleChange }
                                                placeholder="Coût minimum pour livraison"
                                                invalid={ errors.deliveryMin.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.deliveryMin }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="provisionMin">Heure limite de commande</CLabel>
                                        <CInputGroup>
                                                <Flatpickr
                                                    name="maxHour"
                                                    value={ supplier.maxHour }
                                                    onChange={ onHourChange }
                                                    className={`form-control`}
                                                    options={{
                                                        enableTime: true,
                                                        noCalendar: true,
                                                        dateFormat: "H:i",
                                                        time_24hr: true,
                                                        locale: French,
                                                        defaultDate: "12:00"
                                                    }}
                                                />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-alarm"/></CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.provisionMin }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="dayInterval">Jour(s) de préparation</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="dayInterval"
                                                name="dayInterval"
                                                value={ supplier.dayInterval }
                                                onChange={ handleChange }
                                                placeholder="Coût minimum pour livraison"
                                                invalid={ errors.dayInterval.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.dayInterval }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" className="mx-0">
                                    <SelectMultiple name="openedFor" label="Jours désservis" value={ supplier.days } error={ errors.days } onChange={ handleDaysChange } data={ getWeekDays() }/>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/suppliers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Supplier;