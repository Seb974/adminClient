import React, { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import 'flatpickr/dist/themes/material_blue.css';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CFormGroup, CLabel, CInputGroup, CInput, CToaster, CToast, CToastHeader, CToastBody, CSwitch, CSelect, CInputGroupAppend, CInputGroupText, CTextarea, CCardFooter } from '@coreui/react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';
import Roles from 'src/config/Roles';
import { useContext } from 'react';
import AuthContext from 'src/contexts/AuthContext';
import CIcon from '@coreui/icons-react';
import SellerActions from 'src/services/SellerActions';
import ProductSearch from 'src/components/forms/ProductSearch';
import LostActions from 'src/services/LostActions';
import { Link } from 'react-router-dom';

const Lost = ({ match, history }) => {

    const today = new Date();
    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [mainView, setMainView] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [stores, setStores] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [hasIndependencies, setHasIndependencies] = useState(false);
    const failMessage = "Un problème est survenu lors de lu chargement des données. Vérifiez votre l'état de votre connexion.\n";
    const failToast = { position: 'top-right', autohide: 5000, closeButton: true, fade: true, color: 'danger', messsage: failMessage, title: 'Erreur de chargement' };

    const [product, setProduct] = useState(null);
    const [variation, setVariation] = useState(null);
    const [size, setSize] = useState(null);
    const [stock, setStock] = useState(null);
    const [batches, setBatches] = useState([]);
    const [batch, setBatch] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [lostDate, setLostDate] = useState(today);
    const [comments, setComments] = useState("");
    const [number, setNumber] = useState("");
    const [lost, setLost] = useState(null);

    useEffect(() => fetchLost(id), []);
    useEffect(() => fetchLost(id), [id]);

    useEffect(() => fetchSellers(), []);

    useEffect(() => {
        const newStock = getStock();
        setStock(newStock);
        
        if (isDefined(newStock) && mainView && isDefined(product) && product.needsTraceability) {
            const newBatches = getBatches(newStock);
            setBatches(newBatches);
            setBatch(newBatches[0]);
        }
    }, [product, variation, size, selectedStore, selectedSeller, mainView]);

    useEffect(() => {
        if (!isDefined(stock)) {
            setBatches([]);
            setBatch(null);
        }
    }, [stock]);

    const fetchLost = id => {
        if (id !== "new") {
            setEditing(true);
            LostActions.find(id)
                .then(response => {
                    setLost(response);
                    setProduct(response.product);
                    setVariation(response.variation);
                    setSize(response.size);
                    setStock(response.stock);
                    setNumber(response.number);
                    setComments(response.comments);
                    setQuantity(response.quantity);
                    setLostDate(new Date(response.lostDate));
                })
                .catch(error => {
                    console.log(error);
                    history.replace("/");
                });
        }
    };

    const fetchSellers = () => {
        SellerActions
            .findActiveSellers()
            .then(response => {
                setSellers(response);
                setSelectedSeller(response[0]);
                defineStores(response[0]);
            })
            .catch(error => addToast(failToast));
    };

    const getStock = () => {
        const stockEntity = isDefined(size) && isDefinedAndNotVoid(size.stocks) ? size : 
                            isDefined(product) && isDefinedAndNotVoid(product.stocks)? product : null;
        if (isDefined(stockEntity)) {
            if (!mainView && isDefined(selectedStore))
                return stockEntity.stocks.find(s => isDefined(s.store) && s.store.id === selectedStore.id);
            else
                return stockEntity.stocks.find(s => isDefined(s.platform));
        }
        return null;
    };

    const getBatches = viewedStock => isDefinedAndNotVoid(viewedStock.batches) ?getCompiledBatches(viewedStock.batches) : [];

    const getCompiledBatches = batches => {
        if (isDefinedAndNotVoid(batches)) {
            const batchesNumbers = [...new Set(batches.map(b => b.number))];
            return batchesNumbers.map(b => {
                const currentBatchNumber = batches.filter(batch => batch.number === b);
                return currentBatchNumber.length <= 1 ? currentBatchNumber[0] : getFormattedMultipleBatches(b, batches, currentBatchNumber);
            });
        }
        return [];
    };

    const getFormattedMultipleBatches = (number, batches, currentBatchNumber) => {
        const sumQty = getBatchQuantity(number, batches);
        const sumInitQty = getBatchInitialQuantity(number, batches);
        const smallestEndDate = getBatchDate(number, batches);
        return {number, initialQty: sumInitQty, quantity: sumQty, endDate: smallestEndDate, originals: currentBatchNumber};
    };

    const getBatchQuantity = (number, batches) => {
        const quantity = batches.reduce((sum, curr) => {
            return sum += curr.number === number ? curr.quantity : 0;
        }, 0);
        return parseFloat(quantity.toFixed(2));
    };

    const getBatchInitialQuantity = (number, batches) => {
        const quantity = batches.reduce((sum, curr) => {
            return sum += curr.number === number ? curr.initialQty : 0;
        }, 0);
        return parseFloat(quantity.toFixed(2));
    };

    const getBatchDate = (number, batches) => {
        return batches.reduce((minDate, curr) => {
            return minDate = curr.number === number && (!isDefined(minDate) || new Date(curr.endDate) < minDate) ? new Date(curr.endDate) : minDate;
        }, null);
    };

    const handleView = ({ currentTarget }) => setMainView(!mainView);
    const addToast = newToast => setToasts([...toasts, newToast]);
    const onQuantityChange = ({ currentTarget }) => setQuantity(currentTarget.value);
    const handleCommentsChange = ({ currentTarget }) => setComments(currentTarget.value);
    const onNumberChange = ({ currentTarget }) => setNumber(currentTarget.value);

    const onDateChange = datetime => {
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        setLostDate(newDate);
    };

    const handleBatchChange = ({ currentTarget }) => {
        const newBatch = batches.find(b => b.number === currentTarget.value);
        setBatch(newBatch);
    };

    const handleSellerChange= ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSeller);
        defineStores(newSeller)
    };

    const handleStoreChange= ({ currentTarget }) => {
        const newStore = stores.find(store => store.id === parseInt(currentTarget.value));
        setSelectedStore(newStore);
    };

    const  handleSumit = ({ currentTarget }) => {
        const newLost = getLost();
        const request = editing ? LostActions.update(lost.id, newLost) : LostActions.create(newLost);
        request.then(response => history.replace("/"));
    };

    const getLost = () => editing ? getUpdatedLost() : getNewLost();

    const getUpdatedLost = () => {
        return {
            ...lost,
            product: isDefined(product) ? product['@id'] : null,
            variation: isDefined(variation) ? variation['@id'] : null,
            size: isDefined(size) ? size['@id'] : null,
            stock: isDefined(stock) ? stock['@id'] : null,
            number: isDefined(product) && product.needsTraceability ? mainView && isDefined(batch) ? batch.number : number : null,
            quantity: parseFloat(quantity),
            lostDate: new Date(lostDate),
            comments
        };
    };

    const getNewLost = () => {
        return {
            product: isDefined(product) ? product['@id'] : null,
            variation: isDefined(variation) ? variation['@id'] : null,
            size: isDefined(size) ? size['@id'] : null,
            stock: isDefined(stock) ? stock['@id'] : null,
            number: isDefined(product) && product.needsTraceability ? mainView && isDefined(batch) ? batch.number : number : null,
            quantity: parseFloat(quantity),
            lostDate: new Date(lostDate),
            comments
        }; 
    };

    const defineStores = seller => {
        if (isDefinedAndNotVoid(seller.stores)) {
            const independantStores = seller.stores.filter(s => !s.main);
            const hasIndependency = independantStores.length > 0;
            setStores(independantStores)
            setSelectedStore(independantStores[0]);
            setHasIndependencies(hasIndependency);
        } else {
            setStores([]);
            setSelectedStore(null);
            setHasIndependencies(false);
            setMainView(true);
        }
    }

    const toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
    })();

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>{ !editing ? "Créer une perte" : "Modifier une perte" }</CCardHeader>
                    <CCardBody>
                        <CRow className="mt-2">
                            { !Roles.isStoreManager(currentUser) ? 
                                <CCol xs="12" sm="5" md="5">
                                        <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                        </Select>
                                </CCol>
                                :
                                <CCol xs="12" sm="5" md="5">
                                    <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                        { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                    </Select>
                                </CCol>
                            }
                            <CCol xs="12" md="6" className="my-4">
                                    <CFormGroup row className="mb-0 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="2" >
                                            <CSwitch name="mainView" className="mr-0" color="dark" shape="pill" variant="opposite" checked={ mainView } onChange={ handleView } disabled={ !hasIndependencies }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="10" className="col-form-label">
                                            Stock principal
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                        </CRow>
                        { !Roles.isStoreManager(currentUser) && hasIndependencies && !mainView &&
                            <CRow className="mt-3">
                                <CCol xs="12" md="12">
                                    <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                        { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                    </Select>
                                </CCol>
                            </CRow>
                        }
                        <CRow>
                            <CCol xs="12" sm="6">
                                <CFormGroup>
                                    <CLabel htmlFor="name">{"Produit"}</CLabel>
                                    <ProductSearch
                                        product={ product } setProduct={ setProduct }
                                        variation={ variation } setVariation={ setVariation }
                                        size={ size } setSize={ setSize }
                                        seller={ selectedSeller }
                                    />
                                </CFormGroup>
                            </CCol>
                            { isDefined(product) && product.needsTraceability && 
                                (mainView && isDefinedAndNotVoid(batches) ?
                                    <CCol xs="12" sm="6">
                                        <CFormGroup>
                                            <CLabel htmlFor="name">{"Lot"}
                                            </CLabel>
                                            <CSelect custom id="batch" value={ batch.number } onChange={ e => handleBatchChange(e) }>
                                                { batches.map(b => <option key={ b.number } value={ b.number }>{ b.number }</option>) }
                                            </CSelect>
                                            <p className="ml-auto text-right"><small><i>{ batch.quantity } { product.unit } { batch.quantity > 1 ? "disponibles" : "disponible" } en stock</i></small></p>
                                        </CFormGroup>
                                    </CCol>
                                    :
                                    <CCol xs="12" sm="6">
                                        <CFormGroup>
                                            <CLabel htmlFor="name">Lot</CLabel>
                                            <CInput id="number" name="number" value={ number } onChange={ onNumberChange } />
                                        </CFormGroup>
                                    </CCol>
                                )
                            }
                        </CRow>
                        <CRow>
                            <CCol xs="12" sm="6">
                                <CFormGroup>
                                    <CLabel htmlFor="name">Quantité perdue</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            id="quantity"
                                            type="number"
                                            name="quantity"
                                            value={ quantity }
                                            onChange={ onQuantityChange }
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText>{ isDefined(product) ? product.unit : "Kg" }</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </CFormGroup>
                            </CCol>
                            <CCol xs="12" sm="12" md="6">
                                <CFormGroup>
                                    <CLabel htmlFor="name">Date</CLabel>
                                    <Flatpickr
                                        name="lostDate"
                                        value={ lostDate }
                                        onChange={ onDateChange }
                                        className="form-control form-control-sm"
                                        options={{
                                            mode: "single",
                                            dateFormat: "d/m/Y",
                                            locale: French,
                                        }}
                                        style={{ height: "35px" }}
                                    />
                                </CFormGroup>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol xs="12" md="12" className="my-3">
                                <CLabel htmlFor="textarea-input">Commentaires</CLabel>
                                <CTextarea name="comments" id="comments" rows="9" placeholder="Cause(s) de la perte et/ou devenir des produits concernés..." onChange={ handleCommentsChange } value={ comments }/>
                            </CCol>
                        </CRow>
                        <CRow className="mt-2 mb-5 d-flex justify-content-center">
                            <CButton size="sm" color="success" onClick={ handleSumit }>
                                <CIcon name="cil-save"/> <span className="ml-2">Enregistrer</span>
                            </CButton>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/losts" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
            <CCol sm="12" lg="12">
              { Object.keys(toasters).map((toasterKey) => (
                <CToaster position={toasterKey} key={'toaster' + toasterKey}>
                    { toasters[toasterKey].map((toast, key)=> {
                        return (
                            <CToast key={ 'toast' + key } 
                                    show={ true } 
                                    autohide={ toast.autohide } 
                                    fade={ toast.fade } 
                                    color={ toast.color } 
                                    style={{ color: 'white' }}
                            >
                                <CToastHeader closeButton={ toast.closeButton }>{ toast.title }</CToastHeader>
                                <CToastBody style={{ backgroundColor: 'white', color: "black" }}>{ toast.messsage }</CToastBody>
                            </CToast>
                        )})
                    }
                </CToaster>
              ))}
            </CCol>
        </CRow>

    );
}

export default Lost;