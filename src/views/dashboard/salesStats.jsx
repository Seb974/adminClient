import React, { useContext, useEffect, useState } from 'react';
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CProgress, CRow, CCallout} from '@coreui/react';
import OrderActions from 'src/services/OrderActions';
import { getActiveStatus } from 'src/helpers/orders';
import AuthContext from 'src/contexts/AuthContext';
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate } from 'src/helpers/days';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import ProductsContext from 'src/contexts/ProductsContext';
import Roles from 'src/config/Roles';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const SalesStats = () => {

    const productLimit = 8;
    const breaksLimit = 5;
    const status = getActiveStatus();
    const { products } = useContext(ProductsContext);
    const { currentUser, supervisor, seller } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [sales, setSales] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [productSales, setProductSales] = useState([]);
    const [breaks, setBreaks] = useState([]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updateStatusBetween(updatedOrders, getUTCDates(), status, sales, setSales, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    useEffect(() => fetchSales(), [dates]);

    useEffect(() => {
        const selledProducts = getProductsStats();
        const breaksSales = getBreaks();
        setProductSales(selledProducts);
        setBreaks(breaksSales);
    }, [sales, products]);

    const fetchSales = () => {
        if (isDefined(currentUser)) {
            OrderActions
                .findStatusBetween(getUTCDates(), status, currentUser)
                .then(response => {
                    const ownSales = Roles.isSeller(currentUser) && isDefined(seller) ?
                                     response.map(o => ({...o, items: o.items.filter(i => i.product.seller.id === seller.id)})) :
                                     response ;
                    setSales(ownSales.filter(o => isDefinedAndNotVoid(o.items)));
                })
                .catch(error => console.log(error));
        }
    };

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
    };

    const getDateName = () => {
        const { end } = dates;
        const { start } = getUTCDates();
        return  isSameDate(new Date(), start) && isSameDate(new Date(), end) ? "Aujourd'hui" :
                isSameDate(new Date(), end) ? "Du " + getFormattedDate(start) + " à aujourd'hui" :
                isSameDate(new Date(), start) ? "D'aujourd'hui au " + getFormattedDate(end) :
                "Du " + getFormattedDate(start) + " au " + getFormattedDate(end);
    };

    const getFormattedDate = date => date.toLocaleDateString('fr-FR', { timeZone: 'UTC'});

    const getClients = () => {
        let clients = [];
        sales.map(s => clients = clients.includes(s.email) ? clients : [...clients, s.email]);
        return clients.length;
    };

    const getProductsStats = () => {
        const productsWithStats = products.map(p => {
            let totalProduct = 0;
            const {name, image, saleCount, seller, lastCost} = p;
            sales.map(s => {
                totalProduct += s.items.reduce((sum, i) => sum += i.product.id === p.id ? i.orderedQty : 0, 0);
            });
            return {name, image, seller, lastCost, saleCount: isDefined(saleCount) ? saleCount : 0, periodSaleCount: totalProduct};
        });
        return productsWithStats;
    };

    const getBreaks = () => {
        const productsbroken = products.map(p => {
            let totalOrdered = 0;
            let totalFailed = 0;
            sales.map(s => {
                if (["DELIVERED", "COLLECTABLE", "PREPARED"].includes(s.status)) {
                    s.items.map(i => {
                        if (i.product.id === p.id && isDefined(i.orderedQty) && isDefined(i.preparedQty) && i.preparedQty < i.orderedQty) {
                            totalOrdered += i.orderedQty;
                            totalFailed += (i.orderedQty - i.preparedQty);
                        }
                    });
                }
            });
            return { name: p.name, unit: p.unit, ordered: totalOrdered, broken: totalFailed };
        });
        return productsbroken.filter(b => b.ordered > 0);
    };

    const getProfesionalCount = () => sales.filter(s => isDefined(s.user) && Roles.isProfesional(s.user.roles)).length;

    const getConsumerCount = () => sales.length - getProfesionalCount();

    const getTotalBrokenProducts = () => breaks.reduce((sum, b) => sum += b.ordered, 0);

    const getBrokenPartProducts = () => breaks.reduce((sum, b) => sum += b.broken, 0);

    const getVolume = () => {
        return sales.reduce((tSum, s) => {
            return tSum += s.items.reduce((sum, i) => {
                const quantity = isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty;
                return sum += i.product.unit === "U" ? quantity * i.product.weight : quantity;
            }, 0);
        }, 0). toFixed(2);
    };

    const getTotal = () => {
        return sales.reduce((tSum, s) => {
            return tSum += s.items.reduce((sum, i) => {
                const quantity = isDefined(i.deliveredQty) ? i.deliveredQty : i.orderedQty;
                return sum += quantity * i.price;
            }, 0);
        }, 0). toFixed(2);
    };

    return (
        <CRow>
            <CCol>
            <CCard>
                <CCardHeader>
                    <CRow className="d-flex align-items-center">
                        <CCol xs="12" sm="12" lg="6" className="d-flex justify-content-start mb-2">
                            { getDateName() }
                        </CCol>
                        <CCol xs="12" sm="12" lg="6" className="d-flex justify-content-end mb-2">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label=""
                                className="form-control"
                            />
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody>
                <CRow>
                    <CCol xs="12" md={!isDefined(supervisor) ? "6" : "12"} xl={!isDefined(supervisor) ? "6" : "12"}>
                        <CRow>
                            <CCol sm={!isDefined(supervisor) ? "6" : "3"}>
                                <CCallout color="info">
                                    <small className="text-muted">Produits</small>
                                    <br />
                                    <strong className="h4">{ productSales.filter(p => p.periodSaleCount > 0).length }</strong>
                                </CCallout>
                            </CCol>
                            <CCol sm={!isDefined(supervisor) ? "6" : "3"}>
                                <CCallout color="danger">
                                    <small className="text-muted">{!isDefined(supervisor) ? "Ruptures" : "Commandes"}</small>
                                    <br />
                                    <strong className="h4">
                                        { !isDefined(supervisor) ?
                                            (isDefinedAndNotVoid(breaks) ? (getBrokenPartProducts() / getTotalBrokenProducts() * 100).toFixed(2) + '%' : 0 + '%') :
                                            sales.length
                                        }
                                    </strong>
                                </CCallout>
                            </CCol>
                            { isDefined(supervisor) &&
                                <>
                                    <CCol sm="3">
                                        <CCallout color="warning">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Clients" : "Volume" }</small>
                                            <br />
                                            <strong className="h4">{ !isDefined(supervisor) ? getClients() : (getVolume() + " Kg") }</strong>
                                        </CCallout>
                                    </CCol>
                                    <CCol sm="3">
                                        <CCallout color="success">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Commandes" : "Prix moyen du Kg" }</small>
                                            <br />
                                            <strong className="h4">
                                                {  !isDefined(supervisor) ? sales.length : 
                                                (isDefinedAndNotVoid(sales) ? (getTotal() / getVolume()).toFixed(2) : 0) + " €"
                                                }
                                            </strong>
                                        </CCallout>
                                    </CCol>
                                </>
                            }
                        </CRow>

                        <hr className="mt-0" />

                        { productSales
                            .filter((p, i) => i < productLimit)
                            .sort((a, b) => (a.periodSaleCount > b.periodSaleCount) ? -1 : 1)
                            .sort((a, b) => (a.saleCount > b.saleCount) ? -1 : 1)
                            .map((product, i) => {
                                const totalPeriodCount = productSales.reduce((sum, p) => sum += p.periodSaleCount, 0);
                                const totalCount = productSales.reduce((sum, p) => sum += isDefined(p.saleCount) ? p.saleCount : 0, 0);
                                return (
                                    <div key={ i } className="progress-group mb-4">
                                        <div className="progress-group-prepend">
                                        <span className="progress-group-text">{ product.name }</span>
                                        </div>
                                        <div className="progress-group-bars">
                                        <CProgress className="progress-xs" color="info" value={ (product.periodSaleCount / totalPeriodCount * 100).toFixed(2) } />
                                        <CProgress className="progress-xs" color="success" value={ (product.saleCount / totalCount * 100).toFixed(2) } />
                                        </div>
                                    </div>
                                );
                            })
                        }
                        <div className="legend text-center">
                            <small>
                            <sup className="px-1"><CBadge shape="pill" color="info">&nbsp;</CBadge></sup>
                            Sur la période
                            &nbsp;
                            <sup className="px-1"><CBadge shape="pill" color="success">&nbsp;</CBadge></sup>
                            Au global
                            </small>
                        </div>
                    </CCol>
                    { !isDefined(supervisor) && 
                        <>
                            <CCol xs="12" md="6" xl="6">
                                <CRow>
                                    <CCol sm="6">
                                        <CCallout color="warning">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Clients" : "Volume" }</small>
                                            <br />
                                            <strong className="h4">{ !isDefined(supervisor) ? getClients() : (getVolume() + " Kg") }</strong>
                                        </CCallout>
                                    </CCol>
                                    <CCol sm="6">
                                        <CCallout color="success">
                                            <small className="text-muted">{ !isDefined(supervisor) ? "Commandes" : "Prix moyen du Kg" }</small>
                                            <br />
                                            <strong className="h4">
                                                {  !isDefined(supervisor) ? sales.length : 
                                                (isDefinedAndNotVoid(sales) ? (getTotal() / getVolume()).toFixed(2) : 0) + " €"
                                                }
                                            </strong>
                                        </CCallout>
                                    </CCol>
                                </CRow>

                            <hr className="mt-0" />

                            <div className="progress-group mb-4">
                                <div className="progress-group-header">
                                    <i className="fas fa-user-tie progress-group-icon"></i>
                                    <span className="title">Professionnel</span>
                                    <span className="ml-auto font-weight-bold">{ (isDefinedAndNotVoid(sales) ? (getProfesionalCount() / sales.length * 100).toFixed(2) : 0) + '%' }</span>
                                </div>
                                <div className="progress-group-bars">
                                    <CProgress className="progress-xs" color="warning" value={ (isDefinedAndNotVoid(sales) ? (getProfesionalCount() / sales.length * 100).toFixed(2) : 0) } />
                                </div>
                            </div>
                            <div className="progress-group mb-5">
                                <div className="progress-group-header">
                                    <i className="fas fa-user progress-group-icon"></i>
                                    <span className="title">Particulier</span>
                                    <span className="ml-auto font-weight-bold">{ (isDefinedAndNotVoid(sales) ? (getConsumerCount() / sales.length * 100).toFixed(2) : 0) + '%' }</span>
                                </div>
                                <div className="progress-group-bars">
                                    <CProgress className="progress-xs" color="warning" value={ (isDefinedAndNotVoid(sales) ? (getConsumerCount() / sales.length * 100).toFixed(2) : 0) } />
                                </div>
                            </div>
                            { breaks
                                .filter((b, i) => i < breaksLimit)
                                .sort((a, b) => ( (a.broken/ a.ordered) > (b.broken / b.ordered)) ? -1 : 1)
                                .map((b, i) => {
                                    return (
                                        <div key={ i } className="progress-group">
                                            <div className="progress-group-header">
                                            <span className="title">{ b.name }</span>
                                            <span className="ml-auto font-weight-bold">{ b.broken.toFixed(2) + ' ' + b.unit }  <span className="text-muted small">{ (b.broken / b.ordered * 100).toFixed(2) + '%' }</span></span>
                                            </div>
                                            <div className="progress-group-bars">
                                            <CProgress className="progress-xs" color="danger" value={ (b.broken / b.ordered * 100).toFixed(2) } />
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            </CCol>
                        </>
                    }
                </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
  )
}

export default SalesStats
