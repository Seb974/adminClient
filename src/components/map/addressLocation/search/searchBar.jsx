import React, { useContext } from 'react';
import { FlyToInterpolator } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import AuthContext from 'src/contexts/AuthContext';
import { isDefined } from 'src/helpers/utils';

const SearchBar = ({ mapRef, containerRef, informations, setViewport, updatePosition, errors }) => {

    const { country } = useContext(AuthContext);

    const searchParams = { 
        mapboxApiAccessToken: process.env.REACT_APP_MAPBOX_TOKEN, 
        countries: country, 
        language: "fr", 
        minLength: 6, 
        marker: false,
        limit: 5,
        types: "address, postcode"
    };

    const onResult = ({ result }) => {
        const { center, place_name, context } = result;
        const postcode = context.find(data => data.id.includes("postcode"));
        const city = context.find(data => data.id.includes("place"));
        const suggestion = {
            latlng: {lat: center[1], lng: center[0]}, 
            value: place_name, 
            postcodes: [isDefined(postcode) ? postcode.text : ""], 
            city: isDefined(city) ? city.text : ""
        };
        const view = {
            latitude: center[1],
            longitude: center[0],
            zoom: 17,
            transitionDuration: 1800,
            transitionInterpolator: new FlyToInterpolator()
        };
        setViewport(view);
        updatePosition(suggestion);
    }

    return (
            <Geocoder 
                mapRef={ mapRef } 
                containerRef={ containerRef } 
                onResult={ onResult } 
                inputValue={ "" } 
                placeholder={ isDefined(informations.address) && informations.address.length > 0 ? informations.address : "Adresse" } 
                {...searchParams}
            />
    );
}
 
export default SearchBar;