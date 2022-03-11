import React, { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';

const LocationMarker = ({ position, initialPosition }) => {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, 13 + (JSON.stringify(position) === JSON.stringify(initialPosition) ? 0 : 5));
    }, [position])

    return position === null ? null : (
        <Marker position={ position }>
            <Popup>Vous êtes ici !</Popup>
        </Marker>
    );
}
// eventHandlers={{ click: e => console.log("Click on position")}}
 
export default LocationMarker;