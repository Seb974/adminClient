import Roles from "src/config/Roles";
import { isDefined, isDefinedAndNotVoid } from "src/helpers/utils";

export const updateSuppliersBetween = (dates, provisions, setProvisions, data, setData, user, seller, sellers, suppliers) => {
    const { updatedProvisions, newData } = getProvisionsWithUpdates(data, dates, sellers, provisions, user, seller, suppliers);
    setProvisions(updatedProvisions);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

export const updateBetween = (dates, provisions, setProvisions, data, setData, user, seller, sellers) => {
    const { updatedProvisions, newData } = getProvisionsWithUpdates(data, dates, sellers, provisions, user, seller);
    setProvisions(updatedProvisions);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

const getProvisionsWithUpdates = (data, dates, sellers, provisions, user, seller, suppliers = null) => {
    let updatedProvisions = provisions;
    const { start, end } = formatUTC(dates);
    const newData = data.map(provision => {
        const isDeleted = !isDefined(provision.id);
        if (!isDeleted && isFromSelectedSellers(provision, sellers) && isFromSelectedSuppliers(provision, suppliers) ) {
            const provisionDate = new Date(provision.provisionDate);
            const provisionToEdit = {...provision, goods : getFormattedGoods(provision)};
            if (provisionDate >= start && provisionDate <= end && hasAccess(provisionToEdit, user, seller))   // && status.findIndex(s => s.value === provision.status) !== -1
                updatedProvisions = getUpdatedProvisions(provisionToEdit, updatedProvisions);
        } else {
            updatedProvisions = [...updatedProvisions].filter(p => p['@id'] !== provision['@id']);
        }
        return {...provision, treated: true};
    });
    return { updatedProvisions, newData };
};

const getUpdatedProvisions = (newProvision, updatedProvisions) => {
    const index = updatedProvisions.findIndex(p => p.id === newProvision.id);
    const newProvisions = index !== -1 ? updatedProvisions.map(p => p.id !== newProvision.id ? p : newProvision) : [...updatedProvisions, newProvision];
    return newProvisions;
};

const formatUTC = dates => ({ start: new Date(dates.start.toUTCString()), end: new Date(dates.end.toUTCString()) });

const getFormattedGoods = provision => !Array.isArray(provision.goods) ? Object.keys(provision.goods).map(key => provision.goods[key]) : provision.goods;

const isFromSelectedSellers = (provision, sellers) => {
    return isDefinedAndNotVoid(sellers) && sellers.findIndex(s => s.id === provision.seller.id) !== -1;
};

const isFromSelectedSuppliers = (provision, suppliers) => {
    return !isDefinedAndNotVoid(suppliers) || (isDefinedAndNotVoid(suppliers) && suppliers.findIndex(s => s.id === provision.supplier.id) !== -1);
};

const hasAccess = (provision, user, seller) => {
    return Roles.hasAdminPrivileges(user) || Roles.isPicker(user) || (Roles.isSeller(user) && isDefined(seller) && provision.seller.id === seller.id);
};