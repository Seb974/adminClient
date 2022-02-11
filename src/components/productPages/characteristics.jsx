import React, { useContext, useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSelect, CTextarea } from '@coreui/react';
import Select from 'src/components/forms/Select';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Image from '../forms/image';
import GroupActions from 'src/services/GroupActions';
import CatalogActions from 'src/services/CatalogActions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import SellerActions from 'src/services/SellerActions';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import Suppliers from './Suppliers';
import DepartmentActions from 'src/services/DepartmentActions';

const Characteristics = ({ product, categories, type, setProduct, errors, history}) => {

    const { currentUser } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        fetchGroups();
        fetchSellers();
        fetchCatalogs();
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (product.userGroups.length === 0 && groups.length > 0)
            setProduct({...product, userGroups: groups});
        if (product.userGroups.length > 0 && !Object.keys(product.userGroups[0]).includes('label') && groups.length > 0)
            setProduct({...product, userGroups: product.userGroups.map(userGroup => groups.find(group => group.value === userGroup.value))});
    }, [product, groups]);

    useEffect(() => {
        if (!isDefinedAndNotVoid(product.catalogs) && catalogs.length > 0)
            setProduct({...product, catalogs: catalogs});
    }, [product, catalogs]);

    useEffect(() => {
        if (!isDefinedAndNotVoid(product.seller) && sellers.length > 0)
            setProduct({...product, seller: sellers[0]});
    }, [product, sellers]);

    useEffect(() => {
        if (!isDefinedAndNotVoid(product.department) && departments.length > 0)
            setProduct({...product, department: departments[0]});
    }, [product, departments]);

    const handleUsersChange = userGroups => setProduct(product => ({...product, userGroups}));
    const handleCatalogsChange = catalogs => setProduct(product => ({...product, catalogs}));
    const handleCategoriesChange = categories => setProduct(product => ({...product, categories}));
    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});
    const handleSellerChange = ({ currentTarget }) => setProduct({...product, seller : sellers.find(seller => seller.id === parseInt(currentTarget.value))});
    const handleDepartmentChange = ({ currentTarget }) => setProduct({...product, department : departments.find(d => d.id === parseInt(currentTarget.value))});

    const fetchGroups = () => {
        GroupActions.findAll()
                    .then(response => setGroups(response))
                    .catch(error => {
                        // TODO : Notification flash d'une erreur
                        history.replace("/components/products");
                    });
    };

    const fetchDepartments = () => {
        DepartmentActions
            .findAll()
            .then(response => setDepartments(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/products");
            });
    };

    const fetchCatalogs = () => {
        CatalogActions
            .findAll()
            .then(response => {
                const suitedCatalogs = response.map(catalog => {
                    return {...catalog, value: catalog.id, label: catalog.name, isFixed: false};
                });
                setCatalogs(suitedCatalogs);
            })
            .catch(error => {
            // TODO : Notification flash d'une erreur
            history.replace("/components/products");
        });
    };

    const fetchSellers = () => {
        SellerActions.findAll()
                    .then(response => setSellers(response))
                    .catch(error => {
                        // TODO : Notification flash d'une erreur
                        history.replace("/components/products");
                    });
    };

    return (
        <>
            <CRow>
                <CCol xs="12" sm="6">
                    <CFormGroup>
                        <CLabel htmlFor="name">Nom</CLabel>
                        <CInput
                            id="name"
                            name="name"
                            value={ product.name }
                            onChange={ handleChange }
                            placeholder="Nom du produit"
                            invalid={ errors.name.length > 0 } 
                        />
                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="6">
                    <CFormGroup>
                        <CLabel htmlFor="sku">Code</CLabel>
                        <CInput
                            id="sku"
                            name="sku"
                            value={ product.sku }
                            onChange={ handleChange }
                            placeholder="Code interne"
                            disabled
                        />
                    </CFormGroup>
                </CCol>
            </CRow>
            <Image entity={ product } setEntity={ setProduct } isLandscape={ false } sizes="600 x 800"/>
            <CRow className="mb-3">
                <CCol xs="12" sm="12">
                    <Select name="seller" label="Vendeur" value={ isDefined(product.seller) ? product.seller.id : 0 } error={ errors.seller } onChange={ handleSellerChange } required={ true }>
                        { sellers.map(seller => <option value={ seller.id }>{ seller.name }</option>) }
                    </Select>
                </CCol>
            </CRow>
            <Suppliers product={ product } setProduct={ setProduct } />
            <CRow className="mb-3">
                <CCol xs="12" sm="6">
                    <SelectMultiple name="categories" label="Catégories" value={ product.categories } error={ errors.categories } onChange={ handleCategoriesChange } data={ categories.map(category => ({value: category.id, label: category.name, isFixed: false})) }/>
                </CCol>
                <CCol xs="12" sm="6">
                    <CLabel htmlFor="select">Rayon</CLabel>
                    <CSelect custom name="productGroup" id="productGroup" value={ isDefined(product.department) ? product.department.id : 0 } onChange={ handleDepartmentChange }>
                        {/* <option value="J + 1">J + 1</option>
                        <option value="J + 3">J + 3</option>
                        <option value="J + 6">J + 6</option>
                        <option value="J + 10">J + 10</option> */}
                        { departments.map(d => <option value={ d.id }>{ d.name }</option>) }
                    </CSelect>
                </CCol>
            </CRow>
            { isAdmin &&
                <>
                    <CRow className="mb-3">
                        <CCol xs="12" sm="12">
                            <SelectMultiple name="userGroups" label="Pour les utilisateurs" value={ product.userGroups } error={ errors.userGroups } onChange={ handleUsersChange } data={ groups }/>
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol xs="12" sm="12">
                            <SelectMultiple name="catalogs" label="Sur les catalogues" value={ product.catalogs } error={ errors.catalogs } onChange={ handleCatalogsChange } data={ catalogs }/>
                        </CCol>
                    </CRow>
                </>
            }
            <CFormGroup row className="mb-4">
                <CCol xs="12" md="12">
                    <CLabel htmlFor="textarea-input">Description</CLabel>
                    <CTextarea name="fullDescription" id="fullDescription" rows="9" placeholder="Content..." onChange={ handleChange } value={ product.fullDescription } disabled={type === "mixed"}/>
                </CCol>
            </CFormGroup>
        </>
    );
}
 
export default Characteristics;