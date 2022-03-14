import api from 'src/config/api';
import { formatUTC, getStringDate } from 'src/helpers/days';

function findAll() {
    return api
        .get('/api/losts?order[lostDate]=desc')
        .then(response => response.data['hydra:member']);
}

function findAllPaginated(page = 1, items = 30) {
    return api
        .get(`/api/losts?order[title]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findBetweenPaginated(dates, page = 1, items = 30) {
    const UTCDates = formatUTC(dates);
    const dateLimits = `lostDate[after]=${ getStringDate(UTCDates.start) }&lostDate[before]=${ getStringDate(UTCDates.end) }`;
    return api
        .get(`/api/losts?${ dateLimits }&order[title]=asc&pagination=true&itemsPerPage=${ items }&page=${ page }`)
        .then(response => response.data)
        .catch(error => []);
}

function findNumberForPlatform(number, seller, page = 1, items = 30) {
    return api
        .get(`/api/losts?number=${ number }&seller=${ seller.id }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function findNumberForStore(number, store, page = 1, items = 30) {
    return api
        .get(`/api/losts?number=${ number }&store=${ store.id }&order[number]=asc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function findWord(word, page = 1, items = 30) {
    return api
        .get(`/api/losts?number=${ word }&order[lostDate]=desc&pagination=true&page=${ page }&itemsPerPage=${ items }`)
        .then(response => response.data)
        .catch(error => []);
}

function deleteLost(id) {
    return api.delete('/api/losts/' + id);
}

function find(id) {
    return api
        .get('/api/losts/' + id)
        .then(response => response.data);
}

function update(id, lost) {
    return api.put('/api/losts/' + id, {...lost});
}

function create(lost) {
    return api.post('/api/losts', {...lost});
}

export default {
    findAll,
    findAllPaginated,
    findBetweenPaginated,
    findNumberForPlatform,
    findNumberForStore,
    findWord,
    delete: deleteLost,
    find,
    update,
    create
}