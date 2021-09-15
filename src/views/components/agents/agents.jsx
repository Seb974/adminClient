import React, { useEffect, useState } from 'react';
import AgentActions from '../../../services/AgentActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Agents = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', 'role', ' '];
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        AgentActions.findAll()
            .then(response => setAgents(response))
            .catch(error => console.log(error.response));
    }, []);

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
              pagination
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