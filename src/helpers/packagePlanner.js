import { getFloat } from "./utils";

export const getPackagesPlan = order => {
    
    let packages = getPackages(order);
    let items = getItems(order);

    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < packages.length; j++) {
            if (items[i].orderedQty > 0 && packages[j].capacity > 0) {
                if (items[i].weight <= packages[j].capacity) {
                    packages[j] = addItemInPackages(items[i], packages[j], items[i].orderedQty);
                    items[i] = getUnpackedPartItem(items[i], items[i].orderedQty);
                    break;
                } else if (["U", "L"].includes(items[i].unit) && items[i].orderedQty > 1) {
                    for (let index = items[i].orderedQty - 1; index > 0; index--) {
                        if (index * items[i].product.weight <= packages[j].capacity) {
                            packages[j] = addItemInPackages(items[i], packages[j], index);
                            items[i] = getUnpackedPartItem(items[i], index);
                            break;
                        }
                    }
                } else if (!["U", "L"].includes(items[i].unit)) {
                    const capacity = packages[j].capacity;
                    packages[j] = addItemInPackages(items[i], packages[j], capacity);
                    items[i] = getUnpackedPartItem(items[i], capacity);
                }
            }
        }
    }
    return packages;
};

const addItemInPackages = (item, pack, quantity) => {
    return {
        ...pack, 
        cost: pack.cost + getFloat((quantity * item.price).toFixed(2)),
        capacity: getFloat((pack.capacity - (quantity * item.product.weight)).toFixed(2)),
        content: [...pack.content, {...item, orderedQty: quantity, weight: getFloat((quantity * item.product.weight).toFixed(2))}]
    };
};

const getUnpackedPartItem = (item, quantity) => ({...item, orderedQty: getFloat((item.orderedQty - quantity).toFixed(2)), weight: getFloat((item.weight - (quantity * item.product.weight)).toFixed(2))});

const getPackages = order => {
    let packages = [];
    order.packages
        .sort((a, b) => a.container.max < b.container.max ? 1 : -1)
        .map(p => {
            for (let index = 0; index < p.quantity; index++)
                packages = [...packages, {...p.container, capacity: getFloat((p.container.max - p.container.tare).toFixed(2)), quantity: 1, content: [], cost: 0}]
        });
    return packages;
};

const getItems = order => {
    const formattedItems = order.items.map(i => ({...i, weight: getFloat((i.product.weight * i.orderedQty).toFixed(2))}));
    return getOrderedItems(formattedItems);
};

const getOrderedItems = items => {
    const units = items.filter(i => i.unit === "U")
                       .sort((a, b) => a.weight < b.weight ? 1 : -1);
    const weights = items.filter(i => units.findIndex(u => u.id === i.id) === -1)
                         .sort((a, b) => a.weight < b.weight ? 1 : -1);
    return [...units, ...weights];
};