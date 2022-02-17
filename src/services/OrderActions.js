import axios from 'axios';
import api from 'src/config/api';
import Roles from 'src/config/Roles';
import { setOrderStatus } from 'src/helpers/checkout';
import { getStringDate } from 'src/helpers/days';
import { getExportStatuses } from 'src/helpers/orders';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/order_entities')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findStatusBetween(dates, statuses, user) {
    const status = getStatusList(statuses);
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }`)
        .then(response => {
            const data = Roles.hasAdminPrivileges(user) || Roles.isSupervisor(user) || Roles.isPicker(user) ? 
                response.data['hydra:member'] :
                response.data['hydra:member'].filter(order => {
                    return order.items.find(item => {
                        return item.product.seller.users.find(u => u.id === user.id) !== undefined}) !== undefined;
                });
            return data.sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
}

function findInWarehouseStatusBetween(dates, statuses, user, main, Id) {
    const status = getStatusList(statuses);
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`;
    const sellerCondition = !main ? `store=${ Id }` : `platform=${ Id }`;
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }&${ sellerCondition }`)
        .then(response => {
            const data = Roles.hasAdminPrivileges(user) || Roles.isSupervisor(user) ? 
                response.data['hydra:member'] :
                response.data['hydra:member'].filter(order => {
                    return order.items.find(item => {
                        return item.product.seller.users.find(u => u.id === user.id) !== undefined}) !== undefined;
                });
            return data.sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
}

function findValidatedOrdersBetween(dates, statuses, seller) {
    const status = getStatusList(statuses);
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/order_entities?seller=${ seller.id }&${ dateLimits }&${ status }&order[deliveryDate]=asc`)
        .then(response => response.data['hydra:member'].map(o => ({...o, items: o.items.filter(i => i.product.seller['@id'] == seller['@id'])})));
}

function findPreparations(dates, user) {
    const status = `status[]=WAITING&status[]=PRE-PREPARED`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }`)
        .then(response => {
            const data = Roles.hasAdminPrivileges(user) || Roles.isSupervisor(user) ? 
                response.data['hydra:member'] :
                response.data['hydra:member'].filter(order => {
                    return order.items.find(item => {
                        return !item.isPrepared && item.product.seller.users.find(u => u.id === user.id) !== undefined}) !== undefined;
                });
            return data.sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
}

function findPickersPreparations(dates) {
    const status = `status[]=WAITING&status[]=PRE-PREPARED`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }&order[deliveryDate]=asc`)
        .then(response => response.data['hydra:member']);
}

function findPaginatedPreparations(dates, page = 1, items = 30) {
    const status = `status[]=WAITING&status[]=PRE-PREPARED`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }&order[deliveryDate]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function findRecoveries(dates, seller, page, items) {
    const UTCDates = formatUTC(dates);
    const status = `status[]=WAITING&status[]=PRE-PREPARED`;
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?recovery=1&seller=${ seller.id }&${ dateLimits }&${ status }&order[deliveryDate]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function findDeliveries(dates, page, items) {
    const status = `status[]=WAITING&status[]=PRE-PREPARED&status[]=PREPARED`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?truck=1&${ dateLimits }&${ status }&order[deliveryDate]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
};

function findCheckouts(dates, relaypoint) {
    const status = `status[]=WAITING&status[]=PRE-PREPARED&status[]=PREPARED&status[]=ON_TRUCK&status[]=COLLECTABLE`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }`)
        .then(response => {
            const data = response.data['hydra:member'].filter(order => order.metas.id === relaypoint.metas.id);
            return data.sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1);
        });
};

function findPaginatedCheckouts(dates, relaypoint, page = 1, items = 30) {
    const selectedStatus = ['WAITING', 'PRE_PREPARED', 'PREPARED', 'ON_TRUCK', 'COLLECTABLE'];
    const status = getStatusList(selectedStatus);
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?relayPosition=${ relaypoint.metas.id }&${ status }&${ dateLimits }&order[deliveryDate]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
};

function findPaginatedExports(dates, page = 1, items = 30) {
    const selectedStatus = getExportStatuses();
    const status = getStatusList(selectedStatus);
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?truck=0&${ status }&${ dateLimits }&order[deliveryDate]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
};

function getOptimizedTrip(positions, distributionsKeys)
{
    let trip = ""; 
    const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const options = isDefinedAndNotVoid(distributionsKeys) ? 
        `source=first&roundtrip=true&distributions=${ distributionsKeys }` :
        `source=first&roundtrip=true&destination=last`;      // &destination=last&geometries=geojson
    positions.map((position, key) => {
        trip += (key === 0 ? "/" : "") + position.coordinates[1] + "," + position.coordinates[0] + (key === positions.length - 1 ? "" : ";");
    });
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving${ trip }?${ options }&access_token=${ accessToken }`;
    return axios.get(url, {withCredentials: false})
                .then(response => response.data);
}

function deleteOrder(order, isAdmin) {
    if (order.isRemains || isAdmin)
        return api.delete('/api/order_entities/' + order.id)
                  .then(response => {
                        const metas = order.metas;
                        if (!isDefined(metas.user) && !isDefined(metas.isRelaypoint))
                            return api.delete('/api/metas/' + metas.id);
                  });
    else
        return api.put('/api/order_entities/' + order.id, setOrderStatus(order, 'ABORTED'));
}

function find(id) {
    return api
        .get('/api/order_entities/' + id)
        .then(response => response.data);
}

function update(id, order) {
    return api.put('/api/order_entities/' + id, order);
}

function patch(id, order) {
    return api.patch('/api/order_entities/' + id, order);
}

function create(order) {
    return api.post('/api/order_entities', order);
}

function getZPLLabel(id) {
    return api.post('/api/skybills/' + id);
}

function getPrintableLabel(zpl) {
    const ticketHeight = 4.02;  //4
    const ticketWidth = 5.88;   //6
    return axios.post(
        `http://api.labelary.com/v1/printers/8dpmm/labels/${ ticketHeight }x${ ticketWidth }/`,
        zpl,
        {
            withCredentials: false,
            headers: {
                'Accept': 'application/pdf',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob'
        }
    );
}

function formatUTC(dates) {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

function getStatusList(status) {
    let statusList = "";
    status.map((s, i) => {
        const separator = i < status.length - 1 ? "&" : "";
        statusList += "status[]=" + (isDefined(s.value) ? s.value : s) + separator;
    });
    return statusList;
}

function sendToAxonaut(orders) {
    return api.post('/api/accounting/invoices', orders);
}

function getInvoices(user, dates) {
    const UTCDates = formatUTC(dates);
    return api.post('/api/accounting/' + user.id + '/invoices', {from: UTCDates.start, to: UTCDates.end})
              .then(response => response.data);
}

export default {
    findAll,
    findDeliveries,
    findPreparations,
    findRecoveries,
    findPickersPreparations,
    findPaginatedPreparations,
    findCheckouts,
    findPaginatedCheckouts,
    findPaginatedExports,
    findStatusBetween,
    findInWarehouseStatusBetween,
    findValidatedOrdersBetween,
    getOptimizedTrip,
    delete: deleteOrder,
    find,
    update,
    create,
    patch,
    getZPLLabel,
    getPrintableLabel,
    sendToAxonaut,
    getInvoices
}