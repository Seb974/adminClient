import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/containers')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.max < b.max) ? -1 : 1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/containers?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/containers?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteContainer(id) {
    return api.delete('/api/containers/' + id);
}

function find(id) {
    return api
        .get('/api/containers/' + id)
        .then(response => response.data);
}

function update(id, container) {
    return api.put('/api/containers/' + id, {...container});
}

function create(container) {
    return api.post('/api/containers', {...container});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteContainer,
    find,
    update,
    create
}