import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import StoreActions from 'src/services/StoreActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AddressPanel from 'src/components/userPages/AddressPanel';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import Select from 'src/components/forms/Select';
import SellerActions from 'src/services/SellerActions';
import PlatformContext from 'src/contexts/PlatformContext';

const Store = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const [editing, setEditing] = useState(false);
    const initialInformations =  AddressPanel.getInitialInformations();
    const [informations, setInformations] = useState(initialInformations);
    const defaultErrors = {name:"", main: "", phone: "", address: "", address2: "", zipcode: "", city: "", position: "" };
    const [store, setStore] = useState({ name: "", main: false });
    const [sellers, setSellers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [errors, setErrors] = useState(defaultErrors);
    const [intern, setIntern] = useState(!Roles.isSeller(currentUser));
    const [selectedSeller, setSelectedSeller] = useState(null);

    useEffect(() => {
        fetchStore(id);
        fetchSellers();
    }, []);

    useEffect(() => fetchStore(id), [id]);

    const onPhoneChange = ({ currentTarget }) => setInformations({...informations, phone: currentTarget.value});
    const handleChange = ({ currentTarget }) => setStore({...store, [currentTarget.name]: currentTarget.value});
    const handleCheckBoxes = ({ currentTarget }) => setStore({...store, [currentTarget.name]: !store[currentTarget.name]});
    const handleIntern = e => setIntern(!intern);

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => {
                setSellers(response);
                if (!isDefined(selectedSeller))
                    setSelectedSeller(response[0]);
            })
            .catch(error => console.log(error));
    };

    const fetchStore = id => {
        if (id !== "new") {
            setEditing(true);
            StoreActions.find(id)
                .then( response => {
                    console.log(response);
                    const {metas, ...dbStore} = response;
                    setStore(dbStore);
                    setInformations(metas);
                    setIntern(isDefined(response.platform));
                    if (isDefinedAndNotVoid(response.managers))
                        setManagers(response.managers);
                    if (isDefined(response.seller))
                        setSelectedSeller(response.seller);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/stores");
                });
        }
    };

    const getFormattedStore = () => {
        return {
            ...store, 
            metas: {...informations, isRelaypoint: false}, 
            managers: isDefinedAndNotVoid(managers) ? managers.map(u => u['@id']) : [],
            platform : intern ? platform['@id'] : null,
            seller: !intern ? selectedSeller['@id'] : null
        }
    };

    const handleSellerChange= ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSeller);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const storeToWrite = getFormattedStore();
        console.log(storeToWrite);
        const request = !editing ? StoreActions.create(storeToWrite) : StoreActions.update(id, storeToWrite);
        request.then(response => {
                    setErrors(defaultErrors);
                    //TODO : Flash notification de succès
                    history.replace("/components/stores");
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
                        <h3>Créer une boutique physique</h3>
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
                                            value={ store.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la boutique"
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
                            <hr className="mb-5"/>
                            <CFormGroup row>
                                <CCol xs="6" md="6" className="mt-2">
                                    <CFormGroup row className="mb-0 ml-1 d-flex justify-content-start align-items-center">
                                        <CCol xs="4" sm="4" md="4">
                                            <CSwitch name="main" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ store.main } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="8" sm="8" md="8" className="col-form-label">Principal</CCol>
                                    </CFormGroup>
                                </CCol>
                                { Roles.hasAdminPrivileges(currentUser) &&
                                    <CCol xs="6" md="6" className="mt-2">
                                        <CFormGroup row className="mb-0 ml-1 d-flex justify-content-start align-items-center">
                                            <CCol xs="4" sm="4" md="4">
                                                <CSwitch name="main" className="mr-1" color="warning" shape="pill" variant="opposite" checked={ intern } onChange={ handleIntern }/>
                                            </CCol>
                                            <CCol tag="label" xs="8" sm="8" md="8" className="col-form-label">Interne</CCol>
                                        </CFormGroup>
                                    </CCol>
                                }
                            </CFormGroup>
                            { !intern &&
                                <CRow className="mt-4 my-2">
                                    <CCol xs="12" sm="12" md="12">
                                        <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                        </Select>
                                    </CCol>
                                </CRow>
                            }
                            
                            <UserSearchMultiple users={ managers } setUsers={ setManagers }/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/stores" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Store;