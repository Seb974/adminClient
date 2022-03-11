import React, { useEffect, useState } from 'react';
import AgentActions from '../../../services/AgentActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Agents = (props) => {

    const itemsPerPage = 5;
    const fields = ['name', 'role', ' '];
    const [agents, setAgents] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedAgents(), []);
    useEffect(() => getDisplayedAgents(), [search]);
    useEffect(() => getDisplayedAgents(currentPage), [currentPage]);

    const getDisplayedAgents = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedAgents(search, page) : await getAgents(page);
        if (isDefined(response)) {
            setAgents(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getAgents = (page = 1) => page >=1 ? AgentActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedAgents = (word, page = 1) => AgentActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalAgents = [...agents];
        setAgents(agents.filter(day => day.id !== id));
        AgentActions
            .delete(id)
            .catch(error => {
                setAgents(originalAgents);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des membres de l'équipe
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/agents/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ agents }
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
                  item => <td><Link to={ "/components/agents/" + item.id }>{ item.name }</Link></td>
                ,
                'role':
                  item => <td>{ item.name }</td>
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
 
export default Agents;