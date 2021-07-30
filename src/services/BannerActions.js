import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/banners')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.homepage.name > b.homepage.name) ? 1 : -1));
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
    delete: deleteBanner,
    find,
    update,
    create,
    createImage
}