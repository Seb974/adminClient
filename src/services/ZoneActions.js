import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/zones')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/zones?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/zones?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteZone(id) {
    return api.delete('/api/zones/' + id);
}

function find(id) {
    return api
        .get('/api/zones/' + id)
        .then(response => response.data);
}

function update(id, zone) {
    return api.put('/api/zones/' + id, {...zone});
}

function create(zone) {
    return api.post('/api/zones', {...zone});
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteZone,
    find,
    update,
    create
}