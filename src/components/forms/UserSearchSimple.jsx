import React from 'react';
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup';
import { CCol, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import UserSearch from 'src/components/forms/UserSearch';
import '../../assets/css/searchBar.css';
import { isDefined } from 'src/helpers/utils';

const UserSearchSimple = ({ user, setUser, label="Utilisateur associé" }) => {

    const handleDelete = e => {
        e.preventDefault();
        setUser(null);
    };

    return (
        <>
            <CRow className="ml-2 my-4">
                <CLabel htmlFor="name">{ label }</CLabel>
            </CRow>
            <CRow className="mt-4">
                <CCol xs="12" sm="12" md="6">
                    <UserSearch value={ user } setValue={ setUser }/>
                </CCol>
                <CCol xs="12" sm="12" md="6">
                    <Card >
                        <ListGroup variant="flush">
                            { !isDefined(user) ?
                                <ListGroup.Item className="text-center">
                                    <small><i>Aucun utilisateur associé</i></small>
                                </ListGroup.Item>
                             :
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <div>{ user.name } <small> - { user.email }</small></div>
                                    <div><a href="#" id={ user.id } onClick={ handleDelete }><CIcon name="cil-trash"/></a></div>
                                </ListGroup.Item>
                            }
                        </ListGroup>
                    </Card>
                </CCol>
            </CRow>
        </>
    );
}
 
export default UserSearchSimple;