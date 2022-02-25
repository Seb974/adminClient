import { CCol, CFormGroup, CLabel, CRow, CSwitch } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import Select from 'src/components/forms/Select';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import PlatformContext from 'src/contexts/PlatformContext';
import { getUTCDates } from 'src/helpers/days';
import { getStatus } from 'src/helpers/orders';
import { extractSales, getFormattedSales, getProductsAndVariations, isItemProduct, isSelectable, isSelectedItem } from 'src/helpers/supplying';
import { getEvolutionPoints, getFloat, getInt, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import DepartmentActions from 'src/services/DepartmentActions';
import OrderActions from 'src/services/OrderActions';
import ProductActions from 'src/services/ProductActions';
import SaleActions from 'src/services/SaleActions';
import SellerActions from 'src/services/SellerActions';
import StoreActions from 'src/services/StoreActions';
import Supplier from './Supplier';

const Needs = ({ displayedProducts, setDisplayedProducts, selectedSupplier, setSelectedSupplier, selectedSeller, setSelectedSeller,
                 selectedStore, setSelectedStore, mainView, setMainView, selectAll, setSelectAll, loading, setLoading, supplied,
                 addToast, currentPage, setCurrentPage, itemsPerPage, setTotalItems, selection, setSelection }) => 
{
    const rates = getEvolutionPoints();
    const { platform } = useContext(PlatformContext);
    const { currentUser } = useContext(AuthContext);
    const selectedStatus = getStatus().filter(s => !["ON_PAYMENT", "ABORTED"].includes(s.value));
    const failMessage = "Un problème est survenu lors de lu chargement des données. Vérifiez votre l'état de votre connexion.\n";
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'danger', messsage: failMessage, title: 'Erreur de chargement' };

    const [evolution, setEvolution] = useState(0);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    const [orders, setOrders] = useState([]);
    const [stores, setStores] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedDepartments, setSelectedDepartments] = useState(null);
    const [hasIndependencies, setHasIndependencies] = useState(false);

    useEffect(() => getDependencies(), []);

    useEffect(() => getSelectedProducts(currentPage), [currentPage]);
    useEffect(() => getSelectedProducts(), [selectedSeller, selectedSupplier, selectedStore, mainView]);
    useEffect(() => getSelectedOrders(), [dates, selectedSeller, selectedStore, mainView]);
    useEffect(() => getDisplayedProducts(), [products, orders, evolution, supplied, selectedDepartments]);
    useEffect(() => getDisplayedProducts(true), [selectedDepartments]);


    const getDependencies = () => {
        fetchDepartments();
        fetchSellers();
    };

    const getSelectedOrders = () => {
        if (isDefined(selectedSeller) && (mainView || !isDefined(selectedStore))) {
            setLoading(true);
            const UTCOrderDates = getUTCDates(dates);
            OrderActions
                .findValidatedOrdersBetween(UTCOrderDates, selectedStatus, selectedSeller)
                .then(response => setOrders(response))
                .catch(error => {
                    setLoading(false);
                    addToast(failToast);
                });
        } else if (isDefined(selectedStore) && !mainView) {
            setLoading(true);
            const UTCSalesDates = getUTCDates(dates);
            SaleActions
                .findValidatedSalesBetween(UTCSalesDates, selectedStore)
                .then(response => setOrders(getFormattedSales(response)))
                .catch(error => {
                    setLoading(false);
                    addToast(failToast);
                });
        }
    };

    const getSelectedProducts = async (page = 1) => {
        if (page >=1 && isDefined(selectedSeller) && isDefined(selectedSupplier)) {
            try {
                setLoading(true);
                let response = null;
                if (isDefined(selectedStore) && !mainView) {
                    const hiboutikProducts = await StoreActions.getProducts(selectedStore);
                    const ids = hiboutikProducts.map(p => getInt(p["products_ref_ext"]));
                    response = await ProductActions.findFromSupplierAndStore(selectedSeller, selectedSupplier, ids, page, itemsPerPage);
                } else {
                    response = await ProductActions.findFromSupplierAndPlatform(selectedSeller, selectedSupplier, page, itemsPerPage);
                }
                if (isDefined(response)) {
                    const newProducts = response['hydra:member'];
                    setProducts(newProducts);
                    setTotalItems(response['hydra:totalItems']);
                    getDefaultSelectedDepartments(newProducts);
                }
            } catch (error) {
                addToast(failToast);
            }
        }
    };

    const fetchDepartments = () => {
        setLoading(true);
        DepartmentActions
            .findAll()
            .then(response => {
                const formattedDepartments = response.map(d => ({value: d['@id'], label: d.name, isFixed: false}));
                setDepartments(formattedDepartments);
            })
            .catch(error => {
                setLoading(false);
                addToast(failToast);});
    };

    const fetchSellers = () => {
        setLoading(true);
        SellerActions
            .findActiveSellers()
            .then(response => {
                setSellers(response);
                setSelectedSeller(response[0]);
                defineStores(response[0]);
            })
            .catch(error => {
                setLoading(false);
                addToast(failToast);
            });
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

    const getDefaultSelectedDepartments = (products = null) => {
        if (isDefinedAndNotVoid(products)) {
            const availableDepartments = products.map(p => p.department['@id']);
            const newSelectedDepartments = availableDepartments.length > 0 ? 
                departments.filter(d => availableDepartments.includes(d.value)) : [];
            setSelectedDepartments(newSelectedDepartments);
        } else {
            setSelectedDepartments([]);
        }
    };

    const getDisplayedProducts = (departmentUpdate = false) => {
        if (isDefinedAndNotVoid(products)) {
            let productsAndVariations = getProductsAndVariations(products, platform, selectedStore, mainView, currentUser);
            if (departmentUpdate) {
                const departmentsSelected = !isDefinedAndNotVoid(productsAndVariations) || !isDefinedAndNotVoid(selectedDepartments) ? [] :
                    productsAndVariations.filter(p => selectedDepartments.map(d => d.value).includes(p.product.department['@id']));
                productsAndVariations = [...departmentsSelected];
            }
            const newDisplayedProducts = isDefinedAndNotVoid(productsAndVariations) ? extractSales(productsAndVariations, orders, evolution, supplied) : [];
            setDisplayedProducts(newDisplayedProducts);
        } 
        else {
            setDisplayedProducts([]);
        }
        setLoading(false);
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

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleView = ({ currentTarget }) => setMainView(!mainView);

    const handleDepartmentChange = departments => {
        setSelectedDepartments(departments);
    };

    const handleSelectAll = () => {
        let newSelection = [];
        const newSelectState = !selectAll;
        if (newSelectState)
            newSelection = [...new Set([...selection, ...displayedProducts.filter(p => getFloat(p.quantity) > 0 && !isSelectedItem(p, selection))])];
        else 
            newSelection = selection.filter(s => displayedProducts.find(p => isItemProduct(p, s)) === undefined)
        setSelectAll(newSelectState);
        setSelection(newSelection);
    };

    const handleEvolutionChange = ({ currentTarget }) => setEvolution(parseInt(currentTarget.value));

    return (
        <>
            <CRow className="mt-2">
                <CCol xs="12" lg="12">
                    <CLabel><h6><b>1. Estimer les besoins</b></h6></CLabel>
                </CCol>
            </CRow>
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
                    { hasIndependencies && !mainView &&
                        <CCol xs="12" md="7">
                            <Select className="mr-2" name="selectedStore" label="Boutique" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : 0 }>
                                { stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                            </Select>
                        </CCol>
                    }
                </CRow>
            }
            <Supplier   selectedSupplier={ selectedSupplier } 
                        setSelectedSupplier={ setSelectedSupplier } 
                        loading={ loading } 
                        setLoading={ setLoading }
                        addToast={ addToast } 
                        failToast={ failToast } 
            />
            <CRow>
                <CCol xs="12" lg="5" className="mt-4">
                    <SelectMultiple name="productGroups" label="Rayons" value={ selectedDepartments } onChange={ handleDepartmentChange } data={ departments }/>
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
        </>
    );
}

export default Needs;