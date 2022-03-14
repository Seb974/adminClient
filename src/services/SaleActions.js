import api from 'src/config/api';
import { setOrderStatus } from 'src/helpers/checkout';
import { getStringDate } from 'src/helpers/days';
import { isDefined } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/sales')
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.date) < new Date(b.date)) ? 1 : -1));
}

function findSalesBetween(dates) {
    const UTCDates = formatUTC(dates);
    return api
        .get(`/api/sales?date[after]=${ getStringDate(UTCDates.start) }&date[before]=${ getStringDate(UTCDates.end) }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.date) < new Date(b.date)) ? -1 : 1));
}

function findStoreSalesBetween(dates, store) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `date[after]=${ getStringDate(UTCDates.start) }&date[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/sales?store=${ store }&${ dateLimits }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.date) < new Date(b.date)) ? -1 : 1));
}

function findValidatedSalesBetween(dates, store) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `date[after]=${ getStringDate(UTCDates.start) }&date[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/sales?store=${ store }&${ dateLimits }&order[date]=asc`)
        .then(response => response.data['hydra:member']);
}

function deleteOrder(order, isAdmin) {
    if (order.isRemains || isAdmin)
        return api.delete('/api/sales/' + order.id)
                  .then(response => {
                        const metas = order.metas;
                        if (!isDefined(metas.user) && !isDefined(metas.isRelaypoint))
                            return api.delete('/api/metas/' + metas.id);
                  });
    else
        return api.put('/api/sales/' + order.id, setOrderStatus(order, 'ABORTED'));
}

function find(id) {
    return api
        .get('/api/sales/' + id)
        .then(response => response.data);
}

function update(id, order) {
    return api.put('/api/sales/' + id, order);
}

function patch(id, order) {
    return api.patch('/api/sales/' + id, order);
}

function create(order) {
    return api.post('/api/sales', order);
}

function formatUTC(dates) {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

export default {
    findAll,
    findSalesBetween,
    findStoreSalesBetween,
    findValidatedSalesBetween,
    delete: deleteOrder,
    find,
    update,
    create,
    patch
}