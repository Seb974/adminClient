import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GroupActions from 'src/services/GroupActions';
import PriceGroupActions from 'src/services/PriceGroupActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { getFloat, isDefined } from 'src/helpers/utils';

const PriceGroup = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultError = { name: "", rate: "", userGroup: "" };
    const [editing, setEditing] = useState(false);
    const [groups, setGroups] = useState([]);
    const [priceGroup, setPriceGroup] = useState({ name: "", rate: "", userGroup: [] });
    const [errors, setErrors] = useState(defaultError);

    useEffect(() => {
        fetchGroups();
        fetchPriceGroup(id);
    }, []);

    useEffect(() => fetchPriceGroup(id), [id]);

    const handleUsersChange = userGroup => setPriceGroup(priceGroup => ({...priceGroup, userGroup}));
    const handleChange = ({ currentTarget }) => setPriceGroup({...priceGroup, [currentTarget.name]: currentTarget.value});

    const fetchPriceGroup = id => {
        if (id !== "new") {
            setEditing(true);
            PriceGroupActions.find(id)
                .then( response => {
                    const userGroup = response.userGroup === null || response.userGroup === undefined ? [] :
                                      response.userGroup.map(group => ({...group, isFixed: false}));
                    setPriceGroup({...response, userGroup});
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/price_groups");
                });
        }
    }

    const fetchGroups = () => {
        GroupActions
            .findAll()
            .then(response => {
                const filteredGroups = response.filter(group => group.hasShopAccess && (group.priceGroup === null || group.priceGroup === undefined));
                setGroups(filteredGroups.map(group => ({...group, isFixed: false})));
            })
            .catch(error => console.log(error));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { userGroup } = priceGroup;
        const formattedPriceGroup = {...priceGroup, rate: getFloat(priceGroup.rate), userGroup: userGroup.map(group => group['@id'])};
        const request = !editing ? PriceGroupActions.create(formattedPriceGroup) : PriceGroupActions.update(id, formattedPriceGroup);

        request.then(response => {
                    setErrors(defaultError);
                    //TODO : Flash notification de succès
                    history.replace("/components/price_groups");
                })
               .catch( error => {
                    const { response } = error;
                    if (!isDefined(response)) {
                        const { violations } = response.data;
                        if (violations) {
                            const apiErrors = {};
                            violations.forEach(({propertyPath, message}) => {
                                apiErrors[propertyPath] = message;
                            });
                            setErrors(apiErrors);
                        }
                        //TODO : Flash notification d'erreur
                    } else {
                        console.log(error)
                    }
               });
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une catégorie" : "Modifier la catégorie de prix '" + priceGroup.name + "'" }</h3>
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
                                            value={ priceGroup.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la catégorie"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="rate">Marge idéale</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="rate"
                                                name="rate"
                                                value={ priceGroup.rate }
                                                onChange={ handleChange }
                                                placeholder="% de marge"
                                                invalid={ errors.rate.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>%</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="userGroup" label="Pour les utilisateurs" value={ priceGroup.userGroup } error={ errors.userGroup } onChange={ handleUsersChange } data={ groups }/>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/price_groups" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default PriceGroup;