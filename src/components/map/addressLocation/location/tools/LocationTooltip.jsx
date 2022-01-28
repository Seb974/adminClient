import React, { useEffect, useState } from 'react';
import { Popup } from 'react-map-gl';
import { isDefined } from 'src/helpers/utils';

const LocationTooltip = ({ location, informations, isRelaypoint }) => {

    const initialPosition = [-21.065285, 55.480270];
    const [ownPosition, setOwnPosition] = useState([]);
    const [ownInformations, setOwnInformations] = useState(undefined);

    useEffect(() => {
        if (ownPosition.length > 0 && !isRelaypoint) {
            setOwnPosition(informations.position);
        }
    }, []);

    useEffect(() => {
        const reset = JSON.stringify(informations.position) === JSON.stringify(initialPosition);
        if (!isRelaypoint || ownPosition.length === 0 || reset) {
            setOwnPosition(reset ? [] : informations.position);
            setOwnInformations(reset ? undefined : informations);
        }
    }, [informations.position]);

    return !isDefined(location) || !isDefined(ownPosition) ? <></> : (
        <Popup latitude={ownPosition[0]} longitude={ownPosition[1]} offsetLeft={10} offsetTop={-35}>
            <div className="text-center">
                <h4 className="mb-0">Votre adresse</h4>
                <p className="mb-0 mt-0">{ ownInformations.address }</p>
            </div>
        </Popup>
    );
}

export default LocationTooltip;