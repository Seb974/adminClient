import Roles from "src/config/Roles";
import { getDateFrom, isSameDate, isSameTime } from "./days";
import { getFloat, getInt, isDefined, isDefinedAndNotVoid } from "./utils";

export const getProductsAndVariations = (products, platform, selectedStore, mainView, currentUser) => {
    let productsList = [];
    products.map(p => {
        if (isDefinedAndNotVoid(p.variations)) {
            p.variations.map(v => {
                if (isDefinedAndNotVoid(v.sizes))
                    v.sizes.map(s => {
                        productsList = [...productsList, getVariantProduct(p, v, s, platform, selectedStore, mainView, currentUser)]
                    });
            });
        } else {
            productsList = [...productsList, getSimpleProduct(p, platform, selectedStore, mainView, currentUser)];
        }
    });
    return productsList;
};

export const getFormattedSales = sales => {
    return sales.map(({purchases, ...sale}) => {
        return { 
            ...sale, 
            isRemains: false,
            selected: false,
            items: purchases.map(({quantity, ...p}) => ({...p, orderedQty: quantity, unit: p.product.unit }))
        };
    })
};

export const extractSales = (elements, orders, evolution, supplied) => elements.map((element, index) => addSales(element, index, orders, evolution, supplied));

export const getSignPostName = (item, width) => {
    const productName = getProductName(item.product, item.variation, item.size);
    return (
        item.stock.quantity <= item.stock.security ?
            <span  className={ width >= 576 ? "" : "text-danger" }>
                { width >= 576 ? <i className="fas fa-exclamation-triangle mr-1 text-danger"></i> : ""} 
                 { productName }
            </span>
        : item.stock.quantity <= item.sales ?
            <span  className={ width >= 576 ? "" : "text-warning" }>
                { width >= 576 ? <i className="fas fa-info-circle mr-1 text-warning"></i>  : ""} 
                 { productName }
            </span>
        : item.stock.quantity <= item.stock.alert ? 
            <span  className={ width >= 576 ? "" : "text-primary" }>
                { width >= 576 ? <i className="fas fa-info-circle mr-1 text-primary"></i>  : ""} 
                 { productName }
            </span>
        : productName
    );
};

export const getCheapestSupplier = (costs, selectedSupplier, parameter = "name") => {
    const cheapest = !isDefinedAndNotVoid(costs) ? null : costs.reduce((less, curr) => {
        return less = !isDefined(selectedSupplier) || !isDefined(less) || curr.value < less.value ? curr :
                      curr.value > less.value ? less : 
                      curr.supplier.id === selectedSupplier.id ? curr : less
    }, null);
    return parameter !== "name" ? (!isDefined(cheapest) ? 0 : cheapest.value) : 
        !isDefined(cheapest) || cheapest.value === 0 ? <></> : 
            cheapest.supplier.id === selectedSupplier.id ? 
                <span className="text-success"><i className="fas fa-piggy-bank mr-1"></i>Meilleure offre</span> :
                <span className="text-danger"><i className="fas fa-exclamation-triangle mr-1"></i>{ cheapest.supplier.name } est - cher</span>;
};

export const getSupplierCostMessage = (product, selectedSupplier) => {
    const cost = getSupplierCostValue(product, selectedSupplier);
    return cost <= 0 ? "Non renseigné" : cost.toFixed(2) + " €";
};

export const isSelectable = product => {
    const { quantity } = product;
    return ((typeof quantity === 'string' && quantity.length > 0) || typeof quantity !== 'string') && parseInt(quantity) > 0;
};

export const getTotal = (products, selectedSupplier) => {
    return products.filter(p => getFloat(p.quantity) > 0).reduce((sum, curr) => {
        return sum += getSubTotal(curr.product.costs, curr.quantity, selectedSupplier);
    }, 0).toFixed(2);
};

export const getSubTotalCost = (costs, quantity, selectedSupplier) => {
    const subTotal = getSubTotal(costs, quantity, selectedSupplier);
    return subTotal > 0 ? subTotal.toFixed(2) + " €" : ""
};

export const getSuppliedProducts = (goods, suppliedProducts) => {
    let newSuppliedArray = [...suppliedProducts];
    goods.map(good => {
        const goodIndex = suppliedProducts.findIndex(s => s.stock.id === good.stock.id);
        if (goodIndex > -1) 
            newSuppliedArray[goodIndex] = {...newSuppliedArray[goodIndex], quantity: newSuppliedArray[goodIndex].quantity + good.quantity};
        else
            newSuppliedArray = [...newSuppliedArray, good];
    });
    return newSuppliedArray;
};

export const getGoods = (products, selectedSupplier) => {
    return products
        .filter(p => getFloat(p.quantity) > 0)
        .map(p => ({
            product: '/api/products/' + p.product.id,
            variation: isDefined(p.variation) ? '/api/variations/' + p.variation.id : null,
            size: isDefined(p.size) ? '/api/sizes/' + p.size.id : null,
            quantity: getFloat(p.quantity),
            unit: p.unit,
            stock: p.stock,
            price: getSupplierCostValue(p.product, selectedSupplier)
        }))
};

export const getDisabledDays = (date, selectedSupplier) => isDisabledDay(date, selectedSupplier);

export const getFirstDeliverableDay = selectedSupplier => {
    let i = 0;
    const start = new Date();
    let openDay = start;
    if (isDefined(selectedSupplier)) {
        while (isDisabledDay(openDay, selectedSupplier)) {
            i++;
            openDay = getDateFrom(start, i);
        }
    }
    return openDay;
};

