import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CInputGroup, CInput, CInputGroupAppend, CInputGroupPrepend, CInputGroupText, CCardFooter, CLabel, CValidFeedback, CInvalidFeedback, CToaster, CToast, CToastHeader, CToastBody, CSwitch } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { getEvolutionPoints, getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';
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
import UpdateCost from 'src/components/supplyingPages/UpdateCost';

import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';
import { getDateFrom, isSameDate, isSameTime } from 'src/helpers/days';
import PlatformContext from 'src/contexts/PlatformContext';
import StoreActions from 'src/services/StoreActions';
import DepartmentActions from 'src/services/DepartmentActions';
import SaleActions from 'src/services/SaleActions';

const Supplying = (props) => {

    const today = new Date();
    const itemsPerPage = 30;
    const rates = getEvolutionPoints();
    const { height, width } = useWindowDimensions();
    const [minDate, setMinDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 1));
    const fields = ['Produit', 'Coût', 'Stock', 'Besoin', 'Commande', 'Sélection'];
    const { currentUser, seller } = useContext(AuthContext);
    const { products } = useContext(ProductsContext);
    const { platform } = useContext(PlatformContext);
    const [orders, setOrders] = useState([]);
    const [sendingMode, setSendingMode] = useState("email");
    const [receiveMode, setReceiveMode] = useState("livraison");
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
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [mainView, setMainView] = useState(true);
    const [hasIndependencies, setHasIndependencies] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [visibleDepartments, setVisibleDepartments] = useState([]);

    const [toasts, setToasts] = useState([]);
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

    useEffect(() => {
        if (isDefined(selectedSupplier) && isDefined(selectedSeller)) {
            const newMinDate = getFirstDeliverableDay();
            setMinDate(newMinDate);
            setDeliveryDate(newMinDate);
        }
    }, [selectedSupplier, selectedSeller]);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getOrders();
        fetchSuppliers();
        fetchDepartments();
        if (!Roles.isSeller(currentUser) && !Roles.isStoreManager(currentUser)) {
            fetchSellers();
        } else {
            setSellers([seller]);
            setSelectedSeller(seller);
            defineStores(seller);
        }
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates, selectedStore, mainView]);

    useEffect(() => {
        if (isDefined(selectedSupplier) && isDefined(selectedSeller))
            getSupplierDepartments();
    }, [selectedSupplier, selectedSeller]);


    useEffect(() => {
        if (isDefined(orders) && isDefinedAndNotVoid(products)) {
            const productsToDisplay = getProductsList();
            setDisplayedProducts(productsToDisplay);
            setSelectAll(false);
        }
    }, [orders, products, evolution, selectedSeller, supplied, visibleDepartments, selectedStore, mainView]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        // const Id = mainView || !isDefined(selectedStore) ? platform['@id'] : selectedStore['@id'];
        if (mainView || !isDefined(selectedStore)) {
            OrderActions
                .findInWarehouseStatusBetween(UTCDates, selectedStatus, currentUser, mainView, platform['@id'])
                .then(response => {
                    setOrders(response.map(data => ({...data, selected: false})));
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        } else {
            SaleActions
                .findStoreSalesBetween(UTCDates, selectedStore)
                .then(response => {
                    const formattedSales = getFormattedSales(response);
                    console.log(formattedSales);
                    setOrders(formattedSales);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });

        }
    };

    const getFormattedSales = sales => {
        return sales.map(({purchases, ...sale}) => {
            return { 
                ...sale, 
                isRemains: false,
                selected: false,
                items: purchases.map(({quantity, ...p}) => ({...p, orderedQty: quantity, unit: p.product.unit }))
            };
        })
    };


    const fetchDepartments = () => {
        DepartmentActions
            .findAll()
            .then(response => {
                const formattedDepartments = response.map(d => ({value: d['@id'], label: d.name, isFixed: false}));
                setDepartments(formattedDepartments);
                // setVisibleDepartments(formattedDepartments);
            })
            .catch(error => console.log(error));
    };

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
                defineStores(response[0]);
            })
            .catch(error => console.log(error));
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
    };

    const handleDepartmentChange = departments => setVisibleDepartments(departments);

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
        defineStores(newSeller);
    };

    const handleStoreChange= ({ currentTarget }) => {
        const newStore = stores.find(store => store.id === parseInt(currentTarget.value));
        setSelectedStore(newStore);
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

    const handleView = ({ currentTarget }) => setMainView(!mainView);

    const handleSubmit = () => {
        if (displayedProducts.findIndex(p => p.selected) === -1) {
            addToast(voidToast);
        } else if (isDefined(selectedSupplier.provisionMin) && getFloat(getTotal()) < selectedSupplier.provisionMin) {
            addToast(minToast);
        } else if (isDefined(selectedSupplier.deliveryMin) && receiveMode === "livraison" && getFloat(getTotal()) < selectedSupplier.deliveryMin) {
            addToast(deliveryMinToast);
        } else {
            const provision = getNewProvision();
            ProvisionActions
                .create(provision)
                .then(response => {
                    setToSupplies(provision.goods);
                    setSelectAll(false);
                    addToast(successToast);
                })
                .catch(error => addToast(failToast));
        }
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

    const getGoods = () => {
        return displayedProducts
            .filter(p => p.quantity > 0 && p.selected)
            .map(p => ({
                product: '/api/products/' + p.product.id,
                variation: isDefined(p.variation) ? '/api/variations/' + p.variation.id : null,
                size: isDefined(p.size) ? '/api/sizes/' + p.size.id : null,
                quantity: getFloat(p.quantity),
                unit: p.unit,
                stock: p.stock,
                price: getSupplierCostValue(p.product)
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
        if (isDefinedAndNotVoid(visibleDepartments)) {
            const departmentSelection = visibleDepartments.map(d => d.value);
            const departmentProducts = products.filter(p => isDefined(p.department) && departmentSelection.includes(p.department['@id']));
            const productsList = getProductsArray(departmentProducts);
            return extractSales(productsList);
        }
        return [];
    };

    const getSupplierDepartments = (p = products) => {
        let departmentList = [];
        p.filter(product => product.seller.id ===  selectedSeller.id && product.suppliers.map(s => s.id).includes(selectedSupplier.id))
         .map(product => {
            departmentList = isDefined(product.product) ?
                isDefined(product.product.department) ? addIfNotInclude(departmentList, product.product.department) : departmentList :
                isDefined(product.department) ? addIfNotInclude(departmentList, product.department) : departmentList;
        });
        const supplierDepartments = [...new Set(departmentList)].map(d => ({value: d['@id'], label: d.name, isFixed: false}));
        setVisibleDepartments(supplierDepartments);
    };

    const addIfNotInclude = (list, item) => {
        const listItem = list.findIndex(i => i.id === item.id);
        return listItem === -1 ? [...list, item] : list;
    };

    const getProductsArray = groups => {
        let productsList = [];
        const sellerProducts = !Roles.isStoreManager(currentUser) && isDefined(selectedSeller) ? groups.filter(p => p.seller.id === selectedSeller.id) : groups;
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
            product: { id: product.id, name: product.name, costs: product.costs, department: product.department },
            variation: null,
            size: null,
            // stock: product.stock,
            stock: getStock(product),
            unit: product.unit,
            selected: false
        };
    }

    const getVariantProduct = (product, variation, size) => {
        return {
            product: { id: product.id, name: product.name, costs: product.costs, department: product.department },
            variation: { id: variation.id, name: variation.color },
            size: { id: size.id, name: size.name },
            // stock: size.stock,
            stock: getStock(size),
            unit: product.unit,
            selected: false
        };
    };

    const getStock = element => {
        let stock = null;
        if (isDefinedAndNotVoid(element.stocks)) {
            if ((Roles.isStoreManager(currentUser) && isDefined(selectedStore) && !selectedStore.main) || (!Roles.isStoreManager(currentUser) && !mainView))
                stock = element.stocks.find(s => isDefined(s.store) && s.store === selectedStore["@id"]);
            else
                stock = element.stocks.find(s => isDefined(s.platform));

        }
        return isDefined(stock) ? stock : getNewStock();
    };

    const getNewStock = () => {
        const newStock = { quantity: 0, alert: 0, security: 0 };
        return isDefined(selectedStore) ? {...newStock, store: selectedStore['@id']} : {...newStock, platform: platform['@id']}
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
    const handleReceiveModeChange = ({ currentTarget }) => setReceiveMode(currentTarget.value);
    const handleSupplierInfosChange = ({ currentTarget }) => setSelectedSupplier({...selectedSupplier, [currentTarget.name]: currentTarget.value });

    const getCheapestSupplier = (costs, parameter = "name") => {
        const cheapest = !isDefinedAndNotVoid(costs) ? null : costs.reduce((less, curr) => {
            return less = !isDefined(less) || curr.value < less.value ? curr :
                          curr.value > less.value ? less : 
                          curr.supplier.id === selectedSupplier.id ? curr : less
        }, null);
        return parameter !== "name" ? (!isDefined(cheapest) ? 0 : cheapest.value) : 
            !isDefined(cheapest) || cheapest.value === 0 ? <></> : 
                cheapest.supplier.id === selectedSupplier.id ? 
                    <span className="text-success"><i className="fas fa-piggy-bank mr-1"></i>Meilleure offre</span> :
                    <span className="text-danger"><i className="fas fa-exclamation-triangle mr-1"></i>{ cheapest.supplier.name } est - cher</span>;     // Moins cher chez 
    };

    const getSubTotalCost = (costs, quantity) => {
        return getSubTotal(costs, quantity) > 0 ? getSubTotal(costs, quantity).toFixed(2) + " €" : ""
    };

    const getSubTotal = (costs, quantity) => {
        const costObject = costs.find(c => c.supplier.id === selectedSupplier.id);
        const cost = isDefined(costObject) ? costObject.value : 0;
        return quantity * cost <= 0 ? 0 : Math.round(quantity * cost * 100) / 100;
    }

    const getTotal = () => {
        return displayedProducts.filter(p => p.selected && p.quantity > 0).reduce((sum, curr) => {
            return sum += getSubTotal(curr.product.costs, curr.quantity);
        }, 0).toFixed(2);
    };

    const getSupplierCostMessage = product => {
        const cost = getSupplierCostValue(product);
        return cost <= 0 ? "Non renseigné" : cost.toFixed(2) + " €";
    };

    const getSupplierCostValue = product => {
        const cost = getSupplierCost(product);
        return !isDefined(cost) || cost.value.length === 0 ? 0 : getFloat(cost.value);
    }

    const getSupplierCost = product => isDefinedAndNotVoid(product.costs) ? product.costs.find(c => c.supplier.id === selectedSupplier.id) : null;

    const getDisabledDays = date => isDisabledDay(date);

    const isDisabledDay = date => {
        if (isDefined(selectedSupplier)) {
            const now = new Date();
            const max = isDefined(selectedSupplier.maxHour) ? new Date(selectedSupplier.maxHour) : now;
            const deliveryDays = isDefinedAndNotVoid(selectedSupplier.days) ? selectedSupplier.days.map(d => getInt(d.value)) : [1, 2, 3, 4, 5, 6];
            const minimalDate = selectedSupplier.dayInterval || 0;
            const isMaxHourPassed = isSameDate(max, now) && isSameTime(max, now) ? false : getDateFrom(now, 0, max.getHours(), max.getMinutes()) < now;
            const dayLag = minimalDate + (isMaxHourPassed ? 1 : 0);
            return date <= getDateFrom(now, dayLag, max.getHours(), max.getMinutes()) || !deliveryDays.includes(getInt(date.getDay()));
        }
        return true;
    };

    const getFirstDeliverableDay = () => {
        let i = 0;
        const start = new Date();
        let openDay = start;
        while (isDisabledDay(openDay)) {
            i++;
            openDay = getDateFrom(start, i);
        }
        return openDay;
    };

    const addToast = newToast => setToasts([...toasts, newToast]);

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
                        { !Roles.isStoreManager(currentUser) &&
                            <CRow className="mt-3">
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
                                { !mainView &&
                                    <CCol xs="12" md="7">
                                        <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                            { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                        </Select>
                                    </CCol>
                                }
                            </CRow>
                        }
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
                                    />
                                </CInputGroup>
                            </CCol>
                        </CRow>
                        <CRow className="my-4">
                            { isDefined(selectedSupplier) && isDefined(selectedSupplier.provisionMin) && <CCol xs="12" lg="6"><CLabel className="font-italic font-weight-bold">Minimum de commande : { selectedSupplier.provisionMin.toFixed(2) } €</CLabel></CCol> }
                            { isDefined(selectedSupplier) && isDefined(selectedSupplier.deliveryMin) && <CCol xs="12" lg="6"><CLabel className="font-italic font-weight-bold">Minimum pour livraison : { selectedSupplier.deliveryMin.toFixed(2) } €</CLabel></CCol> }
                        </CRow>
                        <hr/>
                        <CRow className="mb-4">
                            <CCol xs="12" lg="5" className="mt-4">
                                <SelectMultiple name="productGroups" label="Rayons" value={ visibleDepartments } onChange={ handleDepartmentChange } data={ departments }/>
                            </CCol>
                            <CCol xs="12" lg="5" className="mt-4">
                                <Select className="mr-2" name="supplier" label="Evolution des besoins" value={ evolution } onChange={ handleEvolutionChange } style={{ height: '39px'}}>
                                    { rates.map(rate => <option key={ rate.value } value={ rate.value }>{ rate.label }</option>) }
                                </Select>
                            </CCol>
                            <CCol xs="12" lg="2" className="mt-4 d-flex align-items-start justify-content-end pr-5 pt-3">
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
                            <>
                            <CDataTable
                                items={ displayedProducts }
                                fields={ width < 576 ? ['Produit', 'Commande', 'Sélection'] : fields }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'Produit':
                                        item => <td style={{width: '25%'}}>
                                                    <UpdateCost 
                                                        name={ getSignPostName(item) } 
                                                        product={ item.product } 
                                                        supplier={ selectedSupplier }
                                                        items= { displayedProducts }
                                                        setItems={ setDisplayedProducts }
                                                    />
                                                    <br/>
                                                    <span className="font-italic" style={{ fontSize: "0.7em"}}>
                                                        { getCheapestSupplier(item.product.costs, 'name') }
                                                    </span>
                                                </td>
                                    ,
                                    'Coût':
                                        item => <td style={{width: '15%'}}>
                                                    {/* { item.stock.security + " " + item.unit } */}
                                                    { getSupplierCostMessage(item.product) }
                                                </td>
                                    ,
                                     'Stock':
                                        item => <td style={{width: '15%'}}>
                                                    { item.stock.quantity + " " + item.unit }<br/>
                                                    <span className="font-italic" style={{ fontSize: "0.7em"}}>
                                                        { "Sécurité : " + item.stock.security + " " + item.unit }
                                                    </span>
                                                </td>
                                    ,
                                    'Besoin':
                                        item => <td style={{width: '15%'}}>{ item.sales + " " + item.unit }</td>
                                    ,
                                    'Commande':
                                        item => <td style={{width: '20%'}}>
                                                    <CFormGroup>
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
                                                            <CValidFeedback style={{ display: 'block', color: 'black', textAlign: 'end' }}>
                                                                { getSubTotalCost(item.product.costs, item.quantity) }
                                                            </CValidFeedback>
                                                        </CInputGroup>
                                                    </CFormGroup>
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
                            <CRow className="mb-4" style={{ display: displayedProducts.length === 0 && 'none'}}>
                                <CCol xs="12" lg="12">
                                    <p style={{ textAlign: "end", fontWeight: "bold" }}>Total : { getTotal() } €</p>
                                </CCol>
                            </CRow>
                            </>
                        }
                        { displayedProducts.length > 0 &&
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
                                                        disable: [ date => getDisabledDays(date) ]
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
                                        <CButton color="success" className="mt-4" onClick={ handleSubmit } style={{width: '180px', height: '35px'}}>      {/* displayedProducts.findIndex(p => p.selected) === -1      disabled={ isDefined(selectedSupplier.provisionMin) ? getFloat(getTotal()) < selectedSupplier.provisionMin : false } */}
                                            Commander
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CCardFooter>
                        }
                    </CCardBody>
                </CCard>
            </CCol>

            <CCol sm="12" lg="6">
              {Object.keys(toasters).map((toasterKey) => (
                <CToaster
                  position={toasterKey}
                  key={'toaster' + toasterKey}
                >
                  {
                    toasters[toasterKey].map((toast, key)=>{
                    return(
                      <CToast
                        key={ 'toast' + key }
                        show={ true }
                        autohide={ toast.autohide }
                        fade={ toast.fade }
                        color={ toast.color }
                        style={{ color: 'white' }}
                      >
                        <CToastHeader closeButton={ toast.closeButton }>
                            { toast.title }
                        </CToastHeader>
                        <CToastBody style={{ backgroundColor: 'white', color: "black" }}>
                            { toast.messsage }
                        </CToastBody>
                      </CToast>
                    )
                  })
                  }
                </CToaster>
              ))}
            </CCol>
        </CRow>
    );
}

export default Supplying;