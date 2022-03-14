import React, { useEffect, useState } from 'react';
import DayOffActions from '../../../services/DayOffActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const DaysOff = (props) => {

    const itemsPerPage = 50;
    const fields = ['name', 'date', ' '];
    const [daysOff, setDaysOff] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedDays(), []);
    useEffect(() => getDisplayedDays(), [search]);
    useEffect(() => getDisplayedDays(currentPage), [currentPage]);

    const getDisplayedDays = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedDays(search, page) : await getDays(page);
        if (isDefined(response)) {
            setDaysOff(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getDays = (page = 1) => page >=1 ? DayOffActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedDays = (word, page = 1) => DayOffActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalDaysOff = [...daysOff];
        setDaysOff(daysOff.filter(day => day.id !== id));
        DayOffActions.delete(id)
                       .catch(error => {
                            setDaysOff(originalDaysOff);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des jours à activité réduite
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/days_off/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ daysOff }
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
                  item => <td><Link to={ "/components/days_off/" + item.id }>{ item.name }</Link></td>
                ,
                'date':
                  item => <td>{ (new Date(item.date)).toLocaleDateString("fr-FR", {year:'numeric', month: 'numeric', day: 'numeric'}) }</td>
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
 
export default DaysOff;