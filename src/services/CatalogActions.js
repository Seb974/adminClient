import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/catalogs')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? -1 : 1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/catalogs?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/catalogs?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteCatalog(id) {
    return api.delete('/api/catalogs/' + id);
}

function find(id) {
    return api
        .get('/api/catalogs/' + id)
        .then(response => response.data);
}

function update(id, catalog) {
    return api.put('/api/catalogs/' + id, {...catalog});
}

function create(catalog) {
    return api.post('/api/catalogs', {...catalog});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteCatalog,
    find,
    update,
    create
}