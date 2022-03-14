import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import ProvisionActions from 'src/services/ProvisionActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CFormGroup, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import PlatformContext from 'src/contexts/PlatformContext';
import Roles from 'src/config/Roles';
import Select from 'src/components/forms/Select';
import Goods from 'src/components/provisionPages/Goods';
import SupplierActions from 'src/services/SupplierActions';
import SellerActions from 'src/services/SellerActions';

const Provision = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const [provision, setProvision] = useState({ provisionDate: new Date(), status: "ORDERED", receiveMode: "livraison", sendingMode: "email" });
    const defaultErrors = { provisionDate: "" };
    const [errors, setErrors] = useState(defaultErrors);
    const defaultGood = {product: null, variation: null, size: null, count: 0, quantity: "", received: "", price: "", unit: "U"};
    const [goods, setGoods] = useState([defaultGood]);
    const [sellers, setSellers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mainView, setMainView] = useState(true);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [hasIndependencies, setHasIndependencies] = useState(false);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchSuppliers();
        fetchSellers();
        fetchProvision(id);
    }, []);

    useEffect(() => fetchProvision(id), [id]);

    useEffect(() => {
        if (isDefinedAndNotVoid(suppliers) && !isDefined(provision.supplier))
            setProvision({...provision, supplier: suppliers[0]});
    }, [suppliers, provision]);

    useEffect(() => {
        if (isDefinedAndNotVoid(sellers) && !isDefined(provision.seller)) {
            let newProvision = {...provision, seller: sellers[0]};
            if (mainView)
                newProvision = {...newProvision, metas: sellers[0].metas['@id']};
            setProvision(newProvision);
            defineStores(sellers[0]);
        }
    }, [sellers]);

    useEffect(() => {
        if (!mainView && isDefined(selectedStore))
            setProvision({...provision, metas: selectedStore.metas['@id']});
        else if (isDefined(provision.seller))
            setProvision({...provision, metas: provision.seller.metas['@id']});
    },[mainView, selectedStore]);

    const fetchProvision = id => {
        if (id !== "new") {
            setEditing(true);
            ProvisionActions.find(id)
                .then(response => {
                    setProvision({
                        ...response, 
                        provisionDate: new Date(response.provisionDate), 
                        status: isDefined(response.status) ? response.status : provision.status,
                    });
                    setGoods(response.goods.map((good, key) => ({
                        ...good,
                        price: isDefined(good.price) ? good.price : "",
                        received: isDefined(good.received) ? good.received : "",
                        count: key
                    })));
                })
                .catch(error => history.replace("/components/provisions"));
        }
    };

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => setSuppliers(response))
            .catch(error => history.replace("/components/provisions"));
    };

    const fetchSellers = () => {
        SellerActions
            .findActiveSellers()
            .then(response => {
                setSellers(response);
                
            })
            .catch(error => history.replace("/components/provisions"));
    };

    const defineStores = seller => {
        if (isDefinedAndNotVoid(seller.stores)) {
            const independantStores = seller.stores.filter(s => !s.main);
            const hasIndependency = independantStores.length > 0;
            setStores(independantStores)
            setSelectedStore(independantStores[0]);
            setHasIndependencies(hasIndependency);
        } else {
            setStores([]);
            setSelectedStore(null);
            setHasIndependencies(false);
            setMainView(true);
        }
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setProvision({...provision, provisionDate: newDate});
    };

    const onChange = ({ currentTarget }) => setProvision({...provision, [currentTarget.name]: currentTarget.value});

    const handleView = ({ currentTarget }) => setMainView(!mainView);

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(s => parseInt(s.id) === parseInt(currentTarget.value));
        setProvision({...provision, supplier: newSupplier});
    };

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(s => parseInt(s.id) === parseInt(currentTarget.value));
        setProvision({...provision, seller: newSeller, metas: newSeller.metas['@id']});
        defineStores(newSeller);
        setMainView(true);
    };

    const handleStoreChange = ({ currentTarget }) => {
        const newStore = stores.find(store => store.id === parseInt(currentTarget.value));
        setSelectedStore(newStore);
    };

    const handleSupplierInfosChange = ({ currentTarget }) => setProvision({...provision, supplier: {...provision.supplier, [currentTarget.name]: currentTarget.value} });

    const handleSubmit = () => {
        const provisionToWrite = getProvisionToWrite();
        const request = !editing ? ProvisionActions.create(provisionToWrite) : ProvisionActions.patch(id, provisionToWrite);
        request.then(response => {
            setErrors(defaultErrors);
            history.replace("/components/provisions");
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

    const getProvisionToWrite = () => {
        const { seller, supplier, provisionDate, status } = provision;
        return {
            ...provision, 
            seller: seller['@id'],
            supplier: supplier['@id'],
            provisionDate: new Date(provisionDate),
            platform: platform['@id'],
            goods: goods.map(good => {
                const { product, variation, size, price, quantity, received } = good;
                return {
                    ...good,
                    product: product['@id'],
                    variation: isDefined(variation) ? variation['@id'] : null,
                    size: isDefined(size) ? size['@id'] : null,
                    quantity: getFloat(quantity),
                    price: isDefined(price) && status === "RECEIVED" ? getFloat(price) : null,
                    received: isDefined(received) && status === "RECEIVED" ? getFloat(received) : null,
                };
            })
        }
    }

    return !isDefined(provision) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un approvisionnement" : "Modifier l'approvisionnement" }</h3>
                    </CCardHeader>
                    <CCardBody>
                            { !Roles.isStoreManager(currentUser) ?
                            <>
                                <CRow>
                                    <CCol xs="12" sm="12" md="6">
                                        <Select className="mr-2" name="seller" label="Pour le compte de" onChange={ handleSellerChange } value={ isDefined(provision.seller) ? provision.seller.id : 0 }>
                                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                        </Select>
                                    </CCol>
                                    { hasIndependencies && !mainView ?
                                        <CCol xs="12" md="6">
                                            <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                                { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                            </Select>
                                        </CCol>
                                        :
                                        <CCol xs="12" md="6">
                                            <Select className="mr-2" name="selectedStore" label="Boutique" disabled={ true }>
                                                <option value="-1">stock principal</option>
                                            </Select>
                                        </CCol>
                                    }
                                </CRow>
                                <CRow>
                                    <CCol xs="12" md="6" className="mt-4">
                                        <CFormGroup row className="mb-0 d-flex align-items-end">
                                            <CCol xs="3" sm="2" md="3">
                                                <CSwitch name="requireDeclaration" className="mr-0" color="dark" shape="pill" variant="opposite" checked={ mainView } onChange={ handleView } disabled={ !hasIndependencies }/>
                                            </CCol>
                                            <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                                Stock principal
                                            </CCol>
                                        </CFormGroup>
                                    </CCol>
                                    <CCol xs="12" sm="12" md="6" className="mt-4">
                                        <CFormGroup>
                                            <CLabel htmlFor="name">Date d'approvisionnement</CLabel>
                                            <Flatpickr
                                                name="provisionDate"
                                                value={ provision.provisionDate }
                                                onChange={ onDateChange }
                                                className="form-control form-control-sm"
                                                options={{
                                                    mode: "single",
                                                    dateFormat: "d/m/Y",
                                                    locale: French,
                                                    disable: [(date) => date.getDay() === 0],
                                                }}
                                                style={{ height: "35px" }}
                                            />
                                        </CFormGroup>
                                    </CCol>
                                </CRow>
                            </>
                            :
                            <CRow>
                                <CCol xs="12" sm="5" md="6" className="mt-4">
                                    <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                        { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                    </Select>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Date d'approvisionnement</CLabel>
                                        <Flatpickr
                                            name="provisionDate"
                                            value={ provision.provisionDate }
                                            onChange={ onDateChange }
                                            className="form-control form-control-sm"
                                            options={{
                                                mode: "single",
                                                dateFormat: "d/m/Y",
                                                locale: French,
                                                disable: [(date) => date.getDay() === 0],
                                            }}
                                            style={{ height: "35px" }}
                                        />
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            }
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="status" label="Statut de la commande" onChange={ onChange } value={ isDefined(provision.status) ? provision.status : "ORDERED" }>
                                        <option value="ORDERED">A envoyer</option>
                                        <option value="RECEIVED">Reçue</option>
                                    </Select>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="supplier" label="Fournisseur" onChange={ handleSupplierChange } value={ isDefined(provision.supplier) ? provision.supplier.id : 0 }>
                                        { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                    </Select>
                                </CCol>
                            </CRow>
                            { provision.status === "ORDERED" && 
                                <>
                                    <hr/>
                                    <CRow className="my-4">
                                        <CCol xs="12" lg="6">
                                            <CLabel>Téléphone</CLabel>
                                            <CInputGroup>
                                                <CInputGroupPrepend>
                                                    <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-phone"/></CInputGroupText>
                                                </CInputGroupPrepend>
                                                <CInput
                                                    name="phone"
                                                    value={ isDefined(provision.supplier) && isDefined(provision.supplier.phone) && provision.supplier.phone.length > 0 ? (parseInt(provision.supplier.id) !== -1 ? provision.supplier.phone : '-') : "" }
                                                    onChange={ handleSupplierInfosChange }
                                                />
                                            </CInputGroup>
                                        </CCol>
                                        <CCol xs="12" lg="6" >
                                            <CLabel>Email(s) <small className="ml-3"><i>séparation par ";"</i></small></CLabel>
                                            <CInputGroup>
                                                <CInputGroupPrepend>
                                                    <CInputGroupText style={{ minWidth: '43px'}}>@</CInputGroupText>
                                                </CInputGroupPrepend>
                                                <CInput
                                                    name="email"
                                                    value={ isDefined(provision.supplier) && isDefined(provision.supplier.email) ? (parseInt(provision.supplier.id) !== -1 ? provision.supplier.email : "-") : "" }
                                                    onChange={ handleSupplierInfosChange }
                                                />
                                            </CInputGroup>
                                        </CCol>
                                    </CRow>
                                    <CRow className="my-4">
                                        { isDefined(provision.supplier) && isDefined(provision.supplier.provisionMin) && <CCol xs="12" lg="6"><CLabel className="font-italic font-weight-bold">Minimum de commande : { provision.supplier.provisionMin.toFixed(2) } €</CLabel></CCol> }
                                        { isDefined(provision.supplier) && isDefined(provision.supplier.deliveryMin) && <CCol xs="12" lg="6"><CLabel className="font-italic font-weight-bold">Minimum pour livraison : { provision.supplier.deliveryMin.toFixed(2) } €</CLabel></CCol> }
                                    </CRow>
                                    
                                    <CRow className="my-4">
                                        <CCol xs="12" lg="6">
                                            <Select className="mr-2" name="receiveMode" label="Mode de récupération des marchandises" value={ provision.receiveMode } onChange={ onChange }>
                                                <option value={"récupération"}>{"Récupération sur place"}</option>
                                                <option value={"livraison"}>{"Livraison"}</option>
                                            </Select>
                                        </CCol>
                                        <CCol xs="12" lg="6">
                                            <Select className="mr-2" name="sendingMode" label="Mode d'envoi de la commande" value={ provision.sendingMode } onChange={ onChange }>
                                                <option value={"email"}>{"Email"}</option>
                                                <option value={"sms"}>{"SMS"}</option>
                                                <option value={"email & sms"}>{"Email & SMS"}</option>
                                            </Select>
                                        </CCol>
                                    </CRow>
                                </>
                            }
                            <hr/>
                            <Goods provision={ provision } goods={ goods } setGoods={ setGoods } defaultGood={ defaultGood } editing={ editing }/>
                        <hr className="mt-5 mb-5"/>
                        <CRow className="mt-4 d-flex justify-content-center">
                            <CButton onClick={ handleSubmit } size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/provisions" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Provision;