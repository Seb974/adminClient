import React, { useContext, useEffect, useState } from 'react';
import ProductActions from '../../../services/ProductActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CCardFooter, CCollapse } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import useWindowDimensions from 'src/helpers/screenDimensions';
import StockActions from 'src/services/StockActions';
import StoreActions from 'src/services/StoreActions';
import ProductsContext from 'src/contexts/ProductsContext';
import PlatformContext from 'src/contexts/PlatformContext';
import Select from 'src/components/forms/Select';
import { batch } from 'react-redux';
import CIcon from '@coreui/icons-react';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';

const Stocks = (props) => {

    const itemsPerPage = 6;
    const { currentUser, seller } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const mainStore = { id: -1, name: "Principal" };
    const fields = ['name', 'Sécurité', 'Alerte', 'Niveau'];
    const [stocks, setStocks] = useState([]);
    const { width } = useWindowDimensions();
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [stores, setStores] = useState([]);
    const [details, setDetails] = useState([]);
    const initialStore = isDefined(currentUser) && Roles.isStoreManager(currentUser) && isDefined(seller) && isDefinedAndNotVoid(seller.stores) ? seller.stores[0] : mainStore;
    const [selectedStore, setSelectedStore] = useState(initialStore);
    const defaultBatch = { number: "", endDate: new Date(), initialQty: 0, quantity: 0, isNew: true };

    useEffect(() => {
        getStores();
        if (Roles.isStoreManager(currentUser))
            setSelectedStore(seller.stores[0]);
    }, []);


    useEffect(() => getStocks(), [platform, selectedStore])
    useEffect(() => getStocks(currentPage), [currentPage]);

    const getStocks = async (page = 1) => {
        if (page >=1 && isDefined(platform) && isDefined(selectedStore)) {
            const main = !isDefined(selectedStore) || selectedStore.id === mainStore.id;
            const entity = main ? platform['@id'] : selectedStore['@id'];
            const response = page >=1 ? await StockActions.findAllPaginated(main, entity, page, itemsPerPage) : null;
            if (isDefined(response)) {
                const newStocks = response['hydra:member']
                        .map(s => ({...s, name: getStockName(s), unit: getUnit(s), updated: false}))
                        .sort((a, b) => (a.name > b.name) ? 1 : -1);
                setStocks(newStocks);
                setTotalItems(response['hydra:totalItems']);
            }
        }
    }; 

    const getStores = () => {
        StoreActions
            .findAll()
            .then(response => setStores(response))
            .catch(error => console.log(error));
    };

    // const getDefaultStock = () => {
    //     return Roles.isStoreManager(currentUser) && isDefined(seller) && isDefinedAndNotVoid(seller.stores) ? seller.stores[0] : mainStore;
    // };

    const getStockName = stock => {
        const { product, size } = stock;
        if (isDefined(size)) {
            const { variation } = size;
            const sizeName = exists(size, size.name) ? size.name : "";
            const variationName = exists(variation, variation.color) ? variation.color : "";
            const productName = exists(variation.product, variation.product.name) ? variation.product.name : ""; 
            return productName + " "  + variationName + " " + sizeName;
        } else {
            return isDefined(product) ? product.name : "";
        }
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

    const exists = (entity, entityName) => {
        return isDefined(entity) && isDefined(entityName) && entityName.length > 0 && entityName !== " ";
    };

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
                .catch(error => console.log(error));
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
        }
    };

    const getFormattedBatches = batches =>{ 
        return batches.map(({id, isNew, ...b}) => {
            const formattedBatch = {...b, initialQty: getFloat(b.initialQty), quantity: getFloat(b.quantity)};
            return isNew ? formattedBatch : {...formattedBatch, id: b['@id']};
        });
    };

    const onBatchAdd = stock => {
        const newStock = {...stock, batches: [...stock.batches, {...defaultBatch, id: new Date().getTime()}], updated: true};
        const newStocks = stocks.map(s => s.id !== newStock.id ? s : newStock);
        setStocks(newStocks);
    };

    const onBatchDelete = (batch, stock) => {
        const newQty = stock.quantity - batch.quantity;
        const newStock = {...stock, batches: stock.batches.filter(b => b.id !== batch.id), quantity: newQty, updated: true};
        const newStocks = stocks.map(s => s.id !== newStock.id ? s : newStock);
        setStocks(newStocks);
    };

    const getSignPostName = item => {
        return (
            item.quantity <= item.security ?
                <span className={ width >= 576 ? "" : "text-danger" }>
                    { width >= 576 ? <i className="fas fa-exclamation-triangle mr-1 text-danger"></i> : ""} { item.name }
                </span>
            : item.quantity <= item.alert ? 
                <span className={ width >= 576 ? "" : "text-warning" }>
                    { width >= 576 ? <i className="fas fa-info-circle mr-1 text-warning"></i>  : ""} { item.name }
                </span>
            : item.name
        );
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
                <CDataTable
                    items={ stocks }
                    fields={ width < 576 ? ['name', 'Niveau'] : fields }
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
                                            // disabled={ !(Roles.isSeller(currentUser) || Roles.hasAdminPrivileges(currentUser)) }
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
                                            // disabled={ !(Roles.isSeller(currentUser) || Roles.hasAdminPrivileges(currentUser)) }
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </td>
                        ,
                        'Niveau':
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
                                        fields={ width < 576 ? ['Lot', 'Niveau'] : ['Lot', 'Date de fin', 'Qté Initiale', 'Niveau'] }
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
                                            'Niveau':
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
            </CCardBody>
            <CCardFooter className="d-flex justify-content-center">
                <CButton size="sm" color="success" onClick={ handleUpdate } className="my-3" style={{width: '140px', height: '35px'}} disabled={ stocks.findIndex(s => s.updated) === -1 }>
                    Mettre à jour
                </CButton>
            </CCardFooter>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Stocks;