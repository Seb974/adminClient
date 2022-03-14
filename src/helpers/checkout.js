import Roles from "src/config/Roles";
import { isInSelectedCountry } from "./map";
import { getFloat, isDefined, isDefinedAndNotVoid } from "./utils";

export const shop = {
    id: "-1",
    name: "Dépôt",
    coordinates: [-21.313875, 55.458254],
    address: "21 chemin Jean Cadet, 97410, Saint-Pierre, La Réunion",
    zipcode: "97410",
    city: "Saint-Pierre"
};

export const cardStyle = {
    style: {
        base: {
            fontSize: "16px",
            color: "#424770",
            letterSpacing: "0.025em",
            fontFamily: "Source Code Pro, monospace",
            "::placeholder": {
            color: "#aab7c4"
            }
        },
        invalid: {
            color: "#9e2146"
        }
    }
};

export const updateError = "Votre paiement a bien été reçu.\n" +
    "Toutefois, une erreur est survenue lors du changement de statut des factures acquittées.\n" +
    "Nous vous invitons à contacter nos services sur les horaires d'ouverture, " +
    "afin que nous puissions mettre à jour les factures concernées.";

export const paymentConnexionError = "Une erreur est survenue lors de la connexion à la plateforme de paiement. " +
                                     "Vérifier l'état de votre connexion internet et rafraichissez la page pour réessayer.";

export const getShop = platform => {
    const { id, name, metas } = platform;
    const { position, address, zipcode, city } = metas;
    return { id: -id, coordinates: position, name, address, zipcode, city };
};

export const getOrderToWrite = (order, user, informations, productCart, date, objectDiscount, selectedCatalog, condition, settings) => {
    return {
        ...order,
        user: isDefined(user) ? user['@id'] : null,
        deliveryDate: date,
        metas: informations,
        catalog: selectedCatalog['@id'],
        appliedCondition: isDefined(condition) ? condition['@id'] : null,
        promotion: isDefined(objectDiscount) ? objectDiscount['@id'] : null,
        items: productCart.map(item => ({
            ...item, 
            product: item.product['@id'],
            variation: isDefined(item.variation) ? item.variation['@id'] : null,
            size: isDefined(item.size) ? item.size['@id'] : null,
            orderedQty: getFloat(item.orderedQty),
            preparedQty: isDefined(item.preparedQty) ? !isNaN(getFloat(item.preparedQty)) ? getFloat(item.preparedQty) : null : null,
            deliveredQty: isDefined(item.deliveredQty) ? !isNaN(getFloat(item.deliveredQty)) ?getFloat(item.deliveredQty) : null : null,
            price: getFloat(item.price),
            unit: item.unit,
            taxRate: item.product.tax.catalogTaxes.find(catalogTax => catalogTax.catalog.id === selectedCatalog.id).percent,
            isAdjourned: false,
            isPrepared: false,
            traceabilities: isDefinedAndNotVoid(item.traceabilities) ? item.traceabilities.map(({id, ...t}) => ({...t, initialQty: getFloat(t.initialQty), quantity: getFloat(t.quantity)})) : []

        })),
        isRemains: false,
        status: !isDefined(order.status) ? "WAITING" : order.status,
        packages: !isDefinedAndNotVoid(order.packages) ? [] : order.packages.map(p => ({...p, container: p.container['@id']})),
        preparator: isDefined(order.preparator) ? (typeof order.preparator === 'object' ? isDefined(order.preparator['@id']) ? order.preparator['@id'] : null : typeof order.preparator === 'string' ? order.preparator : null) : null,
    };
};

