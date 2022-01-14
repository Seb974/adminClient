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
import CIcon from '@coreui/icons-react';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents';
import MercureContext from 'src/contexts/MercureContext';

const StockStats = () => {

    const status = getActiveStatus();
    const { products } = useContext(ProductsContext);
    const { currentUser, supervisor, seller } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [sales, setSales] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [breaks, setBreaks] = useState([]);
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updateStatusBetween(updatedOrders, getUTCDates(dates), status, sales, setSales, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    

    useEffect(() => fetchSales(), [dates]);

    useEffect(() => setStocks(defineStocks()), [sales, products]);

    useEffect(() => setBreaks(getBreaks()), [stocks]);

    const fetchSales = () => {
        if (isDefined(currentUser)) {
            OrderActions
                .findStatusBetween(getUTCDates(dates), status, currentUser)
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
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 4, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
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

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const defineStocks = () => {
        let newStocks = [];
        products.map(product => {
            newStocks = getStock(product, newStocks);
        });
        return newStocks;
    };

    const getStock = (product, stocks) => {
        if (isDefined(product.stock))
            stocks = [...stocks, {...product.stock, name: product.name, unit: product.unit }];
        else if (isDefinedAndNotVoid(product.variations)) {
            product.variations.map(variation => {
                if (isDefinedAndNotVoid(variation.sizes)) {
                    variation.sizes.map(size => {
                        stocks = [...stocks, {...size.stock, name: getProductName(product, variation, size), unit: product.unit }];
                    });
                }
            });
        }
        return stocks;
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, variation.color) ? " - " + variation.color : "";
        const sizeName = exists(size, size.name) ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, entityName) => {
        return isDefined(entity) && isDefined(entityName) && entityName.length > 0 && entityName !== " ";
    };

    const getBreaks = () => {
        const brokenStocks = stocks.map(stock => {
            let totalOrdered = 0;
            sales.map(s => {
                s.items.map(i => {
                    if (isSameProduct(stock, i) && !isDefined(i.preparedQty))
                        totalOrdered += i.orderedQty;
                });
            });
            return { ...stock, ordered: totalOrdered };
        });
        return  brokenStocks.filter(b => b.ordered > 0).length > 5 ?
                brokenStocks.filter(b => b.ordered > 0) :
                brokenStocks.filter(b => b.quantity <= b.alert);
    };

    const isSameProduct = (stock, item) => {
        let isSameProduct = false;
        if (isDefined(item.size) && parseInt(item.size.stock.id) === parseInt(stock.id)) {
            isSameProduct = true;
        } else {
            isSameProduct = isDefined(item.product.stock) && parseInt(item.product.stock.id) === parseInt(stock.id);
        }
        return isSameProduct;
    };

    const getSign = item => {
        return (
            item.quantity <= item.security ?
                <span><i className="fas fa-exclamation-triangle mr-1 text-danger" style={{ width: '36px', height: '36px'}}></i></span>
            : item.quantity <= item.alert ? 
                <span><i className="fas fa-info-circle mr-1 text-warning" style={{ width: '36px', height: '36px'}}></i></span>
            : <span></span>
        );
    };

    const getColor = item => {
        const percent = (isDefined(item.quantity) && item.quantity > 0 ? (item.ordered / item.quantity * 100).toFixed(0) : 0);
        return  percent < 30 ? "success" : 
                percent >= 30 && percent < 70 ? "info" :
                percent >= 70 && percent < 100 ? "warning" : "danger";
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

                    <table className="table table-hover table-outline mb-0 d-none d-sm-table">
                        <thead className="thead-light">
                            <tr>
                                <th className="text-center"><CIcon name="cil-bell" /></th>
                                <th>Produit</th>
                                <th>Utilisation</th>
                                <th>Stock</th>
                                <th>Commandé</th>
                            </tr>
                        </thead>
                        {/* <span style={{ height: '360px', maxHeight: '360px', overflowY: 'scroll'}}> */}
                            <tbody>
                                { breaks
                                    .sort((a, b) => (a.ordered > b.ordered) ? 1 : -1)
                                    .sort((a, b) => (a.quantity - a.ordered) > (b.quantity - b.ordered) ? 1 : -1)
                                    .map((b, i) => {
                                        return (
                                            <tr key={ i }>
                                                <td className="text-center">
                                                    <div className="c-avatar">
                                                        { getSign(b) }
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{ b.name }</div>
                                                    <div className="small text-muted">
                                                        <span>Sécurité : { b.security + " " + b.unit }</span> | Alerte : { b.alert + " " + b.unit }
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="clearfix">
                                                        <div className="float-left">
                                                        <strong>{ (isDefined(b.quantity) && b.quantity > 0 ? (b.ordered / b.quantity * 100).toFixed(0) : 0) + '%' }</strong>
                                                        </div>
                                                        <div className="float-right">
                                                            <small className="text-muted">Jun 11, 2015 - Jul 10, 2015</small>
                                                        </div>
                                                    </div>
                                                    <CProgress className="progress-xs" color={ getColor(b) } value={ (isDefined(b.quantity) && b.quantity > 0 ? (b.ordered / b.quantity * 100).toFixed(0) : 0) } />
                                                </td>
                                                <td>    {/* className="text-center" */}
                                                    { b.quantity + " " + b.unit }
                                                    {/* <CIcon height={25} name="cib-cc-mastercard" /> */}
                                                </td>
                                                <td>
                                                    {/* <div className="small text-muted">Last login</div> */}
                                                    <strong>{ b.ordered + " " + b.unit }</strong>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        {/* </span> */}
                    </table>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
  )
}

export default StockStats;
