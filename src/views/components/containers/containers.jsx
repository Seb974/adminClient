import React, { useEffect, useState } from 'react';
import ContainerActions from '../../../services/ContainerActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Containers = (props) => {

    const itemsPerPage = 50;
    const fields = ['name', ' '];
    const [containers, setContainers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedContainers(), []);
    useEffect(() => getDisplayedContainers(), [search]);
    useEffect(() => getDisplayedContainers(currentPage), [currentPage]);

    const getDisplayedContainers = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedContainers(search, page) : await getContainers(page);
        if (isDefined(response)) {
            setContainers(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getContainers = (page = 1) => page >=1 ? ContainerActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedContainers = (word, page = 1) => ContainerActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalContainers = [...containers];
        setContainers(containers.filter(container => container.id !== id));
        ContainerActions.delete(id)
                       .catch(error => {
                            setContainers(originalContainers);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des colis
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/containers/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ containers }
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
                  item => <td><Link to={ "/components/containers/" + item.id }>{ item.name }</Link></td>
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
 
export default Containers;