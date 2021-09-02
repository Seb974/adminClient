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
    const {image, stock, userGroups, catalogs, ...noImgProduct} = product;
    return {
        ...noImgProduct,
        stock: type === "simple" ? stock : null,
        userGroups: userGroups.map(userGroup => userGroup['@id']),
        catalogs: catalogs.map(catalog => catalog['@id']),
        productGroup: type === "mixed" ? null : product.productGroup,
        tax: product.tax['@id'],
        seller: noImgProduct.seller['@id'],
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
        variations
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
            return {
                ...size,
                name: size.name,
                stock: {
                    ...size.stock,
                    quantity: size.stock !== undefined && size.stock !== null && size.stock.quantity ? size.stock.quantity : 0,
                    alert: parseFloat(product.stock.alert), 
                    security: parseFloat(product.stock.security)
                }
            }
        })
    };
};

export const defineType = (product) => {
    return product.isMixed ? "mixed" : product.variations && product.variations.length > 0 ? "with-variations" : "simple";
};

export const formatProduct = (product, defaultStock) => {
    const {prices, categories, stock, variations, discount, offerEnd} = product;
    const basePrice = prices !== null && prices !== undefined && prices.length > 0 ? prices[0].amount : "";
    const formattedProduct = {
        ...product, 
        userGroups: isDefinedAndNotVoid(product.userGroups) ? isDefined(product.userGroups[0].label) ? product.userGroups : product.userGroups.map(group => ({value: group})) : [],
        catalogs: isDefinedAndNotVoid(product.catalogs) ? isDefined(product.catalogs[0].label) ? product.catalogs : product.catalogs.map(catalog => ({...catalog, value: catalog.id, label: catalog.name, isFixed: false})) : [],
        categories: categories.map(category => ({value: category.id, label: category.name, isFixed: false})),
        uniquePrice: isDefinedAndNotVoid(prices) ? prices.every(price => price.amount === basePrice) : true,
        stock: isDefined(stock) ? stock : isDefinedAndNotVoid(variations) ? variations[0].sizes[0].stock : defaultStock,
        discount: isDefined(discount) ? discount : "",
        offerEnd: isDefined(offerEnd) ? new Date(offerEnd) : new Date()
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

const isDefined = variable => variable !== undefined && variable !== null;
const isDefinedAndNotVoid = variable => Array.isArray(variable) ? isDefined(variable) && variable.length > 0 : isDefined(variable);