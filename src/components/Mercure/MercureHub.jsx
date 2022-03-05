import React, { useEffect, useContext, useState } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import AuthContext from 'src/contexts/AuthContext';
import api from 'src/config/api';
import touringEvents from 'src/data/dataProvider/eventHandlers/touringEvents';
import DeliveryContext from 'src/contexts/DeliveryContext';
import MercureContext from 'src/contexts/MercureContext';
import { CCol, CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';

const MercureHub = ({ children }) => {
    
    const { isAuthenticated } = useContext(AuthContext);
    const url = new URL(api.MERCURE_DOMAIN + "/.well-known/mercure");
    const [toasts, setToasts] = useState([]);
    const { updatedOrders, setUpdatedOrders, updatedProducts, setUpdatedProducts, updatedCategories, setUpdatedCategories } = useContext(MercureContext);
    const { updatedUsers, setUpdatedUsers, updatedProvisions, setUpdatedProvisions, updatedContainers, setUpdatedContainers } = useContext(MercureContext);
    const { updatedMessages, setUpdatedMessages } = useContext(MercureContext);
    const { currentUser, eventSource, setEventSource } = useContext(AuthContext);
    const { tourings, setTourings } = useContext(DeliveryContext);

    const networkMessage = "Vous avez été déconnecté d' internet. Vérifiez l'état de votre connexion et rafraîchissez la page.";
    const networkToast = { position: 'top-right', autohide: false, closeButton: true, fade: true, color: 'danger', messsage: networkMessage, title: 'Connexion interrompue' };

    const addToast = newToast => setToasts([...toasts, newToast]);

    useEffect(() => {
        closeIfExists();
        url.searchParams.append('topic', api.API_DOMAIN + '/api/products/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/messages/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/stocks/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/provisions/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/categories/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/containers/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/catalog_prices/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/tourings/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}/metas');
        url.searchParams.append('topic', api.API_DOMAIN + '/api/users/{id}/shipments');
        setEventSource(new EventSourcePolyfill(url, { withCredentials: true }));
    }, [currentUser]);

    const closeIfExists = () => {
        if (eventSource !== undefined && Object.keys(eventSource).find(key => key === 'readyState') !== undefined)
            eventSource.close();
    };

    eventSource.onerror = errorEvent => {
        if (errorEvent.error.message === 'network error') {
            closeIfExists();
            if (isAuthenticated)
                addToast(networkToast);
        }
    };

    eventSource.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data['@id'].includes('tourings'))
            touringEvents.update(data, tourings, setTourings);

        if (data['@id'].includes('containers') || data['@id'].includes('catalog_prices'))
            setUpdatedContainers([...updatedContainers, data]);

        if (data['@id'].includes('messages'))
            setUpdatedMessages([...updatedMessages, data]);

        if (data['@id'].includes('provisions'))
            setUpdatedProvisions([...updatedProvisions, data]);

        if (data['@id'].includes('categories'))
            setUpdatedCategories([...updatedCategories, data]);

        if (data['@id'].includes('users') || data['@id'].includes('metas'))
            setUpdatedUsers([...updatedUsers, data]);

        if (data['@id'].includes('order_entities') && updatedOrders.findIndex(o => o.id === data.id) === -1)
            setUpdatedOrders([...updatedOrders, data]);

        if (data['@id'].includes('products') || data['@id'].includes('prices') || data['@id'].includes('stocks') || data['@id'].includes('costs'))
            setUpdatedProducts([...updatedProducts, data]);
    };

    const toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
    })();

    return (
        <>
            { children }
            <CCol sm="12" lg="6">
              { Object.keys(toasters).map((toasterKey) => (
                <CToaster position={toasterKey} key={'toaster' + toasterKey}>
                    { toasters[toasterKey].map((toast, key)=> {
                        return (
                            <CToast key={ 'toast' + key } 
                                    show={ true } 
                                    autohide={ toast.autohide } 
                                    fade={ toast.fade } 
                                    color={ toast.color } 
                                    style={{ color: 'white' }}
                            >
                                <CToastHeader closeButton={ toast.closeButton }>{ toast.title }</CToastHeader>
                                <CToastBody style={{ backgroundColor: 'white', color: "black" }}>{ toast.messsage }</CToastBody>
                            </CToast>
                        )})
                    }
                </CToaster>
              ))}
            </CCol>
        </>
        );
}

export default MercureHub;