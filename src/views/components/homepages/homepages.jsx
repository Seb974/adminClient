import React, { useEffect, useState } from 'react';
import HomepageActions from '../../../services/HomepageActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Homepages = (props) => {

    const itemsPerPage = 3;
    const fields = ['name', ' '];
    const [homepages, setHomepages] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedHomepages(), []);
    useEffect(() => getDisplayedHomepages(), [search]);
    useEffect(() => getDisplayedHomepages(currentPage), [currentPage]);

    const getDisplayedHomepages = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedHomepages(search, page) : await getHomepages(page);
        if (isDefined(response)) {
            setHomepages(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getHomepages = (page = 1) => page >=1 ? HomepageActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedHomepages = (word, page = 1) => HomepageActions.findWord(word, page, itemsPerPage);

    const handleDelete = (homepageToDelete) => {
        const originalHomepages = [...homepages];
        setHomepages(homepages.filter(zone => zone.id !== homepageToDelete.id));
        HomepageActions
            .delete(homepageToDelete.id)
            .catch(error => {
                setHomepages(originalHomepages);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des pages d'accueil
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/homepages/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ homepages }
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
                  item => <td><Link to={ "/components/homepages/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item => <td><CButton block color="danger" onClick={ () => handleDelete(item) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Homepages;