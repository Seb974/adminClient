import api from '../config/api';

function findAll() {
    return api
        .get('/api/agents')
        .then(response => response.data['hydra:member']);
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
    find,
    delete: deleteAgent,
    update,
    create,
    createImage
}