const isDisabledDay = (date, selectedSupplier) => {
    if (isDefined(selectedSupplier)) {
        const now = new Date();
        const max = isDefined(selectedSupplier.maxHour) ? new Date(selectedSupplier.maxHour) : now;
        const deliveryDays = isDefinedAndNotVoid(selectedSupplier.days) ? selectedSupplier.days.map(d => getInt(d.value)) : [1, 2, 3, 4, 5, 6];
        const minimalDate = selectedSupplier.dayInterval || 0;
        const isMaxHourPassed = isSameDate(max, now) && isSameTime(max, now) ? false : getDateFrom(now, 0, max.getHours(), max.getMinutes()) < now;
        const dayLag = minimalDate + (isMaxHourPassed ? 1 : 0);
        return date <= getDateFrom(now, dayLag, max.getHours(), max.getMinutes()) || !deliveryDays.includes(getInt(date.getDay()));
    }
    return true;
};

const getSubTotal = (costs, quantity, selectedSupplier) => {
    const costObject = costs.find(c => isDefined(selectedSupplier) && c.supplier.id === selectedSupplier.id);
    const cost = isDefined(costObject) ? costObject.value : 0;
    return quantity * cost <= 0 ? 0 : Math.round(quantity * cost * 100) / 100;
}

export const getSupplierCostValue = (product, selectedSupplier) => {
    const cost = getSupplierCost(product, selectedSupplier);
    return !isDefined(cost) || cost.value.length === 0 ? 0 : getFloat(cost.value);
}

const getSupplierCost = (product, selectedSupplier) => isDefinedAndNotVoid(product.costs) && isDefined(selectedSupplier) ? product.costs.find(c => c.supplier.id === selectedSupplier.id) : null;

const getProductName = (product, variation, size) => {
    const variationName = exists(variation, 'name') ? " - " + variation.name : "";
    const sizeName = exists(size, 'name') ? " " + size.name : "";
    return product.name + variationName + sizeName;
};

const exists = (entity, variable) => {
    return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
};

const addSales = (element, index, orders, evolution, supplied) => {
    let sales = 0;
    const { security, quantity } = element.stock;
    orders.map(order => {
        if (!order.isRemains)
            sales = extractProduct(element, order, sales);
    });
    const evolutedSales = sales * (1 + evolution / 100);
    const suppliedQty = getSuppliedQty(element, supplied);
    const qty = (evolutedSales + security - quantity - suppliedQty) >= 0 ? (evolutedSales + security - quantity - suppliedQty) : 0;
    return {...element, id: index, quantity: qty > 0 ? Math.ceil(qty) : 0, sales: evolutedSales.toFixed(2) };
};

const extractProduct = (element, order, sales) => {
    order.items.map(item => {
        if (isItemProduct(item, element)) {
            const itemQty = item.unit === item.product.unit || !isDefined(item.preparedQty) || item.isAdjourned ? item.orderedQty : item.preparedQty;
            sales += itemQty;
        }
    })
    return sales;
};

export const isItemProduct = (item, element) => {
    const { product, variation, size } = element;
    if (item.product.id === product.id) {
        if (isDefined(variation) && isDefined(item.variation) && variation.id === item.variation.id) {
            if (isDefined(size) && isDefined(item.size) && size.id === item.size.id)
                return true;
        } else if (!isDefined(variation) && !isDefined(size) && !isDefined(item.variation) && !isDefined(item.size)) {
            return true;
        }
    }
    return false;
};

export const isSelectedItem = (item, selection) => {
    return getSelectedItem(item, selection) !== undefined;
};

export const getSelectedQuantity = (item, selection) => {
    const selectedItem = getSelectedItem(item, selection);
    return isDefined(selectedItem) ? selectedItem.quantity : 0;
}

const getSelectedItem = (item, selection) => {
    return selection.find(s => isItemProduct(item, s));
}

const getSuppliedQty = (element, supplied) => {
    const suppliedElt = supplied.find(elt => elt.stock.id === element.stock.id);
    return isDefined(suppliedElt) ? suppliedElt.quantity : 0;
};

const getSimpleProduct = (product, platform, selectedStore, mainView, currentUser) => {
    return {
        product: { id: product.id, name: product.name, costs: product.costs, department: product.department },
        variation: null,
        size: null,
        stock: getStock(product, platform, selectedStore, mainView, currentUser),
        unit: product.unit,
        selected: false
    };
}

const getVariantProduct = (product, variation, size, platform, selectedStore, mainView, currentUser) => {
    return {
        product: { id: product.id, name: product.name, costs: product.costs, department: product.department },
        variation: { id: variation.id, name: variation.color },
        size: { id: size.id, name: size.name },
        stock: getStock(size, platform, selectedStore, mainView, currentUser),
        unit: product.unit,
        selected: false
    };
};

const getStock = (element, platform, selectedStore, mainView, currentUser) => {
    let stock = null;
    if (isDefinedAndNotVoid(element.stocks)) {
        if ((Roles.isStoreManager(currentUser) && isDefined(selectedStore) && !selectedStore.main) || (!Roles.isStoreManager(currentUser) && !mainView))
            stock = element.stocks.find(s => isDefined(s.store) && s.store === selectedStore["@id"]);
        else
            stock = element.stocks.find(s => isDefined(s.platform));

    }
    return isDefined(stock) ? stock : getNewStock(selectedStore, platform);
};

const getNewStock = (selectedStore, platform) => {
    const newStock = { quantity: 0, alert: 0, security: 0 };
    return isDefined(selectedStore) ? {...newStock, store: selectedStore['@id']} : {...newStock, platform: platform['@id']};
};