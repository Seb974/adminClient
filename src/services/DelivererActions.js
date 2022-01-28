import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/deliverers')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/deliverers?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/deliverers?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteDeliverer(id) {
    return api.delete('/api/deliverers/' + id);
}

function find(id) {
    return api
        .get('/api/deliverers/' + id)
        .then(response => response.data);
}

function update(id, deliverer) {
    return api.put('/api/deliverers/' + id, {...deliverer});
}

function create(deliverer) {
    return api.post('/api/deliverers', {...deliverer});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteDeliverer,
    find,
    update,
    create
}