import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import OrderDetails from 'src/components/preparationPages/orderDetails';
import DayOffActions from 'src/services/DayOffActions';
import SellerActions from 'src/services/SellerActions';
import { updateRecoveries } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';
import Select from 'src/components/forms/Select';

const Recoveries = ({ history }) => {

    const itemsPerPage = 50;
    const fields = ['commande', 'date', 'statut', ' '];
    const { currentUser, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [daysOff, setDaysOff] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [details, setDetails] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSeller, setSelectedSeller] = useState(null);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchDaysOff();
        fetchSellers();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders))
            updateRecoveries(updatedOrders, dates, orders, setOrders, currentUser, supervisor, setUpdatedOrders);
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => getOrders(), [dates, selectedSeller]);
    useEffect(() => getOrders(currentPage), [currentPage]);

    const getOrders = (page = 1) => {
        if (isDefined(selectedSeller) && page >= 1) {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            OrderActions
                .findRecoveries(UTCDates, selectedSeller, page, itemsPerPage)
                .then(response => {
                    const newOrders = response['hydra:member'].map(o => ({...o, recoveryDate: getRecoveryDay(new Date(o.deliveryDate), getDelay()) }));
                    setOrders(newOrders);
                    setTotalItems(response['hydra:totalItems']);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    history.replace("/");
                });
        }
    };

    const fetchDaysOff = () => {
        DayOffActions
            .findActives()
            .then(closedDays => setDaysOff(closedDays))
            .catch(error => history.replace("/"));
    };

    const fetchSellers = () => {
        SellerActions
            .findSellersNeedingRecovery()
            .then(response => {
                setSellers(response);
                setSelectedSeller(response[0]);
            })
            .catch(error => history.replace("/"));
    };

    const handleSellerChange = ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSeller);
    };

    const handleDelete = (item) => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions
            .delete(item, isAdmin)
            .catch(error => {
                setOrders(originalOrders);
                history.replace("/");
            });
    }

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const getDelay = () => isDefined(selectedSeller) && isDefined(selectedSeller.recoveryDelay) ? selectedSeller.recoveryDelay : 0;

    const getUTCDates = () => {
        const delay = getDelay();
        const startSelection = getReverseDeliveryDay(dates.start, delay);
        const endSelection = getReverseDeliveryDay(dates.end, delay);
        const UTCStart = new Date(startSelection.getFullYear(), startSelection.getMonth(), startSelection.getDate(), 4, 0, 0);
        const UTCEnd = new Date(endSelection.getFullYear(), endSelection.getMonth(), endSelection.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    const getRecoveryDay = (date, recoveryDelay) => {
        let i = 0;
        let dateStart = getDateFrom(date, i - recoveryDelay);
        while ( isOffDay(dateStart) ) {
            i--;
            dateStart = getDateFrom(date, i - recoveryDelay);
        }
        return dateStart;
    };

    const getReverseDeliveryDay = (date, recoveryDelay) => {
        let i = 0;
        let dateStart = getDateFrom(date, i + recoveryDelay);
        while ( isOffDay(dateStart) ) {
            i++;
            dateStart = getDateFrom(date, i + recoveryDelay);
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
                    <CCol xs="12" sm="6" md="6">
                        <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                            { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                        </Select>
                    </CCol>
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
                        hover
                        scopedSlots = {{
                            'commande':
                                item => <td>
                                            <Link to="#" onClick={ e => { toggleDetails(item.id, e) }}>
                                                { item.name }<br/>
                                                <small><i>{ 'N°' + item.id.toString().padStart(10, '0') }</i></small>
                                            </Link>
                                        </td>
                            ,
                            'date':
                                item => <td>
                                            { new Date(item.recoveryDate).toLocaleDateString('fr-FR', { timeZone: 'UTC'}) }
                                        </td>
                            ,
                            'statut':
                                item => <td>
                                            { item.items.find(elt => !elt.isPrepared) !== undefined ? "EN ATTENTE" : "PRÊT" }
                                        </td>
                            ,
                            ' ':
                                item => (
                                    <td className="mb-3 mb-xl-0 text-center">
                                        <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                        <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                    </td>
                                )
                            ,
                            'details':
                                item => <CCollapse show={details.includes(item.id)}>
                                            <OrderDetails orders={ orders } order={ item } setOrders={ setOrders } isDelivery={ true }/>
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