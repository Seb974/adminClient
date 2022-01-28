import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import React, { useState, useEffect } from 'react';
import { CButton, CCol, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Image from 'src/components/forms/image';
import Select from 'src/components/forms/Select';
import { useContext } from 'react';
import ProductsContext from 'src/contexts/ProductsContext';
import { SwatchesPicker } from 'react-color';
import Flatpickr from 'react-flatpickr';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import { getDateFrom } from 'src/helpers/days';

const Countdown = ({ countdown, errors, countdowns, setCountdowns, iteration }) => {

    const now = new Date();
    const { products } = useContext(ProductsContext);
    const today = getDateFrom(now, 0, 0, 0);

    const handleCatalogsChange = catalogs => {
        const newCountdowns = countdowns.map(c => c.count === countdown.count ? {...countdown, catalogs: isDefined(catalogs) ? catalogs : []} : c);
        setCountdowns(newCountdowns);
    };

    const handleDeleteRule = ({ currentTarget }) => setCountdowns(countdowns.filter(c => c.count !== parseInt(currentTarget.name)));

    const handleChange = ({ currentTarget }) => {
        const newCountdowns = countdowns.map(c => c.count === parseInt(currentTarget.name) ? {...c, [currentTarget.id]: currentTarget.value} : c);
        setCountdowns(newCountdowns);
    };

    const handleTextColorChange = (color, count) => {
        const newCountdowns = countdowns.map(c => c.count === parseInt(count) ? {...c, textColor: color.hex} : c);
        setCountdowns(newCountdowns);
    };

    const handleProductChange = ({ currentTarget }) => {
        const { value, name } = currentTarget;
        const newCountdowns = countdowns.map(c => c.count === parseInt(name) ? 
            {...c, product: parseInt(value) > -1 ? products.find(h => h.id === parseInt(value)) : null} : c);
        setCountdowns(newCountdowns);
    };

    const handleDateChange = (datetime, count) => {
        if (isDefinedAndNotVoid(datetime)) {
            const newSelectedDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 20, 59, 59);
            const newCountdowns = countdowns.map(c => c.count === parseInt(count) ? {...c, date: newSelectedDate} : c);
            setCountdowns(newCountdowns);
        }
    };

    const handleImageChange = (image, count) => {
        const newCountdowns = countdowns.map(c => c.count === parseInt(count) ? {...c, image} : c);
        setCountdowns(newCountdowns);
    };

    return (
        <>
            <hr/>
            <CRow className="mt-2">
                <CCol xs="10" sm="11">
                    <CLabel><h6><b>Compte à rebours { countdowns.length > 1 ? iteration + 1 : "" }</b></h6></CLabel>
                </CCol>
                { countdowns.length > 1 && 
                    <CCol xs="2" sm="1" className="mt-2 d-flex align-items-end">
                        <CButton name={ countdown.count } size="sm" color="danger" onClick={ handleDeleteRule }>
                            <CIcon name="cil-trash"/>
                        </CButton>
                    </CCol>
                }
            </CRow>
            <CRow>
                <CCol xs="12" lg="6">
                    <label htmlFor="date" className="date-label">Date de fin</label>
                    <Flatpickr
                        name="date"
                        value={ countdown.date }
                        onChange={e => handleDateChange(e, countdown.count) }
                        className="form-control mb-3"
                        options={{
                            minDate: today,
                            dateFormat: "d/m/Y",
                            locale: French
                        }}
                    />
                </CCol>
                <CCol xs="12" lg="6">
                    <CFormGroup>
                        <CLabel htmlFor="title">Titre</CLabel>
                        <CInput
                            id="title"
                            name={ countdown.count }
                            value={ countdown.title }
                            onChange={ handleChange }
                            placeholder="Titre"
                            invalid={ errors.title.length > 0 }
                        />
                        <CInvalidFeedback>{ errors.title }</CInvalidFeedback>
                    </CFormGroup>
                </CCol>
            </CRow>
            <CRow className="mt-2">
                <CCol xs="12" sm="12">
                    <SelectMultiple name="catalogs" label="Disponible sur les catalogues" value={ countdown.catalogs } error={ errors.catalogs } onChange={ handleCatalogsChange } data={ countdown.selectableCatalogs }/>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" sm="6" md="6">
                    <Image entity={ countdown } setEntity={ setCountdowns } isLandscape={ true } handleChange={ handleImageChange } iteration={ countdown.count }/>
                </CCol>
                <CCol xs="12" sm="6" md="6" className="mt-4">
                    <Select className="mr-2" id="product" name={ countdown.count } label="Produit associé" onChange={ handleProductChange } value={ isDefined(countdown.product) ? countdown.product.id : -1 }>
                        <option value={ -1 }>Aucun</option>
                        { products.map(product => <option key={ product.id } value={ product.id }>{ product.name }</option>) }
                    </Select>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" lg="6">
                    <CFormGroup>
                        <CLabel htmlFor="title">Bouton</CLabel>
                        <CInput
                            id="buttonText"
                            name={ countdown.count }
                            value={ countdown.buttonText }
                            onChange={ handleChange }
                            placeholder="Texte du bouton"
                            invalid={ errors.buttonText.length > 0 }
                        />
                        <CInvalidFeedback>{ errors.buttonText }</CInvalidFeedback>
                    </CFormGroup>
                </CCol>
                <CCol xs="12" sm="12" md="6" className="">
                    <CLabel htmlFor="title">Couleur du texte</CLabel>
                    <SwatchesPicker id="textColor" name={ countdown.count } color={ countdown.textColor } onChange={ e => handleTextColorChange(e, countdown.count) } />
                </CCol>
            </CRow>
        </>
    );
}

export default Countdown;