import api from 'src/config/api';

function findAll() {
    return api
        .get('/api/heroes')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.homepage.name > b.homepage.name) ? 1 : -1));
}

function deleteHero(id) {
    return api.delete('/api/heroes/' + id);
}

function find(id) {
    return api
        .get('/api/heroes/' + id)
        .then(response => response.data);
}

function update(id, hero) {
    return api.put('/api/heroes/' + id, {...hero});
}

function create(hero) {
    return api.post('/api/heroes', {...hero});
}

function createImage(image, homepageName) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'HERO-' + homepageName.replaceAll(' ', '_').toUpperCase());
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

export default { 
    findAll,
    delete: deleteHero,
    find,
    update,
    create,
    createImage
}