import React, { useState, useEffect, useContext } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import ProvisionActions from 'src/services/ProvisionActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import ProductsContext from 'src/contexts/ProductsContext';
import PlatformContext from 'src/contexts/PlatformContext';
import Roles from 'src/config/Roles';
import Select from 'src/components/forms/Select';
import Goods from 'src/components/provisionPages/Goods';
import SupplierActions from 'src/services/SupplierActions';
import SellerActions from 'src/services/SellerActions';

const Provision = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultVariant = null;
    const [editing, setEditing] = useState(false);
    const { products } = useContext(ProductsContext);
    const { currentUser } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const [provision, setProvision] = useState({ provisionDate: new Date(), status: "ORDERED" });
    const defaultErrors = { provisionDate: "" };
    const [errors, setErrors] = useState(defaultErrors);
    const defaultGood = {product: null, variation: null, size: null, count: 0, quantity: "", received: "", price: "", unit: "U"};
    const [goods, setGoods] = useState([defaultGood]);
    const [sellers, setSellers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);

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
        if (isDefinedAndNotVoid(sellers)) {
            getAvailableProducts();
            if (!isDefined(provision.seller))
                setProvision({...provision, seller: sellers[0]});
        }
    }, [sellers, products]);


    const getAvailableProducts = () => {
        const newAvaibleProducts = products.filter(p => {
            return sellers.findIndex(s => s.id === p.seller.id) !== -1 && (!isDefined(p.isFabricated) || !p.isFabricated);
        });
        setAvailableProducts(newAvaibleProducts);
    };

    const fetchProvision = id => {
        if (id !== "new") {
            setEditing(true);
            ProvisionActions.find(id)
                .then(response => {
                    setProvision({
                        ...response, 
                        provisionDate: new Date(response.provisionDate), 
                        status: isDefined(response.status) ? response.status : provision.status
                    });
                    setGoods(response.goods.map((good, key) => ({
                        ...good,
                        price: isDefined(good.price) ? good.price : "",
                        received: isDefined(good.received) ? good.received : "",
                        product: products.find(product => good.product.id === product.id),
                        count: key
                    })));
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/provisions");
                });
        }
    };

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => setSuppliers(response))
            .catch(error => console.log(error));
    };

    const fetchSellers = () => {
        SellerActions
            .findActiveSellers()
            .then(response => setSellers(response))
            .catch(error => console.log(error));
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setProvision({...provision, provisionDate: newDate});
    };

    const onStatusChange = ({ currentTarget }) => setProvision({...provision, [currentTarget.name]: currentTarget.value});

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(s => parseInt(s.id) === parseInt(currentTarget.value));
        setProvision({...provision, supplier: newSupplier});
    };

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(s => parseInt(s.id) === parseInt(currentTarget.value));
        setProvision({...provision, seller: newSeller});
    };

    const handleSubmit = () => {
        const provisionToWrite = getProvisionToWrite();
        console.log(provisionToWrite);
        // const request = !editing ? ProvisionActions.create(provisionToWrite) : ProvisionActions.patch(id, provisionToWrite);
        // request.then(response => {
        //     setErrors(defaultErrors);
        //     //TODO : Flash notification de succès
        //     history.replace("/components/provisions");
        // })
        // .catch( ({ response }) => {
        //     const { violations } = response.data;
        //     if (violations) {
        //         const apiErrors = {};
        //         violations.forEach(({propertyPath, message}) => {
        //             apiErrors[propertyPath] = message;
        //         });
        //         setErrors(apiErrors);
        //     }
        //     //TODO : Flash notification d'erreur
        // });
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
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="seller" label="Pour le compte de" onChange={ handleSellerChange } value={ isDefined(provision.seller) ? provision.seller.id : 0 }>
                                        { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
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
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="status" label="Statut de la commande" onChange={ onStatusChange } value={ isDefined(provision.status) ? provision.status : "ORDERED" }>
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