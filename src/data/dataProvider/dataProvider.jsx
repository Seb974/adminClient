import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../contexts/ProductsContext';
import AuthContext from '../../contexts/AuthContext';
import AuthActions from '../../services/AuthActions';
import ProductActions from 'src/services/ProductActions';
import DeliveryContext from 'src/contexts/DeliveryContext';
import ContainerActions from 'src/services/ContainerActions';
import CatalogActions from 'src/services/CatalogActions';
import CategoryActions from 'src/services/CategoryActions';
import RelaypointActions from 'src/services/RelaypointActions';
import ContainerContext from 'src/contexts/ContainerContext';
import Roles from 'src/config/Roles';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import SellerActions from 'src/services/SellerActions';
import PlatformContext from 'src/contexts/PlatformContext';
import PlatformActions from 'src/services/PlatformActions';
import SupervisorActions from 'src/services/SupervisorActions';
import Mercure from 'src/mercure/Mercure';
import CatalogContext from 'src/contexts/CatalogContext';
import MessageContext from 'src/contexts/MessageContext';
import MessageActions from 'src/services/MessageActions';

const DataProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(AuthActions.isAuthenticated());
    const [currentUser, setCurrentUser] = useState(AuthActions.getCurrentUser());
    // const [country, setCountry] = useState("RE");
    const [products, setProducts] = useState([]);
    const [settings, setSettings] = useState(null);
    const [eventSource, setEventSource] = useState({});
    const [cities, setCities] = useState([]);
    const [relaypoints, setRelaypoints] = useState([]);
    const [categories, setCategories] = useState([]);
    const [condition, setCondition] = useState(undefined);
    const [containers, setContainers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [totalWeight, setTotalWeight] = useState(null);
    const [availableWeight, setAvailableWeight] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState({});
    const [tourings, setTourings] = useState([]);
    const [seller, setSeller] = useState(null);
    const [supervisor, setSupervisor] = useState(null);
    const [platform, setPlatform] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        AuthActions.setErrorHandler(setCurrentUser, setIsAuthenticated);
        // AuthActions.getGeolocation()
        //            .then(response => setCountry(response));
        PlatformActions.find()
                       .then(response => setPlatform(response));
        ProductActions.findAll()
                      .then(response => setProducts(response));
        // ContainerActions.findAll()
        //                 .then(response => setContainers(response));
        // CatalogActions.findAll()
        //               .then(response => setCatalogs(response));
        // RelaypointActions.findAll()
        //                  .then(response => setRelaypoints(response));
        // CategoryActions.findAll()
        //                .then(response => setCategories(response));
    },[]);

    useEffect(() => {
        setCurrentUser(AuthActions.getCurrentUser());
        AuthActions.getUserSettings()
                   .then(response => setSettings(response));
        ProductActions.findAll()
                      .then(response => setProducts(response));
    }, [isAuthenticated]);

    useEffect(() => {
        if (Roles.isSeller(currentUser))
            SellerActions
                .findAll()
                .then(response => setSeller(response[0]));
        else if (Roles.isSupervisor(currentUser))
            SupervisorActions
                .getSupervisor(currentUser)
                .then(response => setSupervisor(response));
        else if (Roles.hasAdminPrivileges(currentUser))
            MessageActions.findAll()
                          .then(response => setMessages(response));
    },[currentUser]);

    // useEffect(() => {
    //     if (isDefinedAndNotVoid(catalogs) && isDefined(country)) {
    //         const catalog = catalogs.find(catalogOption => catalogOption.code === country);
    //         const selection = isDefined(catalog) ? catalog : catalogs.filter(country => country.isDefault);
    //         setSelectedCatalog(selection);
    //     }
    // }, [catalogs, country]);

    return (
        <PlatformContext.Provider value={ {platform, setPlatform} }>
        <MessageContext.Provider value={ {messages, setMessages} }>
        <CatalogContext.Provider value={ {catalogs, setCatalogs} }>
        <AuthContext.Provider value={ {isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, eventSource, setEventSource, settings, setSettings, selectedCatalog, setSelectedCatalog, seller, setSeller, supervisor, setSupervisor} }>
        <DeliveryContext.Provider value={ {cities, setCities, relaypoints, setRelaypoints, condition, setCondition, packages, setPackages, totalWeight, setTotalWeight, availableWeight, setAvailableWeight, tourings, setTourings} }>
        <ContainerContext.Provider value={{ containers, setContainers }}>
        <ProductsContext.Provider value={ {products, setProducts, categories, setCategories} }>
            <Mercure>
                { children }
            </Mercure>
        </ProductsContext.Provider>
        </ContainerContext.Provider>
        </DeliveryContext.Provider>
        </AuthContext.Provider>
        </CatalogContext.Provider>
        </MessageContext.Provider>
        </PlatformContext.Provider>
    );
}

export default DataProvider;