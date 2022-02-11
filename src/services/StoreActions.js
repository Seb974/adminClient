import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/stores')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/stores?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/stores?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteStore(id) {
    return api.delete('/api/stores/' + id);
}

function find(id) {
    return api
        .get('/api/stores/' + id)
        .then(response => response.data);
}

function update(id, store) {
    return api.put('/api/stores/' + id, {...store});
}

function create(store) {
    return api.post('/api/stores', {...store});
}

function getCategories(store) {
    return api.get('/api/hiboutik/' + store.id + '/categories')
              .then(response => response.data);
}

function sendCategories(store) {
    return api.post('/api/hiboutik/' + store.id + '/categories');
}

function getProducts(store) {
    return api.get('/api/hiboutik/' + store.id + '/products')
              .then(response => response.data);
}

function sendProducts(store) {
    return api.post('/api/hiboutik/' + store.id + '/products');
}

function sendSelectedProducts(store, selectionArray) {
    return api.post('/api/hiboutik/' + store.id + '/products', selectionArray);
}

function sendSelectedCategories(store, selectionArray) {
    return api.post('/api/hiboutik/' + store.id + '/categories', selectionArray);
}

function getTurnover(store, dates) {
    const UTCDates = formatUTC(dates);
    return api.post('/api/hiboutik/' + store.id + '/turnover', {from: UTCDates.start, to: UTCDates.end})
              .then(response => response.data);
}

function formatUTC(dates) {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteStore,
    find,
    update,
    create,
    getProducts,
    sendProducts,
    sendSelectedProducts,
    getCategories,
    sendCategories,
    sendSelectedCategories,
    getTurnover
}