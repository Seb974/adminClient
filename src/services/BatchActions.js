import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/batches?order[endDate]=asc')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/batches?order[title]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/batches?number=${ word }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function findNumberForPlatform(number, seller, page = 1, items = 30) {
    return api
        .get(`/api/batches?number=${ number }&seller=${ seller.id }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function findNumberForStore(number, store, page = 1, items = 30) {
    return api
        .get(`/api/batches?number=${ number }&store=${ store.id }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteBatch(id) {
    return api.delete('/api/batches/' + id);
}

function find(id) {
    return api
        .get('/api/batches/' + id)
        .then(response => response.data);
}

function update(id, batch) {
    return api.put('/api/batches/' + id, {...batch});
}

function create(batch) {
    return api.post('/api/batches', {...batch});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteBatch,
    find,
    update,
    create,
    findNumberForPlatform,
    findNumberForStore
}