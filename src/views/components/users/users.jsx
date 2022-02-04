import React, { useEffect, useState } from 'react'
import UserActions from '../../../services/UserActions'
import Roles from '../../../config/Roles'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Users = (props) => {

    const itemsPerPage = 3;
    const fields = ['name', 'email', 'roles', ' '];
    const [users, setUsers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedUsers(), []);
    useEffect(() => getDisplayedUsers(), [search]);
    useEffect(() => getDisplayedUsers(currentPage), [currentPage]);

    const getDisplayedUsers = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedUsers(search, page) : await getUsers(page);
        if (isDefined(response)) {
            setUsers(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getUsers = (page = 1) => page >=1 ? UserActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedUsers = (word, page = 1) => UserActions.findWord(word, page, itemsPerPage);

    const getBadge = role => {
      const name = role.toUpperCase();
      return name.includes('ADMIN') ? 'danger' :
             name.includes('VIP') ? 'warning' :
             name.includes('USER') ? 'secondary' : 'success';
    };

    const handleDelete = (id) => {
      const originalUsers = [...users];
      setUsers(users.filter(user => user.id !== id));
      UserActions.delete(id)
                 .catch(error => {
                      setUsers(originalUsers);
                      console.log(error.response);
                 });
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
              <CRow>
                  <CCol col="6">
                    Liste des utilisateurs
                  </CCol>
                  <CCol col="6" sm="4" md="2" className="text-right">
                      <Link role="button" to="/components/users/new" block variant="outline" color="success">CRÉER</Link>
                  </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ users }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination={{
                'pages': Math.ceil(totalItems / itemsPerPage),
                'activePage': currentPage,
                'onActivePageChange': page => setCurrentPage(page),
                'align': 'center',
                'dots': true,
                'className': Math.ceil(totalItems / itemsPerPage) > 1 ? "d-block" : "d-none"
              }}
              tableFilter
              onTableFilterChange={ word => setSearch(word) }
              scopedSlots = {{
                'name':
                  item => <td><Link to={"/components/users/" + item.id}>{ item.name }</Link></td>
                ,
                'roles':
                  item => (
                    <td>
                        <CBadge color={ getBadge(Roles.filterRoles(item.roles)) }>
                            { (Roles.filterRoles(item.roles)).substring(5).replace('_', ' ',) }
                        </CBadge>
                    </td>
                ),
                ' ':
                  item => <td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}

export default Users;