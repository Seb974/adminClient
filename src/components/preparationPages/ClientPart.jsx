import React from 'react';
import Map from '../map/checkout/Map';
import ContactPanel from '../userPages/ContactPanel';

const ClientPart = ({ user, informations, objectDiscount, displayedRelaypoints, setUser, setInformations, setDiscount, setObjectDiscount, errors, catalog }) => {
    
    const onPhoneChange = value => {
        setInformations({...informations, phone: value});
    };
    
    return (
        <>
            <ContactPanel user={ user } phone={ informations.phone } onUserChange={ setUser } onPhoneChange={ onPhoneChange } errors={ errors } label={ " " }/>
            <Map informations={ informations } setInformations={ setInformations } errors={ errors } displayedRelaypoints={ displayedRelaypoints } setDiscount={ setDiscount } objectDiscount={ objectDiscount } setObjectDiscount={ setObjectDiscount } catalog={ catalog }/>
        </>
    );
}
 
export default ClientPart;