export const setOrderStatus = (order, status) => {
    const { user, metas, catalog, appliedCondition, promotion, items, preparator } = order;
    return {
        ...order,
        status,
        user: isDefined(user) ? (typeof user === 'object' ? user['@id'] : user) : null,
        metas: isDefined(metas) ? (typeof metas === 'object' ? metas['@id'] : metas) : null,
        catalog: isDefined(catalog) ? (typeof catalog === 'object' ? catalog['@id'] : catalog) : null,
        appliedCondition: isDefined(appliedCondition) ? (typeof appliedCondition === 'object' ? appliedCondition['@id'] : appliedCondition) : null,
        promotion: isDefined(promotion) ? (typeof promotion === 'object' ? promotion['@id'] : promotion) : null,
        items: items.map(item => item['@id']),
        packages: !isDefinedAndNotVoid(order.packages) ? [] : order.packages.map(p => ({...p, container: p.container['@id']})),
        preparator: isDefined(preparator) ? (typeof preparator === 'object' ? isDefined(preparator['@id']) ? preparator['@id'] : null : typeof preparator === 'string' ? preparator : null) : null,
    }
};

export const getPreparedOrder = (order, currentUser) => {
    const { user, metas, catalog, appliedCondition, promotion, items, preparator } = order;
    return {
        ...order,
        user: isDefined(user) ? (typeof user === 'object' ? user['@id'] : user) : null,
        metas: isDefined(metas) ? (typeof metas === 'object' ? metas['@id'] : metas) : null,
        catalog: isDefined(catalog) ? (typeof catalog === 'object' ? catalog['@id'] : catalog) : null,
        preparator: isDefined(preparator) ? (typeof preparator === 'object' ? isDefined(preparator['@id']) ? preparator['@id'] : null : typeof preparator === 'string' ? preparator : null) : null,
        appliedCondition: isDefined(appliedCondition) ? (typeof appliedCondition === 'object' ? appliedCondition['@id'] : appliedCondition) : null,
        promotion: isDefined(promotion) ? (typeof promotion === 'object' ? promotion['@id'] : promotion) : null,
        items: items.map(item => {
            return Roles.hasAdminPrivileges(currentUser) || Roles.isPicker(currentUser) || isDefined(item.product) && isDefined(item.product.seller) && item.product.seller.users.find(user => user.id === currentUser.id) !== undefined ? 
                {...item,
                    orderedQty: isDefined(item.orderedQty) ? getFloat(item.orderedQty) : 0,
                    preparedQty: isDefined(item.preparedQty) ? getFloat(item.preparedQty) : 0,
                    product: isDefined(item.product) ? (typeof item.product === 'string' ? item.product : item.product['@id']) : null,
                    variation: isDefined(item.variation) ? (typeof item.variation === 'string' ? item.variation : item.variation['@id']) : null,
                    size: isDefined(item.size) ? (typeof item.size === 'string' ? item.size : item.size['@id']) : null,
                    traceabilities: isDefinedAndNotVoid(item.traceabilities) ? getFormattedTraceabilities(item.traceabilities) : [],
                    isAdjourned: item.isAdjourned,
                }
                :
                item['@id']
        }),
        packages: !isDefinedAndNotVoid(order.packages) ? [] : order.packages.map(p => ({...p, container: p.container['@id']})),
        isRemains: false
    };
}

const getFormattedTraceabilities = traceabilities  => {
    return traceabilities.map(({id, ...t}) => {
        const quantity = getFloat(t.quantity);
        return {...t, quantity, initialQty: quantity}
    });
};

