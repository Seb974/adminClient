import React, { lazy, useContext, useEffect, useState } from 'react';
import StatChart from '../charts/StatChart.js';
import SalesStats from './salesStats.jsx';
import StockStats from './stockStats.jsx';
import AuthContext from 'src/contexts/AuthContext.js';
import { getDateFrom, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils.js';
import Roles from 'src/config/Roles.js';
import OrderActions from 'src/services/OrderActions.js';
import MercureContext from 'src/contexts/MercureContext.js';
import { getActiveStatus } from 'src/helpers/orders.js';
import { updateStatusBetween } from 'src/data/dataProvider/eventHandlers/orderEvents.js';

const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'));

const Dashboard = () => {

    const interval = 30;
    const widgetInterval = 7;
    const status = getActiveStatus();
    const now = new Date();
    const dates = { start: getDateFrom(now, -interval, 0), end: now };
    const { currentUser, supervisor, seller } = useContext(AuthContext);
    const { updatedOrders, setUpdatedOrders } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);
    const [sales, setSales] = useState([]);

    useEffect(() => fetchSales(), []);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedOrders) && !mercureOpering) {
            setMercureOpering(true);
            updateStatusBetween(updatedOrders, getUTCDates(dates), status, sales, setSales, currentUser, supervisor, setUpdatedOrders)
                .then(response => setMercureOpering(response));
        }
    }, [updatedOrders]);

    const fetchSales = () => {
        if (isDefined(currentUser)) {
            OrderActions
                .findStatusBetween(getUTCDates(), status, currentUser)
                .then(response => {
                      const ownSales = Roles.isSeller(currentUser) && isDefined(seller) ?
                                      response.map(o => ({...o, items: o.items.filter(i => i.product.seller.id === seller.id)})) :
                                      response ;
                      setSales(ownSales.filter(o => isDefinedAndNotVoid(o.items)));
                });
        }
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
  };

    return (
        <>
            <WidgetsDropdown sales={ sales } interval={ widgetInterval }/>
            <SalesStats />
            { !isDefined(supervisor) && <StockStats /> }
            <StatChart style={{height: '300px', marginTop: '40px'}} sales={ sales } interval={ interval }/>
        </>
    );
}

export default Dashboard;
