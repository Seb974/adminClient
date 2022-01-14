import api from '../config/api';

function findAll() {
    return api
        .get('/api/agents')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/agents?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/agents?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function find(id) {
    return api
        .get('/api/agents/' + id)
        .then(response => response.data);
}

function deleteAgent(id) {
    return api.delete('/api/agents/' + id);
}

function update(id, agent) {
    return api.put('/api/agents/' + id, agent);
}

function create(agent) {
    return api.post('/api/agents', agent);
}

function createImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'AGENT');
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

export default {
    findAll,
    findAllPaginated,
    findWord,
    find,
    delete: deleteAgent,
    update,
    create,
    createImage
}