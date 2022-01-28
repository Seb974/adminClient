import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/price_groups')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/price_groups?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/price_groups?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deletePriceGroup(id) {
    return api.delete('/api/price_groups/' + id);
}

function find(id) {
    return api
        .get('/api/price_groups/' + id)
        .then(response => response.data);
}

function update(id, priceGroup) {
    return api.put('/api/price_groups/' + id, {...priceGroup});
}

function create(priceGroup) {
    return api.post('/api/price_groups', {...priceGroup});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deletePriceGroup,
    find,
    update,
    create
}