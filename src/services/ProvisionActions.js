import api from 'src/config/api';
import { getDateFrom, getStringDate } from 'src/helpers/days';
import { isDefined } from 'src/helpers/utils';

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
        .get(`/api/provisions?${ supplierList }&${ sellerList }&${ dateLimits }&order[provisionDate]=asc`)
        .then(response => {
            return response.data['hydra:member'];
        });
}

function findPaginatedProvisionsPerSupplier(dates, suppliers, sellers, page = 1, items = 30) {
    const supplierList = getSuppliersList(suppliers);
    const sellerList = getSellersList(sellers);
    const UTCDates = formatUTC(dates);
    const dateLimits = `provisionDate[after]=${ getStringDate(UTCDates.start) }&provisionDate[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/provisions?${ supplierList }&${ sellerList }&${ dateLimits }&order[provisionDate]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
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

function findSellerInProgress(seller, main, entity) {
    const dateLimit = getDateFrom(new Date(), -60, 0, 4);
    const formattedDate = new Date(dateLimit.toUTCString());
    const entitySelection = main ? `platform=${ entity }` : `store=${ entity }`;
    return api
        .get(`/api/provisions?seller[]=${ seller['@id'] }&${ entitySelection }&status[]=ORDERED&provisionDate[after]=${ getStringDate(formattedDate) }`)
        .then(response => response.data['hydra:member']);
}

function findFromSuppliersForSeller(dates, seller, suppliers, main, entity) {
    const UTCDates = formatUTC(dates);
    const entitySelection = main ? `platform=${ entity }` : `store=${ entity }`;
    const dateLimits = `provisionDate[after]=${ getStringDate(UTCDates.start) }&provisionDate[before]=${ getStringDate(UTCDates.end) }`;
    const suppliersList = suppliers.length > 0 ? '&' + getSuppliersList(suppliers) : '';
    return api
        .get(`/api/provisions?seller=${ seller['@id'] }&${ dateLimits }${ suppliersList }&${ entitySelection }`)
        .then(response => response.data['hydra:member']);
}


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

function getSellersList(sellers) {
    let sellersList = "";
    sellers.map((s, i) => {
        const separator = i < sellers.length - 1 ? "&" : "";
        const value = ('value' in s) ? s.value : s['@id'];
        sellersList += "seller[]=" + value + separator;
    });
    return sellersList;
}

function getSuppliersList(suppliers) {
    let suppliersList = "";
    suppliers.map((s, i) => {
        const separator = i < suppliers.length - 1 ? "&" : "";
        const value = ('value' in s) ? s.value : (isDefined(s['@id']) ? s['@id'] : s);
        suppliersList += "supplier[]=" + value + separator;
    });
    return suppliersList;
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
    findFromSuppliersForSeller,
    findPaginatedProvisionsPerSupplier,
    findSellerInProgress,
    delete: deleteProvision,
    find,
    update,
    patch,
    create
}