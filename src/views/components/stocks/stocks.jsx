import React, { useContext, useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CCardFooter, CCollapse } from '@coreui/react';
import { Link } from 'react-router-dom';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import useWindowDimensions from 'src/helpers/screenDimensions';
import StockActions from 'src/services/StockActions';
import StoreActions from 'src/services/StoreActions';
import PlatformContext from 'src/contexts/PlatformContext';
import Select from 'src/components/forms/Select';
import CIcon from '@coreui/icons-react';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';
import Spinner from 'react-bootstrap/Spinner';

const Stocks = ({ history }) => {

    const itemsPerPage = 50;
    const { currentUser, seller } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const mainStore = { id: -1, name: "Principal" };
    const fields = ['name', 'Sécurité', 'Alerte', 'Disponible'];
    const [stocks, setStocks] = useState([]);
    const { width } = useWindowDimensions();
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [stores, setStores] = useState([]);
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const initialStore = isDefined(currentUser) && Roles.isStoreManager(currentUser) && isDefined(seller) && isDefinedAndNotVoid(seller.stores) ? seller.stores[0] : mainStore;
    const [selectedStore, setSelectedStore] = useState(initialStore);
    const defaultBatch = { number: "", endDate: new Date(), initialQty: 0, quantity: 0, isNew: true };

    useEffect(() => {
        getStores();
        if (Roles.isStoreManager(currentUser))
            setSelectedStore(seller.stores[0]);
    }, []);

    useEffect(() => getStocks(), [platform, selectedStore]);
    useEffect(() => getStocks(currentPage), [currentPage]);

    const getStocks = async (page = 1) => {
        if (page >=1 && isDefined(platform) && isDefined(selectedStore)) {
            try {
                setLoading(true);
                const main = !isDefined(selectedStore) || selectedStore.id === mainStore.id;
                const entity = main ? platform['@id'] : selectedStore['@id'];
                const response = page >=1 ? await StockActions.findAllPaginated(main, entity, page, itemsPerPage) : null;
                if (isDefined(response)) {
                    const newStocks = response['hydra:member']
                            .map(s => ({...s, unit: getUnit(s), updated: false, batches: getCompiledBatches(s.batches)}))
                            .sort((a, b) => (a.name > b.name) ? 1 : -1);
                    setStocks(newStocks);
                    setTotalItems(response['hydra:totalItems']);
                    
                }
            } catch (error) {
                history.replace("/");
            } finally {
                setLoading(false);
            }

        }
    }; 

    const getStores = () => {
        StoreActions
            .findAll()
            .then(response => setStores(response))
            .catch(error => history.replace("/"));
    };

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

    const getUnit = stock  => {
        const { product, size} = stock;
        if (isDefined(product)) {
            return product.unit;
        } else {
            return isDefined(size) && isDefined(size.variation) && isDefined(size.variation.product) ? 
                    size.variation.product.unit : 'U';
        }
    }

    const handleChange = ({ currentTarget }, stock) => {
        const index = stocks.findIndex(s => parseInt(s.id) === parseInt(stock.id));
        const newStocks = stocks.map((s, i) => i !== index ? s : {...stock, [currentTarget.name]: currentTarget.value, updated: true} );
        setStocks(newStocks);
    };

    const handleStoreChange = ({ currentTarget }) => {
        const newStore = isDefinedAndNotVoid(stores) ? 
            stores.find(s => s.id === parseInt(currentTarget.value))
        : mainStore;
        setSelectedStore(isDefined(newStore) ? newStore : mainStore);
        setCurrentPage(1);
    };

    const handleBatchChange = ({ currentTarget }, batch, stock) => {
        let newStock = null;
        const { batches } = stock;
        const { quantity } = batch;
        if (currentTarget.name === "quantity") {
            const newQty = getFloat(currentTarget.value) - quantity;
            newStock = {...stock, batches: batches.map(b => b.id !== batch.id ? b : {...batch, [currentTarget.name]: currentTarget.value}), quantity: stock.quantity + newQty, updated: true};
        } else {
            newStock = {...stock, batches: batches.map(b => b.id !== batch.id ? b : {...batch, [currentTarget.name]: currentTarget.value}), updated: true};
        }
        const newStocks = stocks.map(s => s.id !== newStock.id ? s : newStock);
        setStocks(newStocks);
    };

    const handleBatchDateChange = (datetime, batch, stock) => {
        const { batches } = stock;
        const newDate = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
        const newStock = {...stock, batches: batches.map(b => b.id !== batch.id ? b : {...batch, endDate: newDate}), updated: true};
        const newStocks = stocks.map(s => s.id !== newStock.id ? s : newStock);
        setStocks(newStocks);
    };

    const handleUpdate = () => {
        const stocksToUpdate = stocks.filter(stock => stock.updated);
        stocksToUpdate.map(stock => {
            const {updated, name, ...dbStock} = stock;
            const formattedStock = getStockWithFormattedBatches(dbStock);
            StockActions
                .update(dbStock.id, formattedStock)
                .then(response => {
                    if (response.data.id === stocksToUpdate[stocksToUpdate.length - 1].id) {
                        const newStocks = stocks.map(stock => ({...stock, updated: false}));
                        setStocks(newStocks);
                    }
                })
                .catch(error => history.replace("/"));
        })
    };

    const getStockWithFormattedBatches = stock => {
        const { batches, quantity, alert, security } = stock;
        return {
            ...stock,
            alert: getFloat(alert),
            security: getFloat(security),
            quantity: getFloat(quantity),
            batches: isDefinedAndNotVoid(batches) ? getFormattedBatches(batches) : [],
            size: isDefined(stock.size) ? (typeof stock.size === 'string' ? stock.size : stock.size['@id']) : null,
            store: isDefined(stock.store) ? (typeof stock.store === 'string' ? stock.store : stock.store['@id']) : null,
            product: isDefined(stock.product) ? (typeof stock.product === 'string' ? stock.product : stock.product['@id']) : null,
            platform: isDefined(stock.platform) ? (typeof stock.platform === 'string' ? stock.platform : stock.platform['@id']) : null,
        };
    };

    const getFormattedBatches = batches => {
        let stockBatches = [];
        batches.map(({id, isNew, originals, ...b}) => {
            if (isDefined(originals)) {
                const updatedBatches = updateOriginalsCombinatedBatches(b, originals);
                stockBatches = [...stockBatches, ...updatedBatches];
            } else {
                const formattedBatch = {...b, initialQty: getFloat(b.initialQty), quantity: getFloat(b.quantity)};
                stockBatches = isNew ? [...stockBatches, formattedBatch] : [...stockBatches, {...formattedBatch, id: b['@id']}];
            }
        });
        return stockBatches;
    };

    const updateOriginalsCombinatedBatches = (update, originals) => {
        const previousQty = originals.reduce((sum, curr) => sum += curr.quantity, 0);
        if (update.quantity > previousQty) {
            const qtyToDecrease = update.quantity - previousQty;
            return increaseOriginals(qtyToDecrease, originals);
        } else if (update.quantity < previousQty) {
            const qtyToIncrease = previousQty - update.quantity;
            return decreaseOriginals(qtyToIncrease, originals);
        }
        return originals;
    };

    const increaseOriginals = (quantity, originals) => {
        let qtyToIncrease = quantity;
        const orderedOriginals = originals.sort((a, b) => (a.quantity > b.quantity) ? 1 : -1);
        return orderedOriginals.map(batch => {
            let newQty = batch.quantity + qtyToIncrease > batch.initialQty ? batch.initialQty : batch.quantity + qtyToIncrease;
            qtyToIncrease = batch.quantity + qtyToIncrease > batch.initialQty ? qtyToIncrease + batch.quantity - batch.initialQty : 0;
            return {...batch, id: batch['@id'], quantity: newQty};
        });
    };

    const decreaseOriginals = (quantity, originals) => {
        let qtyToDecrease = quantity;
        const orderedOriginals = originals.sort((a, b) => (a.quantity > b.quantity) ? 1 : -1);
        return orderedOriginals.map(batch => {
            let newQty = batch.quantity > qtyToDecrease ? batch.quantity - qtyToDecrease : 0;
            qtyToDecrease = batch.quantity > qtyToDecrease ? 0 : qtyToDecrease - batch.quantity;
            return {...batch, id: batch['@id'], quantity: newQty};
        });
    };

    const onBatchAdd = stock => {
        const newStock = {...stock, batches: [...stock.batches, {...defaultBatch, id: new Date().getTime()}], updated: true};
        const newStocks = stocks.map(s => s.id !== newStock.id ? s : newStock);
        setStocks(newStocks);
    };

    const onBatchDelete = (batch, stock) => {
        const newQty = stock.quantity - batch.quantity;
        const  newStock = {...stock, batches: stock.batches.filter(b => b.number !== batch.number), quantity: newQty, updated: true};
        const newStocks = stocks.map(s => s.id !== newStock.id ? s : newStock);
        setStocks(newStocks);
    };

    const getSignPostName = item => {
        return (
            item.quantity <= item.security ?
                <span className={ width >= 576 ? "" : "text-danger" }>
                    { width >= 576 ? <i className="fas fa-exclamation-triangle mr-1 text-danger"></i> : ""} { getProductName(item) }
                </span>
            : item.quantity <= item.alert ? 
                <span className={ width >= 576 ? "" : "text-warning" }>
                    { width >= 576 ? <i className="fas fa-info-circle mr-1 text-warning"></i>  : ""} { getProductName(item) }
                </span>
            : getProductName(item)
        );
    };

    const getProductName = item => {
        const { product, size } = item;
        let variationName = "";
        let sizeName = "";
        let productName = isDefined(product) ? product.name : "";
        if (isDefined(size)) {
            const { variation, name } = size;
            variationName = isDefined(variation) && variation.color.trim().length > 0 ? " " + variation.color : "";
            sizeName = name.trim().length > 0 ? " " + name : "";
            productName = productName.trim().length <= 0 && isDefined(variation.product) ? variation.product.name : productName;
        }
        return productName + variationName + sizeName;
    };

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
            newDetails.splice(position, 1)
        } else {
            newDetails = [...details, index]
        }
        setDetails(newDetails);
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>Etat des stocks</CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol xs="12" lg="12" className="my-2">
                        <Select className="mr-2" name="store" label="Stock" value={ isDefined(selectedStore) ? selectedStore.id : mainStore.id } onChange={ handleStoreChange }>
                            { !Roles.isStoreManager(currentUser) && <option value={ mainStore.id }>{ mainStore.name }</option> }
                            { isDefinedAndNotVoid(stores) && stores.map(store => <option key={ store.id } value={ store.id }>{ store.seller.name + " - " + store.name }</option>) }
                        </Select>
                    </CCol>
                </CRow>
                { loading ?
                    <CRow>
                        <CCol xs="12" lg="12" className="text-center">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow>
                    :
                    <CDataTable
                        items={ stocks }
                        fields={ width < 576 ? ['name', 'Disponible'] : fields }
                        bordered
                        itemsPerPage={ stocks.length }
                        pagination={{
                            'pages': Math.ceil(totalItems / itemsPerPage),
                            'activePage': currentPage,
                            'onActivePageChange': page => setCurrentPage(page),
                            'align': 'center',
                            'dots': true,
                            'className': Math.ceil(totalItems / itemsPerPage) > 1 ? "d-block" : "d-none"
                        }}
                        tableFilter
                        onTableFilterChange={ word => setSearch(word) }
                        scopedSlots = {{
                            'name':
                            item => <td style={{ width: '25%'}}>
                                        { !isDefinedAndNotVoid(item.batches) ? getSignPostName(item) : 
                                            <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                { getSignPostName(item) }
                                            </Link>
                                        }
                                    </td>
                            ,
                            'Sécurité':
                            item => <td>
                                        <CInputGroup>
                                            <CInput
                                                name="security"
                                                type="number"
                                                value={ item.security }
                                                onChange={ e => handleChange(e, item) }
                                                style={{ maxWidth: '180px'}}
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                    </td>
                            ,
                            'Alerte':
                            item => <td>
                                        <CInputGroup>
                                            <CInput
                                                name="alert"
                                                type="number"
                                                value={ item.alert }
                                                onChange={ e => handleChange(e, item) }
                                                style={{ maxWidth: '180px'}}
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                    </td>
                            ,
                            'Disponible':
                            item => <td>
                                        <CInputGroup>
                                            <CInput
                                                name="quantity"
                                                type="number"
                                                value={ item.quantity }
                                                onChange={ e => handleChange(e, item) }
                                                style={{ maxWidth: '180px'}}
                                            />
                                            <CInputGroupAppend>
                                                <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                            </CInputGroupAppend>
                                        </CInputGroup>
                                    </td>
                            ,
                            'details':
                            item => <CCollapse show={details.includes(item.id)}>
                                        <CDataTable
                                            items={ item.batches }
                                            fields={ width < 576 ? ['Lot', 'Disponible'] : ['Lot', 'Date de fin', 'Qté Initiale', 'Disponible'] }
                                            bordered
                                            itemsPerPage={ item.batches.length }
                                            scopedSlots = {{
                                                'Lot':
                                                    batch => <td style={{ width: '25%'}}>
                                                                <CInputGroup>
                                                                    <CInput
                                                                        name="number"
                                                                        value={ batch.number }
                                                                        disabled={ !isDefined(batch.isNew) }
                                                                        style={{ maxWidth: '180px'}}
                                                                        onChange={ e => handleBatchChange(e, batch, item) }
                                                                    />
                                                                    <CInputGroupAppend>
                                                                        <CInputGroupText style={{ minWidth: '43px'}} onClick={ e => onBatchDelete(batch, item) }>
                                                                            <i className="fas fa-times mx-auto"></i>
                                                                        </CInputGroupText>
                                                                    </CInputGroupAppend>
                                                                </CInputGroup>
                                                            </td>
                                                ,
                                                'Date de fin':
                                                    batch => <td style={{ width: '25%'}}>
                                                                <CInputGroup>
                                                                    <Flatpickr
                                                                        name="endDate"
                                                                        disabled={ !isDefined(batch.isNew) }
                                                                        value={ [ new Date(batch.endDate) ] }
                                                                        onChange={ e => handleBatchDateChange(e, batch, item) }
                                                                        className={`form-control`}
                                                                        style={{ maxWidth: '224px' }}
                                                                        options={{
                                                                            dateFormat: "d/m/Y",
                                                                            locale: French,
                                                                        }}
                                                                    />
                                                                </CInputGroup>
                                                            </td>
                                                ,
                                                'Qté Initiale':
                                                    batch => <td style={{ width: '25%'}}>
                                                                <CInputGroup>
                                                                    <CInput
                                                                        name="initialQty"
                                                                        type="number"
                                                                        value={ batch.initialQty }
                                                                        disabled={ !isDefined(batch.isNew) }
                                                                        onChange={ e => handleBatchChange(e, batch, item) }
                                                                        style={{ maxWidth: '180px'}}
                                                                    />
                                                                    <CInputGroupAppend>
                                                                        <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                                    </CInputGroupAppend>
                                                                </CInputGroup>
                                                            </td>
                                                ,
                                                'Disponible':
                                                    batch => <td style={{ width: '25%'}}>
                                                                <CInputGroup>
                                                                    <CInput
                                                                        name="quantity"
                                                                        type="number"
                                                                        value={ batch.quantity }
                                                                        onChange={ e => handleBatchChange(e, batch, item) }
                                                                        style={{ maxWidth: '180px'}}
                                                                    />
                                                                    <CInputGroupAppend>
                                                                        <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                                    </CInputGroupAppend>
                                                                </CInputGroup>
                                                            </td>
                                                }}
                                        />
                                        <CRow className="mt-2 mb-5 d-flex justify-content-center">
                                            <CButton size="sm" color="warning" onClick={ e => onBatchAdd(item) }>
                                                <CIcon name="cil-plus"/> Ajouter un lot
                                            </CButton>
                                        </CRow>
                                    </CCollapse>
                        }}
                    />
                }
            </CCardBody>
            { !loading && 
                <CCardFooter className="d-flex justify-content-center">
                    <CButton size="sm" color="success" onClick={ handleUpdate } className="my-3" style={{width: '140px', height: '35px'}} disabled={ stocks.findIndex(s => s.updated) === -1 }>
                        Mettre à jour
                    </CButton>
                </CCardFooter>
            }
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Stocks;