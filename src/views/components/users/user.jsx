import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AddressPanel from 'src/components/userPages/AddressPanel';
import AdminSection from 'src/components/userPages/AdminSection';
import ContactPanel from 'src/components/userPages/ContactPanel';
import AuthContext from 'src/contexts/AuthContext';
import UserActions from 'src/services/UserActions';
import Roles from 'src/config/Roles';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

const UserPage = ({ history, match }) => {

    const { id = "new" } = match.params;
    const { currentUser } = useContext(AuthContext);
    const initialInformations =  AddressPanel.getInitialInformations();
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState({name:"", email: "", password: "", confirmPassword: "", roles: "ROLE_USER"});
    const [informations, setInformations] = useState(initialInformations);
    const [errors, setErrors] = useState({name:"", email: "", password: "", confirmPassword: "", phone: "", address: "", address2: "", zipcode: "", city: "", position: "", roles: ""});

    useEffect(() => fetchUser(id), []);
    useEffect(() => fetchUser(id), [id]);

    const fetchUser = async id => {
        if (id !== undefined && id !== "new") {
            setEditing(true);
            try {
                const newUser = await UserActions.find(id);
                setUser(user => {
                    return {...newUser,
                                roles: !isDefinedAndNotVoid(newUser.roles) ? Roles.getDefaultRole() : Roles.filterRoles(newUser.roles),
                                password: user.password,
                                confirmPassword: user.confirmPassword
                            };
                    });
                if (newUser.metas !== null && newUser.metas !== undefined) {
                    let userMetas = {...informations};
                    Object.entries(newUser.metas).forEach(([key, value]) => {
                        if (key !== 'position')
                            userMetas = {...userMetas, [key]: (value !== null && value !== undefined) ? value : initialInformations[key]}
                        else
                            userMetas = {...userMetas, position: value !== null && value !== undefined && value > 0 ? value : initialInformations.position}
                    });
                    setInformations(userMetas);
                }
            } catch (error) {
                console.log(error.response);
                // TODO : Notification flash d'une erreur
                history.replace("/components/users");
            }
        }
    };

    const onInformationsChange = (newInformations) => setInformations(newInformations);
    const onUserInputChange = (newUser) => setUser(newUser);

    const onUpdatePosition = (newInformations) => {
        setInformations(informations => { 
            return {...newInformations, address2: informations.address2, phone: informations.phone};
        });
    };

    const onPhoneChange = (phone) => {
        setInformations(informations => { 
            return {...informations, phone}
        });
    };

    const getFormattedUser = () => {
        let updatedUser = {};
        const { name, email, password, confirmPassword, metas, roles } = user;
        if (password.length > 0 || confirmPassword.length > 0) {
            if (password !== confirmPassword) {
                setErrors({...errors, confirmPassword: "Les mots de passe saisis ne correspondent pas."});
                return null;
            } else {
                updatedUser = {...updatedUser, password};
            }
        } else if (!editing) {
            setErrors({...errors, password: "Un mot de passe est obligatoire."});
            return null;
        }
        return {...updatedUser, name, email,
                    metas: metas === null || metas === undefined || metas.id === null || metas.id === undefined ? informations : {...informations, id: metas.id},
                    roles: Array.isArray(roles) ? roles : [roles],
        };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let apiErrors = {};
        const updatedUser = getFormattedUser();
        if (updatedUser !== null) {
            const request = !editing ? UserActions.create(updatedUser) : UserActions.update(id, updatedUser);
            request.then(response => {
                        setErrors({});
                        //TODO : Flash notification de succès
                        history.replace("/components/users");
                    })
                   .catch( ({ response }) => {
                        const { violations } = response.data;
                        if (violations) {
                            violations.forEach(({propertyPath, message}) => {
                                apiErrors[propertyPath] = message;
                            });
                            setErrors(apiErrors);
                        }
                         //TODO : Flash notification d'erreur
                   });
        }
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un utilisateur" : "Modifier l'utilisateur " + user.name }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <ContactPanel user={ user } phone={ informations.phone } onUserChange={ onUserInputChange } onPhoneChange={ onPhoneChange } errors={ errors }/>
                            { Roles.hasAllPrivileges(currentUser) && 
                                <AdminSection user={ user } onUserChange={ onUserInputChange } errors={ errors } />
                            }
                            <hr/>
                            <CRow>
                                <h4>Adresse</h4>
                            </CRow>
                            {/* <AddressPanel informations={ informations } onInformationsChange={ onInformationsChange } onPositionChange={ onUpdatePosition } errors={ errors }/> */}
                            <AddressPanel informations={ informations } setInformations={ setInformations } errors={ errors } />
                            <CRow>
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/users" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default UserPage;