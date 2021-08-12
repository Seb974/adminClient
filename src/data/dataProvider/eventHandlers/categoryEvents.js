import Roles from "src/config/Roles";
import { isDefined, isDefinedAndNotVoid } from "src/helpers/utils";

export const updateCategories = (categories, setCategories, products, setProducts, data, setData) => {

    let updatedCategories = categories;
    const newData = data.map(entity => {
        const idFromContext = parseInt(entity['@id'].slice(entity['@id'].lastIndexOf('/') + 1));
        updatedCategories = !isDefined(entity.id) ? 
                            [...updatedCategories].filter(c => c['@id'] !== entity['@id']) :
                            getUpdatedCategories(entity, updatedCategories);
        updateLinkedProductsIfNeeded(idFromContext, entity, products, setProducts);
        return {...entity, treated: true};
    });
    setCategories(updatedCategories);
    setData(newData.filter(d => !isDefined(d.treated)));

    return new Promise((resolve, reject) => resolve(false));
};

const getUpdatedCategories = (newCategory, updatedCategories) => {
    const index = updatedCategories.findIndex(c => c.id === newCategory.id);
    return index !== -1 ? updatedCategories.map(c => c.id !== newCategory.id ? c : newCategory) : [...updatedCategories, newCategory];
};

const updateLinkedProductsIfNeeded = (id, entity, products, setProducts) => {
    if (isDefinedAndNotVoid(products)) {
        const updatedProducts = products.map(p => {
            if (p.categories.find(c => c.id === id) !== undefined)
                return {...p, categories: p.categories.map(c => c.id === id ? entity : c)};
            else 
                return p;
        });
        setProducts(updatedProducts);
    }
};