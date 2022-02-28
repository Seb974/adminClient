import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroActions from 'src/services/HeroActions';
import HomepageActions from 'src/services/HomepageActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Image from 'src/components/forms/image';
import Select from 'src/components/forms/Select';
import { useContext } from 'react';
import { SwatchesPicker } from 'react-color';
import CatalogContext from 'src/contexts/CatalogContext';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import ProductSearch from 'src/components/forms/ProductSearch';

const Hero = ({ match, history }) => {

    const { id = "new" } = match.params;
    const { catalogs } = useContext(CatalogContext);
    const defaultError = { title: "", subtitle: "", image: "", homepage: "", product: "", textColor: "", titleColor: "", textShadow: "", catalogs: "" };
    const [editing, setEditing] = useState(false);
    const [hero, setHero] = useState({ title: "", subtitle: "", image: null, homepage: null, product: null, textColor: '#fff', titleColor: '#fff', textShadow: true, catalogs: [] });
    const [homepages, setHomepages] = useState([]);
    const [errors, setErrors] = useState(defaultError);
    const [formattedCatalogs, setFormattedCatalogs] = useState([]);
    const [product, setProduct] = useState(null);
    const [variation, setVariation] = useState(null);
    const [size, setSize] = useState(null);
    
    useEffect(() => {
        setHero({...hero, product: product});
    }, [product]);

    useEffect(() => {
        if (isDefined(hero.product) && !isDefined(product))
            setProduct(hero.product);
    }, [hero]);

    useEffect(() => {
        fetchHomepages();
        fetchHero(id);
        getFormattedCatalogs();
    }, []);

    useEffect(() => fetchHero(id), [id]);

    const handleChange = ({ currentTarget }) => setHero({...hero, [currentTarget.name]: currentTarget.value});

    const handleHomepageChange = ({ currentTarget }) => {
        const selectedHomepage = homepages.find(h => h.id === parseInt(currentTarget.value));
        setHero({...hero, homepage: selectedHomepage });
    };

    const fetchHero = id => {
        if (id !== "new") {
            setEditing(true);
            HeroActions.find(id)
                .then( response => {
                    let dbCatalogs = [];
                    if (isDefinedAndNotVoid(response.catalogs)) {
                        dbCatalogs = response.catalogs.map(c => ({...c, value: c.id, label: c.name, isFixed: false}));
                    }
                    setHero({...response, catalogs: dbCatalogs});
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/heroes");
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
                history.replace("/components/heroes");
            });
    };

    const getFormattedCatalogs = () => {
        const catalogsToShow = catalogs.map(catalog => ({...catalog, value: catalog.id, label: catalog.name, isFixed: false}));
        setFormattedCatalogs(catalogsToShow);
    };

    const handleCatalogsChange = catalogs => setHero(hero => ({...hero, catalogs}));
    const handleTitleColorChange = (color, event) => setHero({...hero, titleColor: color.hex});
    const handleTextColorChange = (color, event) => setHero({...hero, textColor: color.hex});
    const handleTextShadowChange = ({ currentTarget }) => setHero({...hero, textShadow: !hero.textShadow});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const heroWithImage = await getHeroWithImage();
        const heroToWrite = {
            ...heroWithImage, 
            image: typeof heroWithImage.image === 'string' ? heroWithImage.image : heroWithImage.image['@id'], 
            homepage: typeof heroWithImage.homepage === 'string' ? heroWithImage.homepage : heroWithImage.homepage['@id'],
            product: isDefined(heroWithImage.product) ? heroWithImage.product['@id'] : null,
            catalogs: hero.catalogs.map(c => c['@id']),
        };
        const request = !editing ? HeroActions.create(heroToWrite) : HeroActions.update(id, heroToWrite);
        request.then(response => {
                    setErrors(defaultError);
                    //TODO : Flash notification de succès
                    history.replace("/components/heroes");
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

    const getHeroWithImage = async () => {
        let heroWithImage = {...hero};
        if (hero.image && !hero.image.filePath) {
            const image = await HeroActions.createImage(hero.image, hero.homepage.name);
            heroWithImage = {...heroWithImage, image: image['@id']}
        }
        return heroWithImage;
    };


    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer une page d'accueil" : "Modifier la page d'accueil '" + hero.title + "'" }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="homepage" label="Associé à la page" onChange={ handleHomepageChange } value={ isDefined(hero.homepage) ? hero.homepage.id : 0 }>
                                        { homepages.map(home => <option key={ home.id } value={ home.id }>{ home.name }</option>) }
                                    </Select>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CLabel htmlFor="title">Produit</CLabel>
                                    <ProductSearch
                                        product={ product }
                                        setProduct={ setProduct }
                                        variation={ variation }
                                        setVariation={ setVariation }
                                        size={ size }
                                        setSize={ setSize }
                                        withVariants={ false }
                                    />
                                </CCol>
                            </CRow>
                            <CRow className="mt-2">
                                <CCol xs="12" sm="12">
                                    <SelectMultiple name="catalogs" label="Disponible sur les catalogues" value={ hero.catalogs } error={ errors.catalogs } onChange={ handleCatalogsChange } data={ formattedCatalogs }/>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="title">Titre</CLabel>
                                        <CInput
                                            id="title"
                                            name="title"
                                            value={ hero.title }
                                            onChange={ handleChange }
                                            placeholder="Titre du Héro"
                                            invalid={ errors.title.length > 0 }
                                        />
                                        <CInvalidFeedback>{ errors.title }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="title">Sous-titre</CLabel>
                                        <CInput
                                            id="subtitle"
                                            name="subtitle"
                                            value={ hero.subtitle }
                                            onChange={ handleChange }
                                            placeholder="Titre du Héro"
                                            invalid={ errors.subtitle.length > 0 }
                                        />
                                        <CInvalidFeedback>{ errors.subtitle }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <Image entity={ hero } setEntity={ setHero } isLandscape={ true }/>
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="d-flex align-items-center">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="textShadow" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ hero.textShadow } onChange={ handleTextShadowChange }/>
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
                                    <SwatchesPicker name="titleColor" color={ hero.titleColor } onChange={ handleTitleColorChange } />
                                </CCol>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CLabel htmlFor="title">Couleur du texte</CLabel>
                                    <SwatchesPicker  name="textColor" color={ hero.textColor } onChange={ handleTextColorChange } />
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/heroes" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Hero;