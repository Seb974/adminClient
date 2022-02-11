import React, { useContext, useEffect, useState } from 'react';
import ProductActions from '../../../services/ProductActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CCardFooter } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import useWindowDimensions from 'src/helpers/screenDimensions';
import StockActions from 'src/services/StockActions';
import StoreActions from 'src/services/StoreActions';
import ProductsContext from 'src/contexts/ProductsContext';
import Select from 'src/components/forms/Select';

const Stocks = (props) => {

    const itemsPerPage = 4;
    const { currentUser, seller } = useContext(AuthContext);
    const mainStore = { id: -1, name: "Principal" };
    const fields = ['name', 'Sécurité', 'Alerte', 'Niveau'];
    const [stocks, setStocks] = useState([]);
    const { height, width } = useWindowDimensions();
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(mainStore);

    useEffect(() => {
        getStores();
        getDisplayedProducts();
        if (Roles.isStoreManager(currentUser))
            setSelectedStore(seller.stores[0]);
    }, []);

    useEffect(() => getDisplayedProducts(), [search]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);
    useEffect(() => setStocks(defineStocks(displayedProducts)), [displayedProducts, selectedStore]);

    const getDisplayedProducts = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedProducts(search, page) : await getProducts(page);
        if (isDefined(response)) {
            setDisplayedProducts(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getProducts = (page = 1) => page >=1 ? ProductActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedProducts = (word, page = 1) => ProductActions.findWord(word, page, itemsPerPage);

    const getStores = () => {
        StoreActions
            .findAll()
            .then(response => setStores(response))
            .catch(error => console.log(error));
    };

    const defineStocks = products => {
        let newStocks = [];
        products.map(product => {
            newStocks = getStock(product, newStocks);
        });
        return newStocks;
    };

    const getStock = (product, stocks) => {
        if (isDefinedAndNotVoid(product.stocks)) {
            const searchedProduct = getStockFromSelectedStore(product);
            stocks = isDefined(searchedProduct) ? [...stocks, {...searchedProduct, name: product.name, unit: product.unit, updated: false }] : stocks;
        } else if (isDefinedAndNotVoid(product.variations)) {
            product.variations.map(variation => {
                if (isDefinedAndNotVoid(variation.sizes)) {
                    variation.sizes.map(size => {
                        const searchedSize = getStockFromSelectedStore(size);
                        stocks = isDefined(searchedSize) ? [...stocks, {...searchedSize, name: getProductName(product, variation, size), unit: product.unit, updated: false}] : stocks;
                    });
                }
            });
        }
        return stocks;
    };

    const getStockFromSelectedStore = element => {
        if (selectedStore.id === mainStore.id)
            return element.stocks.find(s => isDefined(s.platform));
        else
            return element.stocks.find(s => s.store === selectedStore['@id']);
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, variation.color) ? " - " + variation.color : "";
        const sizeName = exists(size, size.name) ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

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

    const handleUpdate = () => {
        const stocksToUpdate = stocks.filter(stock => stock.updated);
        stocksToUpdate.map(stock => {
            const {updated, name, ...dbStock} = stock;
            StockActions
                .update(dbStock.id, {...dbStock, quantity: getFloat(dbStock.quantity), alert: getFloat(dbStock.alert), security: getFloat(dbStock.security)})
                .then(response => {
                    if (response.data.id === stocksToUpdate[stocksToUpdate.length - 1].id) {
                        const newStocks = stocks.map(stock => ({...stock, updated: false}));
                        setStocks(newStocks);
                    }
                })
                .catch(error => console.log(error));
        })
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
                    item => <td style={{ width: '25%'}}>{ getSignPostName(item) }</td>
                    ,
                    'Sécurité':
                    // item => <td className="d-none d-sm-table-cell d-md-table-cell d-lg-table-cell d-xl-table-cell" style={{ width: '20%'}}>{ item.security } { item.unit }</td>
                    item => <td>
                                <CInputGroup>
                                    <CInput
                                        name="security"
                                        type="number"
                                        value={ item.security }
                                        onChange={ e => handleChange(e, item) }
                                        style={{ maxWidth: '180px'}}
                                        disabled={ !(Roles.isSeller(currentUser) || Roles.hasAdminPrivileges(currentUser)) }
                                    />
                                    <CInputGroupAppend>
                                        <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                    </CInputGroupAppend>
                                </CInputGroup>
                            </td>
                    ,
                    'Alerte':
                    // item => <td className="d-none d-sm-table-cell d-md-table-cell d-lg-table-cell d-xl-table-cell" style={{ width: '20%'}}>{ item.alert } { item.unit }</td>
                    item => <td>
                                <CInputGroup>
                                    <CInput
                                        name="alert"
                                        type="number"
                                        value={ item.alert }
                                        onChange={ e => handleChange(e, item) }
                                        style={{ maxWidth: '180px'}}
                                        disabled={ !(Roles.isSeller(currentUser) || Roles.hasAdminPrivileges(currentUser)) }
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