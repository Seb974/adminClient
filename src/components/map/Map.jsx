import '../../assets/css/map-leaflet.css';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import AlgoliaPlaces from 'algolia-places-react';
import LocationMarker from './LocationMarker';

const Map = ({ informations, initialPosition, updatePosition }) => {

    const apInput = useRef(null);

    useEffect(() => {
        apInput.current.autocompleteElem.value = informations.address;
    }, [informations.address]);
    
    return (
        <>
            <div id="map" className="row mt-3">
                    <MapContainer center={ informations.position } zoom={13} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={ informations.position } initialPosition={ initialPosition }/>
                    </MapContainer>
            </div>
            <div className="row mt-3">
                <div className="col-md-12">
                    <AlgoliaPlaces
                        ref={ apInput }
                        placeholder='Votre adresse'
                        className="form-control"
                        options={{
                            appId: 'pl6124DJ467I',
                            apiKey: 'dac682bc8a0dc7a59f7ada449553bcf9',
                            language: 'fr',
                            countries: ['fr'],
                            type: 'address',
                        }}
                        onChange={({ query, rawAnswer, suggestion, suggestionIndex }) => {
                            updatePosition(suggestion);
                        }}
                        onClear={() => {
                            updatePosition({latlng: {lat: initialPosition[0], lng: initialPosition[1]}});
                        }}
                    />
                </div>
            </div>
        </>
    );
}
 
export default Map;