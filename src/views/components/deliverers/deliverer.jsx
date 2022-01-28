import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import DelivererActions from 'src/services/DelivererActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import '../../../assets/css/searchBar.css';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import UserSearchSimple from 'src/components/forms/UserSearchSimple';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import CatalogActions from 'src/services/CatalogActions';
import TaxActions from 'src/services/TaxActions';
import Select from 'src/components/forms/Select';

const Deliverer = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const defaultDeliverer = {name: "", cost: "", isPercent: "", isIntern: "", ownerRate: ""};
    const [deliverer, setDeliverer] = useState({...defaultDeliverer, isPercent: false, isIntern: false });
    const [errors, setErrors] = useState(defaultDeliverer);
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [selectedTax, setSelectedTax] = useState(null);
    
    useEffect(() => {
        fetchCatalogs();
        fetchTaxes();
        fetchDeliverer(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchDeliverer(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (isDefinedAndNotVoid(catalogs) && !isDefined(selectedCatalog))
            setSelectedCatalog(catalogs[0]);
    }, [catalogs, selectedCatalog]);

    useEffect(() => {
        if (isDefinedAndNotVoid(catalogs) && !isDefined(selectedTax))
            setSelectedTax(taxes[0]);
    }, [catalogs, selectedTax]);
    
    const handleChange = ({ currentTarget }) => setDeliverer({...deliverer, [currentTarget.name]: currentTarget.value});
    const handleIsPercent = ({ currentTarget }) => setDeliverer({... deliverer, [currentTarget.name] : !deliverer[currentTarget.name]});
    const handleIsIntern = ({ currentTarget }) => {
        setUsers(!deliverer[currentTarget.name] ? null : []);
        setDeliverer({... deliverer, [currentTarget.name] : !deliverer[currentTarget.name]});
    };

    const fetchDeliverer = id => {
        if (id !== "new") {
            setEditing(true);
            DelivererActions.find(id)
                .then(response => {
                    setDeliverer(response);
                    getRelatedUsers(response);
                    getCatalog(response);
                    getTax(response);
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/deliverers");
                });
        }
    };

    const fetchCatalogs = () => {
        CatalogActions.findAll()
            .then(response => setCatalogs(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/deliverers");
            });
    };

    const fetchTaxes = () => {
        let request = TaxActions.findAll();
        request
            .then(response => setTaxes(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/deliverers");
            });
    };

    const handleCatalogChange = ({ currentTarget }) => {
        const newCatalog = catalogs.find(catalog => catalog.id === parseInt(currentTarget.value));
        setSelectedCatalog(newCatalog);
    };

    const handleTaxChange = ({ currentTarget }) => {
        const newTax = taxes.find(tax => tax.id === parseInt(currentTarget.value));
        setSelectedTax(newTax);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const delivererToWrite = getDelivererToWrite();
        const request = !editing ? DelivererActions.create(delivererToWrite) : DelivererActions.update(id, delivererToWrite);
        request.then(response => {
                    setErrors(defaultDeliverer);
                    //TODO : Flash notification de succès
                    history.replace("/components/deliverers");
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

    const getRelatedUsers = deliverer => {
        if (isDefinedAndNotVoid(deliverer.users)) {
            const dbUsers = deliverer.isIntern ? deliverer.users[0] : deliverer.users;
            setUsers(dbUsers);
        } else {
            const nullUser = deliverer.isIntern ? null : [];
            setUsers(nullUser);
        }
    };

    const getCatalog = deliverer => {
        if (isDefined(deliverer.catalog))
            setSelectedCatalog(deliverer.catalog);
    };

    const getTax = deliverer => {
        if (isDefined(deliverer.tax))
            setSelectedTax(deliverer.tax);
    };

    const getDelivererToWrite = () => {
        return {
            ...deliverer,
            ownerRate: !deliverer.isIntern ? getFloat(deliverer.ownerRate) : 0,
            cost: !deliverer.isIntern ? getFloat(deliverer.cost) : 0,
            users: isDefinedAndNotVoid(users) ? (!deliverer.isIntern ? users.map(user => user['@id']) : [users['@id']]) : [],
            catalog: !deliverer.isIntern ? selectedCatalog['@id'] : null,
            tax: !deliverer.isIntern ? selectedTax['@id'] : null,
            isPercent: false
        };
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un livreur</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ deliverer.name }
                                            onChange={ handleChange }
                                            placeholder="Nom du livreur"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isIntern" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ deliverer.isIntern } onChange={ handleIsIntern }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Interne</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            { !deliverer.isIntern && isAdmin ?
                                <>
                                    <CRow>
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
                                            <Select className="mr-2" name="catalog" label="Catalogue" onChange={ handleCatalogChange } value={ isDefined(selectedCatalog) ? selectedCatalog.id : 0 }>
                                                { catalogs.map(catalog => <option key={ catalog.id } value={ catalog.id }>{ catalog.name }</option>) }
                                            </Select>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="6" className="mt-4">
                                            <Select className="mr-2" name="tax" label="TVA" onChange={ handleTaxChange } value={ isDefined(selectedTax) ? selectedTax.id : 0 }>
                                                { taxes.map(tax => <option key={ tax.id } value={ tax.id }>{ tax.name }</option>) }
                                            </Select>
                                        </CCol>
                                    </CRow>
                                    <CRow className="mt-4">
                                        <CCol xs="12" sm="12" md="6">
                                            <CFormGroup>
                                                <CLabel htmlFor="name">{ deliverer.isPercent ? "Pourcentage sur livraison" : "Montant de la livraison" }</CLabel>
                                                <CInputGroup>
                                                    <CInput
                                                        id="cost"
                                                        name="cost"
                                                        type="number"
                                                        value={ deliverer.cost }
                                                        onChange={ handleChange }
                                                        placeholder="Coût de la livraison"
                                                        invalid={ errors.cost.length > 0 }
                                                    />
                                                    <CInputGroupAppend>
                                                        <CInputGroupText>{ deliverer.isPercent ? '%' : '€' }</CInputGroupText>
                                                    </CInputGroupAppend>
                                                </CInputGroup>
                                                <CInvalidFeedback>{ errors.cost }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                            <CCol xs="12" sm="12" md="6">
                                                <CFormGroup>
                                                    <CLabel htmlFor="name">Rétribution sur livraison</CLabel>
                                                    <CInputGroup>
                                                        <CInput
                                                            id="ownerRate"
                                                            name="ownerRate"
                                                            type="number"
                                                            value={ deliverer.ownerRate }
                                                            onChange={ handleChange }
                                                            placeholder="Marge par livraison"
                                                            invalid={ errors.ownerRate.length > 0 } 
                                                        />
                                                        <CInputGroupAppend>
                                                            <CInputGroupText>%</CInputGroupText>
                                                        </CInputGroupAppend>
                                                    </CInputGroup>
                                                    <CInvalidFeedback>{ errors.ownerRate }</CInvalidFeedback>
                                                </CFormGroup>
                                            </CCol>
                                    </CRow>
                                    {/* <CRow>
                                        <CCol xs="12" md="6" className="mt-4">
                                            <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                                <CCol xs="3" sm="2" md="3">
                                                    <CSwitch name="isPercent" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ deliverer.isPercent } onChange={ handleIsPercent }/>
                                                </CCol>
                                                <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Coût en pourcentage</CCol>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow> */}
                                    <UserSearchMultiple users={ users } setUsers={ setUsers }/>
                                </>
                            :
                                <>
                                    <hr className="mt-4 mx-2"/>
                                    <UserSearchSimple user={ users } setUser={ setUsers }/>
                                </>
                            }
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/deliverers" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Deliverer;