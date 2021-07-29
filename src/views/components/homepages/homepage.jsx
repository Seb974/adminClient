import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomepageActions from 'src/services/HomepageActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const Homepage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [homepage, setHomepage] = useState({ name: "", selected: false });
    const [errors, setErrors] = useState({ name: "", selected: "" });

    useEffect(() => fetchHomepage(id), []);

    useEffect(() => fetchHomepage(id), [id]);

    const handleChange = ({ currentTarget }) => setHomepage({...homepage, [currentTarget.name]: currentTarget.value});

    const handleSelection = ({ currentTarget }) => setHomepage({...homepage, [currentTarget.name]: !homepage[currentTarget.name]})

    const fetchHomepage = id => {
        if (id !== "new") {
            setEditing(true);
            HomepageActions.find(id)
                .then( response => setHomepage(response))
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/homepages");
                });
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const homepageToEdit = {
            ...homepage, 
            heroes: isDefinedAndNotVoid(homepage.heroes) ? homepage.heroes.map(h => h['@id']) : [],
            banners: isDefinedAndNotVoid(homepage.banners) ? homepage.banners.map(b => b['@id']) : [],
            countdowns: isDefinedAndNotVoid(homepage.countdowns) ? homepage.countdowns.map(c => c['@id']) : []
        };
        const request = !editing ? HomepageActions.create(homepageToEdit) : HomepageActions.update(id, homepageToEdit);
        request.then(response => {
                    setErrors({name: "", selected: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/homepages");
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


    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une page d'accueil" : "Modifier la page d'accueil '" + homepage.name + "'" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="9">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ homepage.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la page d'accueil"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="3" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="selected" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ homepage.selected } onChange={ handleSelection }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Page d'accueil actuelle</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/homepages" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Homepage;