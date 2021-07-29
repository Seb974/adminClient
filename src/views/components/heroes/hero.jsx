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
import ProductsContext from 'src/contexts/ProductsContext';

const Hero = ({ match, history }) => {

    const { id = "new" } = match.params;
    const defaultError = { title: "", subtitle: "", image: "", homepage: "", product: "" };
    const { products } = useContext(ProductsContext);
    const [editing, setEditing] = useState(false);
    const [hero, setHero] = useState({ title: "", subtitle: "", image: null, homepage: null, product: null });
    const [homepages, setHomepages] = useState([]);
    const [errors, setErrors] = useState(defaultError);

    useEffect(() => {
        fetchHomepages();
        fetchHero(id);
    }, []);

    useEffect(() => fetchHero(id), [id]);

    const handleChange = ({ currentTarget }) => setHero({...hero, [currentTarget.name]: currentTarget.value});

    const handleHomepageChange = ({ currentTarget }) => {
        const selectedHomepage = homepages.find(h => h.id === parseInt(currentTarget.value));
        setHero({...hero, homepage: selectedHomepage });
    };

    const handleProductChange = ({ currentTarget }) => {
        const selectedId = parseInt(currentTarget.value);
        if (selectedId > -1) {
            const selectedProduct = products.find(h => h.id === selectedId);
            setHero({...hero, product: selectedProduct });
        } else {
            setHero({...hero, product: null})
        }
    }

    const fetchHero = id => {
        if (id !== "new") {
            setEditing(true);
            HeroActions.find(id)
                .then( response => setHero(response))
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const heroWithImage = await getHeroWithImage();
        console.log(heroWithImage);
        const heroToWrite = {
            ...heroWithImage, 
            image: typeof heroWithImage.image === 'string' ? heroWithImage.image : heroWithImage.image['@id'], 
            homepage: typeof heroWithImage.homepage === 'string' ? heroWithImage.homepage : heroWithImage.homepage['@id'],
            product: isDefined(heroWithImage.product) ? heroWithImage.product['@id'] : null
        };
        console.log(heroToWrite);
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
                            </CRow>
                            <CRow>
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
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Image entity={ hero } setEntity={ setHero } isLandscape={ true }/>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <Select className="mr-2" name="product" label="Produit associé" onChange={ handleProductChange } value={ isDefined(hero.product) ? hero.product.id : -1 }>
                                        <option value={ -1 }>Aucun</option>
                                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                                    </Select>
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