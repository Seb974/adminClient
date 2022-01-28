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

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteStore,
    find,
    update,
    create
}