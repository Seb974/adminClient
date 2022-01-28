import api from '../config/api';

function findAll() {
    return api
        .get('/api/messages')
        .then(response => response.data['hydra:member']);
}

function find(id) {
    return api
        .get('/api/messages/' + id)
        .then(response => response.data);
}

function deleteMessage(id) {
    return api.delete('/api/messages/' + id);
}

function update(id, message) {
    return api.put('/api/messages/' + id, message);
}

function create(message) {
    return api.post('/api/messages', message);
}

export default {
    findAll,
    find,
    delete: deleteMessage,
    update,
    create
}