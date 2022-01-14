import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/categories')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/categories?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/categories?name[]=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteCategory(id) {
    return api.delete('/api/categories/' + id);
}

function find(id) {
    return api
        .get('/api/categories/' + id)
        .then(response => response.data);
}

function update(id, category) {
    return api.put('/api/categories/' + id, {...category});
}

function create(category) {
    return api.post('/api/categories', {...category});
}

function updateFromMercure(categories, category) {
    const filteredCategories = categories.filter(item => item.id !== category.id);
    return [...filteredCategories, category].sort((a, b) => (a.name > b.name) ? 1 : -1);

}

function deleteFromMercure(categories, id) {
    return categories.filter(item => parseInt(item.id) !== parseInt(id));
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteCategory,
    find, 
    update, 
    create,
    updateFromMercure,
    deleteFromMercure,
}