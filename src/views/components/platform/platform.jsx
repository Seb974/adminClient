import CIcon from '@coreui/icons-react';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInputGroupAppend, CInputGroupText, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { Link } from 'react-router-dom';
import UserSearchMultiple from 'src/components/forms/UserSearchMultiple';
import AddressPanel from 'src/components/userPages/AddressPanel';
import api from 'src/config/api';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import { CONTAINER } from 'src/helpers/platform';
import 'src/views/editors/text-editors/TextEditors.scss';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import PlatformActions from 'src/services/PlatformActions';
import { Tabs, Tab } from 'react-bootstrap';
const Platform = ({ history, match }) => {

    const termsRef = useRef(null);
    const noticesRef = useRef(null);
    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const initialPosition = AddressPanel.getInitialInformations();
    const initialInformations = {...initialPosition};
    const defaultSocial = {name: "", link: "", icon: "", count: 0};
    const [platform, setPlatform] = useState({name: "", email: ""});
    const initialErrors = {name: "", email: "", ...initialInformations};
    const [informations, setInformations] = useState(initialInformations);
    const [errors, setErrors] = useState(initialErrors);
    const [pickers, setPickers] = useState([]);
    const [isAdmin, setIsAdmin] = useState([]);
    const [terms, setTerms] = useState("");
    const [notices, setNotices] = useState("");
    const [socials, setSocials] = useState([defaultSocial]);
    
    useEffect(() => {
        fetchPlatform();
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => {
        fetchPlatform();
    }, [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
    const handleChange = ({ currentTarget }) => setPlatform({...platform, [currentTarget.name]: currentTarget.value});
    const handleInformationChange = ({ currentTarget }) => setInformations({...informations, [currentTarget.name]: currentTarget.value});

    const fetchPlatform = () => {
        PlatformActions
            .find()
            .then(response => {
                const {metas, pickers, terms, notices, socials, ...mainPlatform} = response;
                setPlatform(mainPlatform);
                if (isDefinedAndNotVoid(metas))
                    setInformations(metas);
                if (isDefinedAndNotVoid(pickers))
                    setPickers(pickers);
                if (isDefined(terms))
                    setTerms(terms)
                if (isDefined(notices))
                    setNotices(notices);
                if (isDefinedAndNotVoid(socials))
                    setSocials(socials.map((s, i) => ({...s, count: i})))
            })
            .catch(error => {
                console.log(error);
                // TODO : Notification flash d'une erreur
                history.replace("/dashboard");
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const platformToWrite = getPlatformToWrite();
        const request = !isDefined(platform['@id']) ? PlatformActions.create(platformToWrite) : PlatformActions.update(platform.id, platformToWrite);
        request.then(response => {
                    setErrors(initialErrors);
                    //TODO : Flash notification de succès
                    // history.replace("#");
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

    const getPlatformToWrite = () => {
        return {
            ...platform,
            metas: {...informations},
            pickers: pickers.map(picker => picker['@id']),
            terms,
            notices,
            socials
        };
    };

    const noticesImageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const range = noticesRef.current.getEditor().getSelection();
            const res = await PlatformActions.createImage(input.files[0]);
            noticesRef.current.editor.insertEmbed(range.index, 'image', `${ api.API_DOMAIN }${ res.contentUrl }`);
            noticesRef.current.editor.setSelection(range.index + 1);
        };
    };

    const termsImageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const range = termsRef.current.getEditor().getSelection();
            const res = await PlatformActions.createImage(input.files[0]);
            termsRef.current.editor.insertEmbed(range.index, 'image', `${ api.API_DOMAIN }${ res.contentUrl }`);
            termsRef.current.editor.setSelection(range.index + 1);
        };
    };

    const handleAddSocial = () => setSocials([...socials, {...defaultSocial, count: socials[socials.length - 1].count + 1}]);
    const handleDeleteSocial = ({ currentTarget }) => setSocials(socials.filter(s => s.count !== parseInt(currentTarget.name)));

    const handleSocialChange = ({ currentTarget }) => {
        const updated = socials.find(s => s.count === parseInt(currentTarget.name));
        if (isDefined(updated)) {
            setSocials(socials.map(s => s.count === updated.count ? {...updated, [currentTarget.id]: currentTarget.value} : s));
        }
    };

    const termsModules = useMemo(() => ({ toolbar: { container: CONTAINER, handlers: { image: termsImageHandler } }}), []);
    const noticesModules = useMemo(() => ({ toolbar: { container: CONTAINER, handlers: { image: noticesImageHandler } }}), []);

    return !isDefined(platform) ? <></> : (
                    <CRow>
                        <CCol xs="12" sm="12">
                            <CCard>
                                <CCardHeader>
                                    <h3>Modifiez vos informations</h3>
                                </CCardHeader>
                                <CCardBody>
                                    <CForm onSubmit={ handleSubmit }>
                                        <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" className="mb-3">
                                            <Tab eventKey="home" title="Informations générales">
                                                <CRow className="mb-3">
                                                    <CCol xs="12" sm="12" md="4">
                                                        <CFormGroup>
                                                            <CLabel htmlFor="name">Nom</CLabel>
                                                            <CInput
                                                                id="name"
                                                                name="name"
                                                                value={ platform.name }
                                                                onChange={ handleChange }
                                                                placeholder="Nom de l'établissement"
                                                                invalid={ errors.name.length > 0 } 
                                                            />
                                                            <CInvalidFeedback>{ errors.name }</CInvalidFeedback>
                                                        </CFormGroup>
                                                    </CCol>
                                                    <CCol xs="12" sm="12" md="4">
                                                        <CFormGroup>
                                                            <CLabel htmlFor="phone">N° Téléphone</CLabel>
                                                            <CInput
                                                                id="phone"
                                                                name="phone"
                                                                type="tel"
                                                                value={ informations.phone }
                                                                onChange={ handleInformationChange }
                                                                placeholder="N° de téléphone"
                                                                invalid={ errors.phone.length > 0 } 
                                                            />
                                                            <CInvalidFeedback>{ errors.phone }</CInvalidFeedback>
                                                        </CFormGroup>
                                                    </CCol>
                                                    <CCol xs="12" sm="12" md="4">
                                                        <CFormGroup>
                                                            <CLabel htmlFor="name">Adresse email</CLabel>
                                                            <CInput
                                                                id="email"
                                                                name="email"
                                                                type="email"
                                                                value={ platform.email }
                                                                onChange={ handleChange }
                                                                placeholder="adresse email de contact"
                                                                invalid={ errors.email.length > 0 } 
                                                            />
                                                            <CInvalidFeedback>{ errors.email }</CInvalidFeedback>
                                                        </CFormGroup>
                                                    </CCol>
                                                </CRow>
                                                <AddressPanel informations={ informations } setInformations={ setInformations } errors={ errors } />
                                                <hr/>
                                                <CRow className="mb-3">
                                                    <CCol xs="6" sm="6" md="6">
                                                        <CLabel htmlFor="name">Réseaux sociaux</CLabel>
                                                    </CCol>
                                                    <CCol xs="6" sm="6" md="6" className="text-right">
                                                        <CButton size="sm" color="warning" onClick={ handleAddSocial }><CIcon name="cil-plus"/> Ajouter</CButton> 
                                                    </CCol>
                                                </CRow>
                                                { socials.map((s, i) => {
                                                        return (
                                                            <CRow key={ i }>
                                                                <CCol xs="12" sm="12" md="4">
                                                                    <CFormGroup>
                                                                        <CLabel htmlFor="name">Nom</CLabel>
                                                                        <CInput
                                                                            id="name"
                                                                            name={ s.count }
                                                                            value={ s.name }
                                                                            onChange={ handleSocialChange }
                                                                            placeholder="Nom du réseau social"
                                                                        />
                                                                    </CFormGroup>
                                                                </CCol>
                                                                <CCol xs="12" sm="12" md="4">
                                                                    <CFormGroup>
                                                                        <CLabel htmlFor="phone">Lien</CLabel>
                                                                        <CInput
                                                                            id="link"
                                                                            name={ s.count }
                                                                            value={ s.link }
                                                                            onChange={ handleSocialChange }
                                                                            placeholder="Lien vers votre profil"
                                                                        />
                                                                    </CFormGroup>
                                                                </CCol>
                                                                <CCol xs="12" sm="12" md="2">
                                                                    <CFormGroup>
                                                                        <CLabel htmlFor="name">
                                                                            <a href="https://fontawesome.com/v5.15/icons?d=gallery&p=2" target="_blank">
                                                                                Icone <small className="mr-4"><i> - Choisir</i></small>
                                                                            </a>
                                                                            </CLabel>
                                                                        <CInput
                                                                            id="icon"
                                                                            name={ s.count }
                                                                            value={ s.icon }
                                                                            onChange={ handleSocialChange }
                                                                            placeholder="Icone du réseau social"
                                                                        />
                                                                    </CFormGroup>
                                                                </CCol>
                                                                <CCol xs="12" sm="12" md="2" className= "d-flex justify-content-center align-items-center">
                                                                <CButton 
                                                                    name={ s.count }
                                                                    size="sm" 
                                                                    color="danger" 
                                                                    onClick={ handleDeleteSocial }
                                                                >
                                                                    <CIcon name="cil-trash"/>
                                                                </CButton>
                                                                </CCol>
                                                            </CRow>
                                                        )
                                                  })
                                                }
                                                <UserSearchMultiple users={ pickers } setUsers={ setPickers }/>
                                            </Tab>
                                            <Tab eventKey="profile" title="Mentions légales">
                                                <CRow className="my-4">
                                                    <CCol xs="12" md="12">
                                                        <CLabel htmlFor="textarea-input">Mentions Légales</CLabel>
                                                        <ReactQuill value={ notices } modules={ noticesModules } onChange={ setNotices } theme="snow" ref={ noticesRef }/>
                                                    </CCol>
                                                </CRow>
                                            </Tab>
                                            <Tab eventKey="contact" title="Conditions Générales de Ventes">
                                                <CRow className="my-2">
                                                    <CCol xs="12" md="12">
                                                        <CLabel htmlFor="textarea-input">Conditions Générales de Ventes</CLabel>
                                                        <ReactQuill value={ terms } modules={ termsModules } onChange={ setTerms } theme="snow" ref={ termsRef }/>
                                                    </CCol>
                                                </CRow>
                                            </Tab>
                                        </Tabs>
                                        <CRow className="mt-4 d-flex justify-content-center">
                                            <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                                        </CRow>
                                    </CForm>
                                </CCardBody>
                                <CCardFooter>
                                    <Link to="/dashboard" className="btn btn-link">Retour à l'acccueil</Link>
                                </CCardFooter>
                            </CCard>
                        </CCol>
                    </CRow>
                
                

    );
}
 
export default Platform;