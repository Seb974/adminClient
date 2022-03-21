import api from 'src/config/api';
import { isDefined } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/products')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAvailablePaginated(userGroups, page = 1, items = 30) {
    const groups = userGroups.length > 0 ? getGroupsList(userGroups) + '&' : '';
    return api
        .get(`/api/products?available=true&${ groups }order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data);
}

function findAvailableWord(word, userGroups, page = 1, items = 30) {
    const groups = userGroups.length > 0 ? getGroupsList(userGroups) + '&' : '';
    return api
        .get(`/api/products?available=true&${ groups }name[]=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/products?&order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data);
}

function findBestSales(page = 1, items = 30) {
    return api
        .get(`/api/products?saleCount[lt]=0&order[saleCount]=desc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/products?name[]=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function getAllProductsContainingWord(word) {
    return api
        .get(`/api/products?name[]=${ word }&order[name]=asc`)
        .then(response => response.data);
}

function getSellerProductsContainingWord(word, seller) {
    return api
        .get(`/api/products?name[]=${ word }&seller=${ seller['@id'] }&order[name]=asc`)
        .then(response => response.data);
}

function getSupplierProductsContainingWord(word, supplier) {
    return api
        .get(`/api/products?name[]=${ word }&suppliers=${ supplier['@id'] }&order[name]=asc`)
        .then(response => response.data);
}

function getSellerProductsFromSupplierContainingWord(word, seller, supplier) {
    return api
        .get(`/api/products?name[]=${ word }&seller=${ seller['@id'] }&suppliers=${ supplier['@id'] }&order[name]=asc`)
        .then(response => response.data);
}

function findPaginatedFromSeller(seller, page = 1, items = 30) {
    return api
        .get(`/api/products?seller=${ seller['@id'] }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function findFromSupplierAndStore(seller, supplier, enabledIds, page = 1, items = 30) {
    const ids = getIdsList(enabledIds);
    return api
        .get(`/api/products?seller=${ seller['@id'] }&suppliers[]=${ supplier['@id'] }&${ ids }&storeAvailable=true&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data); 
}

function findFromSupplierAndPlatform(seller, supplier, page = 1, items = 30) {
    // &available=true
    return api
        .get(`/api/products?seller=${ seller['@id'] }&suppliers[]=${ supplier['@id'] }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data); 
}

function findProductWithIds(enabledIds) {
    const ids = getIdsList(enabledIds);
    return api
        .get(`/api/products?${ ids }&storeAvailable=true&order[saleCount]=desc`)
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

function createImage(image, owner) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', "Product");
    const rootRequest = isDefined(owner) ? `/api/pictures?owner=${ owner.id }` : `/api/pictures`;
    return api.post(rootRequest, formData, {headers: {'Content-type': 'multipart/form-data'}})
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

function getIdsList(ids) {
    let idsList = "";
    ids.map((id, i) => {
        const separator = i < ids.length - 1 ? "&" : "";
        idsList += "id[]=" + id + separator;
    });
    return idsList;
}

function getGroupsList(groups) {
    let groupsList = "";
    groups.map((group, i) => {
        const separator = i < groups.length - 1 ? "&" : "";
        groupsList += "group[]=" + group + separator;
    });
    return groupsList;
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    findAvailablePaginated,
    findPaginatedFromSeller,
    findFromSupplierAndStore,
    findFromSupplierAndPlatform,
    delete: deleteProduct,
    findProductWithIds,
    find,
    update,
    create,
    findBestSales,
    createImage,
    createVariation,
    updateVariation,
    createComponent,
    updateComponent,
    updateFromMercure,
    deleteFromMercure,
    getAllProductsContainingWord,
    getSellerProductsContainingWord,
    getSupplierProductsContainingWord,
    getSellerProductsFromSupplierContainingWord
}