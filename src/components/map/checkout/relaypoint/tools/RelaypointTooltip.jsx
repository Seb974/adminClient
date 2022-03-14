import React from 'react';
import { Popup } from 'react-map-gl';
import { isDefined, isSameAddress } from 'src/helpers/utils';

const RelaypointTooltip = ({ relaypoint, informations }) => {

    return !isDefined(relaypoint) ? <></> : (
        <Popup latitude={relaypoint.metas.position[0]} longitude={relaypoint.metas.position[1]} offsetLeft={10} offsetTop={-35}>
            <div className="text-center">
                <p className="mb-0">{ relaypoint.name }</p>
                <p className="mb-0 mt-0">{ relaypoint.metas.city }</p>
                { !isSameAddress(relaypoint.metas, informations) ? 
                    <small className="mt-0">(cliquez pour sélectionner)</small> : 
                    <></> 
                }
            </div>
        </Popup>
    );
}
 
export default RelaypointTooltip;