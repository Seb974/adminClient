import React, { useEffect, useState } from 'react';
import RelaypointActions from '../../../services/RelaypointActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Relaypoints = (props) => {

    const itemsPerPage = 10;
    const fields = ['name', 'city', ' '];
    const [relaypoints, setRelaypoints] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedRelaypoints(), []);
    useEffect(() => getDisplayedRelaypoints(), [search]);
    useEffect(() => getDisplayedRelaypoints(currentPage), [currentPage]);

    const getDisplayedRelaypoints = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedRelaypoints(search, page) : await getRelaypoints(page);
        if (isDefined(response)) {
            setRelaypoints(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getRelaypoints = (page = 1) => page >=1 ? RelaypointActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedRelaypoints = (word, page = 1) => RelaypointActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalRelaypoints = [...relaypoints];
        setRelaypoints(relaypoints.filter(city => city.id !== id));
        RelaypointActions.delete(id)
                   .catch(error => {
                        setRelaypoints(originalRelaypoints);
                        console.log(error.response);
                   });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des points relais
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/relaypoints/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ relaypoints }
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
                  item => <td><Link to={ "/components/relaypoints/" + item.id }>{ item.name }</Link></td>
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
 
export default Relaypoints;