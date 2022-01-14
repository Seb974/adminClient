import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/relaypoints')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/relaypoints?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/relaypoints?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteRelaypoint(id) {
    return api.delete('/api/relaypoints/' + id);
}

function find(id) {
    return api
        .get('/api/relaypoints/' + id)
        .then(response => response.data);
}

function update(id, relaypoint) {
    return api.put('/api/relaypoints/' + id, {...relaypoint});
}

function create(relaypoint) {
    return api.post('/api/relaypoints', {...relaypoint});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteRelaypoint,
    find,
    update,
    create
}