import api from '../config/api';

function find() {
    return api
        .get('/api/about_uses')
        .then(response => response.data['hydra:member'][0]);
}

function deleteAboutUs(id) {
    return api.delete('/api/about_uses/' + id);
}

function update(id, platform) {
    return api.put('/api/about_uses/' + id, {...platform});
}

function create(platform) {
    return api.post('/api/about_uses', {...platform});
}

function createBannerImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'ABOUT-US-BANNER');
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

function createHeaderImage(image) {
    let formData = new FormData();
    formData.append('file', image);
    formData.append('instance', 'ABOUT-US-HEADER');
    return api.post('/api/pictures', formData, {headers: {'Content-type': 'multipart/form-data'}})
              .then(response => response.data);
}

export default {
    find, 
    delete: deleteAboutUs,
    update,
    create,
    createBannerImage,
    createHeaderImage
}