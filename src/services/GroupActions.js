import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/groups')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.isFixed > b.isFixed) ? -1 : 1));
}

function findGroupsWithStoreAccess() {
    return api
        .get('/api/groups?hasStoreAccess=true&order[label]=asc')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/groups?order[label]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/groups?label=${ word }&order[label]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteGroup(id) {
    return api.delete('/api/groups/' + id);
}

function find(id) {
    return api
        .get('/api/groups/' + id)
        .then(response => response.data);
}

function update(id, group) {
    return api.put('/api/groups/' + id, {...group});
}

function create(group) {
    return api.post('/api/groups', {...group});
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    findGroupsWithStoreAccess,
    delete: deleteGroup,
    find,
    update,
    create
}