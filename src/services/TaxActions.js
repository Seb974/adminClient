import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/taxes')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/taxes?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/taxes?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteTax(id) {
    return api.delete('/api/taxes/' + id);
}

function find(id) {
    return api
        .get('/api/taxes/' + id)
        .then(response => response.data);
}

function update(id, tax) {
    return api.put('/api/taxes/' + id, {...tax});
}

function create(tax) {
    return api.post('/api/taxes', {...tax});
}

function updateFromMercure(taxes, tax) {
    const filteredTaxes = taxes.filter(item => item.id !== tax.id);
    return [...filteredTaxes, tax].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

function deleteFromMercure(taxes, id) {
    return taxes.filter(item => parseInt(item.id) !== parseInt(id));
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteTax,
    find, 
    update, 
    create,
    updateFromMercure,
    deleteFromMercure,
}