import 'src/assets/css/map.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactMapGL, { AttributionControl, NavigationControl, FlyToInterpolator, MapContext } from 'react-map-gl';
import mapboxgl from "mapbox-gl";
import RelaypointTools from './relaypoint/RelaypointTools';
import LocationTools from './location/LocationTools';
import SearchBar from './search/searchBar';
import { checkForAlternatives, getCityCondition } from 'src/helpers/map';
import AuthContext from 'src/contexts/AuthContext';
import DeliveryContext from 'src/contexts/DeliveryContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import PolylineOverlay from '../PolylineOverlay';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const Map = ({ informations, setInformations, displayedRelaypoints, setDiscount, objectDiscount, setObjectDiscount, errors, catalog = null }) => {

    const map = useRef(null);
    const searchInput = useRef(null);
    const { currentUser, settings, selectedCatalog } = useContext(AuthContext);
    const [currentCatalog, setCurrentCatalog] = useState(selectedCatalog);
    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const [defaultView, setDefaultView] = useState({ latitude: 0, longitude: 0, zoom: 9});
    const [viewport, setViewport] = useState(defaultView);
    const { cities, relaypoints, setCondition, condition } = useContext(DeliveryContext);
    const [isRelaypoint, setIsRelaypoint] = useState(false);
    const [relayPointTooltip, setRelaypointTooltip] = useState(undefined);
    const [relayPointPopup, setRelaypointPopup] = useState(undefined);
    const [locationTooltip, setLocationTooltip] = useState(undefined);
    const [locationPopup, setLocationPopup] = useState(undefined);
    const mapStyle = { top: 0, left: 0, height: '520px', width: '100', mapStyle: 'mapbox://styles/mapbox/streets-v11' };
    // 'mapbox://styles/mapbox/light-v8'

    useEffect(() => {
        setCurrentCatalog(isDefined(catalog) ? catalog : selectedCatalog);
    }, [selectedCatalog, catalog]);

    useEffect(() => {
        if (isDefined(currentCatalog) && Object.keys(currentCatalog).length > 0 && isDefinedAndNotVoid(currentCatalog.center)) {
            setDefaultView({ latitude: currentCatalog.center[0], longitude: currentCatalog.center[1], zoom: currentCatalog.zoom});
            setViewport({
                ...viewport, 
                latitude: !isInitialState(informations.position) ? informations.position[0] : currentCatalog.center[0], 
                longitude: !isInitialState(informations.position) ? informations.position[1] : currentCatalog.center[1], 
                zoom: !isInitialState(informations.position) ? 17 : currentCatalog.zoom
            });
        }
    }, [currentCatalog]);

    useEffect(() => {
        if (isDefinedAndNotVoid(informations.position) && !isInitialState(informations.position)) {
            setViewport({
                ...viewport,
                latitude: informations.position[0],
                longitude: informations.position[1],
                zoom: 17,
                transitionDuration: 1800, 
                transitionInterpolator: new FlyToInterpolator() 
            });
        }
    },[informations.position]);

    useEffect(() => {
        if (informations.address.length > 0 && !isRelaypoint && relaypoints.length > 0)
            setCityCondition(informations.zipcode);
        else if (informations.address.length === 0)
            onClear()
    }, [informations.address, relaypoints]);

    const updatePosition = suggestion => {
        const { lat, lng } = suggestion.latlng;
        setInformations({
            ...informations, 
            position: [lat, lng], 
            address: suggestion.value, 
            address2: "",
            zipcode : suggestion.postcodes[0], 
            city: suggestion.city
        });
        setIsRelaypoint(false);
        if (isDefined(suggestion.force))
            setCityCondition(suggestion.postcodes[0]);
    };

    const onClear = () => {
        setInformations(informations => ({
            ...informations, 
            position: currentCatalog.center,
            address: '', 
            address2: '', 
            zipcode: '', 
            city: ''
        }));
        setIsRelaypoint(false);
        setCondition(undefined);
        setViewport({
            latitude: isDefined(currentCatalog) && isDefinedAndNotVoid(currentCatalog.center) ? currentCatalog.center[0] : defaultView.latitude,
            longitude: isDefined(currentCatalog)&& isDefinedAndNotVoid(currentCatalog.center) ? currentCatalog.center[1] : defaultView.longitude,
            zoom: isDefined(currentCatalog) && isDefined(currentCatalog.zoom) ? currentCatalog.zoom : defaultView.zoom,
            transitionDuration: 1800, 
            transitionInterpolator: new FlyToInterpolator() 
        });
    };

    const setCityCondition = zipcode => {
        const cityCondition = getCityCondition(zipcode, cities, settings);
        setCondition(cityCondition);
        return cityCondition;
    };

    const isInitialState = (position) => {
        return !isDefinedAndNotVoid(position) || !isDefinedAndNotVoid(currentCatalog.center) ||
               JSON.stringify(position) === JSON.stringify(currentCatalog.center) || 
               JSON.stringify(position) === JSON.stringify([0, 0]);
   };

    return (
        <>
            <ReactMapGL ref={ map } {...viewport} {...mapStyle} onViewportChange={view => setViewport(view)} mapboxApiAccessToken={ apiToken } attributionControl={false} scrollZoom={ false }>
                <NavigationControl style={ {left: 10, top: 10} } />
                <SearchBar
                    mapRef={ map }
                    containerRef={ searchInput }
                    informations={ informations }
                    updatePosition={ updatePosition }
                    setIsRelaypoint={ setIsRelaypoint }
                    setLocationPopup={ setLocationPopup }
                    setRelaypointPopup={ setRelaypointPopup }
                    setViewport={ setViewport }
                    errors={ errors }
                />
                <RelaypointTools
                    informations={ informations }
                    displayedRelaypoints={ displayedRelaypoints }
                    relayPointTooltip={ relayPointTooltip }
                    relayPointPopup={ relayPointPopup }
                    objectDiscount={ objectDiscount }
                    setInformations={ setInformations }
                    setRelaypointTooltip={ setRelaypointTooltip }
                    setRelaypointPopup={ setRelaypointPopup }
                    setDiscount={ setDiscount }
                    setObjectDiscount={ setObjectDiscount }
                    setViewport={ setViewport }
                    setIsRelaypoint={ setIsRelaypoint }
                    onClear={ onClear }
                />
                <LocationTools
                    informations={ informations }
                    locationTooltip={ locationTooltip }
                    locationPopup={ locationPopup }
                    isRelaypoint={ isRelaypoint }
                    setLocationTooltip={ setLocationTooltip }
                    setLocationPopup={ setLocationPopup }
                    updatePosition={ updatePosition }
                    setViewport={ setViewport }
                    setIsRelaypoint={ setIsRelaypoint }
                    onClear={ onClear }
                />
                <AttributionControl compact={ true } style={ {right: 0, bottom: 0} } />
            </ReactMapGL>
            <div className="row mt-3 mb-5">
                <div className="col-md-12 mt-4" ref={ searchInput }></div>
                { errors.address && <p className="mapbox-validation-error">{ errors.address }</p> }
            </div>
        </>
    );
}

export default Map;