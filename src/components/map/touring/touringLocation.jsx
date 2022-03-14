import 'src/assets/css/map.css';
import React, { useContext, useEffect, useState } from 'react';
import { StaticMap } from 'react-map-gl';
import mapboxgl from "mapbox-gl";
import DeckGL, { IconLayer } from "deck.gl";
import TouringActions from 'src/services/TouringActions';
import DeliveryContext from 'src/contexts/DeliveryContext';
import AuthContext from 'src/contexts/AuthContext';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const TouringLocation = (props) => {

    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const Truck = "/assets/img/icon-img/package.png";
    const { selectedCatalog } = useContext(AuthContext);
    const { tourings, setTourings } = useContext(DeliveryContext);
    const [defaultView, setDefaultView] = useState({ latitude: selectedCatalog.center[0], longitude: selectedCatalog.center[1], zoom: 9.4});
    const [viewport, setViewport] = useState(defaultView);

    useEffect(() => fetchTourings(), []);

    const fetchTourings = () => {
        TouringActions
            .getProcessingTourings()
            .then(response => setTourings(response));
    };

    const layers = [
        new IconLayer({
            id: "truck",
            data: tourings,
            pickable: false,
            iconAtlas: Truck,
            iconMapping: { truck: { x: 0, y: 0, width: 512, height: 512 } },
            sizeScale: 30,
            getPosition: d => [d.position[1], d.position[0]],
            getIcon: d => "truck",
        })
    ];

    return (
        <DeckGL initialViewState={ viewport } controller={ true } layers={ layers }>
            <StaticMap mapboxApiAccessToken={ apiToken } width="100vw" height="100vh"/>
        </DeckGL>
    );
}
 
export default TouringLocation;