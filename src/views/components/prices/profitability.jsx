import React, { useContext, useEffect, useState } from 'react';
import ProvisionActions from '../../../services/ProvisionActions';
import PriceGroupActions from '../../../services/PriceGroupActions';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CInputGroup, CInput, CInputGroupAppend, CInputGroupText, CCardFooter } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import ProductActions from 'src/services/ProductActions';
import SellerActions from 'src/services/SellerActions';
import Select from 'src/components/forms/Select';
import GroupRateModal from 'src/components/pricePages/groupRateModal';
import ProductsContext from 'src/contexts/ProductsContext';
import MercureContext from 'src/contexts/MercureContext';
import { updateBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';

const Profitability = (props) => {
    const itemsPerPage = 30;
    const fields = ['Vendeur', 'Fournisseur', 'Date', 'Total', ' '];
    const { currentUser, seller } = useContext(AuthContext);
    const {products, setProducts} = useContext(ProductsContext);
    const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [provisions, setProvisions] = useState([]);
    const [priceGroups, setPriceGroups] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [valuation, setValuation] = useState("LAST");
    const [selectedSellers, setSelectedSellers] = useState([]);
    const [viewedProducts, setViewedProducts] = useState([]);
    const [updated, setUpdated] = useState([]);
    const [mercureOpering, setMercureOpering] = useState(false);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchPriceGroup();
        fetchProducts();
        fetchSellers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (sellers.length > 0 && !isDefinedAndNotVoid(selectedSellers))
            setSelectedSellers(getFormattedEntities(sellers));
    }, [sellers]);

    useEffect(() => {
        if (valuation === "AVERAGE" && isDefinedAndNotVoid(selectedSellers))
            fetchProvisions();
    }, [dates, selectedSellers, valuation]);

    useEffect(() => {
        if (isDefinedAndNotVoid(products) && isDefinedAndNotVoid(selectedSellers)) {
            const filteredProducts = products.filter(p => selectedSellers.findIndex(s => s.value === p.seller['@id']) !== -1);
            setViewedProducts(filteredProducts);
        }
    }, [products, selectedSellers]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateBetween(getUTCDates(), provisions, setProvisions, updatedProvisions, setUpdatedProvisions, currentUser, seller, sellers)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    const fetchProvisions = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        ProvisionActions.findBetween(UTCDates, selectedSellers)
                .then(response => {
                    setProvisions(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    };

    const fetchProducts = () => {
        ProductActions
            .findAll()
            .then(response => setProducts(response))
            .catch(error => console.log(error));
    };

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => setSellers(response))
            .catch(error => console.log(error));
    };

    const fetchPriceGroup = () => {
        PriceGroupActions
            .findAll()
            .then(response => setPriceGroups(response))
            .catch(error => console.log(error));
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])) {
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleValuationChange = ({ currentTarget }) => {
        setValuation(currentTarget.value);
    };

    const handleSellersChange = sellers => setSelectedSellers(sellers);

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

    const getFormattedEntities = sellers => {
        return sellers.map(seller => ({ value: seller['@id'], label: seller.name, isFixed: false }));
    };

    const getStock = product => {
        let total = 0;
        const { isMixed, stock, variations } = product;
        if (!isDefined(isMixed) || !isMixed) {
            if (isDefinedAndNotVoid(variations)) {
                variations.map(variation => {
                    variation.sizes.map(size => {
                        total += size.stock.quantity;
                    })
                });
            } else if (isDefined(stock)) {
                total = stock.quantity;
            }
        }
        return total.toFixed(2);
    };

    const handlePriceChange = ({ currentTarget }, product, price) => {
        const newProducts = products.map(p => p.id === product.id ? getNewProduct(product, price, currentTarget.value) : p);
        setProducts(newProducts);
        if (!updated.includes(product.id))
            setUpdated([...updated, product.id]);
    };

    const handleUpdate = () => {
        const updatedProducts = products.filter(p => updated.includes(p.id));
        const productsToWrite = getProductsToWrite(updatedProducts);
        updatePrices(productsToWrite).then(response => console.log(productsToWrite));
    };

    const getProductsToWrite = filteredProducts => {
        return filteredProducts.map(product => {
            const { catalogs, categories, components, image, prices, seller, stock, tax, userGroups, variations, ...rest } = product;
            return {
                ...rest,
                catalogs: isDefinedAndNotVoid(catalogs) ? catalogs.map(c => c['@id']) : [],
                categories: isDefinedAndNotVoid(categories) ? categories.map(c => c['@id']) : [],
                components: isDefinedAndNotVoid(components) ? components.map(c => c['@id']) : [],
                image: isDefined(image) ? image['@id'] : null,
                seller: isDefined(seller) ? seller['@id'] : null,
                stock: isDefined(stock) ? stock['@id'] : null,
                tax: isDefined(tax) ? tax['@id'] : null,
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
        return costs.length > 0 ? (costs.reduce((sum, current) => sum += current, 0) / costs.length).toFixed(2) : "-";
    };

    const getCostWithLastCost = product => {
        return isDefined(product.lastCost) ? product.lastCost.toFixed(2) : "-"
    };

    const getCost = product => {
        return valuation === "LAST" ? getCostWithLastCost(product) : getCostWithAverage(product);
    };

    const getSignedCost = product => {
        const cost = getCost(product);
        return isNaN(cost) ? "-" : cost + ' €';
    };

    const getGainWithLastCost = (product, price) => {
        return isDefined(product.lastCost) ? ((price.amount - product.lastCost) * 100 / product.lastCost).toFixed(2) : "-";
    };

    const getGainWithAverage = (product, price) => {
        const cost = getCostWithAverage(product);
        return cost === "-" ? cost : ((price.amount - cost) * 100 / cost).toFixed(2);
    };
    
    const getGain = (product, price) => valuation === "LAST" ? getGainWithLastCost(product, price) : getGainWithAverage(product, price);

    const getSignedGain = (product, price) => {
        const gain = getGain(product, price);
        return isNaN(gain) ? "-" : gain + '%';
    };

    const getIdealPrice = (product, price) => {
        const cost = valuation === "LAST" ? getCostWithLastCost(product) : getCost(product);
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
        product.prices.map(price => {
            const priceLevel = getGainLevelInformation(product, price);
            gainLevel = priceLevel > gainLevel ? priceLevel : gainLevel;
        });
        return <>{ gainLevel == 1 ? <i className="fas fa-info-circle mr-2 text-warning"/> : 
                   gainLevel == 2 ? <i className="fas fa-exclamation-triangle mr-2 text-danger"/> : "" }
                 { product.name }
               </>;
    };

    const getGainLevelInformation = (product, price) => {
        const gain = getGain(product, price);
        const group = priceGroups.find(group => group.id === price.priceGroup.id);
        const minRate = isDefined(group) ? group.rate : 0;
        const maxRate = isDefined(group) ? (group.rate + 15) : 15;
        return isNaN(gain) || (gain >= minRate && gain <= maxRate) ? 0 : gain < minRate ? 2 : 1;
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader className="d-flex align-items-center">
                        Rentabilité des produits
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mb-2">
                            <CCol xs="12" lg="6">
                                <SelectMultiple name="sellers" label="Vendeurs" value={ selectedSellers } onChange={ handleSellersChange } data={ getFormattedEntities(sellers) }/>
                            </CCol>
                            <CCol xs="12" lg="4">
                                <Select className="mr-2" name="valuation" label="Type de valorisation" value={ valuation } onChange={ handleValuationChange }>
                                    <option value={ "LAST" }>Dernier coût d'achat</option>
                                    <option value={ "AVERAGE" }>Coût moyen d'achat</option>
                                </Select>
                            </CCol>
                            <CCol xs="12" lg="2" className="mt-4">
                                <GroupRateModal priceGroups={ priceGroups } setPriceGroups={ setPriceGroups }/>
                            </CCol>
                        </CRow>
                        { valuation === "AVERAGE" &&
                            <CRow className="mb-2">
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
                                fields={ ['Produit', 'Coût U', 'Qté', 'Valeur'] }     // fields
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                hover
                                scopedSlots = {{
                                    'Produit':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        { getSignedProductName(item) }
                                                    </Link>
                                                </td>
                                    ,
                                    'Coût U':
                                        item => <td>{ isDefined(item.isMixed) && item.isMixed ? "-" : getSignedCost(item) }</td>
                                    ,
                                    'Qté':
                                        item => <td>{ getStock(item) + " " + item.unit }</td>
                                    ,
                                    'Valeur':
                                        item => <td>{ (isDefined(item.isMixed) && item.isMixed || isNaN(getCost(item))) ? "-" : (getStock(item) * getCost(item)).toFixed(2) + " €" }</td>
                                    ,
                                    'details':
                                        item => <CCollapse show={details.includes(item.id)}>
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
                            Mettre à jour
                        </CButton>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Profitability;