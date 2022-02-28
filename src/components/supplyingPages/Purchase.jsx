import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';
import CIcon from '@coreui/icons-react';
import { CButton, CCardFooter, CCol, CFormGroup, CInputGroup, CInputGroupAppend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import { getDisabledDays, getFirstDeliverableDay, getGoods, getSuppliedProducts, getTotal } from 'src/helpers/supplying';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from '../forms/Select';
import PlatformContext from 'src/contexts/PlatformContext';
import ProvisionActions from 'src/services/ProvisionActions';

const Purchase = ({ displayedProducts, selectedSupplier, selectedSeller, selectedStore, mainView, supplied, setSupplied, selection, setSelection, addToast }) => {

    const today = new Date();
    const { platform } = useContext(PlatformContext);
    const voidMessage = "Aucun produit n'est sélectionné.";
    const successMessage = "La commande a bien été envoyée.";
    const minMessage = "Le montant de la commande est inférieur au minimum fixé par le fournisseur.";
    const deliveryMinMessage = "Le montant de la commande n'est pas suffisant pour prétendre à la livraison.";
    const failMessage = "Un problème est survenu lors de l'envoi de la commande au fournisseur.\n";
    const voidToast = { position: 'top-right', autohide: 4000, closeButton: true, fade: true, color: 'warning', messsage: voidMessage, title: 'Sélection vide' };
    const minToast = { position: 'top-right', autohide: 4000, closeButton: true, fade: true, color: 'warning', messsage: minMessage, title: 'Minimum de commande non atteint' };
    const deliveryMinToast = { position: 'top-right', autohide: 4000, closeButton: true, fade: true, color: 'warning', messsage: deliveryMinMessage, title: 'Minimum pour livraison non atteint' };
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Notification non envoyée' };

    const [deliveryDate, setDeliveryDate] = useState(today);
    const [receiveMode, setReceiveMode] = useState("livraison");
    const [sendingMode, setSendingMode] = useState("email");
    const [minDate, setMinDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 1));

    useEffect(() => defineMinDate(selectedSupplier), [selectedSupplier]);

    const defineMinDate = selectedSupplier => {
        const newMinDate = getFirstDeliverableDay(selectedSupplier);
        setMinDate(newMinDate);
        setDeliveryDate(newMinDate);
    };

    const handleReceiveModeChange = ({ currentTarget }) => setReceiveMode(currentTarget.value);
    const handleSendingModeChange = ({ currentTarget }) => setSendingMode(currentTarget.value);

    const handleDeliveryDateChange = datetime => {
        if (isDefinedAndNotVoid(datetime)) {
            const newSelection = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
            setDeliveryDate(newSelection);
        }
    };

    const handleSubmit = () => {
        if (selection.length === 0) {
            addToast(voidToast);
        } else if (isDefined(selectedSupplier.provisionMin) && getFloat(getTotal(selection, selectedSupplier)) < selectedSupplier.provisionMin) {
            addToast(minToast);
        } else if (isDefined(selectedSupplier.deliveryMin) && receiveMode === "livraison" && getFloat(getTotal(selection, selectedSupplier)) < selectedSupplier.deliveryMin) {
            addToast(deliveryMinToast);
        } else {
            const provision = getNewProvision();
            ProvisionActions
                .create(provision)
                .then(response => {
                    setToSupplies(provision.goods);
                    setSelection([]);
                    addToast(successToast);
                })
                .catch(error => addToast(failToast));
        }
    };

    const setToSupplies = (goods) => {
        let newSuppliedArray = getSuppliedProducts(goods, supplied);
        setSupplied(newSuppliedArray);
    };

    const getNewProvision = () => {
        const goods = getGoods(selection, selectedSupplier);
        const newProvision = {
            seller: selectedSeller['@id'],
            supplier: selectedSupplier,
            provisionDate: new Date(deliveryDate), 
            sendingMode,
            receiveMode,
            goods
        };
        return mainView || !isDefined(selectedStore) ?
            {...newProvision, platform: platform['@id'], metas: isDefined(selectedSeller.metas) ? selectedSeller.metas['@id'] : platform.metas['@id'] } :
            {...newProvision, store: selectedStore['@id'], metas: selectedStore.metas['@id']};
    };

    return displayedProducts.length <= 0 ? <></> : (
        <CCardFooter>
            <CRow className="mt-4">
                <CCol xs="12" lg="12">
                    <CLabel><h6><b>2. Commander</b></h6></CLabel>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" lg="6" className="mt-4">
                    <Select className="mr-2" name="receiveMode" label="Mode de récupération des marchandises" value={ receiveMode } onChange={ handleReceiveModeChange }>
                        <option value={"récupération"}>{"Récupération sur place"}</option>
                        <option value={"livraison"}>{"Livraison"}</option>
                    </Select>
                </CCol>
                <CCol xs="12" lg="6" className="mt-4">
                    <CFormGroup>
                        <CLabel htmlFor="deliveryDate">Date de { receiveMode } souhaitée</CLabel>
                        <CInputGroup>
                            <Flatpickr
                                name="date"
                                value={ [deliveryDate] }
                                onChange={ handleDeliveryDateChange }
                                className={`form-control`}
                                options={{
                                    minDate: minDate,
                                    dateFormat: "d/m/Y",
                                    locale: French,
                                    disable: [ date => getDisabledDays(date, selectedSupplier) ]
                                }}
                            />
                            <CInputGroupAppend>
                                <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-calendar"/></CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" lg="6" className="mt-2">
                    <Select className="mr-2" name="sendMode" label="Mode d'envoi de la commande" value={ sendingMode } onChange={ handleSendingModeChange }>
                        <option value={"email"}>{"Email"}</option>
                        <option value={"sms"}>{"SMS"}</option>
                        <option value={"email & sms"}>{"Email & SMS"}</option>
                    </Select>
                </CCol>
                <CCol xs="12" lg="6" className="mt-2 d-flex justify-content-start">
                    <CButton color="success" className="mt-4" onClick={ handleSubmit } style={{width: '180px', height: '35px'}}>
                        Commander
                    </CButton>
                </CCol>
            </CRow>
        </CCardFooter>
    );
}

export default Purchase;