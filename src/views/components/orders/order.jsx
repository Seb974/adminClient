import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import OrderActions from 'src/services/OrderActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CFormGroup, CInvalidFeedback, CLabel, CRow, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import CIcon from '@coreui/icons-react';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Items from 'src/components/preparationPages/Items';
import UserSearchSimple from 'src/components/forms/UserSearchSimple';
import ClientPart from 'src/components/preparationPages/ClientPart';
import AuthContext from 'src/contexts/AuthContext';
import DeliveryContext from 'src/contexts/DeliveryContext';
import CityActions from 'src/services/CityActions';
import { getOrderToWrite, validateForm } from 'src/helpers/checkout';
import GroupActions from 'src/services/GroupActions';
import UserActions from 'src/services/UserActions';
import Roles from 'src/config/Roles';
import Select from 'src/components/forms/Select';
import { getStatus } from 'src/helpers/orders';
import CatalogContext from 'src/contexts/CatalogContext';
import ContainerContext from 'src/contexts/ContainerContext';
import { getPackages } from 'src/helpers/containers';
import PlatformContext from 'src/contexts/PlatformContext';
import { Spinner } from 'react-bootstrap';

const Order = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const { catalogs } = useContext(CatalogContext);
    const { platform } = useContext(PlatformContext);
    const { containers } = useContext(ContainerContext);
    const { currentUser, selectedCatalog, setSettings, settings, supervisor } = useContext(AuthContext);
    const { setCities, condition, relaypoints, setCondition } = useContext(DeliveryContext);
    const [order, setOrder] = useState({ name: "", email: "", deliveryDate: new Date(), notification: "No", platform: platform['@id'] });
    const defaultErrors = { name: "", email: "", deliveryDate: "", phone: "", address: "" };
    const [informations, setInformations] = useState({ phone: '', address: '', address2: '', zipcode: '', city: '', position: isDefined(selectedCatalog) ? selectedCatalog.center : [0, 0]});
    const [errors, setErrors] = useState(defaultErrors);
    const defaultItem = { product: null, variation: null, size: null, count: 0, orderedQty: "", preparedQty: "", deliveredQty: "", price: 0, unit: ""}
    const [objectDiscount, setObjectDiscount] = useState(null);
    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([defaultItem]);
    const [user, setUser] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [minDate, setMinDate] = useState(new Date());
    const [selectedUser, setSelectedUser] = useState(null);
    const [catalog, setCatalog] = useState(selectedCatalog);
    const [packages, setPackages] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const statuses = getStatus();
    const failMessage = "Des informations sont manquantes ou erronées. Vérifiez s'il vous plaît le formulaire."
    const failToast = { position: 'top-right', autohide: 5000, closeButton: true, fade: true, color: 'danger', messsage: failMessage, title: 'Commande invalide' };

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchCities();
        fetchGroups();
        fetchOrder(id);
    }, []);

    useEffect(() => fetchOrder(id), [id]);

    useEffect(() => {
        setUserInformations();
    }, [user]);
    
    useEffect(() => {
        if (id === "new" && isDefined(supervisor) && !isDefined(user))
            setUser(supervisor.users[0]);
    }, []);

    useEffect(() => {
        if (isDefined(catalog))
            setInformations({...informations, position: catalog.center })
    },[catalog]);

    useEffect(() => {
        if (isDefined(catalog) && catalog.needsParcel) {
            const itemsToPack = items.filter(i => (typeof i.orderedQty === 'string' && i.orderedQty.length > 0) || typeof i.orderedQty === 'number').map(i => ({...i, quantity: getFloat(i.orderedQty)}));
            const newPackages = getPackages(itemsToPack, containers);
            setPackages(newPackages);
        } else if (packages.length > 0) {
            setPackages([]);
        }
    }, [items, catalog]);

    const fetchOrder = id => {
        if (id !== "new") {
            setEditing(true);
            OrderActions.find(id)
                .then(response => {
                    setOrder({...response, name: response.name, email: response.email, deliveryDate: new Date(response.deliveryDate), notification: isDefined(response.notification) ? response.notification : "No"});
                    setItems(response.items.map((item, key) => ({...item, count: key})));
                    setInformations(response.metas);
                    setCondition(response.appliedCondition);
                    setMinDate(new Date(response.deliveryDate));
                    setCatalog(catalogs.find(c => c['@id'] === response.catalog['@id']));
                    if (isDefined(response.user))
                        fetchUser(response.user);
                    if (isDefinedAndNotVoid(response.packages))
                        setPackages(response.packages);
                })
                .catch(error => history.replace("/components/preparations"));
        }
    };

    const fetchCities = () => {
        CityActions
            .findAll()
            .then(response => setCities(response))
            .catch(error => history.replace("/components/preparations"));
    };

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => setGroups(response))
            .catch(error => history.replace("/components/preparations"));
    };

    const fetchUser = user => {
        UserActions
            .find(user.id)
            .then(response => setUser(response))
            .catch(error => history.replace("/components/preparations"));
    };

    const addToast = newToast => setToasts([...toasts, newToast]);

    const setUserInformations = () => {
        if (isDefined(user)) {
            setOrder({...order, name: user.name, email: user.email});
            if (hasCompleteProfile(user) )
               setInformations(user.metas);
        } 
    };

    const hasCompleteProfile = (user) => {
        return isDefined(user.metas) && isDefined(user.metas.address) &&
               isDefined(user.metas.zipcode) && isDefined(user.metas.city) &&
               isDefined(user.metas.position);
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setOrder({...order, deliveryDate: newDate});
    };

    const handleStatusChange = ({ currentTarget }) => {
        setOrder({...order, status: currentTarget.value});
    };

    const handleSupervisorUserChange = ({ currentTarget }) => {
        const newUser = supervisor.users.find(u => parseInt(u.id) === parseInt(currentTarget.value));
        setSelectedUser(newUser);
    };

    const handleCatalogChange = ({ currentTarget }) => {
        const newCatalog = catalogs.find(c => c.id === parseInt(currentTarget.value));
        setCatalog(newCatalog);
    };

    const handleNotificationChange = ({ currentTarget }) => setOrder({...order, notification: currentTarget.value});

    const handleSubmit = () => {
        const newErrors = validateForm(order, informations, (isDefined(order.calalog) ? order.catalog : catalog), condition, relaypoints);
        if (isDefined(newErrors) && Object.keys(newErrors).length > 0) {
            setErrors({...errors, ...newErrors});
            addToast(failToast);
        } else {
            setLoading(true);
            const orderToWrite = getOrderToWrite(order, user, informations, items, order.deliveryDate, objectDiscount, catalog, condition, settings);
            const request = !editing ? OrderActions.create(orderToWrite) : OrderActions.patch(id, orderToWrite);
            request.then(response => {
                setErrors(defaultErrors);
                setLoading(false);
                history.replace("/components/preparations");
            })
            .catch( ({ response }) => {
                setLoading(false);
                const { violations } = response.data;
                if (violations) {
                    const apiErrors = {};
                    violations.forEach(({propertyPath, message}, i) => {
                        apiErrors[propertyPath] = message;
                    });
                    setErrors(apiErrors);
                    addToast(failToast);
                }
            });
        }
    };

    const toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
    })();

    return !isDefined(order) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Commander pour un client" : "Modifier la commande " + (isDefined(order.id) ? order.id.toString().padStart(10, '0') : + "" ) }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <Tabs defaultActiveKey="items" id="uncontrolled-tab-example">
                            <Tab eventKey="items" title="Commande">
                                <CRow>
                                    <CCol xs="12" sm="12" md="6" className="mt-4">
                                        <CFormGroup>
                                            <CLabel htmlFor="name">Date de livraison</CLabel>
                                            <Flatpickr
                                                name="deliveryDate"
                                                value={ order.deliveryDate }
                                                onChange={ onDateChange }
                                                className="form-control form-control-sm"
                                                options={{
                                                    mode: "single",
                                                    dateFormat: "d/m/Y",
                                                    minDate: minDate,
                                                    locale: French,
                                                    disable: [(date) => date.getDay() === 0],
                                                }}
                                                style={{ height: "35px" }}
                                            />
                                            <CInvalidFeedback>{ errors.deliveryDate }</CInvalidFeedback>
                                        </CFormGroup>
                                    </CCol>
                                    { !(isAdmin || Roles.isPicker(currentUser)) && isDefined(supervisor) ?
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
                                            <Select className="mr-2" name="selectedUser" label="Pour le compte de" onChange={ handleSupervisorUserChange } value={ isDefined(user) ? user.id : 0 }>
                                                { supervisor.users.map(user => <option value={ user.id }>{ user.name + " - " + user.email }</option>) }
                                            </Select>
                                        </CCol>
                                     : (isAdmin || Roles.isPicker(currentUser)) && editing ?
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
                                            <Select name="status" label="Statut" onChange={ handleStatusChange } value={ order.status }>
                                                { statuses.map((status, i) => <option key={ status.value } value={ status.value }>{ status.label }</option>) }
                                            </Select>
                                        </CCol>
                                     : (isAdmin || Roles.isPicker(currentUser)) && !editing ?
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
                                            <Select className="mr-2" name="catalog" label="Destination" onChange={ handleCatalogChange } value={ isDefined(catalog) ? catalog.id : 0 }>
                                                { catalogs.map(c => <option value={ c.id }>{ c.name }</option>) }
                                            </Select>
                                        </CCol>
                                    : <></>
                                    }
                                </CRow>
                                { (isAdmin || Roles.isPicker(currentUser)) &&
                                    <>
                                        <hr className="my-2"/>
                                        <UserSearchSimple user={ user } setUser={ setUser } label="Client"/>
                                    </>
                                }
                                <hr/>
                                <Items items={ items } setItems={ setItems } defaultItem={ defaultItem } editing={ editing } packages={ packages } order={ order } user={ user }/>

                            </Tab>
                                <Tab eventKey="metas" title="Client">
                                    <ClientPart
                                        user={ order }
                                        informations={ informations }
                                        objectDiscount={ objectDiscount }
                                        displayedRelaypoints={ relaypoints }
                                        setUser={ setOrder }
                                        setInformations={ setInformations }
                                        setDiscount={ setDiscount }
                                        setObjectDiscount={ setObjectDiscount }
                                        errors={ errors }
                                        catalog={ catalog }
                                    />
                                </Tab>
                        </Tabs>
                        <hr className="mt-5 mb-5"/>
                        { id === "new" && 
                            <CRow>
                                <CCol xs="12" sm="12" md="12" className="my-4">
                                    <Select className="mr-2" name="catalog" label="Prévenir le client" onChange={ handleNotificationChange } value={ order.notification }>
                                        <option value={ "No" }>{ "Non" }</option>
                                        <option value={ "Email" }>{ "Email" }</option>
                                    </Select>
                                </CCol>
                            </CRow>
                        }
                        <CRow className="mt-4 d-flex justify-content-center">
                            <CButton onClick={ handleSubmit } size="sm" color="success" style={{ minWidth: '114px'}}>
                                { loading ?
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                : 
                                    <><CIcon name="cil-save"/> Enregistrer</>
                                }
                            </CButton>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/preparations" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
            <CCol sm="12" lg="6">
              { Object.keys(toasters).map((toasterKey) => (
                <CToaster position={toasterKey} key={'toaster' + toasterKey}>
                    { toasters[toasterKey].map((toast, key)=> {
                        return (
                            <CToast key={ 'toast' + key } 
                                    show={ true } 
                                    autohide={ toast.autohide } 
                                    fade={ toast.fade } 
                                    color={ toast.color } 
                                    style={{ color: 'white' }}
                            >
                                <CToastHeader closeButton={ toast.closeButton }>{ toast.title }</CToastHeader>
                                <CToastBody style={{ backgroundColor: 'white', color: "black" }}>{ toast.messsage }</CToastBody>
                            </CToast>
                        )})
                    }
                </CToaster>
              ))}
            </CCol>
        </CRow>
    );
}
 
export default Order;