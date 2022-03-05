import { getFloat } from "./utils";

export const getFormattedVariations = (variations, defaultVariation) => {
    if (variations && variations.length > 0) {
        return variations.map((variation, index) => {
            return {
                ...variation,
                count: index,
                name: variation.color,
                sizes: variation.sizes.map((size, i) => {
                    return {...size, count: i};
                })
            };
        });
    }
    return [defaultVariation];
};

export const getFormattedComponents = (components, defaultComponent) => {
    if (components && components.length > 0) {
        return components.map((component, index) => ({...component, count: index}))
    }
    return [defaultComponent];
};

export const createDescription = (product, components) => {
    let description = '"' + product.name + '" est composé de : ';
    components.map((component, index) => {
        const { product, quantity } = component;
        let separator = index < components.length - 1 ? (index === components.length - 2 ? ' et ' : ', ') : '.';
        description += product.name + getVariationDetails(component) + ' (' + (product.unit === 'Kg' ? '~ ' : '') + quantity + ' ' + product.unit + ')' + separator;
    });
    return description + ' Composition d\'environ ' + getTotalWeight(components) + ' Kg.';
};

const getVariationDetails = ({ variation, size }) => {
    const sizeDetails = !isDefined(size) ? "" : ": " + size.name + " ";
    return !isDefined(variation) ? "" :
    ' - ' + variation.color + " " + sizeDetails;
};

export const getTotalWeight = (components) => {
    let totalWeight = 0;
    components.map((component) => {
        let unitWeight = component.product.weight === null || component.product.weight === undefined ? 1 : component.product.weight;
        totalWeight += unitWeight * component.quantity;
    });
    return totalWeight;
};

export const getTotalContentWeight = (components) => {
    let totalContentWeight = 0;
    components.map((component) => {
        let unitWeight = !isDefined(component.product.contentWeight) ? 1 : component.product.contentWeight;
        totalContentWeight += unitWeight * component.quantity;
    });
    return totalContentWeight;
};

export const getProductToWrite = (product, type, categories, variations, adaptedComponents, components) => {
    const {image, stock, userGroups, catalogs, stocks, ...noImgProduct} = product;
    const newStocks = isDefinedAndNotVoid(product.stocks) && isDefined(stock["@id"]) ? 
            product.stocks.map(s => s["@id"] === stock["@id"] ? getFormattedStock(stock, s.quantity) : s) : [getFormattedStock(stock, 0)];
    return {
        ...noImgProduct,
        // stock: type === "simple" ? {...stock, name: noImgProduct.name, unit: type === "mixed" ? "U" : noImgProduct.unit} : null,
        stocks: type === "simple" ? newStocks : [],
        userGroups: userGroups.map(userGroup => userGroup['@id']),
        catalogs: catalogs.map(catalog => catalog['@id']),
        productGroup: type === "mixed" ? null : product.productGroup,
        tax: typeof product.tax === 'string' ? product.tax : product.tax['@id'],
        seller: noImgProduct.seller['@id'],
        department: isDefined(noImgProduct.department) ? noImgProduct.department['@id'] : null,
        suppliers: isDefinedAndNotVoid(product.suppliers) ? product.suppliers.map(s => s.value) : [],
        discount: product.discount.toString().length > 0 && getFloat(product.discount) > 0 ? getFloat(product.discount) : null,
        offerEnd: product.discount.toString().length > 0 && getFloat(product.discount) > 0 ? product.offerEnd : null,
        categories: product.categories.map(category => categories.find(element => element.id === category.value)['@id']),
        stockManaged: type === "mixed" ? null : noImgProduct.stockManaged,
        unit: type === "mixed" ? "U" : noImgProduct.unit,
        fullDescription: type === "mixed" ? createDescription(product, components) : noImgProduct.fullDescription,
        weight: type === "mixed" ? getTotalWeight(components) : product.unit === "Kg" ? 1 : noImgProduct.weight.length <= 0 ? 1 : parseFloat(noImgProduct.weight),
        contentWeight: type === "mixed" ? getTotalContentWeight(components) : product.unit === "Kg" || noImgProduct.contentWeight.length <= 0 ? 1 : parseFloat(noImgProduct.contentWeight),
        prices: product.prices.map(price => {
            return ({...price, amount: parseFloat(price.amount), priceGroup: price.priceGroup['@id']})
        }),
        components: adaptedComponents,
        costs: isDefinedAndNotVoid(product.costs) ? product.costs.map(c => ({...c, supplier: c.supplier['@id']})) : [],
        variations
    };
};

const getFormattedStock = (stock, quantity) => {
    const { alert, security, batches } = stock;
    return {
        ...stock, 
        alert: getFloat(alert), 
        security: getFloat(security),
        quantity: getFloat(quantity),
        batches: isDefinedAndNotVoid(batches) ? batches.map(b => b['@id']) : []
    } 
};

const getFormattedSizeStock = (stock, product, quantity) => {
    const { alert, security, platform, batches } = product.stock;
    return isDefined(stock) ? 
        {
            ...stock, 
            alert: getFloat(alert), 
            security: getFloat(security), 
            quantity: getFloat(quantity),
            batches: isDefinedAndNotVoid(batches) ? batches.map(b => b['@id']) : []
        } :
        { 
            platform, 
            alert: getFloat(alert), 
            security: getFloat(security), 
            quantity: getFloat(quantity),
            batches: isDefinedAndNotVoid(batches) ? batches.map(b => b['@id']) : []
         };
};


export const getComponentsToWrite = (components) => {
    return components.map(component => {
        const { count, variation, size, ...mainVarComponent} = component;
        const minComponent = {...mainVarComponent, product: mainVarComponent.product['@id'], quantity: parseFloat(mainVarComponent.quantity) };
        return variation === null || variation === undefined ? minComponent : {...minComponent, variation: variation['@id'], size: size['@id']};
    });
};

