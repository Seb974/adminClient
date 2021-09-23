import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup, CInputCheckbox, CLabel, CSwitch } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner';
import OrderDetails from 'src/components/preparationPages/orderDetails';
import Select from 'src/components/forms/Select';
import RelaypointActions from 'src/services/RelaypointActions';
import { setOrderStatus } from 'src/helpers/checkout';
import { updateCheckouts, updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';
import { getExportStatuses } from 'src/helpers/orders';

const Collects = (props) => {

    const itemsPerPage = 30;
    const exportStatuses = getExportStatuses();
    const fields = ['commande', 'date', 'terminer', ' '];
    const { currentUser, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [orders, setOrders] = useState([]);
    const [relaypoints, setRelaypoints] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRelaypoint, setSelectedRelaypoint] = useState(null);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [relaypointView, setRelaypointView] = useState(true);

    useEffect(() => {
        const isUserAdmin = Roles.hasAdminPrivileges(currentUser);
        setIsAdmin(isUserAdmin);
        fetchRelaypoints();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            const update = relaypointView ? 
                updateCheckouts(updatedOrders, getUTCDates(), orders, setOrders, currentUser, supervisor, selectedRelaypoint, setUpdatedOrders) :
                updateStatusBetween(updatedOrders, getUTCDates(), exportStatuses, orders, setOrders, currentUser, supervisor, setUpdatedOrders);
            update.then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (isDefinedAndNotVoid(relaypoints))
            setSelectedRelaypoint(relaypoints[0]);
    }, [relaypoints]);

    useEffect(() => fetchOrders(), [selectedRelaypoint, dates, relaypointView]);

    const fetchOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        const request = relaypointView ? 
            OrderActions.findCheckouts(UTCDates, selectedRelaypoint) : 
            OrderActions.findStatusBetween(UTCDates, exportStatuses, currentUser)
                        .then(response => response.filter(o => o.catalog.needsParcel));
        request
            .then(response =>{
                setOrders(response.map(data => ({...data, selected: false})));
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    };

    const fetchRelaypoints = () => {
        RelaypointActions
            .findAll()
            .then(response => setRelaypoints(response));
    };

    const handleDelete = item => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions
            .delete(item, isAdmin)
            .catch(error => {
                setOrders(originalOrders);
                console.log(error.response);
            });
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])) {
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleRelaypointChange = ({ currentTarget }) => {
        const newRelaypoint = relaypoints.find(relaypoint => relaypoint.id === parseInt(currentTarget.value));
        setSelectedRelaypoint(newRelaypoint);
    };

    const handleClose = order => {
        const nextStatus = order.catalog.needsParcel ? "SHIPPED" : "DELIVERED";
        const deliveredOrder = setOrderStatus(order, nextStatus);
        OrderActions
            .update(order.id, deliveredOrder)
            .then(response => setOrders(orders.filter(o => o.id !== order.id)));
    };

    const handleCheckBoxes = ({ currentTarget }) => setRelaypointView(!relaypointView);

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

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Liste des commandes à distribuer
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" md="6" lg="6">
                                <RangeDatePicker
                                    minDate={ dates.start }
                                    maxDate={ dates.end }
                                    onDateChange={ handleDateChange }
                                    label="Date"
                                    className = "form-control mb-3"
                                />
                            </CCol>
                            { isAdmin &&
                                <CCol xs="12" md="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="1" sm="1" md="1">
                                            <CSwitch name="available" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ relaypointView } onChange={ handleCheckBoxes }/>
                                        </CCol>
                                        <CCol tag="label" xs="10" sm="10" md="10" className="col-form-label ml-2">
                                            { relaypointView ? "Récupérations Chronopost" : "Récupérations en points relais"}
                                        </CCol>
                                    </CFormGroup>
                                </CCol>
                            }
                            { relaypointView &&
                                <CCol xs="12" lg="6" className="my-3">
                                    <Select className="mr-2" name="deliverer" label="Point relais" onChange={ handleRelaypointChange } style={{height: '35px'}}>
                                        { relaypoints.map(relaypoint => <option value={ relaypoint.id }>{ relaypoint.name }</option>) }
                                    </Select>
                                </CCol>
                            }
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
                                pagination
                                scopedSlots = {{
                                    'commande':
                                        item => <td>
                                                    { isAdmin ? 
                                                        <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} disabled={ item.status !== "COLLECTABLE" && item.status !== "READY" }>
                                                            { item.name }<br/>
                                                            <small><i>{ "N°" + item.id.toString().padStart(10, "0") }</i></small>
                                                        </Link>
                                                    :
                                                        <>
                                                            { item.name }<br/>
                                                            <small><i>{ "N°" + item.id.toString().padStart(10, "0") }</i></small>
                                                        </>
                                                    }
                                                </td>
                                    ,
                                    'date':
                                        item => <td style={{color: item.status !== "COLLECTABLE" && item.status !== "READY" ? "dimgray" : "black"}}>
                                                    { isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                                    isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                                    (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                    }
                                                </td>
                                    ,
                                    'terminer':
                                        item => <td style={{color: item.status !== "COLLECTABLE" && item.status !== "READY" ? "dimgray" : "black"}}>
                                                    <CButton color="success" disabled={ item.status !== "COLLECTABLE" && item.status !== "READY" } onClick={ () => handleClose(item) } className="mx-1 my-1">
                                                        <i className="fas fa-check"></i>
                                                    </CButton>
                                                </td>
                                    ,
                                    ' ':
                                        item => (
                                            <td className="mb-3 mb-xl-0 text-center" style={{color: item.status !== "COLLECTABLE" && item.status !== "READY" ? "dimgray" : "black"}}>
                                                <CButton color="light" href={"#/components/delivery/" + item.id} target="_blank" className="mx-1 my-1"><i className="fas fa-clipboard-list"></i></CButton>
                                                <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                            </td>
                                        )
                                    ,
                                    'details':
                                        item => <CCollapse show={ details.includes(item.id) }>
                                                    <OrderDetails order={ item } isDelivery={ true }/>
                                                </CCollapse>
                                }}
                            />
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Collects;