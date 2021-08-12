import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import HomepageActions from 'src/services/HomepageActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';
import ProductsContext from 'src/contexts/ProductsContext';
import Image from 'src/components/forms/image';
import Flatpickr from 'react-flatpickr';

const Homepage = ({ match, history }) => {

    const maxBanners = 4;
    const now = new Date();
    const { id = "new" } = match.params;
    const { products } = useContext(ProductsContext);
    const today = getDateFrom(now, 0, 0, 0);
    const numberSelect = Array.from(Array(maxBanners).keys()).filter(i => i > 0);
    const [editing, setEditing] = useState(false);
    const [homepage, setHomepage] = useState({ name: "", bannersNumber: 1, selected: false });
    const [countdown, setCountdown] = useState({ date: now, image: null, product: null});
    const [errors, setErrors] = useState({ name: "", bannersNumber: "", selected: "", date: "", image: "", product: "" });

    useEffect(() => fetchHomepage(id), []);
    useEffect(() => fetchHomepage(id), [id]);

    const handleChange = ({ currentTarget }) => setHomepage({...homepage, [currentTarget.name]: currentTarget.value});

    const handleSelection = ({ currentTarget }) => setHomepage({...homepage, [currentTarget.name]: !homepage[currentTarget.name]});

    const handleProductChange = ({ currentTarget }) => {
        const selectedId = parseInt(currentTarget.value);
        if (selectedId > -1) {
            const selectedProduct = products.find(h => h.id === selectedId);
            setCountdown({...countdown, product: selectedProduct });
        } else {
            setCountdown({...countdown, product: null})
        }
    };

    const handleDateChange = datetime => {
        if (isDefinedAndNotVoid(datetime)) {
            const newSelection = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 20, 59, 59);
            setCountdown({...countdown, date: newSelection});
        }
    };

    const fetchHomepage = id => {
        if (id !== "new") {
            setEditing(true);
            HomepageActions.find(id)
                .then( response => {
                    setHomepage(response);
                    if (isDefinedAndNotVoid(response.countdowns)) {
                        setCountdown({...response.countdowns[0], date: new Date(response.countdowns[0].date)});
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
        const countdownWithImage = await getCountdownWithImage();
        const homepageToEdit = {
            ...homepage,
            bannersNumber: getInt(homepage.bannersNumber),
            heroes: isDefinedAndNotVoid(homepage.heroes) ? homepage.heroes.map(h => h['@id']) : [],
            banners: isDefinedAndNotVoid(homepage.banners) ? homepage.banners.map(b => b['@id']) : [],
            // countdowns: isDefinedAndNotVoid(homepage.countdowns) ? homepage.countdowns.map(c => c['@id']) : [],
            countdowns: [
                {...countdownWithImage, product: isDefined(countdown.product) ? countdown.product['@id'] : null }
            ]
        };
        const request = !editing ? HomepageActions.create(homepageToEdit) : HomepageActions.update(id, homepageToEdit);
        request.then(response => {
                    setErrors({name: "", selected: ""});
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

    const getCountdownWithImage = async () => {
        let countdownWithImage = {...countdown};
        if (countdown.image) {
            if (!countdown.image.filePath) {
                const image = await HomepageActions.createImage(countdown.image, homepage.name,);
                countdownWithImage = {...countdownWithImage, image: image['@id']}
            } else {
                countdownWithImage = {...countdownWithImage, image: countdownWithImage.image['@id']}
            }
        }
        return countdownWithImage;
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
                            <hr/>
                            <CRow className="mt-2">
                                <CCol xs="12" lg="12">
                                    <CLabel><h6><b>Compte à rebours</b></h6></CLabel>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" lg="6">
                                    <label htmlFor="date" className="date-label">Date de fin</label>
                                    <Flatpickr
                                        name="date"
                                        value={ countdown.date }
                                        onChange={ handleDateChange }
                                        className="form-control mb-3"
                                        options={{
                                            minDate: today,
                                            dateFormat: "d/m/Y",
                                            locale: French
                                        }}
                                    />
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6" md="6">
                                    <Image entity={ countdown } setEntity={ setCountdown } isLandscape={ true }/>
                                </CCol>
                                <CCol xs="12" sm="6" md="6" className="mt-4">
                                    <Select className="mr-2" name="product" label="Produit associé" onChange={ handleProductChange } value={ isDefined(countdown.product) ? countdown.product.id : -1 }>
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
                        <Link to="/components/homepages" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Homepage;