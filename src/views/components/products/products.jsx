import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../../contexts/ProductsContext'
import ProductActions from '../../../services/ProductActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

const Products = (props) => {

    const itemsPerPage = 3;
    const fields = ['name', 'promo', ' '];
    const { currentUser } = useContext(AuthContext);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => getDisplayedProducts(), []);
    useEffect(() => getDisplayedProducts(), [search]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);

    const getDisplayedProducts = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedProducts(search, page) : await getProducts(page);
        if (isDefined(response)) {
            setDisplayedProducts(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getProducts = (page = 1) => page >=1 ? ProductActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedProducts = (word, page = 1) => ProductActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalProducts = [...displayedProducts];
        setDisplayedProducts(displayedProducts.filter(product => product.id !== id));
        ProductActions.delete(id)
                      .catch(error => {
                           setDisplayedProducts(originalProducts);
                           console.log(error.response);
                      });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des produits
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/products/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ displayedProducts }
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
                  item => <td>
                            <Link to={ "/components/products/" + item.id }>
                                { item.available ? <i className="fas fa-store mr-2 text-success"></i> : <i className="fas fa-store-slash mr-2 text-danger"></i> }
                                { item.name }
                            </Link>
                          </td>
                ,
                'promo':
                  item =>  <td>
                              { isDefined(item.discount) && item.discount > 0 && isDefined(item.offerEnd) && new Date(item.offerEnd) >= new Date() ?
                                  <CBadge color="warning">
                                      <span style={{ fontSize: "1.2em"}}>{ item.discount + " %" }</span>
                                  </CBadge>
                                : <>-</>
                              }
                          </td>
                ,
                ' ':
                  item => (
                      <td className="mb-3 mb-xl-0 text-center">
                          <CButton block color="danger" disabled={ !isAdmin && item.seller.users.find(user => user.id === currentUser.id) === undefined } onClick={ () => handleDelete(item.id) }>Supprimer</CButton>
                      </td>
                  )
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}

export default Products;