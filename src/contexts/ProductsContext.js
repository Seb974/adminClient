import React from 'react';

export default React.createContext({
    products: [],
    setProducts: (value) => {},
    categories: [],
    setCategories: (value) => {},
    navSearch: '',
    setNavSearch: (value) => {}
});