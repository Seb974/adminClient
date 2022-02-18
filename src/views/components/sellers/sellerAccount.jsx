import { CButton, CCard, CCardBody, CCardHeader, CCol, CDataTable, CFormGroup, CRow, CWidgetIcon } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import Select from 'src/components/forms/Select';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import SellerActions from 'src/services/SellerActions';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import AuthContext from 'src/contexts/AuthContext';
import { getDeliveredStatus } from 'src/helpers/orders';
import OrderActions from 'src/services/OrderActions';
import Roles from 'src/config/Roles';
import CIcon from '@coreui/icons-react';
import { Spinner } from 'react-bootstrap';

const SellerAccount = (props) => {

    const itemsPerPage = 10;
    const status = getDeliveredStatus();
    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [details, setDetails] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [viewedOrders, setViewedOrders] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [priceView, setPriceView] = useState("HT");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selection, setSelection] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    useEffect(() => {
        fetchSellers();
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => fetchOrders(currentPage), [currentPage]);
    useEffect(() => {
        fetchOrders();
        setSelection([]);
    }, [selectedSeller, dates, selectedStatus]);

    useEffect(() => isAllSelected(), [viewedOrders, selection]);
    useEffect(() => setViewedOrders(getOrders()), [orders, selectedStatus]);

    const fetchOrders = (page = 1) => {
        if (page >= 1 && isDefined(selectedSeller)) {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            const regulation = selectedStatus == "all" ? null :selectedStatus == "true" ? true : false;
            OrderActions
                .findStatusForSellerBetween(UTCDates, status, selectedSeller, regulation, page, itemsPerPage)
                .then(response =>{
                    setSelectAll(false);
                    setLoading(false);
                    setOrders(response['hydra:member']);
                    setTotalItems(response['hydra:totalItems']);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        }
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

    const handleSellerChange = ({ currentTarget }) => {
        const newSelection = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSelection);
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handlePriceView = ({ currentTarget }) => setPriceView(currentTarget.value);

    const handleStatusChange = ({ currentTarget }) => setSelectedStatus(currentTarget.value);

    const handlePay = () => {
        const newOrders = selection.map(({id, totalHT, totalTTC, totalToPay, totalToPayTTC, ...order}) => {
            return {
                ...order, 
                regulated: true, 
                items: isDefinedAndNotVoid(order.items) ? order.items.map(i => i['@id']) : [], 
                packages: isDefinedAndNotVoid(order.packages) ? order.packages.map(p => p['@id']) : [], 
                catalog: isDefined(order.catalog) ? order.catalog['@id'] : null, 
                metas: isDefined(order.metas) ? order.metas['@id'] : null, 
                touring: isDefined(order.touring) ? order.touring['@id'] : null,
                platform: isDefined(order.platform) ? order.platform['@id'] : null,
                promotion: isDefined(order.promotion) ? order.promotion['@id'] : null,
            };
        });
        updateOrders(newOrders)
            .then(response => {
                const newRegisteredOrders = viewedOrders.map(order => {
                    const index = response.findIndex(update => update.data['@id'] === order['@id']);
                    return index !== -1 ? response[index].data : order;
                });
                setViewedOrders(getFilteredResults(newRegisteredOrders));
            })
            .catch(error => console.log(error));
    };

    const handleSelect = item => updateSelection(item);

    const handleSelectAll = () => {
        let newSelection = [];
        const newSelectState = !selectAll;
        if (newSelectState)
            newSelection = [...new Set([...selection, ...viewedOrders.filter(o => !o.regulated && !isSelectedOrder(o))])];
        else 
            newSelection = selection.filter(s => viewedOrders.find(o => s.id === o.id && isSelectedOrder(o)) === undefined)
        setSelectAll(newSelectState);
        setSelection(newSelection);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const getOrders = () => {
        const sellerOrders = orders.map(order => {
            const totalHT = getTotalHT(order);
            const totalTTC = getTotalTTC(order);
            const ownerPart = selectedSeller.ownerRate
            return {
                ...order,
                id: order.id.toString().padStart(10, '0'),
                totalHT,
                totalTTC,
                totalToPay: getPartToPay(totalHT, ownerPart),
                totalToPayTTC: getPartToPay(totalTTC, ownerPart),
            };
        });
        return getFilteredResults(sellerOrders);
    };

    const getFilteredResults = orders => {
        return orders.filter(order => {
            // order.totalHT > 0 &&
            return (selectedStatus === "all" || 
                   (selectedStatus === "true" && order.regulated) ||
                   (selectedStatus === "false" && !order.regulated));
        });
    };

    const getTotalHT = order => {
        return order.items.reduce((sum, current) => 
            sum += current.product.seller.id === selectedSeller.id ? getQuantity(current)* current.price : 0, 0);
    };

    const getTotalTTC = order => {
        return order.items.reduce((sum, current) => 
            sum += current.product.seller.id === selectedSeller.id ? getQuantity(current) * current.price * (1 + current.taxRate) : 0, 0);
    };

    const getQuantity = order => {
        const { deliveredQty, preparedQty, orderedQty } = order;
        return isDefined(deliveredQty) ? deliveredQty : isDefined(preparedQty) ? preparedQty : orderedQty;
    };

    const getPartToPay = (total, rate) => total * (1 - (rate / 100));

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

    const getTotalStat = () => {
        const selection = priceView === "HT" ? 'totalHT' : 'totalTTC';
        return viewedOrders.reduce((sum, current) => sum += current[selection], 0);
    };

    const getTotalToPayStat = () => {
        const selection = priceView === "HT" ? 'totalToPay' : 'totalToPayTTC';
        return viewedOrders.reduce((sum, current) => sum += current[selection], 0);
    };

    const getProductCount = () => {
        return orders.reduce((total, order) => {
            const sellerItems = order.items.filter(item => item.product.seller.id === selectedSeller.id);
            return total + sellerItems.length;
        }, 0);
    };

    const getEarnedTotal = () => {
        const total = getTotalStat();
        const totalToPay = getTotalToPayStat();
        return total - totalToPay;
    };

    const updateOrders = async (newOrders) => {
        const savedOrders = await Promise.all(newOrders.map( async order => {
            return await OrderActions.update(order.id, order);
        }));
        return savedOrders;
    };

    const updateSelection = item => {
        const select = selection.find(s => s.id === item.id);
        const newSelection = !isDefined(select) ? [...selection, item] : selection.filter(s => s.id !== item.id);
        setSelection(newSelection);
    };

    const isSelectedOrder = order => {
        return selection.findIndex(s => s.id === order.id) !== -1;
    };

    const isAllSelected = () => {
        const notRegulatedOrders = viewedOrders.filter(o => !o.regulated);
        const hasNotSelected = notRegulatedOrders.find(o => !isSelectedOrder(o)) !== undefined;
        if (notRegulatedOrders.length === 0 || hasNotSelected)
          setSelectAll(false);
        else 
          setSelectAll(true);
      };

    return (
        <CCard>
            <CCardHeader className="d-flex align-items-center">
                Liste des ventes par vendeur
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text={"Produits - " + viewedOrders.length + " commandes"} header={ getProductCount() } color="primary" iconPadding={false}>
                            <CIcon width={24} name="cil-clipboard"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Chiffre d'affaires" header={(viewedOrders.length > 0 ? (getTotalStat()).toFixed(2) : "0.00") + " €"} color="info" iconPadding={false}>
                            <CIcon width={24} name="cil-chart"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Revenus" header={(viewedOrders.length > 0 ? (getEarnedTotal()).toFixed(2) : "0.00") + " €"} color="warning" iconPadding={false}>
                            <CIcon width={24} name="cil-wallet"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="A payer" header={ (viewedOrders.length > 0 ? (getTotalToPayStat()).toFixed(2) : "0.00") + " €" } color="danger" iconPadding={false}>
                            <CIcon width={24} name="cil-money"/>
                        </CWidgetIcon>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol xs="12" sm="12" md="6" className="mt-4">
                        <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                        </Select>
                    </CCol>
                    <CCol xs="12" sm="12" md="6" className="mt-4">
                        <RangeDatePicker
                            minDate={ dates.start }
                            maxDate={ dates.end }
                            onDateChange={ handleDateChange }
                            label="Date"
                            className = "form-control mb-3"
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol xs="12" sm="12" md="6" className="mt-4">
                        <Select className="mr-2" name="status" label="Statuts" onChange={ handleStatusChange } value={ selectedStatus }>
                            <option value={ "all" }>{ "Toutes" }</option>
                            <option value={ "false" }>{ "A régler" }</option>
                            <option value={ "true" }>{ "Réglées" }</option>
                        </Select>
                    </CCol>
                    <CCol xs="12" sm="12" md="4" className="mt-4">
                        <Select className="mr-2" name="priceView" label="Affichage" onChange={ handlePriceView } value={ priceView }>
                            <option value={ "HT" }>{ "Hors taxe" }</option>
                            <option value={ "TTC" }>{ "Taxes comprises" }</option>
                        </Select>
                    </CCol>
                    <CCol xs="12" md="2" className="mt-4 d-flex align-items-center justify-content-end pr-5">
                        <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                            <input
                                className="mx-1 my-2"
                                type="checkbox"
                                name="inline-checkbox"
                                checked={ selectAll }
                                onClick={ handleSelectAll }
                                disabled={ viewedOrders.length === 0 }
                                style={{zoom: 2.3}}
                                disabled={ viewedOrders.filter(o => !o.regulated).length <= 0 }
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
                            items={ viewedOrders }
                            fields={ ['Commande', 'Date', 'Total', 'Total Net', 'Selection'] }
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
                                'Commande':
                                    item => <td>
                                                <span>
                                                    { item.regulated ? 
                                                        <i className="far fa-check-circle mr-2 text-success"></i> :
                                                        <i className="far fa-times-circle mr-2 text-warning"></i>
                                                    }
                                                    { item.name }<br/>
                                                    <small><i>{ "N°" + item.id }</i></small>
                                                </span>
                                            </td>
                                ,
                                'Date':
                                    item => <td>
                                                { (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'}) }
                                            </td>
                                ,
                                'Total':
                                    item => <td>
                                                { priceView === "HT" ? item.totalHT.toFixed(2) : item.totalTTC.toFixed(2) } €
                                            </td>
                                ,
                                'Total Net':
                                    item => <td>
                                                { priceView === "HT" ? item.totalToPay.toFixed(2): item.totalToPayTTC.toFixed(2) } €
                                            </td>
                                ,
                                'Selection':
                                    item => <td style={{width: '10%', textAlign: 'center'}}>
                                                <input
                                                    className="mx-1 my-1"
                                                    type="checkbox"
                                                    name="inline-checkbox"
                                                    checked={ isSelectedOrder(item) }
                                                    onClick={ () => handleSelect(item) }
                                                    style={{zoom: 2.3}}
                                                    disabled={ item.regulated }
                                                />
                                            </td>
                                }}
                            />
                        { isAdmin && viewedOrders.filter(o => !o.regulated).length > 0 &&
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                <CButton size="sm" color="success" onClick={ handlePay } style={{width: '140px', height: '35px'}} disabled={ selection.length === 0 }>
                                    Clôturer
                                </CButton>
                            </CRow>
                        }
                    </>
                }
            </CCardBody>
        </CCard>
    );
}
 
export default SellerAccount;