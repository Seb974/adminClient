import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import SupplierActions from 'src/services/SupplierActions';
import SellerActions from '../../../services/SellerActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';


const Supplier = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [isAdmin, setIsAdmin] = useState([]);
    const [editing, setEditing] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const [supplier, setSupplier] = useState({ name: "", seller: null, email: "", phone: "" });
    const [sellers, setSellers] = useState([]);
    const [errors, setErrors] = useState({ name: "", seller: "", email: "", phone: "" });

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

    const handleChange = ({ currentTarget }) => setSupplier({...supplier, [currentTarget.name]: currentTarget.value});

    const fetchSupplier = id => {
        if (id !== "new") {
            setEditing(true);
            SupplierActions.find(id)
                .then(response => setSupplier(response))
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

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSupplier({...supplier, seller: newSeller });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedSupplier = {...supplier, seller: supplier.seller['@id']};
        const request = !editing ? SupplierActions.create(formattedSupplier) : SupplierActions.update(id, formattedSupplier);
        request.then(response => {
                    setErrors({ name: "", seller: "", email: "", phone: "" });
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