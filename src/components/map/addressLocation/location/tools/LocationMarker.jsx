import React, { useContext, useEffect, useState } from 'react';
import { Marker } from 'react-map-gl';
import AddressPanel from 'src/components/userPages/AddressPanel';
import AuthContext from 'src/contexts/AuthContext';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

const LocationMarker = ({ position, informations, setTooltip }) => {

    const { selectedCatalog } = useContext(AuthContext);
    const [ownPosition, setOwnPosition] = useState([]);
    const initialPosition = AddressPanel.getInitialPosition();
    const [ownInformations, setOwnInformations] = useState(undefined);

    useEffect(() => {
        if (ownPosition.length > 0)
            setOwnPosition(informations.position);
    }, []);

    useEffect(() => {
        const reset = JSON.stringify(informations.position) === JSON.stringify(selectedCatalog.center);
        if (ownPosition.length === 0 || reset) {
            setOwnPosition(reset ? [] : informations.position);
            setOwnInformations(reset ? undefined : informations);
        }
    }, [informations.position]);

    const handleClick = e => {
        e.preventDefault();
        setTooltip(undefined);
    };

    const isInitialState = (position) => {
        return !isDefinedAndNotVoid(position) || !isDefinedAndNotVoid(selectedCatalog.center) ||
               JSON.stringify(position) === JSON.stringify(selectedCatalog.center) || 
               JSON.stringify(position) === JSON.stringify(initialPosition) ||
               JSON.stringify(position) === JSON.stringify([0, 0]);
   };

    return !isDefinedAndNotVoid(position) || isInitialState(position) ? <></> : (
        <Marker latitude={ position[0] } longitude={ position[1] } offsetLeft={0} offsetTop={-30}>
            <a href="#" onClick={ handleClick }>
                <img 
                    alt="self-address" 
                    src="/assets/img/icon-img/self-marker.png" 
                    onMouseEnter={ () => setTooltip(informations)} 
                    onMouseLeave={ () => setTooltip(undefined) }
                />
            </a>
        </Marker>
    );
}

export default LocationMarker;