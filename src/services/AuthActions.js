import axios from 'axios';
import jwtDecode from 'jwt-decode';
import api from 'src/config/api';
import { isDefined } from 'src/helpers/utils';
import Roles from '../config/Roles';

function authenticate(credentials) {
    return api.post('/api/login_check', credentials)
              .then(response => response.data.token)
              .then(token => window.localStorage.setItem("authToken", token));
}

function logout() {
    return api.get('/logout')
              .then(response => window.localStorage.removeItem("authToken"));
}

function setup() {
    const token = window.localStorage.getItem("authToken");
    if (token) {
        const { exp } = jwtDecode(token);
        if (exp * 1000 > new Date().getTime()) {
            return ;
        }
    }
    logout();
}

function isAuthenticated() {
    const token = window.localStorage.getItem("authToken");
    if (token) {
        const { exp } = jwtDecode(token);
        if (exp * 1000 > new Date().getTime())
            return true;
    }
    return false;
}

function getCurrentUser() {
    const token = window.localStorage.getItem("authToken");
    if (token) {
        const { exp, id, name, roles, email, metas } = jwtDecode(token);
        if (exp * 1000 > new Date().getTime())
            return {id, email, name, roles: Roles.filterRoles(roles), metas, isRelaypoint: Roles.isRelaypoint(roles)} ;
    }
    return getDefaultUser();
}

function getDefaultUser() {
    return {id:-1, name: "", email: "", roles: Roles.getDefaultRole(), metas: null};
}

function isDefaultUser(user) {
    const defaultUser = getDefaultUser();
    return defaultUser.id === user.id;
}

function setErrorHandler(setCurrentUser, setIsAuthenticated) {
    axios.defaults.withCredentials = true
    axios.interceptors.response.use(response => response, error => {

        if (error.response !== undefined) {
            if (error.response.status === 401) {
                logout()
                    .then(res => {
                        setIsAuthenticated(false);
                        setCurrentUser(getCurrentUser());
                        return ;
                    })
            }
        } else {
            console.log(error);
        }
        return ;
    });
}

function getGeolocation() {
    const country = window.sessionStorage.getItem("country");
    return isDefined(country) ? new Promise((resolve, reject) => resolve(country)) :
        axios.get('https://freegeoip.app/json/')
            .then(response => {
                window.sessionStorage.setItem("country", response.data.country_code);
                return response.data.country_code;
            })
            .catch(error => "RE");
}

function getUserSettings() {
    return api
            .get('/api/groups')
            .then(response => {
                if (isDefined(response)) {
                    const data = response.data['hydra:member'];
                    if (data.length > 1) {
                        const superAdmin = data.find(group => group.value === "ROLE_SUPER_ADMIN");
                        const admin = data.find(group => group.value === "ROLE_ADMIN");
                        return isDefined(superAdmin) ? superAdmin : admin;
                    } else {
                        return data[0];
                    }
                } 
            });
}

export default {
    authenticate,
    logout,
    setup,
    isAuthenticated,
    getCurrentUser,
    isDefaultUser,
    getDefaultUser,
    setErrorHandler,
    getUserSettings,
    getGeolocation
}