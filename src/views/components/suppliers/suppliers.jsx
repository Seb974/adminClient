import React, { useEffect, useState } from 'react';
import SupplierActions from '../../../services/SupplierActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Suppliers = (props) => {

    const itemsPerPage = 3;
    const fields = ['seller', 'name', ' '];
    const [suppliers, setSuppliers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedSuppliers(), []);
    useEffect(() => getDisplayedSuppliers(), [search]);
    useEffect(() => getDisplayedSuppliers(currentPage), [currentPage]);

    const getDisplayedSuppliers = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedSuppliers(search, page) : await getSuppliers(page);
        if (isDefined(response)) {
            setSuppliers(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getSuppliers = (page = 1) => page >=1 ? SupplierActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedSuppliers = (word, page = 1) => SupplierActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalSuppliers = [...suppliers];
        setSuppliers(suppliers.filter(supplier => supplier.id !== id));
        SupplierActions.delete(id)
                       .catch(error => {
                            setSuppliers(originalSuppliers);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des fournisseurs
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/suppliers/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ suppliers }
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
                'seller':
                  item => <td>{ isDefined(item.seller) && isDefined(item.seller.name) ? item.seller.name : "-" }</td>
                ,
                'name':
                  item => <td><Link to={ "/components/suppliers/" + item.id }>{ item.name }</Link></td>
                ,
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
 
export default Suppliers;