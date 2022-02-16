import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/sellers?order[name]=asc')
        .then(response => response.data['hydra:member']);
}

function findSellersNeedingRecovery() {
    return api
        .get('/api/sellers?needsRecovery=true&order[name]=asc')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/sellers?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/sellers?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteSeller(id) {
    return api.delete('/api/sellers/' + id);
}

function find(id) {
    return api
        .get('/api/sellers/' + id)
        .then(response => response.data);
}

function update(id, seller) {
    return api.put('/api/sellers/' + id, {...seller});
}

function create(seller) {
    return api.post('/api/sellers', {...seller});
}

function createImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', "SELLER-LOGO");
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

export default {
    findAll,
    findAllPaginated,
    findSellersNeedingRecovery,
    findWord,
    delete: deleteSeller,
    find,
    update,
    create,
    createImage
}