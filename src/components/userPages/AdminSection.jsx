import React, { useEffect, useState } from 'react';
import Field from '../forms/Field';
import Select from '../forms/Select';
import GroupActions from 'src/services/GroupActions';

const AdminSection = ({ user, onUserChange, errors}) => {

    const [groups, setGroups] = useState([]);

    useEffect(() => fetchGroups(), []);

    const fetchGroups = () => {
        GroupActions.findAll()
                    .then(response => setGroups(response.filter(group => group.hasShopAccess)))
                    .catch(error => window.location.replace("/components/users"));
    };

    const handleUserChange = ({ currentTarget }) => {
        onUserChange({...user, [currentTarget.name]: currentTarget.value});
    };

    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    <Field
                        name="password"
                        type="password"
                        label="Mot de passe"
                        value={ user.password }
                        error={ errors.password }
                        onChange={ handleUserChange }
                    />
                </div>
                <div className="col-md-6 mb-5">
                    <Field
                        name="confirmPassword"
                        type="password"
                        label="Confirmation"
                        placeholder="Confirmation du mot de passe"
                        value={ user.confirmPassword }
                        error={ errors.confirmPassword }
                        onChange={ handleUserChange }
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <Select name="roles" label="Catégorie d'utilisateur" value={ user.roles } error={ errors.category } onChange={ handleUserChange }>
                        { groups.map(role => <option key={ role.id } value={ role.value }>{ role.label }</option> ) }
                    </Select>
                </div>
            </div>
        </>
    );
}
 
export default AdminSection;