import React, { useEffect, useState } from 'react';
import StoreActions from '../../../services/StoreActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Stores = ({ history }) => {

    const itemsPerPage = 50;
    const fields = ['name', ' '];
    const [stores, setStores] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedStores(), []);
    useEffect(() => getDisplayedStores(), [search]);
    useEffect(() => getDisplayedStores(currentPage), [currentPage]);

    const getDisplayedStores = async (page = 1) => {
        try {
          const response = isDefined(search) && search.length > 0 ? await getSearchedStores(search, page) : await getStores(page);
          if (isDefined(response)) {
              setStores(response['hydra:member']);
              setTotalItems(response['hydra:totalItems']);
          }
        } catch (error) {
            history.replace("/");
        }
    };

    const getStores = (page = 1) => page >=1 ? StoreActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedStores = (word, page = 1) => StoreActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalStores = [...stores];
        setStores(stores.filter(city => city.id !== id));
        StoreActions
            .delete(id)
            .catch(error => setStores(originalStores));
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des boutiques physiques
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/stores/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ stores }
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
                  item => <td><Link to={ "/components/stores/" + item.id }>{ item.name }</Link></td>
                ,
                'city':
                  item => <td>{ item.metas.city }</td>
                ,
                ' ':
                  item =><td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Stores;