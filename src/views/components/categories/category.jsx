import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryActions from 'src/services/CategoryActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import GroupActions from 'src/services/GroupActions';
import CatalogActions from 'src/services/CatalogActions';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Restriction from 'src/components/restrictions/restriction';


const CategoryPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [groups, setGroups] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [editing, setEditing] = useState(false);
    const [category, setCategory] = useState({ name: "", userGroups: [], catalogs: [], restrictions: [] });
    const [errors, setErrors] = useState({ name: "", userGroups: "", catalogs: "", restrictions: "" });

    useEffect(() => {
        fetchGroups();
        fetchCatalogs();
        fetchCategory(id);
    }, []);

    useEffect(() => fetchCategory(id), [id]);

    useEffect(() => {
        if (category.userGroups.length === 0 && groups.length > 0)
            setCategory({...category, userGroups: groups});
        if (category.userGroups.length > 0 && !Object.keys(category.userGroups[0]).includes('label') && groups.length > 0)
            setCategory({...category, userGroups: category.userGroups.map(userGroup => groups.find(group => group['@id'] === userGroup))});
    }, [category, groups]);

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => setGroups(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/categories");
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
            history.replace("/components/categories");
        });
    };

    const fetchCategory = id => {
        if (id !== "new") {
            setEditing(true);
            CategoryActions.find(id)
                .then(response => {
                    let dbCatalogs = [];
                    if (isDefinedAndNotVoid(response.catalogs)) {
                        dbCatalogs = response.catalogs.map(c => {
                            return {...c, value: c.id, label: c.name, isFixed: false};
                        });
                    }
                    setCategory({
                        ...response, 
                        catalogs: dbCatalogs, 
                        restrictions: isDefinedAndNotVoid(response.restrictions) ? response.restrictions : []
                    });
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/categories");
                });
        }
    };

    const handleUsersChange = userGroups => setCategory(category => ({...category, userGroups}));
    const handleChange = ({ currentTarget }) => setCategory({...category, [currentTarget.name]: currentTarget.value});
    const handleCatalogsChange = catalogs => setCategory(category => ({...category, catalogs}));

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedCategory = getFormattedCategory();
        console.log(formattedCategory);

        const request = !editing ? CategoryActions.create(formattedCategory) : CategoryActions.update(id, formattedCategory);
        request.then(response => {
                    setErrors({name: "", });
                    //TODO : Flash notification de succès
                    history.replace("/components/categories");
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
                    //TODO : Flash notification d'erreur
               });
    };

    const handleAddRule = () => {
        const { catalogs, restrictions } = category;
        const catalog = catalogs.find(c => restrictions.find(r => r.catalog.id === c.id) === undefined);
        setCategory({
            ...category, 
            restrictions: [...restrictions, { catalog, quantity: "", unit: "U", count: isDefinedAndNotVoid(restrictions) ? restrictions[restrictions.length -1].count + 1 : 0}]
        });
    };

    const handleDeleteRule = ({ currentTarget }) => {
        const { name } = currentTarget
        const { restrictions } = category;
        setCategory({
            ...category, 
            restrictions: restrictions.filter(r => parseInt(r.count) !== parseInt(name))
        });
    };

    const getFormattedCategory = () => {
        return {
            ...category,
            userGroups: category.userGroups.map(group => group['@id']),
            catalogs: category.catalogs.map(c => c['@id']),
            restrictions: category.restrictions.map(r => ({ ...r, catalog: r.catalog['@id'], quantity: getFloat(r.quantity)}))
        }
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une catégorie" : "Modifier la catégorie " + category.name }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ category.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la catégorie"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="catalogs" label="Disponible sur les catalogues" value={ category.catalogs } error={ errors.catalogs } onChange={ handleCatalogsChange } data={ catalogs }/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="userGroups" label="Pour les utilisateurs" value={ category.userGroups } error={ errors.userGroups } onChange={ handleUsersChange } data={ groups }/>
                                </CCol>
                            </CRow>
                            { category.restrictions.map((restriction, index) => {
                                return <Restriction
                                            key={ index }
                                            entity={ category }
                                            restriction={ restriction } 
                                            catalogs={ category.catalogs.filter(c => category.restrictions.findIndex(r => r.count !== restriction.count && r.catalog.id === c.id) === -1) }
                                            setEntity={ setCategory }
                                            handleDeleteRule={ handleDeleteRule }
                                            errors={ errors }
                                            total={ category.catalogs.length }
                                            index={ index }
                                        />
                            })}
                            <>
                                <hr className="mt-5"/>
                                <CRow className="mt-4">
                                    <CCol xs="12" sm="12">
                                        <CButton size="sm" color="warning" onClick={ handleAddRule } disabled={ category.restrictions.length >= category.catalogs.length }><CIcon name="cil-plus"/> Ajouter une restriction</CButton>
                                    </CCol>
                                </CRow>
                            </>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/categories" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default CategoryPage;