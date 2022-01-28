import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/cities')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/cities?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/cities?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteCity(id) {
    return api.delete('/api/cities/' + id);
}

function find(id) {
    return api
        .get('/api/cities/' + id)
        .then(response => response.data);
}

function update(id, city) {
    return api.put('/api/cities/' + id, {...city});
}

function create(city) {
    return api.post('/api/cities', {...city});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteCity,
    find,
    update,
    create
}