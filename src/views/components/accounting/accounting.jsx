import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';
import { getDeliveredStatus } from 'src/helpers/orders';
import UserActions from 'src/services/UserActions';
import Select from 'src/components/forms/Select';

const Accounting = (props) => {

    const itemsPerPage = 30;
    const fields = ['name', 'date', 'CodePaiement', 'Etat', 'selection', ' '];
    const deliveredStatus = getDeliveredStatus();
    const { currentUser, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [billingLoading, setBillingLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [selectAll, setSelectAll] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(-1);

    useEffect(() => {
        const isUserAdmin = Roles.hasAdminPrivileges(currentUser);
        setIsAdmin(isUserAdmin);
        getOrders();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders)&& !mercureOpering) {
            setMercureOpering(true);
            updateStatusBetween(updatedOrders, getUTCDates(), deliveredStatus, orders, setOrders, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates();
        OrderActions.findStatusBetween(UTCDates, deliveredStatus, currentUser)
                .then(response =>{
                    setOrders(response.map(data => ({...data, selected: false})));
                    getUsers(response);
                    setLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setLoading(false);
                });
    };

    const getUsers = orders => {
        let finalUsers = [];
        orders.map(o => {
            if (finalUsers.find(u => u.email === o.email) === undefined) {
                finalUsers = [...finalUsers, { name: o.name, email: o.email }];
            }
        });
        setUsers(finalUsers);
    };

    const handleUserChange = ({ currentTarget }) => setSelectedUser(currentTarget.value);

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

    const handleSelect = item => {
        let newValue = null;
        const newOrders = orders.map(element => {
            newValue = !element.selected;
            return element.id === item.id && !element.invoiced ? {...element, selected: !element.selected} : element;
        });
        setOrders(newOrders);
        if (!newValue && selectAll)
            setSelectAll(false);
    };

    const handleSelectAll = () => {
        const newSelection = !selectAll;
        const newOrders = orders.map(element => element.invoiced ? element : ({...element, selected: newSelection}));
        setSelectAll(newSelection);
        setOrders(newOrders);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    const handleSubmit = () => {
        setBillingLoading(true);
        getInvoices()
            .then(response => {
                console.log(response);
                OrderActions.sendToAxonaut(response)
                            .then(r => {
                                const updatedOrders = orders.map(o => o.selected ? {...o, invoiced: true, selected: false} : o);
                                setOrders(updatedOrders);
                                setBillingLoading(false);
                            })
                            .catch(error => {
                                setBillingLoading(false);
                                console.log(error);
                            })
            })
            .catch(error => {
                setBillingLoading(false);
                console.log(error);
            });
        // const ordersToBill = getGroupedOrders();
        // OrderActions.sendToAxonaut(ordersToBill)
        //             .then(r => console.log(r));
    };

    const getGroupedOrders = () => {
        const filteredOrders = orders.filter(o => o.selected);
        const associatedUsers = filteredOrders.map(o => o.email);
        return [...new Set(associatedUsers)].map(u => {
            const userOrders = filteredOrders.filter(o => o.email === u);
            return { orders: userOrders, metas: userOrders[0].metas };
        })
    }

    const getInvoices = async () => {
        const ordersToBill = getGroupedOrders();
        const invoices = await Promise.all(ordersToBill.map( async order => {
            return await UserActions.getAccountingId(order.orders[0])
                                    .then(accountingId => ({...order, orders: order.orders.map(o => o.id), customer: accountingId}));
        }));
        return invoices;
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Liste des commandes à facturer
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
                        <CRow>
                            <CCol xs="12" lg="12" className="my-2">
                                <Select className="mr-2" name="priceGroup" label="Client" value={ selectedUser } onChange={ handleUserChange }>         {/* onChange={ handleInputChange } */}
                                    <option value="-1">Tous</option>
                                    { users.map(p => <option key={ p.email } value={ p.email }>{ p.name }</option>)}
                                </Select>
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
                                items={ selectedUser == -1 ? orders : orders.filter(o => o.email === selectedUser) }
                                fields={ fields }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'name':
                                        item => <td>
                                                    <Link to={"/components/orders/" + item.id}>
                                                        { "BL N°" + item.id.toString().padStart(10, "0") }<br/>
                                                        <small><i>{ item.name } - { item.metas.zipcode } { item.metas.city }</i></small>
                                                        <br/>
                                                    </Link>
                                                </td>
                                    ,
                                    'date':
                                        item => <td>
                                                    { isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                                    isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                                    (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                    }
                                                </td>
                                    ,
                                    'CodePaiement':
                                        item => <td>
                                                    { isDefined(item.paymentId) ? item.paymentId : "-"}
                                                </td>
                                    ,
                                    'Etat':
                                        item => <td>
                                                    { isDefined(item.invoiced) && item.invoiced ? "Facturé" : "A facturer"}
                                                </td>
                                    ,
                                    'selection':
                                        item => <td className="d-flex align-items-center">
                                                    <input
                                                        className="mx-1 my-1"
                                                        type="checkbox"
                                                        name="inline-checkbox"
                                                        checked={ item.selected }
                                                        onClick={ () => handleSelect(item) }
                                                        disabled={ item.invoiced }
                                                        style={{zoom: 2.3}}
                                                    />
                                                </td>
                                    ,
                                    ' ':
                                        item => (
                                            <td className="mb-3 mb-xl-0 text-center">
                                                <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                            </td>
                                        )
                                }}
                            />
                        }
                        { orders.length > 0 &&
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                <CButton size="sm" color="success" onClick={ handleSubmit } className={ "ml-2" } style={{width: '140px', height: '35px'}} disabled={ orders.findIndex(o => o.selected) === -1 }>
                                    { billingLoading ?
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            />
                                        : 
                                        <>Facturer</>
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

export default Accounting;