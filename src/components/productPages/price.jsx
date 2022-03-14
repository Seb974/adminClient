import React, { useEffect, useState } from 'react';
import { CCol, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CSelect, CSwitch } from '@coreui/react';
import TaxActions from '../../services/TaxActions';
import PriceGroupActions from '../../services/PriceGroupActions';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const Price = ({product, setProduct, history }) => {

    const [taxes, setTaxes] = useState([]);
    const [priceGroups, setPriceGroups] = useState([]);

    useEffect(() => {
        fetchTaxes();
        fetchPriceGroups();
    }, []);

    useEffect(() => {
        if (product.tax === "-1" && taxes.length > 0)
            setProduct({...product, tax: taxes[0]});
    }, [product, taxes]);

    useEffect(() => {
        if (!isDefinedAndNotVoid(product.prices) && priceGroups.length > 0)
            setProduct({...product, prices: priceGroups.map(price => ({amount: "", priceGroup: price})) });
    }, [product, priceGroups]);

    const fetchTaxes = () => {
        let request = TaxActions.findAll();
        request
            .then(response => setTaxes(response))
            .catch(error => history.replace("/components/products"));
    };

    const fetchPriceGroups = () => {
        PriceGroupActions.findAll()
                    .then(response => setPriceGroups(response))
                    .catch(error => history.replace("/components/products"));
    };

    const handleChange = ({ currentTarget }) => setProduct({...product, [currentTarget.name]: currentTarget.value});

    const handlePriceChange = ({ currentTarget }) => {
        const {name, value} = currentTarget;
        const updatedPrice = product.prices.find(({priceGroup}) => priceGroup.name === name);
        const filteredPrices = product.prices.filter(({priceGroup}) => priceGroup.name !== updatedPrice.priceGroup.name);
        const newPrices = !product.uniquePrice ? [...filteredPrices, {...updatedPrice, amount: value}] :
                                                 product.prices.map(price => ({...price, amount: value}));
        setProduct(product => ({...product, prices: newPrices.sort((a, b) => (a.priceGroup.name > b.priceGroup.name) ? 1 : -1)}));
    };

    const handleUniquePrice = ({ currentTarget }) => {
        if (product[currentTarget.name])
            setProduct({...product, [currentTarget.name]: !product[currentTarget.name]});
        else {
            const uniqueValue = product.prices[0].amount;
            setProduct({
                ...product, 
                [currentTarget.name]: !product[currentTarget.name], 
                prices: product[currentTarget.name] ? product.prices : product.prices.map(price => ({...price, amount: uniqueValue}))
            });
        }
    };

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setProduct({...product, offerEnd: newDate});
    };

    return !isDefined(product) ? <></> : (
        <>
            <hr className="mt-5 mb-5"/>
            <CFormGroup row>
                <CCol xs="12" md="4">
                    <CLabel htmlFor="select">TVA</CLabel>
                    <CSelect custom name="tax" id="tax" value={ product.tax['@id'] } onChange={ handleChange }>
                        { taxes.map(tax => <option key={ tax.id } value={ tax['@id'] }>{ tax.name }</option>)}
                    </CSelect>
                </CCol>
                <CCol xs="12" md="4">
                    <CLabel htmlFor="select">{ product.uniquePrice ? "Prix" : "Prix de base"}</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            name={ !isDefinedAndNotVoid(product.prices) ? "price" : product.prices[0].priceGroup.name }
                            id={  !isDefinedAndNotVoid(product.prices) ? "price" : product.prices[0].priceGroup.name }
                            value={  !isDefinedAndNotVoid(product.prices) ? "" : product.prices[0].amount }
                            onChange={ handlePriceChange } 
                            placeholder={ product.uniquePrice ? "Prix HT" : "Prix de base HT"}
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>€</CInputGroupText>
                        </CInputGroupAppend>
                    </CInputGroup>
                </CCol>
                <CFormGroup row className="mt-4 mb-0 ml-1 d-flex align-items-end">
                    <CCol xs="3" sm="3">
                        <CSwitch name="uniquePrice" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ product.uniquePrice } onChange={ handleUniquePrice }/>
                    </CCol>
                    <CCol tag="label" xs="9" sm="9" className="col-form-label">
                        Prix unique
                    </CCol>
                </CFormGroup>
            </CFormGroup>
            { !product.uniquePrice && 
                <CFormGroup row>
                    { product.prices.map( (price, index) => {
                        if (index > 0) {
                            return (
                                <CCol key={index} xs="12" md="4" className="mt-4">
                                    <CLabel htmlFor="select">{ "Prix " + price.priceGroup.name }</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            type="number"
                                            name={price.priceGroup.name}
                                            id={price.priceGroup.name}
                                            value={ price.amount }
                                            onChange={ handlePriceChange } 
                                            placeholder={ "Prix " + price.priceGroup.name + " HT"}
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>€</CInputGroupText>
                                        </CInputGroupAppend>
                                     </CInputGroup>
                                </CCol>
                            )}
                        })
                    }
                </CFormGroup>
            }
            <CFormGroup row>
                <CCol xs="12" md="6" className="mt-4">
                    <CLabel htmlFor="discount">{ "Taux de remise" }</CLabel>
                    <CInputGroup>
                        <CInput
                            type="number"
                            name="discount"
                            id="discount"
                            value={ product.discount }
                            onChange={ handleChange } 
                            placeholder={ "Remise" }
                        />
                        <CInputGroupAppend>
                            <CInputGroupText>%</CInputGroupText>
                        </CInputGroupAppend>
                        </CInputGroup>
                </CCol>
                <CCol xs="12" md="6" className="mt-4">
                    <CFormGroup>
                        <CLabel htmlFor="offerEnd">Valable jusqu'au</CLabel>
                        <Flatpickr
                            name="offerEnd"
                            value={ product.offerEnd }
                            onChange={ onDateChange }
                            className="form-control form-control-sm"
                            options={{
                                mode: "single",
                                dateFormat: "d/m/Y",
                                minDate: 'today',
                                locale: French,
                            }}
                        />
                    </CFormGroup>
                </CCol>
            </CFormGroup>
        </>
    );
}

export default Price;