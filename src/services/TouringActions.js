import api from 'src/config/api';
import Roles from 'src/config/Roles';
import { getStringDate } from 'src/helpers/days';
import { formatUTC, isDefined } from 'src/helpers/utils';
import OrderActions from './OrderActions';

function findAll() {
    return api
        .get('/api/tourings')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.start > b.start) ? 1 : -1));
}

function findDelivererBetween(dates, deliverer) {
    const delivererId = `deliverer=${ deliverer['@id'] }`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `end[after]=${ getStringDate(UTCDates.start) }&end[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/tourings?${ delivererId }&${ dateLimits }`)
        .then(response => {
            return response.data['hydra:member'].sort((a, b) => (new Date(a.end) < new Date(b.end)) ? -1 : 1);
        });
}

function deleteTouring(id) {
    return api.delete('/api/tourings/' + id);
}

function find(id) {
    return api
        .get('/api/tourings/' + id)
        .then(response => response.data);
}

function update(id, touring) {
    return api.put('/api/tourings/' + id, touring);
}

function create(touring) {
    return api.post('/api/tourings', touring);
}

function getTourings(dates, user) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `start[after]=${ getStringDate(UTCDates.start) }&start[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/tourings?${ dateLimits }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1));
};

function getOpenedTourings(dates, user) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `start[after]=${ getStringDate(UTCDates.start) }&start[before]=${ getStringDate(UTCDates.end) }`
    const open = `isOpen=true`;
    return api
        .get(`/api/tourings?${ open }&${ dateLimits }`)
        .then(response => response.data['hydra:member'].sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1));
};

function getProcessingTourings() {
    const parameters = `isOpen=true&exists[position]=true`;
    return api
        .get(`/api/tourings?${ parameters }`)
        .then(response => response.data['hydra:member']);
};

function closeTouring(touring) {
    return api.put('/api/tourings/' + touring.id, {
        ...touring,
        end: new Date(),
        isOpen: false,
        orderEntities: 
        touring.orderEntities.map(order => ({
            id: order.id, 
            deliveredQty: order.preparedQty,
            status: isDefined(order.metas.isRelaypoint) && order.metas.isRelaypoint ? 'COLLECTABLE' : 'DELIVERED'
        })),
        deliverer: isDefined(touring.deliverer) ? typeof touring.deliverer === 'string' ? touring.deliverer : touring.deliverer['@id'] : null
    });
}

function updateTruckPosition(touring, position) {
    return api.put('/api/tourings/' + touring.id, {
        ...touring,
        position,
        orderEntities: touring.orderEntities.map(order => order['@id']),
        deliverer: touring.deliverer['@id']
    });
}

function patch(id, touring) {
    return api.patch('/api/tourings/' + id, touring);
}

// function formatUTC(dates) {
//     return {
//         start: new Date(dates.start.toUTCString()), 
//         end: new Date(dates.end.toUTCString())
//     };
// }

// function updateFromMercure(data) {
//     const filteredProducts = products.filter(item => item.id !== product.id);
//     return [...filteredProducts, product].sort((a, b) => (a.name > b.name) ? 1 : -1);
// }

export default {
    findAll,
    findDelivererBetween,
    delete: deleteTouring,
    find,
    patch,
    update,
    create,
    getTourings,
    getOpenedTourings,
    getProcessingTourings,
    closeTouring,
    updateTruckPosition,
    // updateFromMercure
}