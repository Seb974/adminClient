import api from 'src/config/api';
import { getStringDate } from 'src/helpers/days';
import { isDefined } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/goods')
        .then(response => response.data['hydra:member']);
}

function findProductsBetween(dates, products) {
    const UTCDates = formatUTC(dates);
    const productList = getProductList(products);
    const dateLimits = `after=${ getStringDate(UTCDates.start) }&before=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/goods?active=1&${ productList }&${ dateLimits }`)
        .then(response => response.data);
}

function findSellerProductsBetween(dates, products, seller) {
    const UTCDates = formatUTC(dates);
    const productList = getProductList(products);
    const dateLimits = `after=${ getStringDate(UTCDates.start) }&before=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/goods?active=1&${ productList }&${ dateLimits }&seller[]=${ seller.id }`)
        .then(response => response.data);
}

function findStoreProductsBetween(dates, products, store) {
    const UTCDates = formatUTC(dates);
    const productList = getProductList(products);
    const dateLimits = `after=${ getStringDate(UTCDates.start) }&before=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/goods?active=1&${ productList }&${ dateLimits }&store[]=${ store.id }`)
        .then(response => response.data);
}

function find(id) {
    return api
        .get('/api/goods/' + id)
        .then(response => response.data);
}

function update(id, item) {
    return api.put('/api/goods/' + id, item);
}

function patch(id, item) {
    return api.patch('/api/goods/' + id, item);
}

function create(item) {
    return api.post('/api/goods', item);
}

function formatUTC(dates) {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

function getProductList(products) {
    let productList = "";
    products.map((s, i) => {
        const separator = i < products.length - 1 ? "&" : "";
        productList += "product[]=" + (isDefined(s['@id']) ? s['@id'] : s) + separator;
    });
    return productList;
}

export default {
    findAll,
    findProductsBetween,
    findStoreProductsBetween,
    findSellerProductsBetween,
    find,
    update,
    create,
    patch
}