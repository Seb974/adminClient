import React, { useContext, useEffect, useState } from 'react';
import DeliveryContext from 'src/contexts/DeliveryContext';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import RelaypointMarker from './tools/RelaypointMarker';
import RelaypointPopup from './tools/RelaypointPopup';
import RelaypointTooltip from './tools/RelaypointTooltip';

const RelaypointTools = ({ informations, displayedRelaypoints, relayPointTooltip, relayPointPopup, setInformations, setRelaypointTooltip, setRelaypointPopup, setViewport, setIsRelaypoint, onClear, setDiscount, objectDiscount, setObjectDiscount }) => {

    const { setCondition } = useContext(DeliveryContext);
    const [ userRelaypoints, setUserRelaypoints ] = useState([]);

    useEffect(() => {
        if (isDefinedAndNotVoid(displayedRelaypoints))
            setUserRelaypoints(displayedRelaypoints);
    }, [displayedRelaypoints]);

    return (
        <>
            { userRelaypoints.map(relaypoint => {
                const { id, metas } = relaypoint;
                return <RelaypointMarker
                            key={ id } 
                            position={ metas.position } 
                            relaypoint={ relaypoint } 
                            setTooltip={ setRelaypointTooltip } 
                            setPopup={ setRelaypointPopup }
                        />
                })
            }
            <RelaypointTooltip
                relaypoint={ relayPointTooltip } 
                informations={ informations } 
            />
            <RelaypointPopup
                relaypoint={ relayPointPopup } 
                informations={ informations } 
                objectDiscount={ objectDiscount }
                setInformations={ setInformations } 
                setCondition={ setCondition } 
                setViewport={ setViewport } 
                setPopup={ setRelaypointPopup } 
                setTooltip={ setRelaypointTooltip } 
                onClear={ onClear }
                setDiscount={ setDiscount }
                setObjectDiscount={ setObjectDiscount }
                setIsRelaypoint={ setIsRelaypoint }
            />
        </>
    );
}
 
export default RelaypointTools;