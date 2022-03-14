import React, { useEffect, useState } from 'react';
import CatalogActions from '../../../services/CatalogActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Catalogs = (props) => {

    const itemsPerPage = 50;
    const fields = ['name', 'code', 'etat', ' '];
    const [catalogs, setCatalogs] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedCatalogs(), []);
    useEffect(() => getDisplayedCatalogs(), [search]);
    useEffect(() => getDisplayedCatalogs(currentPage), [currentPage]);

    const getDisplayedCatalogs = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedCatalogs(search, page) : await getCatalogs(page);
        if (isDefined(response)) {
            setCatalogs(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getCatalogs = (page = 1) => page >=1 ? CatalogActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedCatalogs = (word, page = 1) => CatalogActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalCatalogs = [...catalogs];
        setCatalogs(catalogs.filter(catalog => catalog.id !== id));
        CatalogActions.delete(id)
                       .catch(error => {
                            setCatalogs(originalCatalogs);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des catalogues
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/catalogs/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ catalogs }
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
                  item => <td><Link to={ "/components/catalogs/" + item.id }>{ item.name }</Link></td>
                ,
                'code':
                  item => <td><Link to={ "/components/catalogs/" + item.id }>{ item.code }</Link></td>
                ,
                'etat':
                  item => <td>{ item.isActive ? "Actif" : "-" }</td>
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
 
export default Catalogs;