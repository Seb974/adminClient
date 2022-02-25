import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/traceabilities?order[endDate]=asc')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/traceabilities?order[title]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/traceabilities?number=${ word }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function findNumberForPlatform(number, seller, page = 1, items = 30) {
    return api
        .get(`/api/traceabilities?number=${ number }&seller=${ seller.id }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteTraceability(id) {
    return api.delete('/api/traceabilities/' + id);
}

function find(id) {
    return api
        .get('/api/traceabilities/' + id)
        .then(response => response.data);
}

function update(id, traceability) {
    return api.put('/api/traceabilities/' + id, {...traceability});
}

function create(traceability) {
    return api.post('/api/traceabilities', {...traceability});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteTraceability,
    find,
    update,
    create,
    findNumberForPlatform
}