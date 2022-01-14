import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/supervisors')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/supervisors?pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteSupervisor(id) {
    return api.delete('/api/supervisors/' + id);
}

function find(id) {
    return api
        .get('/api/supervisors/' + id)
        .then(response => response.data);
}

function update(id, supervisor) {
    return api.put('/api/supervisors/' + id, {...supervisor});
}

function create(supervisor) {
    return api.post('/api/supervisors', {...supervisor});
}

function getSupervisor(user) {
    return findAll()
            .then(data => data.find(s => s.supervisor.id === user.id));
}

export default { 
    findAll,
    findAllPaginated,
    delete: deleteSupervisor,
    find, 
    update, 
    create,
    getSupervisor
}