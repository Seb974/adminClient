import React, { useContext, useEffect, useState } from 'react';
import ProvisionActions from '../../../services/ProvisionActions';
import PriceGroupActions from '../../../services/PriceGroupActions';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CInputGroup, CInput, CInputGroupAppend, CInputGroupText, CCardFooter, CFormGroup, CSwitch } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import { getUpdateViewedProducts } from 'src/data/dataProvider/eventHandlers/productEvents';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import ProductActions from 'src/services/ProductActions';
import SellerActions from 'src/services/SellerActions';
import Select from 'src/components/forms/Select';
import GroupRateModal from 'src/components/pricePages/groupRateModal';
import MercureContext from 'src/contexts/MercureContext';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';
import SupplierActions from 'src/services/SupplierActions';
import PlatformContext from 'src/contexts/PlatformContext';
import StoreActions from 'src/services/StoreActions';

const Profitability = (props) => {
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const fields = ['Produit', 'Coût U', 'Qté', 'Valeur', 'Prix de vente TTC', 'Marge'];
    const { currentUser, seller } = useContext(AuthContext);
    const { platform } = useContext(PlatformContext);
    const { updatedProvisions, setUpdatedProvisions, updatedProducts, setUpdatedProducts } = useContext(MercureContext);
    const [provisions, setProvisions] = useState([]);
    const [priceGroups, setPriceGroups] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [valuation, setValuation] = useState("LAST");
    const [viewedProducts, setViewedProducts] = useState([]);
    const [updated, setUpdated] = useState([]);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [mercureProductOpering, setMercureProductOpering] = useState(false);
    
    const [stores, setStores] = useState([]);
    const [mainView, setMainView] = useState(!Roles.isStoreManager(currentUser));
    const [suppliers, setSuppliers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [hasIndependencies, setHasIndependencies] = useState(false);
    const [storeProducts, setStoreProducts] = useState([]);
    const [storeTaxes, setStoreTaxes] = useState([]);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchPriceGroup();
        fetchSellers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        setValuation("LAST");
        fetchSuppliers();
    }, [selectedSeller]);

    useEffect(() => {
        const limit = mainView ? 6 : 250;
        setItemsPerPage(limit);
        setValuation("LAST");
    }, [mainView]);

    useEffect(() => {
        setUpdated([]);
        getProducts();
    }, [selectedSeller, mainView, selectedStore]);

    useEffect(() => {
        setStoreTaxes([]);
        getStoreTaxes();
    }, [selectedStore]);
    
    useEffect(() => getProducts(currentPage), [currentPage]);
    
    useEffect(() => getViewedProductsFromStore(), [storeProducts, storeTaxes]);
    useEffect(() => getProductsWithCosts(viewedProducts), [valuation, provisions]);
    useEffect(() => fetchProvisions(), [dates, selectedSuppliers, valuation, mainView, selectedStore]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateBetween(getUTCDates(), provisions, setProvisions, updatedProvisions, setUpdatedProvisions, currentUser, seller, sellers)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProducts) && !mercureProductOpering) {
            setMercureProductOpering(true);
            if (mainView)
                getUpdateViewedProducts(viewedProducts, updatedProducts, setUpdatedProducts)
                .then(response => {
                    getProductsWithCosts(response)
                    setMercureProductOpering(false);
                })
                .catch(error => setMercureProductOpering(false));
        }
    }, [updatedProducts]);

    const fetchProvisions = () => {
        if (isDefined(selectedSeller) && isDefinedAndNotVoid(selectedSuppliers) && valuation === "AVERAGE") {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            const entity = !mainView && isDefined(selectedStore) ? selectedStore['@id'] : platform['@id'];
            ProvisionActions
                .findFromSuppliersForSeller(UTCDates,selectedSeller, selectedSuppliers, mainView, entity)
                .then(response => {
                    setProvisions(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        }
    };

    const getProducts = (page = 1) => {
        if (page >= 1 && isDefined(selectedSeller)) {
            if (mainView )      // || !isDefined(selectedStore)
                getOnlineProducts(page);
            else if (isDefined(selectedStore))
                getStoreProducts(page);
        }
    };

    const getOnlineProducts = (page = 1) => {
        setLoading(true);
        ProductActions
            .findPaginatedFromSeller(selectedSeller, page, itemsPerPage)
            .then(response => {
                getProductsWithCosts(response['hydra:member']);
                setTotalItems(response['hydra:totalItems']);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                console.log(error);
            });
    };

    const getStoreProducts = (page = 1) => {
        setLoading(true);
        StoreActions
            .getProducts(selectedStore, page)
            .then(response => {
                setStoreProducts(response);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                console.log(error);
            });
    };

    const getStoreTaxes = () => {
        if (isDefined(selectedStore)) {
            StoreActions
                .getTaxes(selectedStore)
                .then(response => {
                    setStoreTaxes(response);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    };

    const getViewedProductsFromStore = () => {
        if (!mainView)
            setViewedProducts(getFormattedProducts());
    };

    const getProductsWithCosts = products => {
        if (isDefinedAndNotVoid(products)) {
            const newProducts = products.map(p => ({...p, cost: getSignedCost(p)}));
            setViewedProducts(newProducts);
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
            .catch(error => console.log(error));
    };

    const fetchPriceGroup = () => {
        PriceGroupActions
            .findAll()
            .then(response => setPriceGroups(response))
            .catch(error => console.log(error));
    };

    const fetchSuppliers = () => {
        if (isDefined(selectedSeller)) {
            SupplierActions
                .findSuppliersForSeller(selectedSeller)
                .then(response => {
                    const formattedSuppliers = getFormattedEntities(response);
                    setSuppliers(formattedSuppliers);
                    setSelectedSuppliers(formattedSuppliers);
                })
                .catch(error => console.log(error));
        }
    };

    const defineStores = seller => {
        if (isDefined(seller) && isDefinedAndNotVoid(seller.stores)) {
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
    };

    const getFormattedProducts = () => {
        if (isDefinedAndNotVoid(storeProducts) && isDefinedAndNotVoid(storeTaxes)) {
            const { isTaxIncluded } = selectedStore;
            return storeProducts.map(p => {
                const tax = storeTaxes.find(t => t['tax_id'] === p['product_vat']);
                const priceHT = isDefined(isTaxIncluded) && !isTaxIncluded ? getFloat(p['product_price']) : getPriceHT(p, tax);
                const priceTTC = isDefined(isTaxIncluded) && !isTaxIncluded ? getPriceTTC(p, tax) : getFloat(p['product_price']);
                return !isDefined(tax) ? null : {
                    id: getInt(p['products_ref_ext']),
                    name: p['product_model'],
                    lastCost: getFloat(p['product_supply_price']),
                    priceTTC: priceTTC,
                    priceHT: priceHT,
                    tax: getFloat(tax['tax_value']),
                    hiboutikId: p['product_id'],
                    cost: getFloat(p['product_supply_price']),
                };
            });
        }
        return [];
    };

    const getPriceHT = (product, tax) => {
        return isDefined(product) && isDefined(tax) && isDefined(product['product_price']) && isDefined(tax['tax_value']) ?
            getFloat((getFloat(product['product_price']) * (1 - getFloat(tax['tax_value']))).toFixed(2)) : 0;
    };

    const getPriceTTC = (product, tax) => {
        return isDefined(product) && isDefined(tax) && isDefined(product['product_price']) && isDefined(tax['tax_value']) ?
            getFloat((getFloat(product['product_price']) * (1 + getFloat(tax['tax_value']))).toFixed(2)) : 0;
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])) {
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleValuationChange = ({ currentTarget }) => setValuation(currentTarget.value);

    const handleStoreChange= ({ currentTarget }) => {
        const newStore = stores.find(store => store.id === parseInt(currentTarget.value));
        setSelectedStore(newStore);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index);
        let newDetails = details.slice();
        if (position !== -1) {
            newDetails.splice(position, 1);
        } else {
            newDetails = [...details, index];
        }
        setDetails(newDetails);
    };

    const getFormattedEntities = entities => {
        return entities.map(entity => ({ value: entity['@id'], label: entity.name, isFixed: false }));
    };

    const getStock = product => {
        let total = 0;
        const { isMixed, stocks, variations } = product;
        if (!isDefined(isMixed) || !isMixed) {
            if (isDefinedAndNotVoid(variations)) {
                variations.map(variation => {
                    variation.sizes.map(size => {
                        const sizeStock = getOnlineStock(size.stocks);
                        total += isDefined(sizeStock) ? sizeStock.quantity : 0;
                    })
                });
            } else if (isDefined(stocks)) {
                const productStock = getOnlineStock(stocks);
                total = isDefined(productStock) ? productStock.quantity : 0;
            }
        }
        return total.toFixed(2);
    };

    const getOnlineStock = stocks => stocks.find(s => isDefined(s.platform));

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(s => s.id === getInt(currentTarget.value));
        setSelectedSeller(newSeller);
        defineStores(newSeller)
    };

    const handleView = ({ currentTarget }) => setMainView(!mainView);

    const handleSuppliersChange = newSuppliers => setSelectedSuppliers(newSuppliers);

    const handlePriceChange = ({ currentTarget }, product, price) => {
        const newProducts = viewedProducts.map(p => p.id === product.id ? getNewProduct(product, price, currentTarget.value) : p);
        setViewedProducts(newProducts);
        if (!updated.includes(product.id))
            setUpdated([...updated, product.id]);
    };

    const handleUpdate = async () => {
        try {
            setUpdateLoading(true);
            let response = null;
            const updatedProducts = viewedProducts.filter(p => updated.includes(p.id));
            if (mainView) {
                const productsToWrite = getProductsToWrite(updatedProducts);
                response = await updatePrices(productsToWrite);
            } else {
                response = await updateStorePrices(updatedProducts);
                StoreActions.notifyProductPriceUpdates(selectedStore, updatedProducts.map(p => p['hiboutikId']))
            }
            setUpdated([]);
            setUpdateLoading(false);
        } catch (error) {
            console.log(error);
            setUpdateLoading(false);
        }
        
    };

    const getProductsToWrite = filteredProducts => {
        return filteredProducts.map(product => {
            const { catalogs, categories, components, image, prices, seller, stocks, tax, userGroups, variations, suppliers, costs, department, ...rest } = product;
            return {
                ...rest,
                catalogs: isDefinedAndNotVoid(catalogs) ? catalogs.map(c => c['@id']) : [],
                categories: isDefinedAndNotVoid(categories) ? categories.map(c => c['@id']) : [],
                components: isDefinedAndNotVoid(components) ? components.map(c => c['@id']) : [],
                suppliers: isDefinedAndNotVoid(suppliers) ? suppliers.map(s => s['@id']) : [],
                stocks: isDefinedAndNotVoid(stocks) ? stocks.map(s => s['@id']) : [],
                costs: isDefinedAndNotVoid(costs) ? costs.map(c => c['@id']) : [],
                image: isDefined(image) ? image['@id'] : null,
                seller: isDefined(seller) ? seller['@id'] : null,
                tax: isDefined(tax) ? tax['@id'] : null,
                department: isDefined(department) ? department['@id'] : null,
                userGroups: isDefinedAndNotVoid(userGroups) ? userGroups.map(u => u['@id']) : [],
                variations: isDefinedAndNotVoid(variations) ? variations.map(v => v['@id']) : [],
                prices: product.prices.map(p => ({...p, priceGroup: p.priceGroup['@id'], amount: getFloat(p.amount)}))
            };
        })
    };

    const updatePrices = async (newProducts) => {
        const savedProducts = await Promise.all(newProducts.map( async product => {
            return await ProductActions.update(product.id, product);
        }));
        return savedProducts;
    };

    const updateStorePrices = async (newProducts) => {
        const savedProducts = await Promise.all(newProducts.map( async product => {
            return await StoreActions.updateProductPrice(selectedStore, product);
        }));
        return  savedProducts;
    };

    const getNewProduct = (product, price, amount) => {
        return {...product, prices: product.prices.map(p => p.id === price.id ? {...price, amount} : p)};
    };

    const getCostWithAverage = product => {
        let costs = [];
        provisions.map(provision => {
            provision.goods.map(good => {
                if (good.product.id === product.id && isDefined(good.price)) {
                    costs = [...costs, good.price];
                }
            })
        });
        return costs.length > 0 ? (costs.reduce((sum, current) => sum += current, 0) / costs.length).toFixed(2) : 0;
    };

    const getCostWithLastCost = product => isDefined(product.lastCost) ? getFloat(product.lastCost).toFixed(2) : 0;

    const getCost = product => valuation === "LAST" ? getCostWithLastCost(product) : getCostWithAverage(product);

    const getSignedCost = product => {
        const cost = getCost(product);
        return isNaN(cost) ? 0 : cost;
    };

    const getGainWithLastCost = (product, price) => isDefined(product.lastCost) ? ((price.amount - product.lastCost) * 100 / product.lastCost).toFixed(2) : "-";

    const getGainWithAverage = (product, price) => {
        const cost = getCostWithAverage(product);
        return cost === "-" ? cost : ((price.amount - cost) * 100 / cost).toFixed(2);
    };
    
    const getGain = (product, price) => valuation === "LAST" ? getGainWithLastCost(product, price) : getGainWithAverage(product, price);

    const getSignedGain = (product, price) => {
        const { cost } = product;
        const { amount } = price;
        const gain = isDefined(cost) && isDefined(amount) && getFloat(amount) > 0 && getFloat(cost) > 0 ? 
                    getFloat((getFloat(amount) - getFloat(cost)) * 100 / getFloat(amount)) : 0;
        return gain > 0 ? gain.toFixed(2) + ' %' : '-';
    };

    const getIdealPrice = (product, price) => {
        const { cost } = product;
        const group = priceGroups.find(group => group.id === price.priceGroup.id);
        const idealPrice = isDefined(group) && isDefined(group.rate) ? Math.ceil( cost * (1 + group.rate / 100) * 100 ) / 100 : 0;
        return isNaN(cost) ? "-" : idealPrice + " €";
    };

    const getSignedName = (product, price) => {
        const gainLevel = getGainLevelInformation(product, price);
        return <>{ gainLevel == 1 ? <i className="fas fa-info-circle mr-2 text-warning"/> : 
                   gainLevel == 2 ? <i className="fas fa-exclamation-triangle mr-2 text-danger"/> : "" }
                 { price.priceGroup.name }
                </>;
    };

    const getSignedProductName = (product) => {
        let gainLevel = 0;
        if (isDefinedAndNotVoid(product.prices)) {
            product.prices.map(price => {
                const priceLevel = getGainLevelInformation(product, price);
                gainLevel = priceLevel > gainLevel ? priceLevel : gainLevel;
            });
            return <>{ gainLevel == 1 ? <i className="fas fa-info-circle mr-2 text-warning"/> : 
                    gainLevel == 2 ? <i className="fas fa-exclamation-triangle mr-2 text-danger"/> : "" }
                    { product.name }
                </>;
        }
        return product.name;
    };

    const getGainLevelInformation = (product, price) => {
        const gain = getGain(product, price);
        const group = priceGroups.find(group => group.id === price.priceGroup.id);
        const minRate = isDefined(group) ? group.rate : 0;
        const maxRate = isDefined(group) ? (group.rate + 15) : 15;
        return isNaN(gain) || (gain >= minRate && gain <= maxRate) ? 0 : gain < minRate ? 2 : 1;
    };

    const getShopGain = product => {
        const { tax, cost, priceTTC } = product;
        const gain = isDefined(tax) && isDefined(cost) && isDefined(priceTTC) && getFloat(priceTTC) > 0 && getFloat(cost) > 0 ? 
                    getFloat((getFloat(priceTTC) - (getFloat(cost) * (1 + getFloat(tax)))) * 100 / getFloat(priceTTC)) : 0;
        return gain > 0 ? gain.toFixed(2) + ' %' : '-';
    }

    const handlePriceStoreChange = ({ currentTarget }) => {
        const updatedProduct = viewedProducts.find(p => p.id === parseInt(currentTarget.name));
        const updatedProducts = viewedProducts.map(p => p.id !== updatedProduct.id ? p : ({
            ...updatedProduct, 
            priceTTC: currentTarget.value, 
            priceHT: getHTPrice(updatedProduct, currentTarget.value)
        }));
        setViewedProducts(updatedProducts);
        if (!updated.includes(updatedProduct.id))
            setUpdated([...updated, updatedProduct.id]);
    };

    const handleCostChange = ({ currentTarget }) => {
        const updatedProduct = viewedProducts.find(p => p.id === parseInt(currentTarget.name));
        const updatedProducts = viewedProducts.map(p => p.id == updatedProduct.id ? {...updatedProduct, cost: currentTarget.value} : p);
        setViewedProducts(updatedProducts);
    };

    const getHTPrice = ({ tax }, TTCPrice) => getFloat(getFloat(TTCPrice) * (1 - getFloat(tax))).toFixed(2);

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader className="d-flex align-items-center">
                        Rentabilité des produits
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mb-2">
                            <CCol xs="12" sm="6" md="6">
                                { !Roles.isStoreManager(currentUser) ?
                                    <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                                        { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                    </Select>
                                    :
                                    <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                        { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                    </Select>
                                }
                            </CCol>
                            <CCol xs="12" lg={ Roles.isStoreManager(currentUser) ? "6" : "4"}>
                                <Select className="mr-2" name="valuation" label="Type de valorisation" value={ valuation } onChange={ handleValuationChange }>
                                    <option value={ "LAST" }>Dernier coût d'achat</option>
                                    <option value={ "AVERAGE" }>Coût moyen d'achat</option>
                                </Select>
                            </CCol>
                            { !Roles.isStoreManager(currentUser) && 
                                <CCol xs="12" lg="2" className="mt-4">
                                    <GroupRateModal priceGroups={ priceGroups } setPriceGroups={ setPriceGroups } mainView={ mainView }/>
                                </CCol>
                            }
                        </CRow>
                        { !Roles.isStoreManager(currentUser) &&
                            <CRow className="mt-2">
                                <CCol xs="12" md="5" className="my-4">
                                    <CFormGroup row className="mb-0 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="requireDeclaration" className="mr-0" color="dark" shape="pill" variant="opposite" checked={ mainView } onChange={ handleView } disabled={ !hasIndependencies }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">
                                            Stock principal
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                                { hasIndependencies && !mainView &&
                                    <CCol xs="12" md="7">
                                        <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                            { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                        </Select>
                                    </CCol>
                                }
                            </CRow>
                        }
                        { valuation === "AVERAGE" &&
                            <CRow className="mb-2">
                                <CCol xs="12" lg="6">
                                    <SelectMultiple name="suppliers" label="Fournisseurs" value={ selectedSuppliers } onChange={ handleSuppliersChange } data={ suppliers }/>
                                </CCol>
                                <CCol xs="12" lg="6">
                                    <RangeDatePicker
                                        minDate={ dates.start }
                                        maxDate={ dates.end }
                                        onDateChange={ handleDateChange }
                                        label="Date"
                                        className = "form-control mb-3"
                                    />
                                </CCol>
                            </CRow>
                        }
                        { loading ?
                            <CRow>
                                <CCol xs="12" lg="12" className="text-center">
                                    <Spinner animation="border" variant="danger"/>
                                </CCol>
                            </CRow>
                            :
                            <CDataTable
                                items={ viewedProducts }
                                fields={ mainView ? 
                                    fields.filter(f => f !== 'Prix de vente TTC'&& f !== 'Marge') : 
                                    fields.filter(f => f !== 'Qté' && f !== 'Valeur') 
                                }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination={{
                                    'pages': Math.ceil(totalItems / itemsPerPage),
                                    'activePage': currentPage,
                                    'onActivePageChange': page => setCurrentPage(page),
                                    'align': 'center',
                                    'dots': true,
                                    'className': Math.ceil(totalItems / itemsPerPage) > 1 ? "d-block" : "d-none"
                                }}
                                hover
                                scopedSlots = {{
                                    'Produit':
                                        item => !mainView ? <td>{ item.name }</td> : 
                                                <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        { getSignedProductName(item) }
                                                    </Link>
                                                </td>
                                    ,
                                    'Coût U':
                                        item => <td>
                                                    <CInputGroup>
                                                        <CInput
                                                            type="number"
                                                            name={ item.id }
                                                            value={ item.cost }
                                                            onChange={ handleCostChange }
                                                            style={{ maxWidth: '180px'}}
                                                            disabled={ isDefined(item.isMixed) && item.isMixed  }
                                                        />
                                                        <CInputGroupAppend>
                                                            <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                                        </CInputGroupAppend>
                                                    </CInputGroup>
                                                </td>

                                    ,
                                    'Qté':
                                        item => <td>{ isDefined(item.isMixed) && item.isMixed ? "-" : getStock(item) + " " + item.unit }</td>
                                    ,
                                    'Valeur':
                                        item => <td>{ (isDefined(item.isMixed) && item.isMixed || isNaN(getCost(item))) ? "-" : (getStock(item) * getFloat(item.cost)).toFixed(2) + " €" }</td>
                                    ,
                                    'Prix de vente TTC': 
                                        item => <td>
                                                    <CInputGroup>
                                                        <CInput
                                                            type="number"
                                                            name={ item.id }
                                                            value={ item.priceTTC }
                                                            onChange={ handlePriceStoreChange }
                                                            style={{ maxWidth: '180px'}}
                                                        />
                                                        <CInputGroupAppend>
                                                            <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                                        </CInputGroupAppend>
                                                    </CInputGroup>
                                                </td>
                                    ,
                                    'Marge':
                                        item => <td>{ getShopGain(item) }</td>
                                    ,
                                    'details':
                                        item => !mainView ? <></> : <CCollapse show={details.includes(item.id)}>
                                                    <CDataTable
                                                        items={ item.prices }
                                                        fields={ [
                                                            { key: 'Groupe', _style: { width: '30%'} },
                                                            { key: 'Marge', _style: { width: '20%'} },
                                                            { key: 'PrixConseillé', _style: { width: '20%'} },
                                                            { key: 'PrixHT', _style: { width: '30%'} }
                                                        ] }
                                                        bordered
                                                        itemsPerPage={ itemsPerPage }
                                                        pagination
                                                        hover
                                                        scopedSlots = {{
                                                            'Groupe':
                                                                price => <td>{ getSignedName(item, price) }</td>
                                                            ,
                                                            'Marge':
                                                                price => <td>{ getSignedGain(item, price) }</td>
                                                            ,
                                                            'PrixConseillé':
                                                                price => <td>{ getIdealPrice(item, price) }</td>
                                                            ,
                                                            'PrixHT':
                                                                price => <td>
                                                                            <CInputGroup>
                                                                                <CInput
                                                                                    type="number"
                                                                                    name={ item.id }
                                                                                    value={ price.amount }
                                                                                    onChange={ e => handlePriceChange(e, item, price) }
                                                                                    style={{ maxWidth: '180px'}}
                                                                                />
                                                                                <CInputGroupAppend>
                                                                                    <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                                                                </CInputGroupAppend>
                                                                            </CInputGroup>
                                                                        </td>
                                                        }}
                                                    />
                                                </CCollapse>
                                }}
                            />
                        }
                    </CCardBody>
                    <CCardFooter className="d-flex justify-content-center">
                        <CButton size="sm" color="success" onClick={ handleUpdate } className="my-3" style={{width: '140px', height: '35px'}} disabled={ updated.length <= 0 }>
                            { updateLoading ? <Spinner animation="border" variant="light" size="sm"/> : "Mettre à jour" }
                        </CButton>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Profitability;