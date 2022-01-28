import api from 'src/config/api';
import { isDefined } from 'src/helpers/utils';

function register(user) {
    const { name, email, password } = user;
    return api.post("/api/users", { name, email, password });
}

function findAll() {
    return api
        .get(`/api/users?pagination=false`)
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/users?order[name]=asc&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/users?name=${ word }&order[name]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data);
}

function deleteUser(id) {
    return api
        .delete('/api/users/' + id);
}

function find(id) {
    return api.get('/api/users/' + id)
                .then(response => response.data);
}

function update(id, user) {
    return api.put('/api/users/' + id, user);
}

function create(user) {
    return api.post('/api/users', user);
}

function findUser(search) {
    return api
            .get('/api/users?name=' + search)
            .then(response => response.data['hydra:member']);
}

function findDeliverers() {
    return api
            .get('/api/users?roles=DELIVERER')
            .then(response => response.data['hydra:member']);
}

function getAccountingId(order) {
    return isDefined(order.user) && isDefined(order.user.accountingId) ? new Promise((resolve, reject) => resolve(order.user.accountingId)) :
         api.post('/api/accounting/user/' + order.id)
            .then(response => response.data)
}

export default {
    register,
    findAll,
    findAllPaginated,
    findWord,
    delete: deleteUser,
    find, 
    update, 
    create,
    findUser,
    findDeliverers,
    getAccountingId
}