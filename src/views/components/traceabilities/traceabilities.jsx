import React, { useEffect, useState } from 'react';
import BatchActions from '../../../services/BatchActions';
import TraceabilityActions from '../../../services/TraceabilityActions';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CLabel, CInputGroup, CInput, CToaster, CToast, CToastHeader, CToastBody, CSwitch } from '@coreui/react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';
import Roles from 'src/config/Roles';
import { useContext } from 'react';
import AuthContext from 'src/contexts/AuthContext';
import CIcon from '@coreui/icons-react';
import { Spinner } from 'react-bootstrap';
import SellerActions from 'src/services/SellerActions';

const Traceabilities = (props) => {

    const itemsPerPage = 6;
    const { currentUser } = useContext(AuthContext);
    const [type, setType] = useState("upstream");
    const [number, setNumber] = useState("");
    const [mainView, setMainView] = useState(true);
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [search, setSearch] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [stores, setStores] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [hasIndependencies, setHasIndependencies] = useState(false);
    const [loading, setLoading] = useState(false);
    const batchFields = ['N° de lot', 'DLC', 'Date d\'achat', 'Acheté', 'Reste', 'Fournisseur'];
    const traceabilityFields = ['N° de lot', 'DLC', 'Date de vente', 'Quantité', 'Client'];
    const voidMessage = "Aucun numéro de lot n'est renseigné.\n";
    const failMessage = "Un problème est survenu lors de lu chargement des données. Vérifiez votre l'état de votre connexion.\n";
    const voidToast = { position: 'top-right', autohide: 5000, closeButton: true, fade: true, color: 'warning', messsage: voidMessage, title: 'Information manquante' };
    const failToast = { position: 'top-right', autohide: 5000, closeButton: true, fade: true, color: 'danger', messsage: failMessage, title: 'Erreur de chargement' };

    useEffect(() => fetchSellers(), []);
    useEffect(() => getData(currentPage), [currentPage]);

    useEffect(() => {
        getData();
        setCurrentPage(1);
    }, [selectedStore, selectedSeller, mainView]);

    useEffect(() => {
        if (!mainView)
            setType("upstream");
    }, [mainView]);

    const fetchSellers = () => {
        setLoading(true);
        SellerActions
            .findActiveSellers()
            .then(response => {
                setSellers(response);
                setSelectedSeller(response[0]);
                defineStores(response[0]);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                addToast(failToast);
            });
    };

    const getData = async (page = 1) => {
        if (page >= 1) {
            if (number.length > 0 && isDefined(selectedSeller) && (mainView || (!mainView && isDefined(selectedStore))) ) {
                try {
                    setLoading(true);
                    let data = null;
                    if (type === "upstream") {
                        setFields(batchFields);
                        data = await getBatches(page);
        
                    } else if (type === "downstream") {
                        setFields(traceabilityFields);
                        data = await getTraceabilities(page);
                    }
                    
                    if (isDefined(data)) {
                        setData(data['hydra:member']);
                        setTotalItems(data['hydra:totalItems']);
                    }
                } catch (error) {
                    addToast(failToast);
                } finally {
                    setSearch(false);
                    setLoading(false);
                }
            } else {
                if (search)
                    addToast(voidToast);
            }
        }
    };

    const getBatches = async (page) => {
        if ( mainView && isDefined(selectedSeller)) {
            return await BatchActions.findNumberForPlatform(number, selectedSeller, page, itemsPerPage);
        } else if (isDefined(selectedStore)) {
            return await BatchActions.findNumberForStore(number, selectedStore, page, itemsPerPage);
        }
        return new Promise((resolve, reject) => resolve(null));
    };

    const getTraceabilities = async (page) => {
        if ( mainView && isDefined(selectedSeller)) {
            return await TraceabilityActions.findNumberForPlatform(number, selectedSeller, page, itemsPerPage);
        }
        return new Promise((resolve, reject) => resolve(null));
    };

    const handleView = ({ currentTarget }) => setMainView(!mainView);
    const addToast = newToast => setToasts([...toasts, newToast]);
    const onTypeChange = ({ currentTarget }) => setType(currentTarget.value);
    const onNumberChange = ({ currentTarget }) => setNumber(currentTarget.value);
    const onSubmit = () => {
        setSearch(true);
        setCurrentPage(1);
        getData();
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
                    <CCardHeader>Traçabilité</CCardHeader>
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
                            <CCol xs="12" md="5" className="my-2">
                                <Select className="mr-2" name="store" label="Type de traçabilité" value={ type } onChange={ onTypeChange }>
                                    <option value="upstream">Amont</option>
                                    { mainView && <option value="downstream">Avale</option> }
                                </Select>
                            </CCol>
                            <CCol xs="12" md="5" className="my-2">
                                <CFormGroup>
                                    <CLabel htmlFor="name">Lot recherché</CLabel>
                                    <CInputGroup>
                                        <CInput
                                            id="number"
                                            name="number"
                                            placeholder={"N° de lot"}
                                            value={ number }
                                            onChange={ onNumberChange }

                                        />
                                    </CInputGroup>
                                </CFormGroup>
                            </CCol>
                            <CCol xs="12" md="2" className="mt-2">
                                <CFormGroup className="mt-4">
                                    <CButton color="success" onClick={ onSubmit }>
                                        <CIcon name="cil-zoom"/> Rechercher
                                    </CButton>
                                </CFormGroup>
                            </CCol>
                        </CRow>
                        { loading ?
                            <CRow>
                                <CCol xs="12" lg="12" className="text-center mt-4">
                                    <Spinner animation="border" variant="danger"/>
                                </CCol>
                            </CRow>
                            :
                            <CDataTable
                                items={ data }
                                fields={ fields }
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
                                scopedSlots = {{
                                    'N° de lot':
                                        item => <td style={{ width: '20%'}}>
                                                    <span style={{ fontWeight: 'bold' }}>{ item.number }</span>
                                                    <span style={{ fontSize: '0.8em', fontStyle: 'italic'}}>
                                                        <br/>{ isDefined(item.item) ? item.item.product.name  : item.stock.product.name }
                                                    </span> 
                                                </td>
                                    ,
                                    'DLC':
                                        item => <td style={{ width: '15%'}}>
                                                    { new Date(item.endDate).toLocaleDateString() }
                                                </td>
                                    ,
                                    'Date d\'achat':
                                        item => <td style={{ width: '15%'}}>
                                                    { isDefined(item.good) ? new Date(item.good.provision.provisionDate).toLocaleDateString() : '-' }
                                                </td>
                                    ,
                                    'Date de vente':
                                        item => <td style={{ width: '15%'}}>
                                                    { new Date(item.item.orderEntity.deliveryDate).toLocaleDateString() }
                                                    { isDefined(item.item) && 
                                                        <span style={{ fontSize: '0.8em', fontStyle: 'italic'}}>
                                                            <br/>{ item.item.orderEntity.status }
                                                        </span> 
                                                    }
                                                </td>
                                    ,
                                    'Acheté':
                                        item => <td style={{ width: '10%'}}>
                                                    {   (isDefined(item.initialQty) ? item.initialQty : 0) + " "
                                                        + 
                                                        (isDefined(item.good) ? item.good.product.unit : 
                                                         isDefined(item.item) ? item.item.product.unit : 
                                                         isDefined(item.stock) ? item.stock.product.unit :
                                                         0)
                                                    }
                                                </td>
                                    ,
                                    'Reste':
                                        item => <td style={{ width: '10%'}}>
                                                    {   (isDefined(item.quantity) ? item.quantity : 0) + " "
                                                        + 
                                                        (isDefined(item.good) ? item.good.product.unit : 
                                                         isDefined(item.item) ? item.item.product.unit : 
                                                         isDefined(item.stock) ? item.stock.product.unit :
                                                         0)
                                                    }
                                                </td>
                                    ,
                                    'Fournisseur':
                                        item => <td style={{ width: '25%'}}>
                                                    { !isDefined (item.good) ? '-' : 
                                                        <>
                                                            <span style={{ fontSize: '0.9em', fontWeight: 'bold', textAlign: 'center'}}>
                                                                { item.good.provision.supplier.name }
                                                            </span><br/>
                                                            <span style={{ fontSize: '0.8em', fontStyle: 'italic', textAlign: 'center'}}>
                                                                { item.good.provision.supplier.email }<br/>
                                                                { item.good.provision.supplier.phone }
                                                            </span>
                                                        </>
                                                    }
                                                </td>
                                    ,
                                    'Client':
                                        item => <td style={{ width: '25%'}}>
                                                    <span style={{ fontSize: '0.9em', fontWeight: 'bold', textAlign: 'center'}}>
                                                        { item.item.orderEntity.name }
                                                    </span><br/>
                                                    <span style={{ fontSize: '0.8em', fontStyle: 'italic', textAlign: 'center'}}>
                                                        { item.item.orderEntity.email }<br/>
                                                        { item.item.orderEntity.metas.phone }
                                                    </span>
                                                </td>
                                }}
                            />
                        }
                    </CCardBody>
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

export default Traceabilities;