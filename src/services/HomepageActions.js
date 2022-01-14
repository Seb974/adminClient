import api from 'src/config/api';
import { isDefined } from 'src/helpers/utils';

function findAll() {
    return api
        .get('/api/homepages')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/homepages?order[name]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/homepages?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
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

function createImage(image, homepageName) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'COUNTDOWN-' + homepageName.replaceAll(' ', '_').toUpperCase());
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
            .then(response => response.data);
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteHomepage,
    find,
    update,
    create,
    createImage
}