import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/products')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/products?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/products?name[]=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function deleteProduct(id) {
    return api
        .delete('/api/products/' + id);
}

function find(id) {
    return api.get('/api/products/' + id)
                .then(response => response.data);
}

function update(id, product) {
    return api.put('/api/products/' + id, product);
}

function create(product) {
    return api.post('/api/products', product);
}

function updateFromMercure(products, product) {
    const filteredProducts = products.filter(item => item.id !== product.id);
    return [...filteredProducts, product].sort((a, b) => (a.name > b.name) ? 1 : -1);
}

function deleteFromMercure(products, id) {
    return products.filter(item => parseInt(item.id) !== parseInt(id));
}

function createImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', "Product");
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data['@id']);
}

function createVariation(variation) {
    return api.post('/api/variations', variation)
              .then(response => response.data['@id']);
}

function updateVariation(id, variation) {
    return api.put('/api/variations/' + id, variation)
              .then(response => response.data['@id']);
}

function createComponent(component) {
    return api.post('/api/components', component)
              .then(response => response.data['@id']);
}

function updateComponent(id, component) {
    return api.put('/api/components/' + id, component)
              .then(response => response.data['@id']);
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteProduct,
    find,
    update,
    create,
    createImage,
    createVariation,
    updateVariation,
    createComponent,
    updateComponent,
    updateFromMercure,
    deleteFromMercure,
}