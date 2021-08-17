import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BannerActions from 'src/services/BannerActions';
import HomepageActions from 'src/services/HomepageActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Image from 'src/components/forms/image';
import Select from 'src/components/forms/Select';
import { useContext } from 'react';
import ProductsContext from 'src/contexts/ProductsContext';
import { SwatchesPicker } from 'react-color';

const Banner = ({ match, history }) => {

    const { id = "new" } = match.params;
    const maxBanners = 4;
    const defaultError = { title: "", subtitle: "", image: "", homepage: "", product: "", isMain: "", bannerNumber: "", textColor: "", titleColor: "", textShadow: "" };
    const { products } = useContext(ProductsContext);
    const [editing, setEditing] = useState(false);
    const [banner, setBanner] = useState({ title: "", subtitle: "", image: null, homepage: null, product: null, isMain: false, bannerNumber: 1, textColor: '#fff', titleColor: '#fff', textShadow: true });
    const [homepages, setHomepages] = useState([]);
    const [errors, setErrors] = useState(defaultError);
    const [numberSelect, setNumberSelect] = useState(Array.from(Array(maxBanners).keys()).filter(i => i > 0));

    useEffect(() => {
        fetchHomepages();
        fetchBanner(id);
    }, []);

    useEffect(() => fetchBanner(id), [id]);

    useEffect(() => {
        if (!isDefined(banner.homepage) && isDefinedAndNotVoid(homepages))
            setBanner({...banner, homepage: homepages[0]});
    }, [banner, homepages]);

    useEffect(() => {
        if (isDefined(banner.homepage))
            setNumberSelect(Array.from(Array((banner.homepage.bannersNumber + 1)).keys()).filter(i => i > 0));
    }, [banner.homepage]);

    const handleChange = ({ currentTarget }) => setBanner({...banner, [currentTarget.name]: currentTarget.value});

    const handleHomepageChange = ({ currentTarget }) => {
        const selectedHomepage = homepages.find(h => h.id === parseInt(currentTarget.value));
        setBanner({...banner, homepage: selectedHomepage });
    };

    const handleProductChange = ({ currentTarget }) => {
        const selectedId = parseInt(currentTarget.value);
        if (selectedId > -1) {
            const selectedProduct = products.find(h => h.id === selectedId);
            setBanner({...banner, product: selectedProduct });
        } else {
            setBanner({...banner, product: null})
        }
    };

    const handleIsMainChange = ({ currentTarget }) => setBanner({...banner, isMain: !banner.isMain});

    const fetchBanner = id => {
        if (id !== "new") {
            setEditing(true);
            BannerActions.find(id)
                .then( response => {
                    console.log(response);
                    setBanner(response);
                    setNumberSelect(Array.from(Array(response.homepage.bannersNumber).keys()).filter(i => i > 0));
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/banners");
                });
        }
    };

    const fetchHomepages = () => {
        HomepageActions
            .findAll()
            .then(response => setHomepages(response))
            .catch(error => {
                console.log(error);
                // TODO : Notification flash d'une erreur
                history.replace("/components/banners");
            });
    };

    const handleTitleColorChange = (color, event) => setBanner({...banner, titleColor: color.hex});
    const handleTextColorChange = (color, event) => setBanner({...banner, textColor: color.hex});
    const handleTextShadowChange = ({ currentTarget }) => setBanner({...banner, textShadow: !banner.textShadow});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bannerWithImage = await getBannerWithImage();
        const bannerToWrite = {
            ...bannerWithImage,
            bannerNumber: getInt(bannerWithImage.bannerNumber),
            image: typeof bannerWithImage.image === 'string' ? bannerWithImage.image : bannerWithImage.image['@id'], 
            homepage: typeof bannerWithImage.homepage === 'string' ? bannerWithImage.homepage : bannerWithImage.homepage['@id'],
            product: isDefined(bannerWithImage.product) ? bannerWithImage.product['@id'] : null,
        };
        console.log(bannerToWrite);
        const request = !editing ? BannerActions.create(bannerToWrite) : BannerActions.update(id, bannerToWrite);
        request.then(response => {
                    setErrors(defaultError);
                    //TODO : Flash notification de succès
                    history.replace("/components/banners");
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

    const getBannerWithImage = async () => {
        let bannerWithImage = {...banner};
        console.log(bannerWithImage);
        if (banner.image && !banner.image.filePath) {
            const image = await BannerActions.createImage(banner.image, banner.homepage.name, banner.bannerNumber, banner.isMain);
            bannerWithImage = {...bannerWithImage, image: image['@id']}
        }
        return bannerWithImage;
    };


    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une publicité" : "Modifier la publicité' '" + banner.title + "'" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="6" md="6" className="mt-4">
                                    <Select className="mr-2" name="homepage" label="Associé à la page" onChange={ handleHomepageChange } value={ isDefined(banner.homepage) ? banner.homepage.id : 0 }>
                                        { homepages.map(home => <option key={ home.id } value={ home.id }>{ home.name }</option>) }
                                    </Select>
                                </CCol>
                                <CCol xs="12" sm="6" md="6" className="mt-4">
                                    <CFormGroup>
                                        <Select name="bannerNumber" label="Associé à l'espace publicitaire" onChange={ handleChange } value={ banner.bannerNumber }>
                                            { numberSelect.map(i => <option key={ i } value={ i }>{ i }</option>) }
                                        </Select>
                                        <CInvalidFeedback>{ errors.bannersNumber }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="title">Titre</CLabel>
                                        <CInput
                                            id="title"
                                            name="title"
                                            value={ banner.title }
                                            onChange={ handleChange }
                                            placeholder="Titre du Héro"
                                            invalid={ errors.title.length > 0 }
                                        />
                                        <CInvalidFeedback>{ errors.title }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="6" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="title">Sous-titre</CLabel>
                                        <CInput
                                            id="subtitle"
                                            name="subtitle"
                                            value={ banner.subtitle }
                                            onChange={ handleChange }
                                            placeholder="Titre du Héro"
                                            invalid={ errors.subtitle.length > 0 }
                                        />
                                        <CInvalidFeedback>{ errors.subtitle }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6" md="6">
                                    <Image entity={ banner } setEntity={ setBanner } isLandscape={ true }/>
                                </CCol>
                                <CCol xs="12" sm="6" md="6" className="mt-4">
                                    <Select className="mr-2" name="product" label="Produit associé" onChange={ handleProductChange } value={ isDefined(banner.product) ? banner.product.id : -1 }>
                                        <option value={ -1 }>Aucun</option>
                                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                                    </Select>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="isMain" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ banner.isMain } onChange={ handleIsMainChange }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Publicité principale</CCol>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="d-flex align-items-center">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="textShadow" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ banner.textShadow } onChange={ handleTextShadowChange }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Ombre d'écriture
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CLabel htmlFor="title">Couleur du titre</CLabel>
                                    <SwatchesPicker name="titleColor" color={ banner.titleColor } onChange={ handleTitleColorChange } />
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CLabel htmlFor="title">Couleur du texte</CLabel>
                                    <SwatchesPicker  name="textColor" color={ banner.textColor } onChange={ handleTextColorChange } />
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/banners" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Banner;