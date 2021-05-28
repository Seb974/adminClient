import axios from 'axios';
import api from 'src/config/api';
import Roles from 'src/config/Roles';
import { getStringDate } from 'src/helpers/days';

function findAll() {
    return api
        .get('/api/order_entities')
        .then(response => response.data['hydra:member'].sort((a, b) => (a.name > b.name) ? 1 : -1));
}

function findPreparations(dates, user) {
    const status = `status=WAITING`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }`)
        .then(response => {
            const isAdmin = Roles.hasAdminPrivileges(user);
            const data = isAdmin ? 
                response.data['hydra:member'] :
                response.data['hydra:member'].filter(order => {
                    return order.items.find(item => {
                        return item.product.seller.users.find(u => u.id === user.id) !== undefined}) !==undefined;
                });
            return data.sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
}

function findDeliveries(dates, user) {
    const status = `status[]=WAITING&status[]=PREPARED`;
    const UTCDates = formatUTC(dates);
    const dateLimits = `deliveryDate[after]=${ getStringDate(UTCDates.start) }&deliveryDate[before]=${ getStringDate(UTCDates.end) }`
    return api
        .get(`/api/order_entities?${ status }&${ dateLimits }`)
        .then(response => {
            const isAdmin = Roles.hasAdminPrivileges(user);
            const data = isAdmin ? 
                response.data['hydra:member'] :
                response.data['hydra:member'].filter(order => {
                    return order.items.find(item => {
                        return item.product.seller.users.find(u => u.id === user.id) !== undefined}) !==undefined;
                });
            return data.sort((a, b) => (new Date(a.deliveryDate) < new Date(b.deliveryDate)) ? -1 : 1)
        });
};

function getOptimizedTrip(positions, distributionsKeys)
{
    let trip = ""; 
    const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const options = distributionsKeys.length > 0 ? 
        `source=first&roundtrip=true&distributions=${ distributionsKeys }` :
        `source=first&roundtrip=true`;      // &destination=last&geometries=geojson
    positions.map((position, key) => {
        trip += "" + position.coordinates[1] + "," + position.coordinates[0] + (key === positions.length - 1 ? "" : ";");
    });
    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${ trip }?${ options }&access_token=${ accessToken }`;
    return axios.get(url, {withCredentials: false})
                .then(response => response.data);
}

function deleteOrder(id) {
    return api.delete('/api/order_entities/' + id);
}

function find(id) {
    return api
        .get('/api/order_entities/' + id)
        .then(response => response.data);
}

function update(id, order) {
    return api.put('/api/order_entities/' + id, {...order});
}

function create(order) {
    return api.post('/api/order_entities', order);
}

function formatUTC(dates) {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

export default {
    findAll,
    findDeliveries,
    findPreparations,
    getOptimizedTrip,
    delete: deleteOrder,
    find,
    update,
    create,
}