import React, { useState } from 'react';
import mapboxgl from "mapbox-gl";
import ReactMapGL, {GeolocateControl} from "react-map-gl";
import TouringActions from 'src/services/TouringActions';
import { shop } from 'src/helpers/checkout';
import { isDefined } from 'src/helpers/utils';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const TruckLocation = ({ touring, playing }) => {

    const refreshDelay = 1;
    const apiToken = process.env.REACT_APP_MAPBOX_TOKEN;
    const geolocateControlStyle= { right: 10, top: 10 };
    const [defaultView, setDefaultView] = useState({ latitude: 0, longitude: 0, zoom: 9});
    const [viewport, setViewport] = useState(defaultView);
    const [sentPosition, setSentPosition] = useState({position: shop.coordinates, lastSent: null});
    const [opering, setOpering] = useState(false);

    const onGeolocate = positionOptions => {
        const {coords, timestamp} = positionOptions;
        const { latitude, longitude } = coords;
        if (needsUpdate(timestamp) && !opering) {
            setOpering(true);
            TouringActions
                .updateTruckPosition(touring, [latitude, longitude])
                .then(response => {
                    setSentPosition({position: [latitude, longitude], lastSent: timestamp});
                    setOpering(false);
                })
                .catch(error => console.log(error));
        }
    };

    const needsUpdate = (newTimestamp) => {
        return !isDefined(sentPosition.lastSent) || (newTimestamp - sentPosition.lastSent) / 1000 > refreshDelay;
    }

    return !isDefined(touring) ? <></> : (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Ma tournée
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <ReactMapGL {...viewport} width="100vw" height="520px" onViewportChange={ setViewport } mapboxApiAccessToken={ apiToken }>
                                <GeolocateControl style={ geolocateControlStyle } positionOptions={{enableHighAccuracy: true}} trackUserLocation={ true } auto onGeolocate={ onGeolocate }/>
                            </ReactMapGL>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default TruckLocation;