export const getVariationToWrite = (variation, product) => {
    const {image, ...noImgVar} = variation;
    return {
        ...noImgVar,
        color: variation.name,
        sizes: variation.sizes.map(size => {
            const { stock, ...noStockSize} = size
            const newStocks = isDefinedAndNotVoid(size.stocks) && isDefined(product.stock["@id"]) ? 
                size.stocks.map(s => isDefined(s.platform) ? getFormattedSizeStock(s, product, s.quantity) : s) : [getFormattedSizeStock(null, product, 0)];
            return {
                ...noStockSize,
                name: size.name,
                stocks: newStocks,
                // stock: {
                //     ...size.stock,
                //     name: getProductName(product, variation, size),
                //     unit: product.unit,
                //     quantity: size.stock !== undefined && size.stock !== null && size.stock.quantity ? size.stock.quantity : 0,
                //     alert: parseFloat(product.stock.alert), 
                //     security: parseFloat(product.stock.security)
                // }
            }
        })
    };
};

const getProductName = (product, variation, size) => {
    const variationName = exists(variation, variation.name) ? " " + variation.name : "";
    const sizeName = exists(size, size.name) ? " " + size.name : "";
    return product.name + variationName + sizeName;
};

const exists = (entity, entityName) => {
    return isDefined(entity) && isDefined(entityName) && entityName.length > 0 && entityName !== " ";
};

export const defineType = (product) => {
    return product.isMixed ? "mixed" : product.variations && product.variations.length > 0 ? "with-variations" : "simple";
};

export const formatProduct = (product, defaultStock) => {
    const {prices, categories, stock, variations, discount, offerEnd, storeAvailable, stocks} = product;
    const basePrice = prices !== null && prices !== undefined && prices.length > 0 ? prices[0].amount : "";
    const viewableStock = isDefinedAndNotVoid(stocks) ? stocks.find(s => isDefined(s.platform)) : 
        (isDefinedAndNotVoid(variations) && isDefinedAndNotVoid(variations[0].sizes[0].stocks) ? variations[0].sizes[0].stocks.find(s => isDefined(s.platform)) : undefined);
    const formattedProduct = {
        ...product, 
        userGroups: isDefinedAndNotVoid(product.userGroups) ? isDefined(product.userGroups[0].label) ? product.userGroups : product.userGroups.map(group => ({value: group})) : [],
        catalogs: isDefinedAndNotVoid(product.catalogs) ? isDefined(product.catalogs[0].label) ? product.catalogs : product.catalogs.map(catalog => ({...catalog, value: catalog.id, label: catalog.name, isFixed: false})) : [],
        suppliers: isDefinedAndNotVoid(product.suppliers) ? isDefined(product.suppliers[0].label) ? product.suppliers : product.suppliers.map(supplier => ({...supplier, value: supplier['@id'], label: supplier.name, isFixed: false})) : [],
        categories: categories.map(category => ({value: category.id, label: category.name, isFixed: false})),
        uniquePrice: isDefinedAndNotVoid(prices) ? prices.every(price => price.amount === basePrice) : true,
        // stock: isDefined(stock) ? stock : isDefinedAndNotVoid(variations) ? variations[0].sizes[0].stock : defaultStock,
        stock: isDefined(viewableStock) ? viewableStock : defaultStock, 
        discount: isDefined(discount) ? discount : "",
        offerEnd: isDefined(offerEnd) ? new Date(offerEnd) : new Date(),
        storeAvailable: isDefined(storeAvailable) ? storeAvailable : true
    };
    return formattedProduct;
};

export const getProductGroups = () => {
    return [
        {value: "J + 1", label: "DLC à J + 1", isFixed: false},
        {value: "J + 3", label: "DLC à J + 3", isFixed: false},
        {value: "J + 6", label: "DLC à J + 6", isFixed: false},
        {value: "J + 10", label: "DLC à J + 10", isFixed: false},
    ];
}

export const getWritableProduct = product => {
    return {
        ...product,
        catalogs: isDefinedAndNotVoid(product.catalogs) ? product.catalogs.map(c => c['@id']) : [],
        categories: isDefinedAndNotVoid(product.categories) ? product.categories.map(c => c['@id']) : [],
        components: isDefinedAndNotVoid(product.components) ? product.components.map(c => c['@id']) : [],
        costs: isDefinedAndNotVoid(product.costs) ? product.costs.map(c => c['@id']) : [],
        prices: isDefinedAndNotVoid(product.prices) ? product.prices.map(p => p['@id']) : [],
        suppliers: isDefinedAndNotVoid(product.suppliers) ? product.suppliers.map(s => s['@id']) : [],
        userGroups: isDefinedAndNotVoid(product.userGroups) ? product.userGroups.map(u => u['@id']) : [],
        variations: isDefinedAndNotVoid(product.variations) ? product.variations.map(v => v['@id']) : [],
        image: isDefined(product.image) ? product.image['@id'] : null,
        seller: isDefined(product.seller) ? product.seller['@id'] : null,
        department: isDefined(product.department) ? product.department['@id'] : null,
        stock: isDefined(product.stock) ? product.stock['@id'] : null,
        stocks: isDefined(product.stocks) ? product.stocks.map(s => s['@id']) : [],
        tax: isDefined(product.tax) ? product.tax['@id'] : null,



    }
}

const isDefined = variable => variable !== undefined && variable !== null;
const isDefinedAndNotVoid = variable => Array.isArray(variable) ? isDefined(variable) && variable.length > 0 : isDefined(variable);