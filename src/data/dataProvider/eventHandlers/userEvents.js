import Roles from "src/config/Roles";
import { isDefined } from "src/helpers/utils";

export const updateUsers = (users, setUsers, currentUser, setCurrentUser, data, setData) => {
    
    let updatedUsers = users;
    const newData = data.map(entity => {
        const idFromContext = parseInt(entity['@id'].slice(entity['@id'].lastIndexOf('/') + 1));
        updatedUsers = entity['@id'].includes('users') ? treatUser(entity, updatedUsers) :
                                                         treatMeta(entity, updatedUsers);
    
        updateCurrentUserIfNeeded(idFromContext, entity, currentUser, setCurrentUser);
        return {...entity, treated: true};
    });

    setUsers(updatedUsers);
    setData(newData.filter(d => !isDefined(d.treated)));

    return new Promise((resolve, reject) => resolve(false));
};

export const updateCurrentUser = (currentUser, setCurrentUser, data, setData) => {
    const newData = data.map(entity => {
        const idFromContext = parseInt(entity['@id'].slice(entity['@id'].lastIndexOf('/') + 1));
        updateCurrentUserIfNeeded(idFromContext, entity, currentUser, setCurrentUser);
        return {...entity, treated: true};
    });
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

const treatUser = (user, updatedUsers) => {
    return !isDefined(user.id) ? [...updatedUsers].filter(u => u['@id'] !== user['@id']) : getUpdatedUsers(user, updatedUsers);
};

const treatMeta = (meta, updatedUsers) => {
    const linkedUser = updatedUsers.find(u => u.metas['@id'] === meta['@id']);
    return  !isDefined(linkedUser) ? updatedUsers :
            updatedUsers.map(u => u.id !== linkedUser.id ? u : {...linkedUser, metas: meta});
};

const getUpdatedUsers = (newUser, updatedUsers) => {
    const index = updatedUsers.findIndex(u => u.id === newUser.id);
    return index !== -1 ? updatedUsers.map(u => u.id !== newUser.id ? u : newUser) : [...updatedUsers, newUser];
};

const updateCurrentUserIfNeeded = (id, entity, currentUser, setCurrentUser) => {
    if ( entity['@id'].includes('users') && currentUser.id === id) {
        const { id, name, roles, email } = entity;
        const newUser = { id, name, roles, email, metas: currentUser.metas };
        setCurrentUser({...newUser, roles: Roles.filterRoles(roles), isRelaypoint: Roles.isRelaypoint(roles)});
    } else if ( entity['@id'].includes('metas') && currentUser.metas.id === id) {
        setCurrentUser({ ...currentUser, metas: entity });
    }
}