import React, { useEffect, useState } from 'react';
import PriceGroupActions from '../../../services/PriceGroupActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const PriceGroups = (props) => {

    const itemsPerPage = 2;
    const fields = ['name', ' '];
    const [priceGroups, setPriceGroups] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedGroups(), []);
    useEffect(() => getDisplayedGroups(), [search]);
    useEffect(() => getDisplayedGroups(currentPage), [currentPage]);

    const getDisplayedGroups = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedGroups(search, page) : await getGroups(page);
        if (isDefined(response)) {
            setPriceGroups(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getGroups = (page = 1) => page >=1 ? PriceGroupActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedGroups = (word, page = 1) => PriceGroupActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalPriceGroups = [...priceGroups];
        setPriceGroups(priceGroups.filter(group => group.id !== id));
        PriceGroupActions.delete(id)
                       .catch(error => {
                            setPriceGroups(originalPriceGroups);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des groupes de prix
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/price_groups/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ priceGroups }
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
                  item => <td><Link to={ "/components/price_groups/" + item.id }>{ item.name }</Link></td>
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
 
export default PriceGroups;