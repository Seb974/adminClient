import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/departments')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/departments?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/departments?name[]=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteDepartment(id) {
    return api.delete('/api/departments/' + id);
}

function find(id) {
    return api
        .get('/api/departments/' + id)
        .then(response => response.data);
}

function update(id, department) {
    return api.put('/api/departments/' + id, {...department});
}

function create(department) {
    return api.post('/api/departments', {...department});
}

function updateFromMercure(departments, department) {
    const filteredDepartments = departments.filter(item => item.id !== department.id);
    return [...filteredDepartments, department].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

function deleteFromMercure(departments, id) {
    return departments.filter(item => parseInt(item.id) !== parseInt(id));
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteDepartment,
    find, 
    update, 
    create,
    updateFromMercure,
    deleteFromMercure,
}