import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import SellerActions from 'src/services/SellerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import '../../../assets/css/searchBar.css';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import Image from 'src/components/forms/image';
import { Tabs, Tab } from 'react-bootstrap';
import AddressPanel from 'src/components/userPages/AddressPanel';
import ImgixAccount from 'src/components/Imgix/ImgixAccount';

const Seller = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const initialInformations =  AddressPanel.getInitialInformations();
    const [informations, setInformations] = useState(initialInformations);
    const defaultSeller = {name: "", delay: "", ownerRate: "", needsRecovery: "", recoveryDelay: "", delayInDays: "", image: "", isActive: "", phone: "", address: "", address2: "", zipcode: "", city: "", position: "", imgDomain: "", imgKey: "" };
    const [seller, setSeller] = useState({...defaultSeller, needsRecovery: false, delayInDays: true, image: null, isActive: true });
    const [errors, setErrors] = useState(defaultSeller);
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState([]);
    
    useEffect(() => {
        fetchSeller(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchSeller(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
    const handleChange = ({ currentTarget }) => setSeller({...seller, [currentTarget.name]: currentTarget.value});

    const onPhoneChange = ({ currentTarget }) => setInformations({...informations, phone: currentTarget.value});

    const fetchSeller = id => {
        if (id !== "new") {
            setEditing(true);
            SellerActions.find(id)
                .then(response => {
                    const {metas, imgDomain, imgKey, ...dbSeller} = response;
                    const viewedSeller = isDefined(imgDomain) ? {...dbSeller, imgDomain} : dbSeller;
                    setSeller(viewedSeller);
                    if (isDefined(metas))
                        setInformations(metas);
                    if (isDefinedAndNotVoid(response.users))
                        setUsers(response.users);
                })
                .catch(error => history.replace("/components/sellers"));
        }
    };

    const handleRecovery = ({ currentTarget }) => setSeller({...seller, needsRecovery: !seller.needsRecovery});
    const handleStatus = ({ currentTarget }) => setSeller({...seller, isActive: !seller.isActive});
    const handleDelayType = ({ currentTarget }) => setSeller({...seller, delayInDays: !seller.delayInDays});

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!seller.needsRecovery || (seller.needsRecovery && delaysConsistency())) {
            const sellerToWrite = await getSellerWithImage();
            const request = !editing ? SellerActions.create(sellerToWrite) : SellerActions.update(id, sellerToWrite);
            request.then(response => {
                        setErrors(defaultSeller);
                        history.replace("/components/sellers");
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
        } else {
            setErrors({...errors, delay: "Le délai de préparation ne peut être inférieur au délai de récupération"});
        }
    };

    const delaysConsistency = () => {
        const today = new Date();
        const preparationDelay = getDelayFromDays(today, seller.delay);
        const recovery = seller.delayInDays ? 
            getDelayFromDays(today, parseInt(seller.recoveryDelay)) :
            getDelayFromMinutes(today, parseInt(seller.recoveryDelay));
        return recovery.getTime() <= preparationDelay.getTime();
    };

    const getDelayFromDays = (today, days) => {
        return new Date(today.getFullYear(), today.getMonth(), (today.getDate() + parseInt(days)), 9, 0, 0);
    };

    const getDelayFromMinutes = (today, minutes) => {
        const days = Math.floor(minutes / 60) >= 24 ? Math.floor( Math.floor(minutes / 60) / 24) : 0;
        const hours = days > 0 ? Math.floor((minutes - days * 24 * 60)/ 60) : Math.floor(minutes / 60);
        const trueMinutes = minutes % 60;
        return new Date(today.getFullYear(), today.getMonth(), (today.getDate() + days), (9 + hours), trueMinutes, 0);
    };

    const getSellerToWrite = () => {
        return {
            ...seller, 
            ownerRate: getFloat(seller.ownerRate),
            delay: getInt(seller.delay),
            recoveryDelay: seller.needsRecovery ? getInt(seller.recoveryDelay) : null,
            users: isDefinedAndNotVoid(users) ? users.map(user => user['@id']) : [],
            metas: {...informations, isRelaypoint: false},
            stores: isDefinedAndNotVoid(seller.stores) ? seller.stores.map(s =>s['@id']) : []
        };
    };

    const getSellerWithImage = async () => {
        let sellerWithImage = getSellerToWrite();
        if (seller.image) {
             if (!seller.image.filePath) {
                const image = await SellerActions.createImage(seller.image);
                sellerWithImage = {...sellerWithImage, image: image['@id']};
            } else {
                sellerWithImage = {...sellerWithImage, image: sellerWithImage.image['@id']};
            }
        }
        return sellerWithImage;
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un vendeur</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3">
                                <Tab eventKey="home" title="Informations générales">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
                                            <CFormGroup>
                                                <CLabel htmlFor="name">Nom</CLabel>
                                                <CInput
                                                    id="name"
                                                    name="name"
                                                    value={ seller.name }
                                                    onChange={ handleChange }
                                                    placeholder="Nom du vendeur"
                                                    invalid={ errors.name.length > 0 } 
                                                />
                                                <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
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
                                        <CCol xs="12" md="12">
                                            <Image entity={ seller } setEntity={ setSeller } isLandscape={ true }/>
                                        </CCol>
                                    </CRow>
                                    <CRow>
                                        <h5 className="ml-3 mt-3">Adresse du stock principal</h5>
                                    </CRow>
                                    <AddressPanel informations={ informations } setInformations={ setInformations } errors={ errors } />
                                    <UserSearchMultiple users={ users } setUsers={ setUsers }/>
                                </Tab>
                                { Roles.hasAdminPrivileges(currentUser) && 
                                    <Tab eventKey="accounts" title="Paramètres">
                                        <CRow>
                                            <CCol xs="12" md="6" className="my-4">
                                                <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                                    <CCol xs="3" sm="2" md="3">
                                                        <CSwitch name="isActive" className="mr-1" color="danger" shape="pill" variant="opposite" checked={ seller.isActive } onChange={ handleStatus }/>
                                                    </CCol>
                                                    <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Actif</CCol>
                                                </CFormGroup>
                                            </CCol>
                                            <CCol xs="12" md="6" className="my-4">
                                                <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                                    <CCol xs="3" sm="2" md="3">
                                                        <CSwitch name="needsRecovery" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ seller.needsRecovery } onChange={ handleRecovery }/>
                                                    </CCol>
                                                    <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Récupération des produits</CCol>
                                                </CFormGroup>
                                            </CCol>
                                        </CRow>

                                        { seller.needsRecovery &&
                                            <CRow className="mt-3">
                                                <CCol xs="12" md="6" className="mt-4">
                                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                                        <CCol xs="3" sm="2" md="3">
                                                            <CSwitch name="delayInDays" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ seller.delayInDays } onChange={ handleDelayType }/>
                                                        </CCol>
                                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Décalage en jour</CCol>
                                                    </CFormGroup>
                                                </CCol>
                                                <CCol xs="12" md="6">
                                                    <CFormGroup>
                                                        <CLabel htmlFor="name">Délais entre récupération et livraison</CLabel>
                                                        <CInputGroup>
                                                            <CInput
                                                                id="recoveryDelay"
                                                                name="recoveryDelay"
                                                                type="number"
                                                                value={ seller.recoveryDelay }
                                                                onChange={ handleChange }
                                                                placeholder=" "
                                                                invalid={ errors.recoveryDelay.length > 0 } 
                                                            />
                                                            <CInputGroupAppend>
                                                                <CInputGroupText>{ seller.delayInDays ? "Jour(s)" : "Minute(s)" }</CInputGroupText>
                                                            </CInputGroupAppend>
                                                        </CInputGroup>
                                                        <CInvalidFeedback>{ errors.recoveryDelay }</CInvalidFeedback>
                                                    </CFormGroup>
                                                </CCol>
                                            </CRow>
                                        }

                                        <CRow className="mt-4">
                                            { isAdmin && 
                                                <CCol xs="12" sm="12" md="6">
                                                    <CFormGroup>
                                                        <CLabel htmlFor="name">Rétribution sur vente</CLabel>
                                                        <CInputGroup>
                                                            <CInput
                                                                id="ownerRate"
                                                                name="ownerRate"
                                                                type="number"
                                                                value={ seller.ownerRate }
                                                                onChange={ handleChange }
                                                                placeholder="Marge par vente"
                                                                invalid={ errors.ownerRate.length > 0 } 
                                                            />
                                                            <CInputGroupAppend>
                                                                <CInputGroupText>%</CInputGroupText>
                                                            </CInputGroupAppend>
                                                        </CInputGroup>
                                                        <CInvalidFeedback>{ errors.ownerRate }</CInvalidFeedback>
                                                    </CFormGroup>
                                                </CCol>
                                            }
                                            <CCol xs="12" md={isAdmin ? "6" : "12"}>
                                                <CFormGroup>
                                                    <CLabel htmlFor="name">Délais entre réception et livraison</CLabel>
                                                    <CInputGroup>
                                                        <CInput
                                                            id="delay"
                                                            name="delay"
                                                            type="number"
                                                            value={ seller.delay }
                                                            onChange={ handleChange }
                                                            placeholder=" "
                                                            invalid={ errors.delay.length > 0 } 
                                                        />
                                                        <CInputGroupAppend>
                                                            <CInputGroupText>Jour(s)</CInputGroupText>
                                                        </CInputGroupAppend>
                                                        <CInvalidFeedback>{ errors.delay }</CInvalidFeedback>
                                                    </CInputGroup>
                                                </CFormGroup>
                                            </CCol>
                                        </CRow>
                                        <hr/>
                                            <ImgixAccount imageOwner={ seller } handleChange={ handleChange }/>
                                    </Tab>
                                }
                            </Tabs>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/sellers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Seller;