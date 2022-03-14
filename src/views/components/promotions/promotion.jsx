import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { Link } from 'react-router-dom';
import PromotionActions from 'src/services/PromotionActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CInputGroupText, CInputGroupAppend, CInputGroup, CSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getDateFrom, getFloat } from 'src/helpers/utils';
import '../../../assets/css/datepicker.css';

const Promotion = ({ match, history }) => {

    const codeLength = 8;
    const { id = "new" } = match.params;
    const [editing, setEditing] = useState(false);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const defaultE = {code: "", maxUsage: "", used: "", percentage: "", discount: "", endsAt: ""};
    const [promotion, setPromotion] = useState({...defaultE, percentage: true, endsAt: getDateFrom(new Date(), 14, 23, 59), maxUsage: 1, discount: 5, used: 0 });
    const [automatic, setAutomatic] = useState(true);
    const [errors, setErrors] = useState(defaultE);

    useEffect(() => {
        setPromotion({...promotion, code: generateCode()});
        fetchPromotion(id);
    }, []);
    useEffect(() => fetchPromotion(id), [id]);

    const handleChange = ({ currentTarget }) => setPromotion({...promotion, [currentTarget.name]: currentTarget.value});
    const handleDiscountType = ({ currentTarget }) => setPromotion({... promotion, [currentTarget.name] : !promotion[currentTarget.name]});

    const handleAutoCoding = ({ currentTarget }) => {
        setAutomatic(!automatic);
        setPromotion({...promotion, code: !automatic ? generateCode() : ""});
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setPromotion({...promotion, endsAt: newDate});
    };

    const fetchPromotion = id => {
        if (id !== "new") {
            setEditing(true);
            PromotionActions.find(id)
                .then(response => setPromotion(response))
                .catch(error => history.replace("/components/promotions"));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const promotionToWrite = getPromotionToWrite();
        const request = !editing ? PromotionActions.create(promotionToWrite) : PromotionActions.update(id, promotionToWrite);
        request.then(response => {
                    setErrors(defaultE);
                    history.replace("/components/promotions");
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
                   }
               });
    };

    const generateCode = () => {
        let result = "";
        for (let i = 0; i < codeLength; i++) {
            result += chars.charAt( Math.floor(Math.random() * chars.length) );
        }
        return result;
    }

    const getPromotionToWrite = () => {
        return {
            ...promotion,
            name: promotion.code,
            discount: getFloat(promotion.discount),
            maxUsage: getFloat(promotion.maxUsage),
        };
    }

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un coupon de réduction</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Code</CLabel>
                                        <CInput
                                            id="code"
                                            name="code"
                                            value={ promotion.code }
                                            onChange={ handleChange }
                                            placeholder="Code"
                                            disabled={ automatic }
                                            invalid={ errors.code.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.code }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="automatic" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ automatic } onChange={ handleAutoCoding }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Génération automatique</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            <CRow className="mt-4">
                                <CCol xs="12" sm="12" md="6">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">{ promotion.percentage ? "Pourcentage de réduction" : "Montant de la réduction" }</CLabel>
                                        <CInputGroup>
                                            <CInput
                                                id="discount"
                                                name="discount"
                                                type="number"
                                                value={ promotion.discount }
                                                onChange={ handleChange }
                                                placeholder="Remise"
                                                invalid={ errors.discount.length > 0 } 
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText>{ promotion.percentage ? '%' : '€' }</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                        <CInvalidFeedback>{ errors.discount }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="percentage" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ promotion.percentage } onChange={ handleDiscountType }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Réduction en pourcentage</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>

                            <CRow>
                                <CCol xs="12" sm="12" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Valable jusqu'au</CLabel>
                                        <Flatpickr
                                            name="endsAt"
                                            value={ promotion.endsAt }
                                            onChange={ onDateChange }
                                            className="form-control form-control-sm"
                                            options={{
                                                mode: "single",
                                                dateFormat: "d/m/Y",
                                                minDate: 'today',
                                                locale: French,
                                            }}
                                        />
                                        <CInvalidFeedback>{ errors.endsAt }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Nombre d'utilisation maximal</CLabel>
                                        <CInput
                                            id="maxUsage"
                                            name="maxUsage"
                                            value={ promotion.maxUsage }
                                            onChange={ handleChange }
                                            placeholder="utilisation max"
                                            invalid={ errors.maxUsage.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.maxUsage }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            

                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/promotions" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Promotion;