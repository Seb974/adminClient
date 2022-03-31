import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/packages')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/packages?order[id]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findPackagesNeedingReturn() {
    return api.get('/api/packages?needsReturn=true')
              .then(response => response.data['hydra:member']);
}

function deletePackage(id) {
    return api.delete('/api/packages/' + id);
}

function find(id) {
    return api
        .get('/api/packages/' + id)
        .then(response => response.data);
}

function update(id, _package) {
    return api.put('/api/packages/' + id, {..._package});
}

function updateReturns(id, _package) {
    return api.put('/api/packages/' + id, {..._package});
}

function create(_package) {
    return api.post('/api/packages', {..._package});
}

export default { 
    findAll,
    findAllPaginated,
    findPackagesNeedingReturn,
    delete: deletePackage,
    updateReturns,
    find, 
    update, 
    create,
}