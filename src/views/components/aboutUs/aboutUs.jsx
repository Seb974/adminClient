import CIcon from '@coreui/icons-react';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CTextarea } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Image from 'src/components/forms/image';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import { isDefined } from 'src/helpers/utils';
import AboutUsActions from 'src/services/AboutUsActions';
import { SwatchesPicker } from 'react-color';

const AboutUs = ({ history, match }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const [aboutUs, setAboutUs] = useState({
        summary: "", 
        mission: "", 
        vision: "", 
        goal: "",
        headerTitle: "",
        headerSubtitle: "",
        headerTitleColor: "#fff",
        headerSubtitleColor: "#fff",
        visionTitle: "",
        missionTitle: "",
        goalTitle: "",
        serviceTitle: "",
        serviceColor: "#fff",
        productTitle: "",
        productColor: "#fff",
        supportTitle: "",
        supportColor: "#fff",
        servicePicture: null, 
        productPicture: null, 
        supportPicture: null,
        headerPicture: null
    });
    const initialErrors = {
        summary: "", 
        mission: "", 
        vision: "", 
        goal: "",
        headerTitle: "",
        headerSubtitle: "",
        headerTitleColor: "",
        headerSubtitleColor: "",
        visionTitle: "",
        missionTitle: "",
        goalTitle: "",
        serviceTitle: "",
        serviceColor: "",
        productTitle: "",
        productColor: "",
        supportTitle: "",
        supportColor: "",
        servicePicture: "", 
        productPicture: "", 
        supportPicture: "",
        headerPicture: ""
    };
    const [errors, setErrors] = useState(initialErrors);
    const [isAdmin, setIsAdmin] = useState([]);
    
    useEffect(() => {
        fetchAboutUs();
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchAboutUs(), [id]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
    const handleChange = ({ currentTarget }) => setAboutUs({...aboutUs, [currentTarget.name]: currentTarget.value});

    const handleServiceColorChange = (color, event) => setAboutUs({...aboutUs, serviceColor: color.hex});
    const handleProductColorChange = (color, event) => setAboutUs({...aboutUs, productColor: color.hex});
    const handleSupportColorChange = (color, event) => setAboutUs({...aboutUs, supportColor: color.hex});
    const handleHeaderTitleColorChange = (color, event) => setAboutUs({...aboutUs, headerTitleColor: color.hex});
    const handleHeaderSubtitleColorChange = (color, event) => setAboutUs({...aboutUs, headerSubtitleColor: color.hex});

    const fetchAboutUs = () => {
        AboutUsActions
            .find()
            .then(response => {
                if (isDefined(response))
                    setAboutUs(response);
            })
            .catch(error => history.replace("/dashboard"));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const aboutUsToWrite = await getAboutUsWithImage();
        const request = !isDefined(aboutUs['@id']) ? AboutUsActions.create(aboutUsToWrite) : AboutUsActions.update(aboutUs.id, aboutUsToWrite);
        request.then(response => setErrors(initialErrors))
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
                    }
                });
    };

    const getAboutUsWithImage = async () => {

        let headerImage = null;
        let serviceImage = null;
        let productImage = null;
        let supportImage = null;
        let aboutUsWithImage = {...aboutUs};

        if (aboutUs.headerPicture && !aboutUs.headerPicture.filePath)
            headerImage = await AboutUsActions.createHeaderImage(aboutUs.headerPicture);
        if (aboutUs.servicePicture && !aboutUs.servicePicture.filePath)
            serviceImage = await AboutUsActions.createBannerImage(aboutUs.servicePicture);
        if (aboutUs.productPicture && !aboutUs.productPicture.filePath)
            productImage = await AboutUsActions.createBannerImage(aboutUs.productPicture);
        if (aboutUs.supportPicture && !aboutUs.supportPicture.filePath)
            supportImage = await AboutUsActions.createBannerImage(aboutUs.supportPicture);

        return {
            ...aboutUsWithImage,
            headerPicture:  isDefined(headerImage)  ?  headerImage['@id'] : (isDefined(aboutUsWithImage.headerPicture)  ? aboutUsWithImage.headerPicture['@id']  : null),
            servicePicture: isDefined(serviceImage) ? serviceImage['@id'] : (isDefined(aboutUsWithImage.servicePicture) ? aboutUsWithImage.servicePicture['@id'] : null),
            productPicture: isDefined(productImage) ? productImage['@id'] : (isDefined(aboutUsWithImage.productPicture) ? aboutUsWithImage.productPicture['@id'] : null),
            supportPicture: isDefined(supportImage) ? supportImage['@id'] : (isDefined(aboutUsWithImage.supportPicture) ? aboutUsWithImage.supportPicture['@id'] : null)
        }
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Modifiez vos informations</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow className="my-0">
                                <CCol xs="12" sm="12" md="4">
                                    <CLabel htmlFor="textarea-input">Hero</CLabel>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="12">
                                    <Image entity={ aboutUs } setEntity={ setAboutUs } isLandscape={ true } sizes="1920 x 750" imageName={ "headerPicture" } tip={ "principale" }/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="6">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="headerTitle">Titre principal</CLabel>
                                                <CInput
                                                    id="headerTitle"
                                                    name="headerTitle"
                                                    value={ aboutUs.headerTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.headerTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.headerTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CLabel htmlFor="headerTitleColor">Couleur du titre principal</CLabel>
                                            <SwatchesPicker name="headerTitleColor" color={ aboutUs.headerTitleColor } onChange={ handleHeaderTitleColorChange } />
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol xs="12" sm="12" md="6">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="headerSubtitle">Sous-titre</CLabel>
                                                <CInput
                                                    id="headerSubtitle"
                                                    name="headerSubtitle"
                                                    value={ aboutUs.headerSubtitle }
                                                    onChange={ handleChange }
                                                    placeholder="Sous-titre"
                                                    invalid={ errors.headerSubtitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.headerSubtitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CLabel htmlFor="headerSubtitleColor">Couleur du sous-titre</CLabel>
                                            <SwatchesPicker name="headerSubtitleColor" color={ aboutUs.headerSubtitleColor } onChange={ handleHeaderSubtitleColorChange } />
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                            <hr/>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="textarea-input">Description</CLabel>
                                        <CTextarea name="summary" id="summary" rows="7" placeholder="Résumé..." onChange={ handleChange } value={ aboutUs.summary }/>
                                        <CInvalidFeedback>{ errors.summary }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <hr/>
                            <CRow className="my-3">
                                <CCol xs="12" sm="12" md="4">
                                    <CLabel htmlFor="textarea-input">Images</CLabel>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="4">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <Image entity={ aboutUs } setEntity={ setAboutUs } isLandscape={ true } sizes="370 x 215" imageName={ "servicePicture" } tip={ "1" }/>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="serviceTitle">Titre 1</CLabel>
                                                <CInput
                                                    id="serviceTitle"
                                                    name="serviceTitle"
                                                    value={ aboutUs.serviceTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.serviceTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.serviceTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CLabel htmlFor="serviceColor">Couleur du titre 1</CLabel>
                                            <SwatchesPicker name="serviceColor" color={ aboutUs.serviceColor } onChange={ handleServiceColorChange } />
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <Image entity={ aboutUs } setEntity={ setAboutUs } isLandscape={ true } sizes="370 x 215" imageName={ "productPicture" } tip={ "2" }/>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="productTitle">Titre 2</CLabel>
                                                <CInput
                                                    id="productTitle"
                                                    name="productTitle"
                                                    value={ aboutUs.productTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.productTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.productTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CLabel htmlFor="productColor">Couleur du titre 2</CLabel>
                                            <SwatchesPicker name="productColor" color={ aboutUs.productColor } onChange={ handleProductColorChange } />
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <Image entity={ aboutUs } setEntity={ setAboutUs } isLandscape={ true } sizes="370 x 215" imageName={ "supportPicture" } tip={ "3" }/>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="supportTitle">Titre 3</CLabel>
                                                <CInput
                                                    id="supportTitle"
                                                    name="supportTitle"
                                                    value={ aboutUs.supportTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.supportTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.supportTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                        <CCol xs="12" sm="12" md="12">
                                            <CLabel htmlFor="supportColor">Couleur du titre 3</CLabel>
                                            <SwatchesPicker name="supportColor" color={ aboutUs.supportColor } onChange={ handleSupportColorChange } />
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                            <hr/>
                            <CRow className="my-3">
                                <CCol xs="12" sm="12" md="4">
                                    <CLabel htmlFor="textarea-input">Paragraphes</CLabel>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol xs="12" sm="12" md="4">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="visionTitle">Titre 1</CLabel>
                                                <CInput
                                                    id="visionTitle"
                                                    name="visionTitle"
                                                    value={ aboutUs.visionTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.visionTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.visionTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="vision">Paragraphe 1</CLabel>
                                                <CTextarea name="vision" id="vision" rows="5" placeholder="..." onChange={ handleChange } value={ aboutUs.vision }/>
                                                <CInvalidFeedback>{ errors.vision }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="missionTitle">Titre 2</CLabel>
                                                <CInput
                                                    id="missionTitle"
                                                    name="missionTitle"
                                                    value={ aboutUs.missionTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.missionTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.missionTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="textarea-input">Paragraphe 2</CLabel>
                                                <CTextarea name="mission" id="mission" rows="5" placeholder="..." onChange={ handleChange } value={ aboutUs.mission }/>
                                                <CInvalidFeedback>{ errors.mission }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol xs="12" sm="12" md="4">
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="goalTitle">Titre 3</CLabel>
                                                <CInput
                                                    id="goalTitle"
                                                    name="goalTitle"
                                                    value={ aboutUs.goalTitle }
                                                    onChange={ handleChange }
                                                    placeholder="Titre"
                                                    invalid={ errors.goalTitle.length > 0 }
                                                />
                                                <CInvalidFeedback>{ errors.goalTitle }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol xs="12" sm="12" md="12">
                                            <CFormGroup>
                                                <CLabel htmlFor="textarea-input">Paragraphe 3</CLabel>
                                                <CTextarea name="goal" id="goal" rows="5" placeholder="..." onChange={ handleChange } value={ aboutUs.goal }/>
                                                <CInvalidFeedback>{ errors.goal }</CInvalidFeedback>
                                            </CFormGroup>
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
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
 
export default AboutUs;