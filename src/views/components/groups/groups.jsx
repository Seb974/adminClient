import React, { useEffect, useState } from 'react';
import GroupActions from '../../../services/GroupActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Groups = (props) => {

    const itemsPerPage = 50;
    const fields = ['label', ' '];
    const [groups, setGroups] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedGroups(), []);
    useEffect(() => getDisplayedGroups(), [search]);
    useEffect(() => getDisplayedGroups(currentPage), [currentPage]);

    const getDisplayedGroups = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedGroups(search, page) : await getGroups(page);
        if (isDefined(response)) {
            setGroups(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getGroups = (page = 1) => page >=1 ? GroupActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedGroups = (word, page = 1) => GroupActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalGroups = [...groups];
        setGroups(groups.filter(group => group.id !== id));
        GroupActions.delete(id)
                       .catch(error => {
                            setGroups(originalGroups);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des groupes d'utilisateurs
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/groups/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ groups }
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
                'label':
                  item => <td><Link to={ "/components/groups/" + item.id }>{ item.label }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" disabled={ item.isFixed } onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Groups;