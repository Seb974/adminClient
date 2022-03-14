import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DepartmentActions from 'src/services/DepartmentActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import ParentDepartmentActions from 'src/services/ParentDepartmentActions';
import Select from 'src/components/forms/Select';
import { isDefined } from 'src/helpers/utils';


const DepartmentPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [department, setDepartment] = useState({ name: "", parentDepartment: null });
    const [parentDepartments, setParentDepartments] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [errors, setErrors] = useState({ name: "", parentDepartment: "" });

    useEffect(() => {
        fetchDepartment(id);
        fetchParentDepartment();
    }, []);

    useEffect(() => fetchDepartment(id), [id]);

    const fetchDepartment = id => {
        if (id !== "new") {
            setEditing(true);
            DepartmentActions.find(id)
                .then(response =>{ 
                    setDepartment(response);
                    if (isDefined(response.parentDepartment))
                        setSelectedParent(response.parentDepartment);
                })
                .catch(error => history.replace("/components/departments"));
        }
    };

    const fetchParentDepartment = id => {
        if (id !== "new") {
            ParentDepartmentActions.findAll()
                .then(response => {
                    setParentDepartments(response);
                    if (!isDefined(selectedParent))
                        setSelectedParent(response[0]);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    const handleChange = ({ currentTarget }) => setDepartment({...department, [currentTarget.name]: currentTarget.value});

    const handleParentChange = ({ currentTarget }) =>  {
        const newParent = parentDepartments.find(p => p.id === parseInt(currentTarget.value));
        setSelectedParent(newParent);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDepartment = {...department, parentDepartment: selectedParent['@id']};
        const request = !editing ? DepartmentActions.create(newDepartment) : DepartmentActions.update(id, newDepartment);
        request.then(response => {
                    setErrors({name: "", });
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
                                <CCol xs="12" sm="12" md="6">
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
                                <CCol xs="12" sm="12" md="6">
                                    <Select className="mr-2" name="store" label="Département" value={ isDefined(selectedParent) ? selectedParent.id : 1 } onChange={ handleParentChange }>
                                        { parentDepartments.map(p => <option key={ p.id } value={ p.id }>{ p.name }</option>) }
                                    </Select>
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