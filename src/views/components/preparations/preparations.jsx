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
import { updatePreparations } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const Preparations = ({ history }) => {

    const itemsPerPage = 20;
    const fields = ['name', 'date', 'total', 'préparateur', ' '];
    const { currentUser, seller, supervisor } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [labelLoading, setLabelLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [daysOff, setDaysOff] = useState([]);
    const [details, setDetails] = useState([]);
    const [idTreating, setIdTreating] = useState(0);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchDaysOff();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updatePreparations(updatedOrders, getUTCDates(), orders, setOrders, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => getOrders(), [dates, daysOff]);
    useEffect(() => getOrders(currentPage), [currentPage]);

    const getOrders = (page = 1) => {
        if (page >= 1) {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            OrderActions
                .findPaginatedPreparations(UTCDates, page, itemsPerPage)
                .then(response => {
                    setOrders(response['hydra:member']);
                    setTotalItems(response['hydra:totalItems']);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    history.replace("/");
                });
        }
    }

    const fetchDaysOff = () => {
        DayOffActions
            .findActives()
            .then(closedDays => setDaysOff(closedDays))
            .catch(error => history.replace("/"));
    };

    const handleDelete = item => {
        const originalOrders = [...orders];
        setOrders(orders.filter(order => order.id !== item.id));
        OrderActions
            .delete(item, isAdmin)
            .catch(error => {
                setOrders(originalOrders);
                history.replace("/")
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
        let UTCEnd = 0;
        let UTCStart = 0;
        if (Roles.isSeller(currentUser) && isDefined(seller) && isDefined(seller.needsRecovery)) {
            const dateStart = isOffDay(dates.start) ? dates.start : getDeliveryDay(getStart(dates.start), seller);
            const dateEnd = isOffDay(dates.end) ? dates.end : getDeliveryDay(getEnd(dates.end), seller);
            UTCStart = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), 4, 0, 0);
            UTCEnd = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() + 1, 3, 59, 0);
        } else {
            UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
            UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        }
        return {start: UTCStart, end: UTCEnd};
    };

    const getStart = date => {
        let i = 0;
        let dateStart = date;
        while ( isOffDay(dateStart) ) {
            dateStart = getDateFrom(date, i);
            i--;
        }
        return dateStart
    };

    const getEnd = date => {
        let i = 1;
        let dateEnd = getDateFrom(date, i);
        while ( isOffDay(dateEnd) ) {
            dateEnd = getDateFrom(date, i);
            i++;
        }
        return getDateFrom(date, i - 1);
    };

    const getReverseDeliveryDay = date => {
        let i = 0;
        const delay = isDefined(seller.recoveryDelay) ? seller.recoveryDelay : 0;
        let dateStart = getDateFrom(date, i - delay);
        while ( isOffDay(dateStart) ) {
            i--;
            dateStart = getDateFrom(date, i - delay);
        }
        return dateStart;
    };

    const getDeliveryDay = date => getDeliveryDate(date, seller.recoveryDelay);

    const getDeliveryDate = (date, delta) => new Date(date.getFullYear(), date.getMonth(), (date.getDate() + delta), 9, 0, 0);

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

    const handleLabel = id => {
        setIdTreating(id);
        setLabelLoading(true);
        OrderActions
            .getZPLLabel(id)
            .then(response => {
                OrderActions
                    .getPrintableLabel(response.data)
                    .then(response => {
                        setLabelLoading(false);
                        setIdTreating(0);
                        const file = new Blob([response.data], {type: 'application/pdf'});
                        const fileURL = URL.createObjectURL(file);
                        window.open(fileURL, '_blank');
                    });
            })
            .catch(error => {
                setLabelLoading(false);
                setIdTreating(0);
                history.replace("/")
            });
    };

    const handleSetPreparator = (order) => {
        const formattedOrder = getOrderWithPreparator(order);
        OrderActions
            .update(order.id, formattedOrder)
            .then(response => {
                const newOrders = orders.map(o => o.id === order.id ? {...order, preparator: response.data.preparator} : o);
                setOrders(newOrders);
            })
            .catch(error => history.replace("/"));
    };

    const getOrderWithPreparator = order => {
        const { appliedCondition, catalog, items, metas, packages, user } = order;
        return {
            ...order, 
            appliedCondition: isDefined(appliedCondition) && typeof appliedCondition === 'object' ? appliedCondition['@id'] : typeof appliedCondition === 'string' ? appliedCondition : null,
            catalog: isDefined(catalog) && typeof catalog === 'object' ? catalog['@id'] : typeof catalog === 'string' ? catalog : null,
            items: isDefinedAndNotVoid(items) ? items.map(i => i['@id']) : [],
            metas: isDefined(metas) && typeof metas === 'object' ? metas['@id'] : typeof metas === 'string' ? metas : null,
            packages: isDefinedAndNotVoid(packages) ? packages.map(i => i['@id']) : [],
            user: isDefined(user) && typeof user === 'object' ? user['@id'] : typeof user === 'string' ? user : null,
            preparator: '/api/users/' + currentUser.id
        };
    };

    const getSign = item => {
        return item.isRemains ? 
            <i className="fas fa-sync-alt mr-2"></i> :
        isDefinedAndNotVoid(item.packages) ? 
            <i className="fas fa-plane mr-2"></i> :
            <i className="fas fa-truck mr-2"></i>;
    };

    const getAddress = item => {
        return <><br/><small><i>{ item.metas.zipcode } { item.metas.city }</i></small></>;
    };

    const hasUnpreparedItems = item => {
        const hasUnprepared = item.items.filter(i => i.product.seller.id === seller.id).find(i => !i.isPrepared) === undefined;
        return hasUnprepared;
    };
 
    const getNameContent = item => {
        const sign = getSign(item);
        const address = getAddress(item);
        return <>{ sign }{ item.id + " - " + item.name }{ address }</>;
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des commandes à préparer
                { (isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser)) &&
                    <CCol col="6" sm="4" md="2" className="ml-auto">
                            <Link role="button" to="/components/orders/new" block={ true } variant="outline" color="success">CRÉER</Link>
                    </CCol>
                }
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
                        scopedSlots = {{
                            'name':
                                item => <td>
                                            { Roles.isSeller(currentUser) && isDefined(seller) && hasUnpreparedItems(item) ?
                                                <p>{ getNameContent(item) }</p> :
                                                <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >{ getNameContent(item) }</Link>
                                            }
                                        </td>
                            ,
                            'date':
                                item => <td>
                                            { isAdmin || Roles.isPicker(currentUser) || Roles.isSupervisor(currentUser) ?
                                            (isSameDate(new Date(item.deliveryDate), new Date()) ? "Aujourd'hui" : 
                                            isSameDate(new Date(item.deliveryDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                            (new Date(item.deliveryDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})) 
                                            : 
                                            isSameDate( getReverseDeliveryDay(new Date(item.deliveryDate), seller), new Date()) ? "Aujourd'hui" : 
                                            isSameDate( getReverseDeliveryDay(new Date(item.deliveryDate), seller), getDateFrom(new Date(), 1)) ? "Demain" :
                                            ( getReverseDeliveryDay(new Date(item.deliveryDate), seller).toLocaleDateString('fr-FR', { timeZone: 'UTC'}))
                                            }
                                        </td>
                            ,
                            'total':
                                item => <td>{ isDefined(item.totalHT) ? item.totalHT.toFixed(2) + " €" : " "}</td>
                            ,
                            'préparateur': 
                               item => <td>
                                            { Roles.isSeller(currentUser) && isDefined(seller) && hasUnpreparedItems(item) ?
                                                 <span className="mx-1 my-1">{ "Prêt" }</span> :
                                                isDefined(item.preparator) ? 
                                                    <span className="mx-1 my-1">{ item.preparator.name }</span> : 
                                                    <CButton color="success" onClick={ () => handleSetPreparator(item) } className="mx-1 my-1"><i className="fas fa-check mr-2"></i>Prendre</CButton>
                                            }
                                        </td>
                            ,
                            ' ':
                                item => (
                                    <td className="mb-3 mb-xl-0 text-right">
                                        { isDefinedAndNotVoid(item.packages) && <CButton color="light" href={"#/components/parcels/" + item.id} target="_blank" className="mx-1 my-1"><i className="fas fa-list-ul"></i></CButton> }
                                        { isDefinedAndNotVoid(item.reservationNumber) && 
                                            <CButton color="light" onClick={ () => handleLabel(item.id) } className="mx-1 my-1">
                                                {labelLoading && item.id === idTreating ? 
                                                    <>
                                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                                        <span className="sr-only">Loading...</span>
                                                    </>
                                                    : <i className="fas fa-barcode" style={{ fontSize: '1.2em'}}></i>
                                                }
                                            </CButton>
                                        }
                                        <CButton color="warning" disabled={ !isAdmin } href={ "#/components/orders/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                        <CButton color="danger" disabled={ !(isAdmin || (item.isRemains && Roles.isPicker(currentUser))) } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                    </td>
                                )
                            ,
                            'details':
                                item => <CCollapse show={details.includes(item.id)}>
                                            <OrderDetails orders={ orders } order={ item } setOrders={ setOrders } id={ item.id } toggleDetails={ toggleDetails }/>
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
 
export default Preparations;