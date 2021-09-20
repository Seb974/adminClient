import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import HomepageActions from 'src/services/HomepageActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {  getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';
import Countdown from './countdown';
import CatalogContext from 'src/contexts/CatalogContext';

const Homepage = ({ match, history }) => {

    const maxBanners = 4;
    const now = new Date();
    const { id = "new" } = match.params;
    const { catalogs } = useContext(CatalogContext);
    const defaultCountdown = { date: now, image: null, product: null, title: "", textColor: "#fff", textShadow: false, buttonText: "J'en profite !", catalogs: [] };
    const defaultError = { name: "", bannersNumber: "", selected: "", date: "", image: "", product: "", title: "", textColor: "", textShadow: "", buttonText: "", catalogs: ""};
    const numberSelect = Array.from(Array(maxBanners).keys()).filter(i => i > 0);
    const [editing, setEditing] = useState(false);
    const [homepage, setHomepage] = useState({ name: "", bannersNumber: 1, selected: false });
    const [errors, setErrors] = useState(defaultError);
    const [countdowns, setCountdowns] = useState([{...defaultCountdown, selectableCatalogs: catalogs.map(s => ({...s, value: s.id, label: s.name, isFixed: false})), count: 0}]);

    useEffect(() => fetchHomepage(id), []);
    useEffect(() => fetchHomepage(id), [id]);

    const handleChange = ({ currentTarget }) => setHomepage({...homepage, [currentTarget.name]: currentTarget.value});
    const handleSelection = ({ currentTarget }) => setHomepage({...homepage, [currentTarget.name]: !homepage[currentTarget.name]});

    const fetchHomepage = id => {
        if (id !== "new") {
            setEditing(true);
            HomepageActions.find(id)
                .then( response => {
                    setHomepage(response);
                    if (isDefinedAndNotVoid(response.countdowns)) {
                        setCountdowns(response.countdowns.map((c, i) => ({...c, date: new Date(c.date), catalogs: getFormattedCatalogs(c.catalogs), selectableCatalogs: getFormattedCatalogs(catalogs), count: i})))
                    }
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    history.replace("/components/homepages");
                });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(countdowns);
        const countdownsToWrite = await getFormattedCountdowns();
        const homepageToEdit = {
            ...homepage,
            bannersNumber: getInt(homepage.bannersNumber),
            heroes: isDefinedAndNotVoid(homepage.heroes) ? homepage.heroes.map(h => h['@id']) : [],
            banners: isDefinedAndNotVoid(homepage.banners) ? homepage.banners.map(b => b['@id']) : [],
            countdowns: countdownsToWrite
        };
        const request = !editing ? HomepageActions.create(homepageToEdit) : HomepageActions.update(id, homepageToEdit);
        request.then(response => {
                    setErrors(defaultError);
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

    const getFormattedCountdowns = async () => {
        const savedCountdowns = await Promise.all(countdowns.map( async countdown => {
            return await getCountdownWithImage(countdown);
        }));
        return savedCountdowns;
    };

    const getCountdownWithImage = async (countdown) => {
        let countdownWithImage = getFormattedCountdown(countdown);
        if (countdown.image) {
            if (!countdown.image.filePath) {
                const image = await HomepageActions.createImage(countdown.image, homepage.name);
                countdownWithImage = {...countdownWithImage, image: image['@id']}
            } else {
                countdownWithImage = {...countdownWithImage, image: countdown.image['@id']}
            }
        }
        return countdownWithImage;
    };

    const getFormattedCountdown = countdown => {
        const { image, product, catalogs, ...noImgCountdown } = countdown;
        return {
            ...noImgCountdown, 
            product: isDefined(product) ? product['@id'] : null,
            catalogs: isDefinedAndNotVoid(catalogs) ? catalogs.map(c => c['@id']) : [],
        };
    };

    const handleAddCountdown = () => {
        const availableCatalogs = getAvailableCatalogs();
        setCountdowns([
            ...countdowns, 
            {...defaultCountdown, 
                selectableCatalogs: getFormattedCatalogs(availableCatalogs),
                count: isDefinedAndNotVoid(countdowns) ? countdowns[countdowns.length -1].count + 1 : 0
            }
        ]);
    };

    const getFormattedCatalogs = selection => selection.map(s => ({...s, value: s.id, label: s.name, isFixed: false}));

    const getAvailableCatalogs = () => {
        const availableCatalogs = catalogs.filter(c => {
            const current = countdowns.find(cd => cd.catalogs.find(cat => cat.id === c.id) !== undefined);
            return current === undefined;
        });
        return countdowns.length >= catalogs.length ? [] : availableCatalogs;
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
                                <CCol xs="12" sm="6">
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
                            </CRow>
                            <CRow className="mt-3">
                                <CCol xs="12" sm="6">
                                    <CFormGroup>
                                        <Select name="bannersNumber" label="Nombre d'espaces publicitaires" onChange={ handleChange } value={ homepage.bannersNumber }>
                                            { numberSelect.map(i => <option key={ i } value={ i }>{ i }</option>) }
                                        </Select>
                                        <CInvalidFeedback>{ errors.bannersNumber }</CInvalidFeedback>
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
                            { countdowns.map((countdown, i) => {
                                    return <Countdown
                                                iteration={ i }
                                                countdown={ countdown } 
                                                countdowns={ countdowns } 
                                                setCountdowns={ setCountdowns }
                                                errors={ errors } 
                                            />
                                    })
                            }

                            <>
                                <hr className="mt-5"/>
                                <CRow className="mt-4">
                                    <CCol xs="12" sm="12">
                                        <CButton size="sm" color="warning" onClick={ handleAddCountdown } disabled={ (getAvailableCatalogs()).length <= 0 }>
                                            <CIcon name="cil-plus"/> Ajouter un compte à rebours
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </>
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