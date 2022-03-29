import { isDefined, isDefinedAndNotVoid } from "./utils";

export const getStatus = () => {
    return [
        {value: "ON_PAYMENT", label: "En paiement", isFixed: false},
        {value: "WAITING", label: "En attente", isFixed: false},
        {value: "PRE-PREPARED", label: "En préparation", isFixed: false},
        {value: "PREPARED", label: "A l'expédition", isFixed: false},
        {value: "READY", label: "En attente de récupération", isFixed: false},
        {value: "ON_TRUCK", label: "En livraison", isFixed: false},
        {value: "COLLECTABLE", label: "En point relais", isFixed: false},
        {value: "DELIVERED", label: "Livré", isFixed: false},
        {value: "SHIPPED", label: "Expédié", isFixed: false},
        {value: "ABORTED", label: "Abandonné", isFixed: false}
    ];
};

export const getStatusName = (status) => {
    const all = getStatus();
    return all.find(s => s.value === status).label;
};

export const getDeliveredStatus = () => {
    return [
        {value: "COLLECTABLE", label: "En point relais", isFixed: false},
        {value: "DELIVERED", label: "Livré", isFixed: false},
        {value: "SHIPPED", label: "Expédié", isFixed: false}
    ];
}

export const getExportStatuses = () => {
    return [
        {value: "WAITING", label: "En attente", isFixed: false},
        {value: "READY", label: "En attente de récupération", isFixed: false},
        {value: "SHIPPED", label: "Expédié", isFixed: false}
    ];
}

export const getActiveStatus = () => {
    return [
        {value: "WAITING", label: "En attente", isFixed: false},
        {value: "PRE-PREPARED", label: "En préparation", isFixed: false},
        {value: "PREPARED", label: "A l'expédition", isFixed: false},
        {value: "READY", label: "En attente de récupération", isFixed: false},
        {value: "ON_TRUCK", label: "En livraison", isFixed: false},
        {value: "COLLECTABLE", label: "En point relais", isFixed: false},
        {value: "DELIVERED", label: "Livré", isFixed: false},
        {value: "SHIPPED", label: "Expédié", isFixed: false},
    ];
}

export const getContainerTotalHT = (packages, catalog) => {
    if (isDefined(packages)) {
        return packages.reduce((sum, current) => {
            const { quantity, container } = current;
            const price = getContainerPrice(container, catalog);
            return sum += (quantity * price);
        }, 0);
    }
    return 0;
};

export const getContainerTotalTTC = (packages, catalog) => {
    if (isDefined(packages)) {
        return packages.reduce((sum, current) => {
            const { quantity, container } = current;
            const price = getContainerPrice(container, catalog);
            const tax = getContainerTax(container, catalog);
            return sum += (quantity * price * (1 + tax));
        }, 0);
    }
    return 0;
};

export const getContainerTotalTax = (packages, catalog) => {
    if (isDefined(packages)) {
        const ht = getContainerTotalHT(packages, catalog);
        const ttc = getContainerTotalTTC(packages, catalog);

        return Math.round((ttc - ht) * 100) / 100;
    }
    return 0;
};

export const getContainerPrice = (container, catalog) => {
    const catalogPrice = isDefined(container) && isDefinedAndNotVoid(container.catalogPrices) ? container.catalogPrices.find(c => c.catalog.id === catalog.id) : null;
    return isDefined(catalogPrice) ? catalogPrice.amount : 0;
};

export const getContainerTax = (container, catalog) => {
    const catalogTax = container.tax.catalogTaxes.find(c => c.catalog.id === catalog.id);
    return isDefined(catalogTax) ? catalogTax.percent : 0;
};

export const getProductsTotalTax = (order, catalog) => {
    const { user, paymentId } = order;
    return order.items.reduce((sum, current) => {
        const { product, price, orderedQty, preparedQty } = current;
        const quantity = !isDefined(user) || isDefined(paymentId) || !isDefined(preparedQty) ? orderedQty : preparedQty;
        const tax = getProductTax(product, catalog);
        return sum += (quantity * price * tax);
    }, 0);
    
};

export const getTotalHT = order => {
    const { packages, catalog, totalHT } = order
    return Math.round((totalHT) * 100) / 100;
};

export const getSubTotalHT = (items, onlinePayment) => {
    return items.reduce((sum, curr) => {
        const quantity = onlinePayment ? curr.orderedQty : 
                        isDefined(curr.deliveredQty) ? curr.deliveredQty : 
                        isDefined(curr.preparedQty) ? curr.preparedQty : curr.orderedQty;
        return sum += isDefined(quantity) ? curr.price * quantity : 0;
    }, 0);
};

export const getContainerCosts = (items, catalog) => {
    return items.filter(i => i.isPackage).reduce((sum, curr) => {
        const priceEntity = curr.container.catalogPrices.find(c => c.catalog.code === catalog.code);
        const price = isDefined(priceEntity) ? priceEntity.amount : 0;
        return sum += curr.quantity * price;
    }, 0);
};

export const getTotalTTC = order => getTotalHT(order) + getTotalTax(order);

export const getTotalTax = order => {
    const { packages, catalog } = order;
    const productsTotal = getProductsTotalTax(order, catalog);
    const containersTotal = getContainerTotalTax(packages, catalog);
    const deliveryTax = getDeliveryTax(order);
    return Math.round((productsTotal + containersTotal + deliveryTax) * 100) / 100;
};

const getDeliveryTax = order => {
    if (isDefined(order.appliedCondition)) {
        const catalogTax = order.appliedCondition.tax.catalogTaxes.find(c => c.catalog.id === order.catalog.id);
        return isDefined(catalogTax) && order.totalHT < order.appliedCondition.minForFree ? order.appliedCondition.price * catalogTax.percent : 0;
    }
    return 0;
};

const getProductTax = (product, catalog) => {
    const catalogTax = product.tax.catalogTaxes.find(c => c.catalog.id === catalog.id);
    return isDefined(catalogTax) ? catalogTax.percent : 0;
};