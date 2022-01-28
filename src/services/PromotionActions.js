import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/promotions')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/promotions?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/promotions?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deletePromotion(id) {
    return api.delete('/api/promotions/' + id);
}

function find(id) {
    return api
        .get('/api/promotions/' + id)
        .then(response => response.data);
}

function update(id, promotion) {
    return api.put('/api/promotions/' + id, {...promotion});
}

function create(promotion) {
    return api.post('/api/promotions', {...promotion});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deletePromotion,
    find,
    update,
    create
}