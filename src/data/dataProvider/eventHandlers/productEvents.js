import { isDefined } from "src/helpers/utils";

export const updateContext = (products, setProducts, data, setData) => {
    let updatedProducts = products;
    const newData = data.map(entity => {
        updatedProducts = entity['@id'].includes('products') ? treatProduct(entity, updatedProducts) : 
                          entity['@id'].includes('prices') ? treatPrice(entity, updatedProducts) :
                          treatStock(entity, updatedProducts);
        return {...entity, treated: true};
    });
    setProducts(updatedProducts);
    setData(newData.filter(d => !isDefined(d.treated)));
    return new Promise((resolve, reject) => resolve(false));
};

const treatProduct = (product, updatedProducts) => {
    return !isDefined(product.id) ? [...updatedProducts].filter(p => p['@id'] !== product['@id']) : getUpdatedProducts(product, updatedProducts);
};

const treatPrice = (price, updatedProducts) => {
    const linkedProduct = updatedProducts.find(pdt => pdt['@id'] === price.product);
    return  !isDefined(linkedProduct) ? updatedProducts :
            updatedProducts.map(p => p.id !== linkedProduct.id ? p : getProductWithNewPrice(linkedProduct, price));
};

const treatStock = (stock, updatedProducts) => {
    const { product, variation, size } = getProductLinkedToStock(stock, updatedProducts);
    return  !isDefined(product) ? updatedProducts :
            updatedProducts.map(p => p.id !== product.id ? p : getProductWithNewStock(product, variation, size, stock));
};

const getUpdatedProducts = (newProduct, updatedProducts) => {
    const index = updatedProducts.findIndex(o => o.id === newProduct.id);
    return index !== -1 ? updatedProducts.map(o => o.id !== newProduct.id ? o : newProduct) : [...updatedProducts, newProduct];
};

const getProductWithNewPrice = (product, price) => {
    if (!isDefined(price.id)) {
        return {...product, prices: product.prices.filter(p => p['@id'] === price['@id'])};
    } else {
        const priceIndex = product.prices.findIndex(p => p.id === price.id);
        const newPrices = priceIndex !== -1 ? product.prices.map(p => p.id !== price.id ? p : price) : [...product.prices, price];
        return {...product, prices: newPrices};
    }
};

const getProductWithNewStock = (product, variation, size, stock) => {
    if (isDefined(size))
        return {
            ...product, 
            variations: product.variations.map(v => {
                return v['@id'] !== variation['@id'] ? v : 
                        {...variation, sizes: variation.sizes.map(s => s['@id'] !== size['@id'] ? s : {...size, stock: stock})}
            })
        };
    else
        return {...product, stock: stock};
};

const getProductLinkedToStock = (stock, products) => {
    const entities = products.map(pdt => isStockMatching(stock, pdt)).filter(obj => isDefined(obj));
    return entities.length > 0 ? entities[0] : {product: null, variation: null, size: null};

};

const isStockMatching = (stock, product) => {
    if (isDefined(product.stock) && product.stock['@id'] === stock['@id'])
        return { product, variation: null, size: null }
    else if (isDefined(product.variations)) {
        const variation = product.variations.find(v => v.sizes.find(s => s.stock['@id'] === stock['@id']));
        if (isDefined(variation)) {
            const size = variation.sizes.find(s => s.stock['@id'] === stock['@id']);
            return {product, variation, size};
        }
    }
    return null;
};


