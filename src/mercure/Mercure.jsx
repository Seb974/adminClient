import React, { useContext, useEffect, useState } from 'react';
import MercureContext from 'src/contexts/MercureContext';
import MercureHub from 'src/components/Mercure/MercureHub';
import AuthContext from 'src/contexts/AuthContext';
import ProductsContext from 'src/contexts/ProductsContext';
import ContainerContext from 'src/contexts/ContainerContext';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import { updateContext } from 'src/data/dataProvider/eventHandlers/productEvents';
import { updateCurrentUser } from 'src/data/dataProvider/eventHandlers/userEvents';
import { updateCategories } from 'src/data/dataProvider/eventHandlers/categoryEvents';
import { updateContainers } from 'src/data/dataProvider/eventHandlers/containerEvents';
import { updateMessages } from 'src/data/dataProvider/eventHandlers/messageEvents';
import MessageContext from 'src/contexts/MessageContext';

const Mercure = ({ children }) => {

    const { containers, setContainers } = useContext(ContainerContext);
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const { messages, setMessages } = useContext(MessageContext);
    const { products, setProducts, categories, setCategories } = useContext(ProductsContext);

    const [updatedUsers, setUpdatedUsers] = useState([]);
    const [updatedOrders, setUpdatedOrders] = useState([]);
    const [updatedProducts, setUpdatedProducts] = useState([]);
    const [updatedCategories, setUpdatedCategories] = useState([]);
    const [updatedProvisions, setUpdatedProvisions] = useState([]);
    const [updatedContainers, setUpdatedContainers] = useState([]);
    const [updatedMessages, setUpdatedMessages] = useState([]);

    const [productOpering, setProductOpering] = useState(false);
    const [categoryOpering, setCategoryOpering] = useState(false);
    const [messageOpering, setMessageOpering] = useState(false);
    const [containerOpering, setContainerOpering] = useState(false);
    const [currentUserOpering, setCurrentUserOpering] = useState(false);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProducts) && !productOpering) {
            setProductOpering(true);
            updateContext(products, setProducts, updatedProducts, setUpdatedProducts)
                .then(response => setProductOpering(response));
        }
    }, [updatedProducts]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedCategories) && !categoryOpering) {
            setCategoryOpering(true);
            updateCategories(categories, setCategories, products, setProducts, updatedCategories, setUpdatedCategories)
                .then(response => setCategoryOpering(response));
        }
    }, [updatedCategories]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedContainers) && !containerOpering) {
            setContainerOpering(true);
            updateContainers(containers, setContainers, updatedContainers, setUpdatedContainers)
                .then(response => setContainerOpering(response));
        }
    }, [updatedContainers]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedUsers) && !currentUserOpering) {
            setCurrentUserOpering(true);
            updateCurrentUser(currentUser, setCurrentUser, updatedUsers, setUpdatedUsers)
                .then(response => setCurrentUserOpering(response));
        }
    }, [updatedUsers]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedMessages) && !messageOpering) {
            setMessageOpering(true);
            updateMessages(messages, setMessages, updatedMessages, setUpdatedMessages)
                .then(response => setMessageOpering(response));
        }
    }, [updatedMessages]);

    return (
        <MercureContext.Provider value={{ 
                updatedOrders, setUpdatedOrders, 
                updatedProducts, setUpdatedProducts, 
                updatedUsers, setUpdatedUsers, 
                updatedCategories, setUpdatedCategories,
                updatedProvisions, setUpdatedProvisions,
                updatedContainers, setUpdatedContainers,
                updatedMessages, setUpdatedMessages,
            }}
        >
            <MercureHub>
                { children }
            </MercureHub>
        </MercureContext.Provider>
    );
}

export default Mercure;