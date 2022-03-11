import React, { useEffect, useState } from 'react';
import PromotionActions from '../../../services/PromotionActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Promotions = (props) => {

    const itemsPerPage = 3;
    const fields = ['name', 'usage', 'validity', ' '];
    const [promotions, setPromotions] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedPromotions(), []);
    useEffect(() => getDisplayedPromotions(), [search]);
    useEffect(() => getDisplayedPromotions(currentPage), [currentPage]);

    const getDisplayedPromotions = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedPromotions(search, page) : await getPromotions(page);
        if (isDefined(response)) {
            setPromotions(response['hydra:member'].filter(p => p.code !== "relaypoint"));
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getPromotions = (page = 1) => page >=1 ? PromotionActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedPromotions = (word, page = 1) => PromotionActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalPromotions = [...promotions];
        setPromotions(promotions.filter(p => p.id !== id));
        PromotionActions
            .delete(id)
            .catch(error => {
                setPromotions(originalPromotions);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des coupons de réduction
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/promotions/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ promotions }
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
                  item => <td><Link to={ "/components/promotions/" + item.id }>{ item.code }</Link></td>
                ,
                'usage':
                  item => <td>{ item.used } / { item.maxUsage }</td>
                ,
                'validity':
                  item => <td>{ item.used < item.maxUsage && (new Date(item.endsAt)).getTime() > (new Date()).getTime() ? "En cours" : "Périmé" }</td>
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
 
export default Promotions;