import Roles from "src/config/Roles";
import { getActiveStatus } from "src/helpers/orders";
import { isDefined } from "src/helpers/utils";

export const updateStatusBetween = (data, dates, status, orders, setOrders, user, supervisor, setData) => {
    const { updatedOrders, newData } = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    setOrders(updatedOrders);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

export const updatePreparations = (data, dates, orders, setOrders, user, supervisor, setData) => {
    const status = [{value: "WAITING"}, {value: "PRE_PREPARED"}];
    const { updatedOrders, newData } = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    const ordersWithUpdate = Roles.isSeller(user) ? updatedOrders.filter(o => o.items.findIndex(i => !i.isPrepared) !== -1) : updatedOrders;
    setOrders(ordersWithUpdate);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

export const updateDeliveries = (data, dates, orders, setOrders, user, supervisor, setData) => {
    const status = [{value: "WAITING"}, {value: "PRE_PREPARED"}, {value: "PREPARED"}];
    const { updatedOrders, newData } = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    setOrders(updatedOrders);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

export const updateRecoveries = (data, dates, orders, setOrders, user, supervisor, setData) => {
    const status = [{value: "WAITING"}, {value: "PRE_PREPARED"}];
    const { updatedOrders, newData } = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    setOrders(updatedOrders);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

export const updateCheckouts = (data, dates, orders, setOrders, user, supervisor, relaypoint, setData) => {
    const status = getActiveStatus().filter(s => s.value !== "DELIVERED");
    const { updatedOrders, newData } = getOrdersWithUpdates(data, dates, status, orders, user, supervisor);
    const ordersWithUpdate = updatedOrders.filter(o => o.metas.id === relaypoint.metas.id);
    setOrders(ordersWithUpdate);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

const getOrdersWithUpdates = (data, dates, status, orders, user, supervisor) => {
    let updatedOrders = orders;
    const { start, end } = formatUTC(dates);
    const newData = data.map(order => {
        const isDeleted = !isDefined(order.id);
        if (!isDeleted) {
            const deliveryDate = new Date(order.deliveryDate);
            const orderToEdit = {...order, items : getFormattedItems(order)};
            if (deliveryDate >= start && deliveryDate <= end && hasAccess(orderToEdit, user, supervisor))   // && status.findIndex(s => s.value === order.status) !== -1
                updatedOrders = getUpdatedOrders(orderToEdit, updatedOrders);
        } else {
            updatedOrders = [...updatedOrders].filter(o => o['@id'] !== order['@id']);
        }
        return {...order, treated: true};
    });
    return { updatedOrders, newData };
};

const formatUTC = dates => ({ start: new Date(dates.start.toUTCString()), end: new Date(dates.end.toUTCString()) });

const getUpdatedOrders = (newOrder, updatedOrders) => {
    const index = updatedOrders.findIndex(o => o.id === newOrder.id);
    const newOrders = index !== -1 ? updatedOrders.map(o => o.id !== newOrder.id ? o : newOrder) : [...updatedOrders, newOrder];
    return newOrders;
};

const getFormattedItems = order => !Array.isArray(order.items) ? Object.keys(order.items).map(key => order.items[key]) : order.items;

const hasAccess = (order, user, supervisor) => {
    return  Roles.hasAdminPrivileges(user) || Roles.isPicker(user) ? true :
            Roles.isSeller(user) && order.items.findIndex(i => i.product.seller.users.findIndex(u => u.id === user.id) !== -1) !== -1 ? true :
            Roles.isSupervisor(user) && isDefined(supervisor) && supervisor.users.findIndex(u => u.id === order.user.id) !== -1;
};