export const getDeliveredOrder = order => {
    const { user, metas, catalog, appliedCondition, promotion, items, preparator } = order;
    return {
        ...order,
        user: isDefined(user) ? (typeof user === 'object' ? user['@id'] : user) : null,
        metas: isDefined(metas) ? (typeof metas === 'object' ? metas['@id'] : metas) : null,
        catalog: isDefined(catalog) ? (typeof catalog === 'object' ? catalog['@id'] : catalog) : null,
        appliedCondition: isDefined(appliedCondition) ? (typeof appliedCondition === 'object' ? appliedCondition['@id'] : appliedCondition) : null,
        promotion: isDefined(promotion) ? (typeof promotion === 'object' ? promotion['@id'] : promotion) : null,
        items: items.map(item => ({
            ...item,
            orderedQty: getFloat(item.orderedQty),
            preparedQty: getFloat(item.preparedQty),
            deliveredQty: getFloat(item.deliveredQty),
            product: isDefined(item.product) ? (typeof item.product === 'object' ? item.product['@id'] : item.product) : null,
            variation: isDefined(item.variation) ? (typeof item.variation === 'object' ? item.variation['@id'] : item.variation) : null,
            size: isDefined(item.size) ? (typeof item.size === 'object' ? item.size['@id'] : item.size) : null,
            traceabilities: isDefinedAndNotVoid(item.traceabilities) ? item.traceabilities.map(t => ({...t, quantity: getFloat(t.quantity)})) : []
        })),
        packages: !isDefinedAndNotVoid(order.packages) ? [] : order.packages.map(p => ({...p, container: p.container['@id']})),
        status: isDefined(metas.isRelaypoint) && metas.isRelaypoint ? "COLLECTABLE" : "DELIVERED",
        preparator: isDefined(preparator) ? (typeof preparator === 'object' ? isDefined(preparator['@id']) ? preparator['@id'] : null : typeof preparator === 'string' ? preparator : null) : null,
    };
}

export const validateForm = (user, informations, catalog, condition, relaypoints) => {
    let errors = {};
    let isCatalogError = false;
    let notDeliverableAddress = false;
    if (!isValidName(user.name))
        errors['name'] = "Le nom n'est pas renseigné."
    if (!isValidEmail(user.email))
        errors['email'] = "L'adresse email est invalide ou non renseignée."
    if (!isValidPhoneNumber(informations.phone))
        errors['phone'] = "Le numéro de téléphone est invalide ou non renseigné."
    if (!isValidAddress(informations, catalog, condition, relaypoints))
        errors['address'] = "L'adresse n'est pas valide."
    else if (!isDefined(user.catalog) && !isValidCatalog(catalog, informations)) {
        errors['address'] = "Adresse non disponible depuis le catalogue sélectionné."
        isCatalogError = true;
    } else if (!isDeliverable(catalog, condition)) {
        errors['address'] = "Pas de livraison à domicile à cette adresse."
        notDeliverableAddress = true;
    }
    return errors;
}

export const isValidName = name => {
    return name.length > 0;
}

export const isValidEmail = email => {
    const pattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
    return isDefinedAndNotVoid(email.match(pattern));
}

export const isValidPhoneNumber = phoneNumber => {
    const pattern1 = /^(?:(?:\+|00)33|(?:\+|00)262|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/g;
    const pattern = /^(?:(?:\+|00)33|(?:\+|00)262|0)[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/g;
    return isDefinedAndNotVoid(phoneNumber.match(pattern));
}

export const isValidAddress = (informations, catalog, condition, relaypoints) => {
    const zipPattern = /^(?:[0-9]\d|9[0-8])\d{3}$/g;
    if ( isDefinedAndNotVoid(informations.zipcode.match(zipPattern)) ) {
        const { city, address, position } = informations;
        const initialPosition = isDefined(catalog) && isDefinedAndNotVoid(catalog.center) ? catalog.center : [0, 0];
        return city.length > 0 && address.length > 0 && (!isSamePosition(position, initialPosition) || isRelaypoint(condition, relaypoints));
    }
    return false;
}

export const isValidCatalog = (catalog, informations) => {
    const { position } = informations;
    return isInSelectedCountry(position[0], position[1], catalog);
};

const isDeliverable = (catalog, condition) => {
    return isDefined(catalog) && (catalog.needsParcel || !isDefined(condition));
};

export const isSamePosition = (position1, position2) => JSON.stringify(position1) === JSON.stringify(position2);

const isRelaypoint = (condition, relaypoints) => {
    if (!isDefined(condition) || !isDefinedAndNotVoid(relaypoints)) {
        return false;
    }
    const selectedRelaypoint = relaypoints.find(relaypoint => relaypoint.conditions.find(c => c.id === condition.id) !== undefined);
    return isDefined(selectedRelaypoint);
}