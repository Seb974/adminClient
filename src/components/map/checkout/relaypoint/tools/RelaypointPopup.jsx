import React, { useContext, useEffect, useState } from 'react';
import { Popup, FlyToInterpolator } from 'react-map-gl';
import AuthContext from 'src/contexts/AuthContext';
import { isDefined, isSameAddress } from 'src/helpers/utils';

const RelaypointPopup = ({ relaypoint, informations, setInformations, setCondition, setViewport, setPopup, onClear, setIsRelaypoint, setDiscount, objectDiscount, setObjectDiscount }) => {

    const { settings } = useContext(AuthContext);
    const initialPosition = [-21.065285, 55.480270];
    const [ownCondition, setOwnCondition] = useState(undefined);

    useEffect(() => {
        const relaypointCondition = !isDefined(relaypoint) ? [] : relaypoint.conditions.find(condition => {
            return condition.userGroups.find(group => group.value === settings.value) !== undefined;
        });
        setOwnCondition(relaypointCondition);
    }, [relaypoint]);

    const onSelect = e => {
            const { position, phone, user, ...mainMetas } = relaypoint.metas;
            const newCondition = relaypoint.conditions.find(condition => {
                return condition.userGroups.find(group => group.value === settings.value) !== undefined;
            });
            if (isDefined(relaypoint.promotion)) {
                setObjectDiscount(relaypoint.promotion);
                setDiscount(isDefined(relaypoint.promotion.discount) ? relaypoint.promotion.discount : 0);
            }
            setInformations({...informations, ...mainMetas});
            setCondition(newCondition);
            setViewport({
                latitude: relaypoint.metas.position[0],
                longitude: relaypoint.metas.position[1],
                zoom: 17,
                transitionDuration: 1500,
                transitionInterpolator: new FlyToInterpolator(),
            });
            setPopup(undefined);
            setIsRelaypoint(true);
        };

        const onDeleteSelection = () => {
            setViewport({
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                zoom: 9,
                transitionDuration: 1500,
                transitionInterpolator: new FlyToInterpolator(),
            });
            if (isDefined(objectDiscount)) {
                setDiscount(0);
            }
            onClear();
            setPopup(undefined);
        };


    return !isDefined(relaypoint) || !isDefined(ownCondition) || !isDefined(ownCondition.days) ? <></> : (
        <Popup latitude={relaypoint.metas.position[0]} longitude={relaypoint.metas.position[1]} offsetLeft={10} offsetTop={-35} closeOnClick={ false } onClose={() => setPopup(undefined)}>
            <div className="d-flex flex-column align-items-center">
                 <h5 className="mb-0 mt-1">{ relaypoint.name }</h5>
                 <p className="mb-0 mt-1 text-center"> Livré les { " " }
                     { ownCondition.days.map((day, i) => {
                         return day.label + ( i < (ownCondition.days.length - 2) ? ", " : (i === (ownCondition.days.length - 2) ? " et " : ""))
                     })}
                 </p>
                 <p className="mt-1">{ relaypoint.informations }</p>
                 { !isSameAddress(relaypoint.metas, informations) ?
                     <button className="btn btn-primary" onClick={ onSelect }>Choisir</button> :
                     <button className="btn btn-warning" onClick={ onDeleteSelection }>Effacer ma sélection</button>
                 }
             </div>
        </Popup>
    );
}
 
export default RelaypointPopup;