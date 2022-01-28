import React from 'react';

export default React.createContext({
    updatedOrders: [],
    setUpdatedOrders: (value) => {},
    updatedProducts: [],
    setUpdatedProducts: (value) => {},
    updatedUsers: [], 
    setUpdatedUsers: (value) => {},
    updatedCategories: [],
    setUpdatedCategories: (value) => {},
    updatedProvisions: [],
    setUpdatedProvisions: (value) => {},
    updatedContainers: [],
    setUpdatedContainers: (value) => {},
    updatedMessages: [],
    setUpdatedMessages: (value) => {},
});