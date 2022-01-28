import React from 'react';
import Field from '../forms/Field';
import Map from '../map/addressLocation/Map';

const initialPosition = [-21.329519, 55.471617];
const initialInformations = { phone: '', address: '', address2: '', zipcode: '', city: '', position: initialPosition};

const AddressPanel = ({ informations, setInformations, errors }) => {

    const onChange = ({ currentTarget }) => setInformations({...informations, [currentTarget.name]: currentTarget.value});

    return (
        <>
            <Map informations={ informations } setInformations={ setInformations } errors={ errors }/>
            <div className="row">
                <div className="col-md-12">
                    <Field
                        name="address2"
                        label=" "
                        value={ informations.address2 }
                        onChange={ onChange }
                        placeholder="N° d'appart, digicode..."
                        error={ errors.address2 }
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Field 
                        name="zipcode"
                        label=" "
                        value={ informations.zipcode }
                        onChange={ onChange }
                        placeholder="Code postal"
                        error={ errors.zipcode }
                        maxLength={ 5 }
                    />
                </div>
                <div className="col-md-6">
                    <Field
                        name="city"
                        label=" "
                        value={ informations.city }
                        onChange={ onChange }
                        placeholder="Ville"
                        error={ errors.city }
                    />
                </div>
            </div>
        </>
    );
}

AddressPanel.getInitialPosition = () => {
    return initialPosition;
}

AddressPanel.getInitialInformations = () => {
    return initialInformations;
}
 
export default AddressPanel;