import React, { useContext } from 'react';
import { Route, Redirect } from "react-router-dom";
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { CContainer, CFade } from '@coreui/react'

const AdminRoute = ({ path, component, exact=false, name="", key=1 }) => {
    const { isAuthenticated, currentUser } = useContext(AuthContext);
    return isAuthenticated && Roles.hasPrivileges(currentUser) ?
        <CFade>
            <Route key={ key } path={ path } component={ component } name={ name } exact={ exact }/>
        </CFade> :
        <Redirect to="/login" />
}
 
export default AdminRoute;