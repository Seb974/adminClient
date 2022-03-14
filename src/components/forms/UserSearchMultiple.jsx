import React from 'react';
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup';
import { CCol, CLabel, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import UserSearch from 'src/components/forms/UserSearch';
import '../../assets/css/searchBar.css';

const UserSearchMultiple = ({ users, setUsers, title = "Utilisateurs associés", label = "Utilisateurs associés", noUserMessage="Aucun utilisateur associé" }) => {

    const handleDelete = e => {
        e.preventDefault();
        setUsers(users.filter(user => user.id !== parseInt(e.currentTarget.id)));
    };

    return (
        <>
            <hr className="mx-2 my-4"/>
            <CRow className="ml-2">
                <CLabel htmlFor="name">{ label }</CLabel>
            </CRow>
            <CRow className="mt-4">
                <CCol xs="12" sm="12" md="6">
                    <UserSearch value={ users } setValue={ setUsers }/>
                </CCol>
                <CCol xs="12" sm="12" md="6">
                    <Card >
                        <Card.Header className="text-center"><strong>{ title }</strong></Card.Header>
                        <ListGroup variant="flush">
                            { users.length <= 0 ? 

                                <ListGroup.Item className="text-center">
                                    <small><i>{ noUserMessage }</i></small>
                                </ListGroup.Item>

                              : users.map(user => {
                                return (
                                    <ListGroup.Item key={ user.id } className="d-flex justify-content-between">
                                        <div>{ user.name } <small> - { user.email }</small></div>
                                        <div><a href="#" id={ user.id } onClick={ handleDelete }><CIcon name="cil-trash"/></a></div>
                                    </ListGroup.Item>
                                )})
                            }
                        </ListGroup>
                    </Card>
                </CCol>
            </CRow>
        </>
    );
}
 
export default UserSearchMultiple;