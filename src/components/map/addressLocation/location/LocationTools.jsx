import React from 'react';
import LocationMarker from './tools/LocationMarker';
import LocationTooltip from './tools/LocationTooltip';

const LocationTools = ({ informations, locationTooltip, setLocationTooltip }) => {
    return (
        <>
            <LocationMarker
                position={ informations.position }
                informations={ informations }
                setTooltip={ setLocationTooltip }
            />
            <LocationTooltip 
                location={ locationTooltip }
                informations={ informations }
            />
        </>
    );
}
 
export default LocationTools;