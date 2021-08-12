import axios from 'axios';
import api from 'src/config/api';
import Roles from 'src/config/Roles';
import { getStringDate } from 'src/helpers/days';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/provisions')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.provisionDate > b.provisionDate) ? 1 : -1));
}

function findSuppliersBetween(dates, suppliers, sellers, user) {
    const supplierList = getSuppliersList(suppliers);
    const sellerList = getSellersList(sellers);
    const UTCDates = formatUTC(dates);
    const dateLimits = `provisionDate[after]=${ getStringDate(UTCDates.start) }&provisionDate[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/provisions?${ supplierList }&${ sellerList }&${ dateLimits }`)
        .then(response => {
            return response.data['hydra:member'].sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
}

function findBetween(dates, sellers) {
    const sellerList = getSellersList(sellers);
    const UTCDates = formatUTC(dates);
    const dateLimits = `provisionDate[after]=${ getStringDate(UTCDates.start) }&provisionDate[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/provisions?${ sellerList }&${ dateLimits }`)
        .then(response => {
            return response.data['hydra:member'].sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
};


function deleteProvision(id) {
    return api.delete('/api/provisions/' + id);
}

function find(id) {
    return api
        .get('/api/provisions/' + id)
        .then(response => response.data);
}

function update(id, provision) {
    return api.put('/api/provisions/' + id, {...provision});
}

function patch(id, provision) {
    return api.patch('/api/provisions/' + id, provision);
}

function create(provision) {
    return api.post('/api/provisions', {...provision});
}

function getSuppliersList(suppliers) {
    let suppliersList = "";
    suppliers.map((s, i) => {
        const separator = i < suppliers.length - 1 ? "&" : "";
        suppliersList += "supplier[]=" + s.value + separator;
    });
    return suppliersList;
}

function getSellersList(sellers) {
    let sellersList = "";
    sellers.map((s, i) => {
        const separator = i < sellers.length - 1 ? "&" : "";
        const value = ('value' in s) ? s.value : s['@id'];
        sellersList += "seller[]=" + value + separator;
    });
    return sellersList;
}

function formatUTC(dates) {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

export default { 
    findAll,
    findBetween,
    findSuppliersBetween,
    delete: deleteProvision,
    find,
    update,
    patch,
    create
}