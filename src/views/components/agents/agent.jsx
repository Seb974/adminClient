import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgentActions from 'src/services/AgentActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, isDefined } from 'src/helpers/utils';
import Image from 'src/components/forms/image';

const Agent = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const [agent, setAgent] = useState({ name: "", role: "", image: null });
    const [errors, setErrors] = useState({ name: "", role: "", image: "" });

    useEffect(() => {
        fetchAgent(id);
    }, []);

    useEffect(() => fetchAgent(id), [id]);

    const handleChange = ({ currentTarget }) => setAgent({...agent, [currentTarget.name]: currentTarget.value});

    const fetchAgent = id => {
        if (id !== "new") {
            setEditing(true);
            AgentActions.find(id)
                .then(response => setAgent(response))
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/agents");
                });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedAgent = await getAgentWithImage();
        const request = !editing ? AgentActions.create(formattedAgent) : AgentActions.update(id, formattedAgent);
        request.then(response => {
                    setErrors({ name: "", role: "", image: "" });
                    //TODO : Flash notification de succès
                    history.replace("/components/agents");
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

    const getAgentWithImage = async () => {

        let image = null;
        let agentWithImage = {...agent};

        if (agent.image && !agent.image.filePath)
            image = await AgentActions.createImage(agent.image);

        return {
            ...agentWithImage,
            image: isDefined(image) ? image['@id'] : (isDefined(agentWithImage.image) ? agentWithImage.image['@id'] : null),
        }
    };

    return !isDefined(agent) ? <></> : (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un membre de l'équipe" : "Modifier le membre '" + agent.name + "'" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nom</CLabel>
                                        <CInput
                                            id="name"
                                            name="name"
                                            value={ agent.name }
                                            onChange={ handleChange }
                                            placeholder="Prénom"
                                            invalid={ errors.name.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="role">Poste</CLabel>
                                        <CInput
                                            id="role"
                                            name="role"
                                            value={ agent.role }
                                            onChange={ handleChange }
                                            placeholder="Poste occupé"
                                            invalid={ errors.role.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.role }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="12">
                                    <Image entity={ agent } setEntity={ setAgent } isLandscape={ false } sizes="270 x 330" imageName={ "image" } tip={ " de profil" }/>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/agents" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Agent;