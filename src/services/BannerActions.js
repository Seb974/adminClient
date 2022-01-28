import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/banners')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.homepage.name > b.homepage.name) ? 1 : -1));
}

function findAllPaginated(homepage, page = 1, items = 30) {
    return api
        .get(`/api/banners?homepage=${ homepage }&order[title]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/banners?title=${ word }&order[title]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteBanner(id) {
    return api.delete('/api/banners/' + id);
}

function find(id) {
    return api
        .get('/api/banners/' + id)
        .then(response => response.data);
}

function update(id, banner) {
    return api.put('/api/banners/' + id, {...banner});
}

function create(banner) {
    return api.post('/api/banners', {...banner});
}

function createImage(image, homepageName, bannerNumber, main) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'BANNER-' + homepageName.replaceAll(' ', '_').toUpperCase() + '-' + bannerNumber + (main ? '-MAIN' : ''));
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

export default { 
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteBanner,
    find,
    update,
    create,
    createImage
}