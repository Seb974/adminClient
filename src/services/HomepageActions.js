import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/homepages')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function deleteHomepage(id) {
    return api.delete('/api/homepages/' + id);
}

function find(id) {
    return api
        .get('/api/homepages/' + id)
        .then(response => response.data);
}

function update(id, homepage) {
    return api.put('/api/homepages/' + id, {...homepage});
}

function create(homepage) {
    return api.post('/api/homepages', {...homepage});
}

export default { 
    findAll,
    delete: deleteHomepage,
    find,
    update,
    create
}