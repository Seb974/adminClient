import React, { useEffect, useState } from 'react';
import CIcon from '@coreui/icons-react';
import { CFormGroup, CInput, CInputGroupText, CInputGroupAppend, CInputGroup } from '@coreui/react';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import UserActions from 'src/services/UserActions';

const UserSearch = ({ value, setValue, history }) => {

    const [userSearch, setUserSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [hasResults, setHasResults] = useState(false);

    useEffect(() => {
        if (userSearch.length === 0)
            setSuggestions([]);
            setHasResults(false);
    }, [userSearch]);

    const handleUserSearch = ({ currentTarget }) => setUserSearch(currentTarget.value);

    const handleSearch = () => {
        UserActions
            .findUser(userSearch)
            .then(response => {
                const filteredResponse = !isDefinedAndNotVoid(value) ? response : Array.isArray(value) ? 
                        response.filter(suggestion => value.find(user => user.id === suggestion.id) === undefined) :
                        response.filter(suggestion => suggestion.id !== value.id);
                setSuggestions(filteredResponse);
                setHasResults(true);
            })
            .catch(error => history.replace('/'));
    };

    const handleSelect = ({ currentTarget }) => {
        const selectedUser = suggestions.find(user => user.id === parseInt(currentTarget.id));
        Array.isArray(value) ?
            setValue([...value, selectedUser]) : 
            setValue(selectedUser);
        setSuggestions([]);
        setUserSearch("");
        setHasResults(false);
    };

    return (
        <CFormGroup>
            <CInputGroup>
                <CInput
                    id="userSearch"
                    name="userSearch"
                    value={ userSearch }
                    onChange={ handleUserSearch }
                    placeholder="Rechercher..."
                />
                <CInputGroupAppend>
                    <CInputGroupText onClick={ handleSearch }>
                        <span className={ userSearch.length === 0 ? "" : "text-success" }>
                            <CIcon name="cil-magnifying-glass"/>
                        </span>
                    </CInputGroupText>
                </CInputGroupAppend>
            </CInputGroup>
            <div className="mapboxgl-ctrl-geocoder">
                <div className="suggestions-wrapper">
                    { !isDefinedAndNotVoid(suggestions) && !hasResults ? <></> :
                    !isDefinedAndNotVoid(suggestions) ?
                        <ul className="suggestions no-suggestion" >
                            <li>
                                <a>
                                    <div className="mapboxgl-ctrl-geocoder--suggestion">
                                        <div className="mapboxgl-ctrl-geocoder--suggestion-title"> </div>
                                        <div className="mapboxgl-ctrl-geocoder--suggestion-address">
                                            <small className="text-danger"><i>Aucun utilisateur ne correspond à votre recherche.</i></small>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    :
                        <ul className="suggestions" >
                            { suggestions.map(suggestion => {
                                return (
                                    <li key={ suggestion.id } onClick={ handleSelect } id={ suggestion.id }>
                                        <a>
                                            <div className="mapboxgl-ctrl-geocoder--suggestion">
                                                <div className="mapboxgl-ctrl-geocoder--suggestion-title">{ suggestion.name }</div>
                                                <div className="mapboxgl-ctrl-geocoder--suggestion-address">{ suggestion.email }</div>
                                            </div>
                                        </a>
                                    </li>
                                )})
                            }
                        </ul>

                    }
                </div>
            </div>
        </CFormGroup>
    );
}
 
export default UserSearch;