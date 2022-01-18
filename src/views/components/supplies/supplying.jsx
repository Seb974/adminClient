import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CInputGroup, CInput, CInputGroupAppend, CInputGroupPrepend, CInputGroupText, CCardFooter, CLabel } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { getEvolutionPoints, getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner'
import Select from 'src/components/forms/Select';
import SupplierActions from 'src/services/SupplierActions';
import { getStatus } from 'src/helpers/orders';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import ProductsContext from 'src/contexts/ProductsContext';
import { getProductGroups } from 'src/helpers/products';
import SimpleDatePicker from 'src/components/forms/SimpleDatePicker';
import useWindowDimensions from 'src/helpers/screenDimensions';
import SellerActions from 'src/services/SellerActions';
import ProvisionActions from 'src/services/ProvisionActions';
import CIcon from '@coreui/icons-react';

const Supplying = (props) => {

    const today = new Date();
    const itemsPerPage = 30;
    const rates = getEvolutionPoints();
    const { height, width } = useWindowDimensions();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 1);
    const fields = ['Produit', 'Sécurité', 'Stock', 'Besoin', 'Commande', 'Sélection'];
    const { currentUser } = useContext(AuthContext);
    const { products } = useContext(ProductsContext);
    const [orders, setOrders] = useState([]);
    const [sendingMode, setSendingMode] = useState("email");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [selectAll, setSelectAll] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const selectedStatus = getStatus().filter(s => !["ON_PAYMENT", "ABORTED"].includes(s.value));
    const [productGroups, setProductGroups] = useState(getProductGroups());
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [evolution, setEvolution] = useState(0);
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState(today);
    const [supplied, setSupplied] = useState([]);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getOrders();
        fetchSuppliers();
        fetchSellers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates]);

    useEffect(() => {
        if (isDefinedAndNotVoid(orders) && isDefinedAndNotVoid(products) && isDefinedAndNotVoid(productGroups) && isDefined(selectedSeller)) {
            const productsToDisplay = getProductsList();
            setDisplayedProducts(productsToDisplay);
            setSelectAll(false);
        }
    }, [orders, products, productGroups, evolution, selectedSeller, supplied, selectedSupplier]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        OrderActions.findStatusBetween(UTCDates, selectedStatus, currentUser)
                .then(response => {
                    setOrders(response.map(data => ({...data, selected: false})));
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    }

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => {
                setSuppliers(response);
                setSelectedSupplier(response[0]);
            })
            .catch(error => console.log(error));
    };

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => {
                setSellers(response);
                setSelectedSeller(response[0]);
            })
            .catch(error => console.log(error));
    };

    const handleGroupChange = productGroups => setProductGroups(productGroups);

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleSelect = item => {
        let newValue = null;
        const newProductsList = displayedProducts.map(element => {
            newValue = !element.selected;
            return element.id === item.id ? {...element, selected: newValue} : element;
        });
        setDisplayedProducts(newProductsList);
        if (newValue && selectAll)
            setSelectAll(false);
    };

    const handleSelectAll = () => {
        const newSelection = !selectAll;
        setSelectAll(newSelection);
        const newProductsList = displayedProducts.map(product => (isSelectable(product) ? {...product, selected: newSelection} : product));
        setDisplayedProducts(newProductsList);
    };

    const handleCommandChange = ({ currentTarget }, item) => {
        const newProductList = displayedProducts.map(element => (element.id === item.id ? {...element, quantity: currentTarget.value} : element));
        setDisplayedProducts(newProductList);
    };

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(supplier => supplier.id === parseInt(currentTarget.value));
        setSelectedSupplier(newSupplier);
    };

    const handleSellerChange= ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSeller);
    };

    const handleEvolutionChange = ({ currentTarget }) => {
        const newRate = parseInt(currentTarget.value);
        setEvolution(newRate);
    };

    const handleDeliveryDateChange = datetime => {
        if (isDefinedAndNotVoid(datetime)) {
            const newSelection = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
            setDeliveryDate(newSelection);
        }
    };

    const handleSubmit = () => {
        const provision = getNewProvision();
        console.log(provision);
        ProvisionActions
            .create(provision)
            .then(response => {
                setToSupplies(provision.goods);
                setSelectAll(false);
                // setDisplayedProducts(displayedProducts.filter(p => !p.selected))
                //TODO : Flash notification de succès
                // history.replace("/components/provisions");
            })
            .catch( ({ response }) => {
                // const { violations } = response.data;
                // if (violations) {
                //     const apiErrors = {};
                //     violations.forEach(({propertyPath, message}) => {
                //         apiErrors[propertyPath] = message;
                //     });
                //     // setErrors(apiErrors);
                // }
                //TODO : Flash notification d'erreur
            });
    };

    const setToSupplies = goods => {
        let newSuppliedArray = [...supplied];
        goods.map(good => {
            const goodIndex = supplied.findIndex(s => s.stock.id === good.stock.id);
            if (goodIndex > -1) 
                newSuppliedArray[goodIndex] = {...newSuppliedArray[goodIndex], quantity: newSuppliedArray[goodIndex].quantity + good.quantity};
            else
                newSuppliedArray = [...newSuppliedArray, good];
        });
        setSupplied(newSuppliedArray);
    };

    const getNewProvision = () => {
        const goods = getGoods();
        return {
            seller: selectedSeller['@id'], 
            // supplier: selectedSupplier['@id'],
            supplier: selectedSupplier,
            provisionDate: new Date(deliveryDate), 
            sendingMode,
            goods
        };
    };

    const getGoods = () => {
        return displayedProducts
            .filter(p => p.quantity > 0 && p.selected)
            .map(p => ({
                product: '/api/products/' + p.product.id,
                variation: isDefined(p.variation) ? '/api/variations/' + p.variation.id : null,
                size: isDefined(p.size) ? '/api/sizes/' + p.size.id : null,
                quantity: getFloat(p.quantity),
                unit: p.unit,
                stock: p.stock
            }))
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const isSelectable = product => {
        const { quantity } = product;
        return ((typeof quantity === 'string' && quantity.length > 0) || typeof quantity !== 'string') && parseInt(quantity) > 0;
    };

    const getProductsList = () => {
        const groupSelection = productGroups.map(p => p.value);
        const groupProducts = products.filter(p => groupSelection.includes(p.productGroup));
        const productsList = getProductsArray(groupProducts);
        return extractSales(productsList);
    };

    const getProductsArray = groups => {
        let productsList = [];
        const sellerProducts = groups.filter(p => p.seller.id === selectedSeller.id);
        sellerProducts
            .filter(p => isDefinedAndNotVoid(p.suppliers) && isDefined(selectedSupplier) && p.suppliers.findIndex(s => s.id === selectedSupplier.id) !== -1 )
            .map(product => {
            if (isDefinedAndNotVoid(product.variations))
                product.variations.map(variation => {
                    if (isDefinedAndNotVoid(variation.sizes))
                        variation.sizes.map(size => {
                            productsList = [...productsList, getVariantProduct(product, variation, size)]
                        });
                });
            else
                productsList = [...productsList, getSimpleProduct(product)];
        });
        return productsList;
    };

    const getSimpleProduct = product => {
        return {
            product: { id: product.id, name: product.name },
            variation: null,
            size: null,
            stock: product.stock,
            unit: product.unit,
            selected: false
        };
    }

    const getVariantProduct = (product, variation, size) => {
        return {
            product: { id: product.id, name: product.name },
            variation: { id: variation.id, name: variation.color },
            size: { id: size.id, name: size.name },
            stock: size.stock,
            unit: product.unit,
            selected: false
        };
    };

    const extractSales = elements => elements.map((element, index) => addSales(element, index));

    const addSales = (element, index) => {
        let sales = 0;
        const { security, quantity } = element.stock;
        orders.map(order => {
            if (!order.isRemains)
                sales = extractProduct(element, order, sales);
        });
        const evolutedSales = sales * (1 + evolution / 100);
        const suppliedQty = getSuppliedQty(element);
        const qty = (evolutedSales + security - quantity - suppliedQty) >= 0 ? (evolutedSales + security - quantity - suppliedQty) : 0;
        return {...element, id: index, quantity: qty > 0 ? Math.ceil(qty) : 0, sales: evolutedSales.toFixed(2) };
    };

    const extractProduct = (element, order, sales) => {
        order.items.map(item => {
            if (isItemProduct(item, element)) {
                const itemQty = item.unit === item.product.unit || !isDefined(item.preparedQty) || item.isAdjourned ? item.orderedQty : item.preparedQty;
                sales += itemQty;
            }
        })
        return sales;
    };

    const isItemProduct = (item, element) => {
        const { product, variation, size } = element;
        if (item.product.id === product.id) {
            if (isDefined(variation) && isDefined(item.variation) && variation.id === item.variation.id) {
                if (isDefined(size) && isDefined(item.size) && size.id === item.size.id)
                    return true;
            } else if (!isDefined(variation) && !isDefined(size) && !isDefined(item.variation) && !isDefined(item.size)) {
                return true;
            }
        }
        return false;
    };

    const getSuppliedQty = (element) => {
        const suppliedElt = supplied.find(elt => elt.stock.id === element.stock.id);
        return isDefined(suppliedElt) ? suppliedElt.quantity : 0;
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, 'name') ? " - " + variation.name : "";
        const sizeName = exists(size, 'name') ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, variable) => {
        return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
    };

    const getSignPostName = item => {
        return (
            item.stock.quantity <= item.stock.security ?
                <span  className={ width >= 576 ? "" : "text-danger" }>
                    { width >= 576 ? <i className="fas fa-exclamation-triangle mr-1 text-danger"></i> : ""} 
                     { getProductName(item.product, item.variation, item.size) }
                </span>
            : item.stock.quantity <= item.sales ?
                <span  className={ width >= 576 ? "" : "text-warning" }>
                    { width >= 576 ? <i className="fas fa-info-circle mr-1 text-warning"></i>  : ""} 
                     { getProductName(item.product, item.variation, item.size) }
                </span>
            : item.stock.quantity <= item.stock.alert ? 
                <span  className={ width >= 576 ? "" : "text-primary" }>
                    { width >= 576 ? <i className="fas fa-info-circle mr-1 text-primary"></i>  : ""} 
                     { getProductName(item.product, item.variation, item.size) }
                </span>
            : getProductName(item.product, item.variation, item.size)
        );
    };

    const handleSendingModeChange = ({ currentTarget }) => setSendingMode(currentTarget.value);
    const handleSupplierInfosChange = ({ currentTarget }) => {
        setSelectedSupplier({...selectedSupplier, [currentTarget.name]: currentTarget.value })
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Définition des besoins
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mt-2">
                            <CCol xs="12" lg="12">
                                <CLabel><h6><b>1. Estimer les besoins</b></h6></CLabel>
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol xs="12" sm="5" md="5">
                                    <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                                        { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                    </Select>
                            </CCol>
                            <CCol xs="12" lg="7">
                                <RangeDatePicker
                                    minDate={ dates.start }
                                    maxDate={ dates.end }
                                    onDateChange={ handleDateChange }
                                    label="Bornes du calcul prévisionnel"
                                    className = "form-control mb-3"
                                />
                            </CCol>
                        </CRow>
                        <hr/>
                        <CRow>
                            <CCol xs="12" lg="12" className="mt-4">
                                <Select className="mr-2" name="supplier" label="Fournisseur" value={ isDefined(selectedSupplier) ? selectedSupplier.id : 0 } onChange={ handleSupplierChange }>
                                    { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                </Select>
                            </CCol>
                        </CRow>
                        <CRow className="mb-4">
                            <CCol xs="12" lg="6">
                                <CLabel>Téléphone</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-phone"/></CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                        name="phone"
                                        value={ isDefined(selectedSupplier) && isDefined(selectedSupplier.phone) && selectedSupplier.phone.length > 0 ? (parseInt(selectedSupplier.id) !== -1 ? selectedSupplier.phone : '-') : "" }
                                        onChange={ handleSupplierInfosChange }
                                        // disabled={ !isDefined(selectedSupplier) || parseInt(selectedSupplier.id) === parseInt(allSuppliers.id) }
                                    />
                                </CInputGroup>
                            </CCol>
                            <CCol xs="12" lg="6" >
                                <CLabel>Email(s) <small className="ml-3"><i>séparation par ";"</i></small></CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText style={{ minWidth: '43px'}}>@</CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput
                                        name="email"
                                        value={ isDefined(selectedSupplier) && isDefined(selectedSupplier.email) ? (parseInt(selectedSupplier.id) !== -1 ? selectedSupplier.email : "-") : "" }
                                        onChange={ handleSupplierInfosChange }
                                        // disabled={ !isDefined(selectedSupplier) || parseInt(selectedSupplier.id) === parseInt(allSuppliers.id) }
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>
                        <hr/>
                        <CRow className="mb-4">
                            <CCol xs="12" lg="5" className="mt-4">
                                <SelectMultiple name="productGroups" label="Groupes de produits" value={ productGroups } onChange={ handleGroupChange } data={ getProductGroups() }/>
                            </CCol>
                            <CCol xs="12" lg="5" className="mt-4">
                                <Select className="mr-2" name="supplier" label="Evolution des besoins" value={ evolution } onChange={ handleEvolutionChange } style={{ height: '39px'}}>
                                    { rates.map(rate => <option key={ rate.value } value={ rate.value }>{ rate.label }</option>) }
                                </Select>
                            </CCol>
                            <CCol xs="12" lg="2" className="mt-4 d-flex align-items-center justify-content-end pr-5">
                                <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                                    <input
                                        className="mx-1 my-2"
                                        type="checkbox"
                                        name="inline-checkbox"
                                        checked={ selectAll }
                                        onClick={ handleSelectAll }
                                        disabled={ displayedProducts.length === 0 }
                                        style={{zoom: 2.3}}
                                    />
                                    <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tous</label>
                                </CFormGroup>
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
                                items={ displayedProducts }
                                fields={ width < 576 ? ['Produit', 'Commande', 'Sélection'] : fields }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'Produit':
                                        item => <td style={{width: '25%'}}>{ getSignPostName(item) }</td>
                                    ,
                                    'Sécurité':
                                        item => <td style={{width: '15%'}}>{ item.stock.security + " " + item.unit }</td>
                                    ,
                                     'Stock':
                                        item => <td style={{width: '15%'}}>{ item.stock.quantity + " " + item.unit }</td>
                                    ,
                                    'Besoin':
                                        item => <td style={{width: '15%'}}>{ item.sales + " " + item.unit }</td>
                                    ,
                                    'Commande':
                                        item => <td style={{width: '20%'}}>
                                                    <CInputGroup>
                                                        <CInput
                                                            type="number"
                                                            name={ item.id }
                                                            value={ item.quantity }
                                                            onChange={ e => handleCommandChange(e, item) }
                                                        />
                                                        <CInputGroupAppend>
                                                            <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                        </CInputGroupAppend>
                                                    </CInputGroup>
                                                </td>
                                    ,
                                    'Sélection':
                                        item => <td style={{width: '10%', textAlign: 'center'}}>
                                                    <input
                                                        className="mx-1 my-1"
                                                        type="checkbox"
                                                        name="inline-checkbox"
                                                        checked={ item.selected }
                                                        onClick={ () => handleSelect(item) }
                                                        disabled={ item.status === "WAITING" }
                                                        style={{zoom: 2.3}}
                                                    />
                                                </td>
                                }}
                            />
                        }
                        { displayedProducts.length > 0 &&
                            <CCardFooter>
                                <CRow className="mt-4">
                                    <CCol xs="12" lg="12">
                                        <CLabel><h6><b>2. Commander</b></h6></CLabel>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    {/* <CCol xs="12" lg="5" className="mt-4">
                                        <Select className="mr-2" name="supplier" label="Fournisseur" value={ isDefined(selectedSupplier) ? selectedSupplier.id : 0 } onChange={ handleSupplierChange }>
                                            { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                                        </Select>
                                    </CCol> */}
                                    <CCol className="mt-4">
                                        <SimpleDatePicker selectedDate={ [deliveryDate] } minDate={ minDate } onDateChange={ handleDeliveryDateChange } label="Date de livraison souhaitée"/>
                                    </CCol>
                                    <CCol xs="12" lg="4" className="mt-4">
                                    <Select className="mr-2" name="sendMode" label="Mode d'envoi" value={ sendingMode } onChange={ handleSendingModeChange }>
                                        <option value={"email"}>{"Email"}</option>
                                        <option value={"sms"}>{"SMS"}</option>
                                        <option value={"email & sms"}>{"Email & SMS"}</option>
                                    </Select>
                                </CCol>
                                    <CCol xs="12" lg="2" className="mt-4 d-flex justify-content-center">
                                        <CButton color="success" className="mt-4" onClick={ handleSubmit } style={{width: '180px', height: '35px'}} disabled={ displayedProducts.findIndex(p => p.selected) === -1 }>
                                            Commander
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CCardFooter>
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Supplying;