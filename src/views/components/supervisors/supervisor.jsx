import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SupervisorActions from 'src/services/SupervisorActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputFile, CInputGroup, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSelect, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Select from 'src/components/forms/Select';
import { isDefinedAndNotVoid, getFloat, isDefined } from 'src/helpers/utils';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import UserSearchSimple from 'src/components/forms/UserSearchSimple';

const Supervisor = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({ role: "", supervisor: "", users: "" });
    const [supervisorEntity, setSupervisorEntity] = useState({ role: "", supervisor: null, users: [] });

    useEffect(() => fetchSupervisor(id), []);
    useEffect(() => fetchSupervisor(id), [id]);

    const fetchSupervisor = id => {
        if (id !== "new") {
            setEditing(true);
            SupervisorActions
                .find(id)
                .then(response => setSupervisorEntity(response))
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/supervisors");
                });
        }
    };

    const setUsers = newUsers => setSupervisorEntity({...supervisorEntity, users: newUsers});
    const setSupervisor = newSupervisor => setSupervisorEntity({...supervisorEntity, supervisor: newSupervisor});
    const handleChange = ({ currentTarget }) => setSupervisorEntity({...supervisorEntity, [currentTarget.name]: currentTarget.value});

    const handleSubmit = (e) => {
        e.preventDefault();
        const { supervisor, users } = supervisorEntity; 
        const supervisorToWrite = {...supervisorEntity, supervisor: supervisor['@id'], users: users.map(user => user['@id']) };
        const request = !editing ? SupervisorActions.create(supervisorToWrite) : SupervisorActions.update(id, supervisorToWrite);
        request.then(response => {
                    setErrors({name: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/supervisors");
                })
               .catch( error => {
                    const { response } = error.response;
                    if ( isDefined(response) ) {
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
                        console.log(error);
                    }
               });
    };

    return !isDefined(supervisorEntity) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une superviseur" : "Modifier '" + supervisorEntity.role + "'" }</h3> 
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="role">Fonction</CLabel>
                                        <CInput
                                            id="role"
                                            name="role"
                                            value={ supervisorEntity.role }
                                            onChange={ handleChange }
                                            placeholder="Fonction du superviseur"
                                            invalid={ errors.role.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.role }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <hr className="mt-5"/>
                            <UserSearchSimple user={ supervisorEntity.supervisor } setUser={ setSupervisor }/>
                            <UserSearchMultiple users={ supervisorEntity.users } setUsers={ setUsers }/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/supervisors" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Supervisor;