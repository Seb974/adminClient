import api from 'src/config/api';

function find() {
    return api
        .get('/api/platforms')
        .then(response => response.data['hydra:member'][0]);
}

function deletePlatform(id) {
    return api.delete('/api/platforms/' + id);
}

function update(id, platform) {
    return api.put('/api/platforms/' + id, {...platform});
}

function create(platform) {
    return api.post('/api/platforms', {...platform});
}

function createImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'Platform');
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

export default {
    find, 
    delete: deletePlatform,
    update,
    create,
    createImage
}