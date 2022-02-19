import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/suppliers?order[name]=asc')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/suppliers?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/suppliers?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function findSuppliersForSeller(seller) {
    return api
        .get(`/api/suppliers?seller=${ seller.id }&order[name]=asc`)
        .then(response => response.data['hydra:member']);
}

function deleteSupplier(id) {
    return api.delete('/api/suppliers/' + id);
}

function find(id) {
    return api
        .get('/api/suppliers/' + id)
        .then(response => response.data);
}

function update(id, supplier) {
    return api.put('/api/suppliers/' + id, {...supplier});
}

function create(supplier) {
    return api.post('/api/suppliers', {...supplier});
}

function updateFromMercure(suppliers, supplier) {
    const filteredsuppliers = suppliers.filter(item => item.id !== supplier.id);
    return [...filteredsuppliers, supplier].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    findSuppliersForSeller,
    delete: deleteSupplier,
    find, 
    update, 
    create,
    updateFromMercure,
}