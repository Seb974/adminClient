import 'src/assets/css/map.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactMapGL, { AttributionControl, NavigationControl, FlyToInterpolator, MapContext } from 'react-map-gl';
import mapboxgl from "mapbox-gl";
import LocationTools from './location/LocationTools';
import SearchBar from './search/searchBar';
import AuthContext from 'src/contexts/AuthContext';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AddressPanel from 'src/components/userPages/AddressPanel';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const Map = ({ informations, setInformations, errors }) => {

    const map = useRef(null);
    const searchInput = useRef(null);
    const { selectedCatalog } = useContext(AuthContext);
    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const initialPosition = AddressPanel.getInitialPosition();
    const [defaultView, setDefaultView] = useState({ latitude: 0, longitude: 0, zoom: 9});
    const [viewport, setViewport] = useState(defaultView);
    const [locationTooltip, setLocationTooltip] = useState(undefined);
    const mapStyle = { top: 0, left: 0, height: '520px', width: '100', mapStyle: 'mapbox://styles/mapbox/streets-v11' };
    // 'mapbox://styles/mapbox/light-v8'

    useEffect(() => {
        if (isDefined(selectedCatalog) && Object.keys(selectedCatalog).length > 0 && isDefinedAndNotVoid(selectedCatalog.center)) {
            setDefaultView({ latitude: selectedCatalog.center[0], longitude: selectedCatalog.center[1], zoom: selectedCatalog.zoom});
            setViewport({
                ...viewport, 
                latitude: !isInitialState(informations.position) ? informations.position[0] : selectedCatalog.center[0], 
                longitude: !isInitialState(informations.position) ? informations.position[1] : selectedCatalog.center[1], 
                zoom: !isInitialState(informations.position) ? 17 : selectedCatalog.zoom
            });
        }
    }, [selectedCatalog]);

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
        if (isDefined(informations.address) && informations.address.length > 0) {
            setViewport({
                latitude: informations.position[0],
                longitude: informations.position[1],
                zoom: 17,
                transitionDuration: 1800, 
                transitionInterpolator: new FlyToInterpolator() 
            });
        }
    }, [informations.address]);

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
    };

    const onClear = () => {
        setInformations({
            ...informations, 
            position: selectedCatalog.center,
            address: '', 
            address2: '', 
            zipcode: '', 
            city: ''
        });
        setViewport({
            latitude: isDefined(selectedCatalog) && isDefinedAndNotVoid(selectedCatalog.center) ? selectedCatalog.center[0] : defaultView.latitude,
            longitude: isDefined(selectedCatalog)&& isDefinedAndNotVoid(selectedCatalog.center) ? selectedCatalog.center[1] : defaultView.longitude,
            zoom: isDefined(selectedCatalog) && isDefined(selectedCatalog.zoom) ? selectedCatalog.zoom : defaultView.zoom,
            transitionDuration: 1800, 
            transitionInterpolator: new FlyToInterpolator() 
        });
    };

    const isInitialState = (position) => {
        return !isDefinedAndNotVoid(position) || !isDefinedAndNotVoid(selectedCatalog.center) ||
               JSON.stringify(position) === JSON.stringify(selectedCatalog.center) || 
               JSON.stringify(position) === JSON.stringify(initialPosition) ||
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
                    setViewport={ setViewport }
                    errors={ errors }
                />
                <LocationTools
                    informations={ informations }
                    locationTooltip={ locationTooltip }
                    setLocationTooltip={ setLocationTooltip }
                />
                <AttributionControl compact={ true } style={ {right: 0, bottom: 0} } />
            </ReactMapGL>
            <div className="row mt-3 mb-3">
                <div className="col-md-12 mt-4" ref={ searchInput }></div>
                { errors.address && <p className="mapbox-validation-error">{ errors.address }</p> }
            </div>
        </>
    );
}

export default Map;