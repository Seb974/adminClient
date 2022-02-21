import React, { useContext, useEffect, useState } from 'react';
import SellerActions from '../../../services/SellerActions';
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';

const Sellers = (props) => {

    const itemsPerPage = 3;
    const { currentUser } = useContext(AuthContext);
    const fields = ['name', 'turnover', 'totalToPay', ' '];
    const [sellers, setSellers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedSellers(), []);
    useEffect(() => getDisplayedSellers(), [search]);
    useEffect(() => getDisplayedSellers(currentPage), [currentPage]);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    const getDisplayedSellers = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedSellers(search, page) : await getSellers(page);
        if (isDefined(response)) {
            setSellers(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getSellers = (page = 1) => page >=1 ? SellerActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedSellers = (word, page = 1) => SellerActions.findWord(word, page, itemsPerPage);  

    const handleDelete = (id) => {
        const originalSellers = [...sellers];
        setSellers(sellers.filter(city => city.id !== id));
        SellerActions
            .delete(id)
            .catch(error => {
                setSellers(originalSellers);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des vendeurs
                { isAdmin &&
                  <CCol col="6" sm="4" md="2" className="ml-auto">
                      <Link role="button" to="/components/sellers/new" block variant="outline" color="success">CRÉER</Link>
                  </CCol>
                }
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ sellers }
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
                  item => <td><Link to={ "/components/sellers/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Sellers;