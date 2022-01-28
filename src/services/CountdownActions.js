import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/countdowns')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.homepage.name > b.homepage.name) ? 1 : -1));
}

function deleteCountdown(id) {
    return api.delete('/api/countdowns/' + id);
}

function find(id) {
    return api
        .get('/api/countdowns/' + id)
        .then(response => response.data);
}

function update(id, countdown) {
    return api.put('/api/countdowns/' + id, {...countdown});
}

function create(countdown) {
    return api.post('/api/countdowns', {...countdown});
}

export default { 
    findAll,
    delete: deleteCountdown,
    find,
    update,
    create
}