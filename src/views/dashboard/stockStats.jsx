import React, { useContext, useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CProgress, CRow } from '@coreui/react';
import ProductActions from 'src/services/ProductActions';
import { getActiveStatus } from 'src/helpers/orders';
import AuthContext from 'src/contexts/AuthContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate } from 'src/helpers/days';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import { updateViewedProducts } from 'src/data/dataProvider/eventHandlers/productEvents';
import { updateAllBetween, updateAllFromStoreBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';
import MercureContext from 'src/contexts/MercureContext';
import ItemActions from 'src/services/ItemActions';
import GoodActions from 'src/services/GoodActions';
import StoreActions from 'src/services/StoreActions';
import Spinner from 'react-bootstrap/Spinner';
import Roles from 'src/config/Roles';

const StockStats = () => {

    const itemsPerPage = 10;
    const status = getActiveStatus();
    const fields = [' ', 'Produit', 'Disponible', 'Commandé', 'Vendu', 'Utilisation' ];
    const { currentUser, supervisor, seller, store } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders, updatedProducts, setUpdatedProducts, updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [mercureProductOpering, setMercureProductOpering] = useState(false);
    const [mercureProvisionOpering, setMercureProvisionOpering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState([]);
    const [goods, setGoods] =  useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [products, setProducts] = useState([]);
    const [provisions, setProvisions] = useState([]);
    const [productsEntities, setProductsEntities] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updateStatusBetween(updatedOrders, getUTCDates(dates), status, sales, setSales, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProducts) && !mercureProductOpering) {
            setMercureProductOpering(true);
            updateViewedProducts(productsEntities, setProductsEntities, updatedProducts, setUpdatedProducts)
                .then(response => setMercureProductOpering(false)); 
        }
    }, [updatedProducts]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureProvisionOpering) {
            if (!Roles.isStoreManager(currentUser)) {
                setMercureProvisionOpering(true);
                updateAllBetween(getUTCDates(), provisions, setProvisions, updatedProvisions, setUpdatedProducts)
                    .then(response => setMercureProvisionOpering(false)); 
            } else if (isDefined(store)) {
                setMercureProvisionOpering(true);
                updateAllFromStoreBetween(getUTCDates(), store, provisions, setProvisions, updatedProvisions, setUpdatedProducts)
                    .then(response => setMercureProvisionOpering(false)); 
            }
        }
    }, [updatedProvisions]);

    useEffect(() => fetchProducts(), []);
    useEffect(() => fetchProducts(), [store]);
    useEffect(() => fetchProducts(currentPage), [currentPage]);

    useEffect(() => getData(), [products, dates]);
    useEffect(() => formatDisplayedProducts(), [productsEntities]);
    useEffect(() => getDisplayedProducts(), [sales, goods]);

    useEffect(() => {
        let newGoods = [];
        provisions.map(p => newGoods = [...newGoods, ...p.goods]);
        const updatedGoods = goods.map(g => {
            const updatedGood = newGoods.find(good => good.id === g.id);
            return isDefined(updatedGood) ? updatedGood : g;
        });
        const goodsFromNewProvision = newGoods.filter(g => updatedGoods.find(good => good.id === g.id) === undefined);
        const displayableGoods = [...updatedGoods, ...goodsFromNewProvision];
        setGoods(displayableGoods);
    }, [provisions]);

    const getData = async () => {
        const sales = await fetchItems();
        const provisions = await fetchGoods();
        setSales(sales);
        setGoods(provisions);
    };

    const getDisplayedProducts = () => {
        const productsWithSales = isDefinedAndNotVoid(sales) ? getProductsWithSales(products, sales) : products;
        const productsWithProvisions = isDefinedAndNotVoid(goods) ? getProductsWithProvisions(productsWithSales, goods) : productsWithSales;
        setDisplayedProducts(productsWithProvisions);
        setLoading(false);
    };

    const formatDisplayedProducts = () => {
        if (isDefinedAndNotVoid(productsEntities)) {
            const productsAndVariants = getProductsWithVariants(productsEntities);
            setProducts(productsAndVariants);
        }
    };

    const fetchProducts = ( page = 1 ) => {
        if (page >= 1) {
            try {
                if (!Roles.isStoreManager(currentUser)) {
                    setLoading(true);
                    ProductActions
                        .findBestSales(page, itemsPerPage)
                        .then(response => {
                            setTotalItems(response['hydra:totalItems']);
                            setProductsEntities(response['hydra:member']);
                        });
                } else if (isDefined(store)) {
                    setLoading(true);
                    StoreActions
                        .getProducts(store, page)
                        .then(response => {
                            const ids = response.map(p => p.products_ref_ext);
                            ProductActions
                                .findProductWithIds(ids)
                                .then(response => {
                                    setTotalItems(response['hydra:totalItems']);
                                    setProductsEntities(response['hydra:member']);
                                })
                        })
                }
            } catch (error) {
                setLoading(false);
            }
        }
    };

    const fetchItems = async () => {
        if (isDefinedAndNotVoid(products)) {
            try {
                if (!Roles.isSeller(currentUser)) {
                    return await ItemActions
                        .findProductsBetween(getUTCDates(dates), products)
                        .then(response => response['hydra:member']);
                } else if (isDefined(seller)) {
                    return await ItemActions
                        .findSellerProductsBetween(getUTCDates(dates), products, seller)
                        .then(response => response['hydra:member']);
                }
            } catch (error) {
                setLoading(false);
            }
        }
        return new Promise((resolve, reject) => resolve([]));
    };

    const fetchGoods = async () => {
        if (isDefinedAndNotVoid(products)) {
            try {
                if (Roles.isSeller(currentUser) && isDefined(seller)) {
                    return await GoodActions
                        .findSellerProductsBetween(getUTCDates(dates), products, seller)
                        .then(response => response['hydra:member']);
                } else if (Roles.isStoreManager(currentUser) && isDefined(store)) {
                    return await GoodActions
                        .findStoreProductsBetween(getUTCDates(dates), products, store)
                        .then(response => response['hydra:member']);
                } else {
                    return await GoodActions
                        .findProductsBetween(getUTCDates(dates), products)
                        .then(response => response['hydra:member']);
                }
            } catch (error) {
                setLoading(false);
            }
        }
        return new Promise((resolve, reject) => resolve([]));
    };

    const getProductsWithSales = (products, sales) => {
        return products.map(p => {
            const productSales = getProductTotalSales(p, sales);
            const clients = getProductClients(p, sales);
            return {...p, ordered: productSales, clients};
        });
    };

    const getProductsWithProvisions = (products, provisions) => {
        return products.map(p => {
            const productProvisions = getProductTotalProvisions(p, provisions);
            return {...p, provisioned: productProvisions};
        });
    };

    const getProductTotalSales = (product, sales) => {
        return sales.reduce((sum, cur) => {
            return sum += isSameProduct(product, cur) ? cur.orderedQty : 0;
        }, 0);
    };

    const getProductClients = (product, sales) => {
        return sales.reduce((sum, cur) => {
            return sum += isSameProduct(product, cur) ? 1 : 0;
        }, 0);
    };

    const getProductTotalProvisions = (product, provisions) => {
        return provisions.reduce((sum, cur) => {
            return sum += isSameProduct(product, cur) ? cur.quantity : 0;
        }, 0);
    };

    const isSameProduct = (product, sale) => {
        if (isDefined(product.product) && isDefined(sale.product) && product.product['@id'] === sale.product['@id']) {
            if (isDefined(product.variation) && isDefined(sale.variation) && isDefined(product.size) && isDefined(sale.size)) {
                if (product.variation['@id'] === sale.variation['@id'] && product.size['@id'] === sale.size['@id']) {
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;
    };

    const getProductsWithVariants = products => {
        let newProducts = [];
        products.map(p => {
            if (!isDefinedAndNotVoid(p.variations)) {
                newProducts = [...newProducts, getNewProduct(p, null, null, p.stocks)]
            } else {
                p.variations.map((v, i) => {
                    v.sizes.map((s, j) => {
                        newProducts = [...newProducts, getNewProduct(p, v, s, s.stocks)];
                    })
                });
            }
        });
        return newProducts;
    };

    const getNewProduct = (product, variation, size, stocks) => ({
        product,
        variation,
        size,
        stock: stocks.find(s => !Roles.isStoreManager(currentUser) && isDefined(s.platform) || isDefined(s.store)),
        name: getProductName(product, variation, size),
        ordered: 0,
        provisioned: 0,
        clients: 0
    });

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 4, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 19, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const getDateName = () => {
        const { end } = dates;
        const { start } = getUTCDates();
        return  isSameDate(new Date(), start) && isSameDate(new Date(), end) ? "Aujourd'hui" :
                isSameDate(new Date(), end) ? "Du " + getFormattedDate(start) + " à aujourd'hui" :
                isSameDate(new Date(), start) ? "D'aujourd'hui au " + getFormattedDate(end) :
                "Du " + getFormattedDate(start) + " au " + getFormattedDate(end);
    };

    const getFormattedDate = date => date.toLocaleDateString('fr-FR', { timeZone: 'UTC'});

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate(), 23, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };


    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, "color") ? " " + variation.color : "";
        const sizeName = exists(size, "name") ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, entityName) => {
        return isDefined(entity) && isDefined(entity[entityName]) && entity[entityName].length > 0 && entity[entityName] !== " ";
    };

    const getSign = item => {
        const { stock, ordered, provisioned } = item;
        if (isDefined(stock)) {
            return (
                (stock.quantity + provisioned - ordered) <= stock.security ?
                    <span><i className="fas fa-exclamation-triangle mr-1 text-danger" style={{ width: '36px', height: '36px'}}></i></span>
                : (stock.quantity + provisioned - ordered) <= stock.alert ? 
                    <span><i className="fas fa-info-circle mr-1 text-warning" style={{ width: '36px', height: '36px'}}></i></span>
                : <span></span>
            );
        }
        return <span></span>
    };

    const getColor = item => {
        const { stock } = item;
        if (isDefined(stock)) {
            const percent = (isDefined(stock.quantity) && stock.quantity > 0 ? (stock.ordered / stock.quantity * 100).toFixed(0) : 0);
            return  percent < 30 ? "success" : 
                    percent >= 30 && percent < 70 ? "info" :
                    percent >= 70 && percent < 100 ? "warning" : "danger";
        }
        return "info";
    };

    const getQuantity = item => {
        const { stock } = item;
        return isDefined(stock) ? stock.quantity : 0;
    };

    const getSecurity = item => {
        const { stock } = item;
        return isDefined(stock) ? stock.security : 0;
    };

    const getAlert = item => {
        const { stock } = item;
        return isDefined(stock) ? stock.alert : 0;
    };

    const getUnit = item => {
        const { product } = item;
        return isDefined(product) ? product.unit : "";
    };

    const getUsage = item => isDefined(item) ? item.ordered / (getQuantity(item) > 0 ? (getQuantity(item) + item.provisioned) : 1) * 100 : 0;

    return (
        <CRow>
            <CCol>
            <CCard>
                <CCardHeader>
                    <CRow className="d-flex align-items-center">
                        <CCol xs="12" sm="12" lg="6" className="d-flex justify-content-start mb-2">
                            { getDateName() }
                        </CCol>
                        <CCol xs="12" sm="12" lg="6" className="d-flex justify-content-end mb-2">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label=""
                                className="form-control"
                            />
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody>
                    { loading ?
                        <CRow>
                            <CCol xs="12" lg="12" className="text-center">
                                <Spinner animation="border" variant="danger"/>
                            </CCol>
                        </CRow>
                        :
                        <CDataTable
                            items={ displayedProducts }
                            fields={ !Roles.isStoreManager(currentUser) ? fields : fields.filter(f => f !== 'Vendu'  && f !== 'Utilisation') }
                            bordered
                            itemsPerPage={ displayedProducts.length }
                            pagination={{
                            'pages': Math.ceil(totalItems / itemsPerPage),
                            'activePage': currentPage,
                            'onActivePageChange': page => setCurrentPage(page),
                            'align': 'center',
                            'dots': true,
                            'className': Math.ceil(totalItems / itemsPerPage) > 1 ? "d-block" : "d-none"
                            }}
                            scopedSlots = {{
                                ' ':
                                    item => <td className="text-center">
                                                <div className="c-avatar"> 
                                                    { getSign(item) }
                                                </div>
                                            </td>
                                ,
                                'Produit':
                                    item => <td>
                                                <div>
                                                    <strong>{ item.name }</strong>
                                                </div>
                                                <div className="small text-muted">
                                                    <span>Sécurité : { getSecurity(item) + " " + getUnit(item) }</span> | Alerte : { getAlert(item) + " " + getUnit(item) }
                                                </div>
                                            </td>
                                    ,
                                'Utilisation':
                                    item => <td>
                                                <div className="clearfix">
                                                    <div className="float-left">
                                                        <strong>{ getUsage(item).toFixed(0) + '%' }</strong>
                                                    </div>
                                                    <div className="float-right">
                                                        <small className="text-muted">{ item.clients + " client" + (item.clients > 1 ? "s" : "") }</small>
                                                    </div>
                                                </div>
                                                <CProgress className="progress-xs" color={ getColor(item) } value={ getUsage(item) } />
                                            </td>
                                    ,
                                'Disponible':
                                    item => <td>
                                                { getQuantity(item) + " " + getUnit(item) }
                                            </td>
                                    ,
                                'Commandé':
                                    item => <td>
                                                { item.provisioned.toFixed(2) + " " + getUnit(item) }
                                            </td>
                                ,
                                'Vendu':
                                    item => <td>
                                                { item.ordered.toFixed(2) + " " + getUnit(item) }
                                            </td>
                            }} 
                        />
                    }
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
  )
}

export default StockStats;
