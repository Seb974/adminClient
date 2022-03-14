import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import StoreActions from 'src/services/StoreActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AddressPanel from 'src/components/userPages/AddressPanel';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import Select from 'src/components/forms/Select';
import SellerActions from 'src/services/SellerActions';
import PlatformContext from 'src/contexts/PlatformContext';
import { Spinner } from 'react-bootstrap';
import GroupActions from 'src/services/GroupActions';

const Store = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const [editing, setEditing] = useState(false);
    const initialInformations =  AddressPanel.getInitialInformations();
    const [informations, setInformations] = useState(initialInformations);
    const defaultErrors = {name:"", main: "", phone: "", address: "", address2: "", zipcode: "", city: "", position: "", user: "", apiKey: "", url: "", storeGroup: "", isTaxIncluded: "" };
    const [store, setStore] = useState({ name: "", main: false, user: "", apiKey: "", url: "", storeGroup: null, isTaxIncluded: true });
    const [sellers, setSellers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [errors, setErrors] = useState(defaultErrors);
    const [intern, setIntern] = useState(!Roles.isSeller(currentUser));
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    const successMessage = "Les informations de la caisse sont à jour.";
    const failMessage = "Un problème est survenu lors de l'envoi des informations à la caisse.\n";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Informations non mis à jour' };

    useEffect(() => {
        fetchStore(id);
        fetchSellers();
        fetchGroups();
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
            .catch(error => history.replace("/components/stores"));
    };

    const fetchGroups = () => {
        GroupActions
            .findGroupsWithStoreAccess()
            .then(response => {
                setGroups(response);
                if (!isDefined(selectedGroup))
                    setSelectedGroup(response[0]);
            })
            .catch(error => history.replace("/components/stores"));
    };

    const fetchStore = id => {
        if (id !== "new") {
            setEditing(true);
            StoreActions.find(id)
                .then( response => {
                    const {metas, isTaxIncluded, ...dbStore} = response;
                    setStore({...dbStore, isTaxIncluded: isDefined(isTaxIncluded) ? isTaxIncluded : store.isTaxIncluded});
                    setInformations(metas);
                    setIntern(isDefined(response.platform));
                    if (isDefinedAndNotVoid(response.managers))
                        setManagers(response.managers);
                    if (isDefined(response.seller))
                        setSelectedSeller(response.seller);
                    if (isDefined(response.storeGroup))
                        setSelectedGroup(response.storeGroup);
                })
                .catch(error => history.replace("/components/stores"));
        }
    };

    const getFormattedStore = () => {
        const { apiKey, ...publicStore } = store;
        const newStore = {
            ...publicStore, 
            metas: {...informations, isRelaypoint: false}, 
            managers: isDefinedAndNotVoid(managers) ? managers.map(u => u['@id']) : [],
            platform : intern ? platform['@id'] : null,
            seller: !intern ? selectedSeller['@id'] : null,
            storeGroup: selectedGroup['@id']
        }
        return isDefined(apiKey) && apiKey.length > 0 ? {...newStore, apiKey} : newStore;
    };

    const handleTaxInclusion = e => setStore({...store, isTaxIncluded: !store.isTaxIncluded});

    const handleSellerChange= ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSeller);
    };

    const handleGroupChange = ({ currentTarget }) => {
        const newGroup = groups.find(g => g.id ===  parseInt(currentTarget.value));
        setSelectedGroup(newGroup);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const storeToWrite = getFormattedStore();
        const request = !editing ? StoreActions.create(storeToWrite) : StoreActions.update(id, storeToWrite);
        request.then(response => {
                    setErrors(defaultErrors);
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
                   }
               });
    };

    const HandleUpdateCategories = e => {
        e.preventDefault();
        setCategoriesLoading(true);
        StoreActions
            .sendCategories(store)
            .then(response => {
                setCategoriesLoading(false);
                addToast(successToast);
            })
            .catch(error => {
                setCategoriesLoading(false);
                addToast(failToast);
            });
    };

    const HandleUpdateProducts = e => {
        e.preventDefault();
        setProductsLoading(true);
        StoreActions
            .sendProducts(store)
            .then(response => {
                setProductsLoading(false);
                addToast(successToast);
            })
            .catch(error => {
                setProductsLoading(false);
                addToast(failToast);
            });
    };

    const addToast = newToast => setToasts([...toasts, newToast]);

    const toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
    })();

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
                                        <CCol tag="label" xs="8" sm="8" md="8" className="col-form-label">Lié au stock principal</CCol>
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
                                    <CCol xs="12" sm="12" md="6">
                                        <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                        </Select>
                                    </CCol>
                                    <CCol xs="12" sm="12" md="6">
                                        <Select name="storeGroup" label="Catégorie tarifaire" value={ isDefined(selectedGroup) ? selectedGroup.id : 1 } onChange={ handleGroupChange }>
                                            { groups.map(role => <option key={ role.id } value={ role.id }>{ role.label }</option> ) }
                                        </Select>
                                    </CCol>
                                </CRow>
                            }
                            <hr className="my-3"/>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="4">
                                    <CLabel>Lien à une caisse <span className="text-primary font-weight-bold">Hiboutik</span></CLabel>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4">
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="url">URL du compte</CLabel>
                                        <CInput
                                            id="url"
                                            name="url"
                                            value={ store.url }
                                            onChange={ handleChange }
                                            placeholder="Adresse du compte Hiboutik"
                                            invalid={ errors.url.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.url }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="my-4">
                                    <CFormGroup row className="mb-0 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isTaxIncluded" className="mr-0" color="dark" shape="pill" variant="opposite" checked={ store.isTaxIncluded } onChange={ handleTaxInclusion }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            TVA incluse dans les prix de la caisse
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="user">Utilisateur</CLabel>
                                        <CInput
                                            id="user"
                                            name="user"
                                            value={ store.user }
                                            onChange={ handleChange }
                                            placeholder="Nom d'utilisateur"
                                            invalid={ errors.user.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.user }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="apiKey">Clé API</CLabel>
                                        <CInput
                                            type="password"
                                            id="apiKey"
                                            name="apiKey"
                                            value={ informations.apiKey }
                                            onChange={ handleChange }
                                            placeholder="Clé secrète"
                                            invalid={ errors.apiKey.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.apiKey }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            
                            <CRow className="mt-4">
                                <CCol xs="12" sm="12" md="4">
                                    <CLabel>Mettre à jour les données</CLabel>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="text-center">
                                    <CButton size="sm" color="warning" onClick={ HandleUpdateCategories } style={{width: "110px", minWidth: "110px", height: "30.2px", minHeight: "30.2px"}}>
                                        { categoriesLoading ?
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                                <span className="sr-only">Loading...</span>
                                            </>
                                            : <><CIcon name="cil-columns"/> Catégories</>
                                        }
                                    </CButton>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="text-center">
                                    <CButton size="sm" color="warning" onClick={ HandleUpdateProducts } style={{width: "110px", minWidth: "110px", height: "30.2px", minHeight: "30.2px"}}>
                                        { productsLoading ?
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                                <span className="sr-only">Loading...</span>
                                            </>
                                            : <><CIcon name="cil-fastfood"/> Produits</>
                                        }
                                    </CButton>
                                </CCol>
                            </CRow>
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
            <CCol sm="12" lg="6">
              {Object.keys(toasters).map((toasterKey) => (
                <CToaster
                  position={toasterKey}
                  key={'toaster' + toasterKey}
                >
                  {
                    toasters[toasterKey].map((toast, key)=>{
                    return(
                      <CToast
                        key={ 'toast' + key }
                        show={ true }
                        autohide={ toast.autohide }
                        fade={ toast.fade }
                        color={ toast.color }
                        style={{ color: 'white' }}
                      >
                        <CToastHeader closeButton={ toast.closeButton }>
                            { toast.title }
                        </CToastHeader>
                        <CToastBody style={{ backgroundColor: 'white', color: "black" }}>
                            { toast.messsage }
                        </CToastBody>
                      </CToast>
                    )
                  })
                  }
                </CToaster>
              ))}
            </CCol>
        </CRow>
    );
}
 
export default Store;