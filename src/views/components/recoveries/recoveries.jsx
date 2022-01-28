import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom, isBetween } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import { Button } from 'bootstrap';
import OrderDetails from 'src/components/preparationPages/orderDetails';
import DayOffActions from 'src/services/DayOffActions';
import SellerActions from 'src/services/SellerActions';
import { updateRecoveries } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const Recoveries = (props) => {

    const itemsPerPage = 30;
    const fields = ['vendeur', 'commande', 'date', 'statut', ' '];
    const { currentUser, seller, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [daysOff, setDaysOff] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [recoveries, setRecoveries] = useState([]);
    const [details, setDetails] = useState([]);
    const [currentItems, setCurrentItems] = useState(recoveries)

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchDaysOff();
        fetchSellers();
        getOrders();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders))
            updateRecoveries(updatedOrders, dates, orders, setOrders, currentUser, supervisor, setUpdatedOrders);
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => setCurrentItems(recoveries), [recoveries]);

    useEffect(() => {
        if (sellers.length > 0 && orders.length > 0)
            getRecoveries();
    }, [dates, daysOff, sellers, orders]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        OrderActions
            .findRecoveries(UTCDates)
            .then(response =>{
                setOrders(response);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }

    const getRecoveries = () => {
        let newRecoveries = [];
        sellers.map(seller => {
            if (isDefined(seller.needsRecovery) && seller.needsRecovery === true) {
                const sellerOrders = orders.filter(order => order.items.find(item => item.product.seller.id === seller.id));
                sellerOrders.map(order => {
                    const recoveryDate = getReverseDeliveryDay(new Date(order.deliveryDate), seller.recoveryDelay);
                    if (isBetween(recoveryDate, dates.start, dates.end)) {
                        newRecoveries = [
                            ...newRecoveries, 
                            {
                                seller, 
                                order: {...order, items: order.items.filter(item => item.product.seller.id === seller.id)},
                                recoveryDate
                            }
                        ];
                    }
                });
            }
        });
        setRecoveries(newRecoveries.sort((a, b) => (a.recoveryDate > b.recoveryDate) ? 1 : -1));
    };

    const fetchDaysOff = () => {
        DayOffActions
            .findActives()
            .then(closedDays => setDaysOff(closedDays))
            .catch(error => console.log(error));
    };

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => setSellers(response))
            .catch(error => console.log(error));
    };

    const handleDelete = (item) => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions
            .delete(item, isAdmin)
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

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    const getReverseDeliveryDay = (date, recoveryDelay) => {
        let i = 0;
        let dateStart = getDateFrom(date, i - recoveryDelay);
        while ( isOffDay(dateStart) ) {
            i--;
            dateStart = getDateFrom(date, i - recoveryDelay);
        }
        return dateStart;
    };

    const isOffDay = date => daysOff.find(day => isSameDate(new Date(day.date), date)) !== undefined || date.getDay() === 0;

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
            newDetails.splice(position, 1)
        } else {
            newDetails = [...details, index]
        }
        setDetails(newDetails);
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>Liste des commandes à récupérer</CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol xs="12" md="6">
                    <RangeDatePicker
                        minDate={ dates.start }
                        maxDate={ dates.end }
                        onDateChange={ handleDateChange }
                        label="Date"
                        className = "form-control mb-3"
                    />
                    </CCol>
                </CRow>
                { loading ? 
                    <CRow className="mx-5">
                        <CCol xs="12" lg="12" className="text-center mx-5">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow> 
                    :
                    <CDataTable
                        items={ recoveries }
                        fields={ fields }
                        bordered
                        itemsPerPage={ itemsPerPage }
                        pagination
                        hover
                        scopedSlots = {{
                            'vendeur':
                                item => <td>
                                            <Link to="#" onClick={ e => { toggleDetails(item.order.id, e) }}>
                                                { item.seller.name }
                                            </Link>
                                        </td>
                            ,
                            'commande':
                                item => <td>
                                            <Link to="#" onClick={ e => { toggleDetails(item.order.id, e) }}>
                                                { item.order.name }<br/>
                                                <small><i>{ 'N°' + item.order.id.toString().padStart(10, '0') }</i></small>
                                            </Link>
                                        </td>
                            ,
                            'date':
                                item => <td>
                                            { item.recoveryDate.toLocaleDateString('fr-FR', { timeZone: 'UTC'}) }
                                        </td>
                            ,
                            'statut':
                                item => <td>
                                            { item.order.items.find(elt => !elt.isPrepared) !== undefined ? "EN ATTENTE" : "PRÊT" }
                                        </td>
                            ,
                            ' ':
                                item => (
                                    <td className="mb-3 mb-xl-0 text-center">
                                        <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.order.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                        <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item.order) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                    </td>
                                )
                            ,
                            'details':
                                item => <CCollapse show={details.includes(item.order.id)}>
                                            <OrderDetails orders={ orders } order={ item.order } setOrders={ setOrders } isDelivery={ true }/>
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
 
export default Recoveries;