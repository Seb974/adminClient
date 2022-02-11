import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DepartmentActions from 'src/services/DepartmentActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';


const DepartmentPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [department, setDepartment] = useState({ name: "" });
    const [errors, setErrors] = useState({ name: "" });

    useEffect(() => fetchDepartment(id), []);
    useEffect(() => fetchDepartment(id), [id]);

    const fetchDepartment = id => {
        if (id !== "new") {
            setEditing(true);
            DepartmentActions.find(id)
                .then(response => setDepartment(response))
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/departments");
                });
        }
    };

    const handleChange = ({ currentTarget }) => setDepartment({...department, [currentTarget.name]: currentTarget.value});

    const handleSubmit = (e) => {
        e.preventDefault();
        const request = !editing ? DepartmentActions.create(department) : DepartmentActions.update(id, department);
        request.then(response => {
                    setErrors({name: "", });
                    //TODO : Flash notification de succès
                    history.replace("/components/departments");
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
                        <h3>{!editing ? "Créer un rayon" : "Modifier le rayon " + department.name }</h3>
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
                                            value={ department.name }
                                            onChange={ handleChange }
                                            placeholder="Nom de la catégorie"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/departments" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default DepartmentPage;