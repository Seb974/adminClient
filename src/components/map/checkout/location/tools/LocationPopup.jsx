import React, { useContext, useEffect, useState } from 'react';
import { Popup, FlyToInterpolator } from 'react-map-gl';
import { getCityCondition } from 'src/helpers/map';
import { isDefined, isSameAddress } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import DeliveryContext from 'src/contexts/DeliveryContext';

const LocationPopup = ({ location, informations, setViewport, setPopup, onClear, setIsRelaypoint, isRelaypoint, updatePosition }) => {

    const { settings } = useContext(AuthContext);
    const { condition, cities } = useContext(DeliveryContext);
    const [ownPosition, setOwnPosition] = useState([]);
    const initialPosition = [-21.065285, 55.480270];
    const [ownCondition, setOwnCondition] = useState(undefined);
    const [ownInformations, setOwnInformations] = useState(undefined);

    useEffect(() => {
        if (ownPosition.length > 0 && !isRelaypoint)
            setOwnPosition(informations.position);
    }, []);

    useEffect(() => {
        if (isDefined(location) && (!isDefined(ownInformations) || JSON.stringify(location.position) !== JSON.stringify(ownPosition))) {
                setOwnPosition(location.position);
                setOwnInformations(location);
                setOwnCondition(getCityCondition(location.zipcode, cities, settings));
        }
    }, [location]);

    useEffect(() => {
        if (ownPosition.length > 0 && !isDefined(ownCondition))
            setOwnCondition(condition);
    }, [condition]);

    const handleClick = () => {
        const suggestion = {latlng: {lat: ownInformations.position[0], lng: ownInformations.position[1]}, value: ownInformations.address, postcodes: [ownInformations.zipcode], city: ownInformations.city, force: true};
        setIsRelaypoint(false);
        setViewport({
            latitude: ownInformations.position[0],
            longitude: ownInformations.position[1],
            zoom: 17,
            transitionDuration: 1800,
            transitionInterpolator: new FlyToInterpolator(),
        });
        updatePosition(suggestion);
        setPopup(undefined);
    };

    const onDeleteSelection = () => {
        setViewport({
            latitude: initialPosition[0],
            longitude: initialPosition[1],
            zoom: 9,
            transitionDuration: 1500,
            transitionInterpolator: new FlyToInterpolator(),
        });
        onClear();
        setPopup(undefined);
    };

    return !isDefined(location) ? <></> : (
        <Popup latitude={location.position[0]} longitude={location.position[1]} offsetLeft={10} offsetTop={-35} closeOnClick={ false } onClose={() => setPopup(undefined)}>
            <div className="d-flex flex-column align-items-center">
                 <h5 className="mb-0 mt-1">Votre adresse</h5>
                 { !isDefined(ownCondition) || !isDefined(ownCondition.days) ? <></> :
                    <p className="mb-0 mt-1 text-center"> Livrable les { " " }
                        { ownCondition.days.map((day, i) => {
                            return day.label + ( i < (ownCondition.days.length - 2) ? ", " : (i === (ownCondition.days.length - 2) ? " et " : ""))
                        })}
                    </p>
                 }
                 { !isSameAddress(ownInformations, informations) ?
                     <button className="btn btn-primary" onClick={ handleClick }>Choisir</button> :
                     <button className="btn btn-warning" onClick={ onDeleteSelection }>Effacer ma sélection</button>
                 }
             </div>
        </Popup>
    );
}

export default LocationPopup;