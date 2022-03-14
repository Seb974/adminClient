import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import OrderDetails from 'src/components/preparationPages/orderDetails';
import TouringActions from 'src/services/TouringActions';
import Select from 'src/components/forms/Select';
import { getShop } from 'src/helpers/checkout';
import DelivererActions from 'src/services/DelivererActions';
import PlatformContext from 'src/contexts/PlatformContext';
import { updateDeliveries } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const Deliveries = (props) => {

    const itemsPerPage = 50;
    const fields = ['name', 'date', 'total', 'selection', ' '];
    const { platform } = useContext(PlatformContext);
    const { currentUser, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [tripLoading, setTripLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [deliverers, setDeliverers] = useState([]);
    const [selectedDeliverer, setSelectedDeliverer] = useState(null);
    const [selection, setSelection] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const shop = getShop(platform);

    useEffect(() => {
        const isUserAdmin = Roles.hasAdminPrivileges(currentUser);
        setIsAdmin(isUserAdmin);
        getOrders();
        if (isUserAdmin)
            fetchDeliverers();
        else
            setSelectedDeliverer(currentUser);
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updateDeliveries(updatedOrders, dates, orders, setOrders, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => getOrders(), [dates]);
    useEffect(() => getOrders(currentPage), [currentPage]);
    useEffect(() => isAllSelected(), [orders, selection]);

    const getOrders = (page = 1) => {
        if (page >= 1) {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            OrderActions
                .findDeliveries(UTCDates, page, itemsPerPage)
                .then(response => {
                    setOrders(response['hydra:member']);
                    setTotalItems(response['hydra:totalItems']);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
        }
    }

    const fetchDeliverers = () => {
        DelivererActions
            .findAll()
            .then(response => {
                    setDeliverers(response);
                    setSelectedDeliverer(response[0]);
                })
            .catch(error => console.log(error));
    };

    const handleDelete = item => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions.delete(item, isAdmin)
                      .catch(error => {
                           setOrders(originalOrders);
                           console.log(error.response);
                      });
    }

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleDelivererChange = ({ currentTarget }) => {
        const newDeliverer = deliverers.find(deliverer => deliverer.id === parseInt(currentTarget.value));
        setSelectedDeliverer(newDeliverer);
    };

    const handleSelect = item => updateSelection(item);

    const handleSelectAll = () => {
        let newSelection = [];
        const newSelectState = !selectAll;
        if (newSelectState)
            newSelection = [...new Set([...selection, ...orders.filter(o => o.status !== "WAITING" && !isSelectedOrder(o))])];
        else 
            newSelection = selection.filter(s => orders.find(o => isSelectedOrder(o)) === undefined)
        setSelectAll(newSelectState);
        setSelection(newSelection);
    };

    const isSelectedOrder = order => {
        return selection.findIndex(s => s.id === order.id) !== -1;
    }

    const updateSelection = item => {
        const select = selection.find(s => s.id === item.id);
        const newSelection = !isDefined(select) ? [...selection, item] : selection.filter(s => s.id !== item.id);
        if (isDefined(select) && priorities.includes(select.id))
            setPriorities(priorities.filter(p => p !== item.id));
        setSelection(newSelection);
    };

    const isAllSelected = () => {
        const preparedOrders = orders.filter(o => o.status !== "WAITING");
        const hasNotSelected = preparedOrders.find(o => !isSelectedOrder(o));
        if (preparedOrders.length === 0 || hasNotSelected !== undefined)
          setSelectAll(false);
        else 
          setSelectAll(true);
      };

    const handlePriorities = item => {
        const newPriorities = priorities.includes(item.id) ? priorities.filter(priority => priority !== item.id) : [...priorities, item.id];
        setPriorities(newPriorities);
        if ( !isSelectedOrder(item) )
            handleSelect(item);
    }

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

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
    }

    const handleCreateTrip = () => {
        getOrderedOrders()
            .then(response => createTouring(response));
    }

    const getOrderedOrders = () => {
        let priorizedOrders = [];
        const ordersTrip = getOrdersTrip();
        let tripFromShop = [shop, ...ordersTrip, shop];
        if (priorities.length > 0) {
            priorizedOrders = getPriorizedOrders(ordersTrip);
            const ordersToOptimize = ordersTrip.filter(o => priorizedOrders.findIndex(p => p.id === o.id) === -1);
            if (ordersToOptimize.length === 0)
                return new Promise((resolve, reject) => resolve(priorizedOrders));
            else if (ordersToOptimize.length === 1)
                return new Promise((resolve, reject) => resolve([...priorizedOrders, {...ordersToOptimize[0], deliveryPriority: (priorizedOrders.length + 1)}]));
            else {
                const lastPriorized = priorizedOrders[priorizedOrders.length - 1];
                tripFromShop = [lastPriorized, ...ordersToOptimize, shop];
            }
        }
        return getOptimizedTrip(tripFromShop, priorizedOrders);
    };

    const getPriorizedOrders = (ordersTrip) => {
        return priorities.map((priority, index) => {
            const selection = orders.find(order => order.id === priority);
            const orderedOrder = ordersTrip.find(order => {
                return order.name === selection.name && JSON.stringify(order.coordinates) === JSON.stringify(selection.metas.position);
            });
            return {...orderedOrder, deliveryPriority: (index + 1)};
        })
    }

    const getOptimizedTrip = (tripFromShop, priorizedOrders) => {
        setTripLoading(true);
        return OrderActions
            .getOptimizedTrip(tripFromShop)
            .then(response => {
                let optimizedOrders = [];
                const startIndex = priorizedOrders.length;
                if (isDefined(response.waypoints)) {
                    optimizedOrders = response.waypoints.map((waypoint, i) => ({...tripFromShop[i], deliveryPriority: (startIndex + waypoint.waypoint_index)}));
                } else {
                    optimizedOrders = tripFromShop.map((order, key) => ({...order, deliveryPriority: (startIndex + key)}))
                }
                const [shopPoint, ...optimizedOrdersWithReturn] = optimizedOrders;
                const waypoints = optimizedOrdersWithReturn.slice(0,-1);
                const touring = [...priorizedOrders, ...waypoints];
                setTripLoading(false);
                return touring.sort((a, b) => (a.deliveryPriority > b.deliveryPriority) ? 1 : -1);
            });
    }

    const createTouring = newTrip => {
        let classifiedPoints = [];
        selection.map(order => {
            const waypoint = newTrip.find(tripPoint => isSameWaypoint(tripPoint, order));
            classifiedPoints = [...classifiedPoints, {...order, deliveryPriority: waypoint.deliveryPriority}];
        });
        const orderedOrders = classifiedPoints.sort((a, b) => (a.deliveryPriority > b.deliveryPriority) ? 1 : -1);
        TouringActions
            .create({
                orderEntities: orderedOrders.map(order => ({id: order.id, deliveryPriority: order.deliveryPriority, status: 'ON_TRUCK'})),
                start: new Date(),
                isOpen: true,
                deliverer: selectedDeliverer['@id']
            })
            .then(response => {
                setOrders(orders.filter(o => isSelectedOrder(o)));
                setSelection([]);
            });
    };

    const getOrdersTrip = () => {
        const trip = selection.reduce((unique, order) => {
            return unique.find(o => isForSameClient(order, o)) !== undefined ? unique : [...unique, order];
        }, []);
        return trip.map(order => ({
            id: order.id,
            name: order.name,
            coordinates: order.metas.position,
            address: order.metas.address,
            zipcode: order.metas.zipcode,
            city: order.metas.city
        }));
    };

    const isForSameClient = (order1, order2) => {
        return  order1.name === order2.name &&
                JSON.stringify(order1.metas.position) === JSON.stringify(order2.metas.position);
    };

    const isSameWaypoint = (waypoint, order) => {
        return waypoint.name === order.name && JSON.stringify(waypoint.coordinates) === JSON.stringify(order.metas.position);
    }

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Liste des commandes à livrer
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" lg="6">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label="Date"
                                className = "form-control mb-3"
                            />
                            </CCol>
                            <CCol xs="12" lg="6" className="mt-4">
                                <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                                    <input
                                        className="mx-1 my-1"
                                        type="checkbox"
                                        name="inline-checkbox"
                                        checked={ selectAll }
                                        onClick={ handleSelectAll }
                                        disabled={ orders.find(order => order.status !== "WAITING") == undefined }
                                        style={{zoom: 2.3}}
                                    />
                                    <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tout sélectionner</label>
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
                                items={ orders }
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
                                    'name':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} disabled={ item.status === "WAITING" }>
                                                        { item.isRemains ? 
                                                            <i className="fas fa-sync-alt mr-2"></i> :
                                                        isDefinedAndNotVoid(item.packages) ? 
                                                        <i className="fas fa-plane mr-2"></i> :
                                                            <i className="fas fa-truck mr-2"></i>
                                                        }{ item.name }<br/>
                                                        <small><i>{ item.metas.zipcode } { item.metas.city }</i></small>
                                                        <br/>
                                                    </Link>
                                                </td>
                                    ,
                                    'date':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                                    isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                                    (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                    }
                                                </td>
                                    ,
                                    'total':
                                        item => <td style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    { isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}
                                                </td>
                                    ,
                                    'selection':
                                        item => <td className="d-flex align-items-center"style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                    <input
                                                        className="mx-1 my-1"
                                                        type="checkbox"
                                                        name="inline-checkbox"
                                                        checked={ isSelectedOrder(item) }
                                                        onClick={ () => handleSelect(item) }
                                                        disabled={ item.status === "WAITING" }
                                                        style={{zoom: 2.3}}
                                                    />
                                                    <CButton size="sm" color="danger" disabled={ item.status === "WAITING" } onClick={ () => handlePriorities(item) } className="mx-1 my-1" style={{width: '27px', height: '27px'}}>
                                                        { priorities.includes(item.id) ? parseInt(Object.keys(priorities).find(key => priorities[key] === item.id)) + 1 : <i className="fas fa-exclamation"></i> }
                                                    </CButton>
                                                </td>
                                    ,
                                    ' ':
                                        item => (
                                            <td className="mb-3 mb-xl-0 text-center" style={{color: item.status === "WAITING" ? "dimgray" : "black"}}>
                                                { item.status !== "WAITING" && 
                                                    <CButton color="light" href={"#/components/delivery/" + item.id} target="_blank" className="mx-1 my-1"><i className="fas fa-clipboard-list"></i></CButton>
                                                }
                                                <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                            </td>
                                        )
                                    ,
                                    'details':
                                        item => <CCollapse show={details.includes(item.id)}>
                                                    <OrderDetails orders={ orders } setOrders={setOrders} order={ item } isDelivery={ true } id={ item.id }/>
                                                </CCollapse>
                                }}
                            />
                        }
                        { orders.length > 0 &&
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                { isAdmin && 
                                    <Select className="mr-2" name="deliverer" label=" " value={ isDefined(selectedDeliverer) ? selectedDeliverer.id : 0 } onChange={ handleDelivererChange } style={{width: '140px', height: '35px'}}>
                                        { deliverers.map(deliverer => <option key={ deliverer.id } value={ deliverer.id }>{ deliverer.name }</option>) }
                                    </Select>
                                }
                                <CButton size="sm" color="success" onClick={ handleCreateTrip } className={ "ml-2" } style={{width: '140px', height: '35px'}} disabled={ selection.length == 0 }>
                                    { tripLoading ?
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            />
                                        : 
                                        <>Créer une tournée</>
                                    }
                                    </CButton>
                            </CRow>
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Deliveries;