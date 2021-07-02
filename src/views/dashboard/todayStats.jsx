import React, { useContext, useEffect, useState } from 'react';
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CProgress, CRow, CCallout} from '@coreui/react';
import OrderActions from 'src/services/OrderActions';
import { getActiveStatus } from 'src/helpers/orders';
import AuthContext from 'src/contexts/AuthContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate } from 'src/helpers/days';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import ProductsContext from 'src/contexts/ProductsContext';
import Roles from 'src/config/Roles';

const TodayStats = () => {

    const productLimit = 8;
    const breaksLimit = 5;
    const status = getActiveStatus();
    const { currentUser } = useContext(AuthContext);
    const { products } = useContext(ProductsContext);
    const [sales, setSales] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [productSales, setProductSales] = useState([]);
    const [breaks, setBreaks] = useState([]);

    useEffect(() => fetchSales(), [dates]);

    useEffect(() => {
        const selledProducts = getProductsStats();
        const breaksSales = getBreaks();
        setProductSales(selledProducts);
        setBreaks(breaksSales);
    }, [sales]);

    const fetchSales = () => {
        OrderActions
            .findStatusBetween(dates, status, currentUser)
            .then(response => setSales(response));
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 4, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const getDateName = () => {
        const { start, end } = dates;
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
                    <CCol xs="12" md="6" xl="6">

                    <CRow>
                        <CCol sm="6">
                        <CCallout color="info">
                            <small className="text-muted">Produits</small>
                            <br />
                            <strong className="h4">{ productSales.filter(p => p.periodSaleCount > 0).length }</strong>
                        </CCallout>
                        </CCol>
                        <CCol sm="6">
                        <CCallout color="danger">
                            <small className="text-muted">Ruptures</small>
                            <br />
                            <strong className="h4">
                                { isDefinedAndNotVoid(breaks) ? (getBrokenPartProducts() / getTotalBrokenProducts() * 100).toFixed(2) + '%' : 0 + '%' }
                            </strong>
                        </CCallout>
                        </CCol>
                    </CRow>

                    <hr className="mt-0" />
                    
                    { productSales
                        .filter((p, i) => i < productLimit)
                        .sort((a, b) => (a.periodSaleCount > b.periodSaleCount) ? -1 : 1)
                        .map(product => {
                            const totalPeriodCount = productSales.reduce((sum, p) => sum += p.periodSaleCount, 0);
                            const totalCount = productSales.reduce((sum, p) => sum += isDefined(p.saleCount) ? p.saleCount : 0, 0);
                            return (
                                <div className="progress-group mb-4">
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

                    <CCol xs="12" md="6" xl="6">

                    <CRow>
                        <CCol sm="6">
                        <CCallout color="warning">
                            <small className="text-muted">Clients</small>
                            <br />
                            <strong className="h4">{ getClients() }</strong>
                        </CCallout>
                        </CCol>
                        <CCol sm="6">
                        <CCallout color="success">
                            <small className="text-muted">Commandes</small>
                            <br />
                            <strong className="h4">{ sales.length }</strong>
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
                        .map(b => {
                            return (
                                <div className="progress-group">
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
                </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
  )
}

export default TodayStats
