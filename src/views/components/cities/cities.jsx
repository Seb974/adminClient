import React, { useEffect, useState } from 'react';
import CityActions from '../../../services/CityActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Cities = (props) => {

    const itemsPerPage = 5;
    const fields = ['name', 'zipCode', ' '];
    const [cities, setCities] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedCities(), []);
    useEffect(() => getDisplayedCities(), [search]);
    useEffect(() => getDisplayedCities(currentPage), [currentPage]);

    const getDisplayedCities = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedCities(search, page) : await getCities(page);
        if (isDefined(response)) {
            setCities(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getCities = (page = 1) => page >=1 ? CityActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedCities = (word, page = 1) => CityActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalCities = [...cities];
        setCities(cities.filter(city => city.id !== id));
        CityActions.delete(id)
                   .catch(error => {
                        setCities(originalCities);
                        console.log(error.response);
                   });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des villes desservies
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/cities/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ cities }
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
                  item => <td><Link to={ "/components/cities/" + item.id }>{ item.name }</Link></td>
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
 
export default Cities;