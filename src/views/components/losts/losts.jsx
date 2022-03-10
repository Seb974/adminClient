import React, { useEffect, useState } from 'react';
import LostActions from '../../../services/LostActions';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCardFooter } from '@coreui/react';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';

const Losts = (props) => {

    const itemsPerPage = 5;
    const fields = ['number', 'lostDate', 'quantity', 'comments', ' '];
    const [loading, setLoading] = useState(false);
    const [losts, setLosts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    useEffect(() => getDisplayedLosts(), [dates]);
    useEffect(() => getDisplayedLosts(currentPage), [currentPage]);

    const getDisplayedLosts = async (page = 1) => {
        const response = await getLosts(page);
        if (isDefined(response)) {
            setLosts(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getLosts = (page = 1) => {
      if (page >=1) {
          try {
              setLoading(true);
              return LostActions.findBetweenPaginated(getUTCDates(), page, itemsPerPage);
          } catch (error) {
              return new Promise((resolve, reject) => resolve(null))
          } finally {
              setLoading(false);
          }
      } 
      return new Promise((resolve, reject) => resolve(null))
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])) {
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleDelete = (id) => {
        const originalLosts = [...losts];
        setLosts(losts.filter(article => article.id !== id));
        LostActions
            .delete(id)
            .catch(error => {
                setLosts(originalLosts);
                console.log(error.response);
            });
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
  }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des pertes
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/losts/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
              <>
                <CRow>
                    <CCol xs="12" lg="6">
                    <RangeDatePicker
                        minDate={ dates.start }
                        maxDate={ dates.end }
                        onDateChange={ handleDateChange }
                        label="Date"
                        className = "form-control mb-3"
                    />
                    </CCol>
                </CRow>
                { loading ? 
                    <CRow>
                        <CCol xs="12" lg="12" className="text-center">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow>
                    :
                    <CDataTable
                      items={ losts }
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
                      scopedSlots = {{
                        'number':
                          item => <td style={{ width: '15%'}}><Link to={ "/components/losts/" + item.id }>{ item.number }</Link></td>
                        ,
                        'lostDate':
                          item => <td style={{ width: '10%'}}>{ new Date(item.lostDate).toLocaleDateString() }</td>
                        ,
                        'quantity':
                          item => <td style={{ width: '10%'}}>{ item.quantity }</td>
                        ,
                        'comments':
                          item => <td style={{ width: '55%'}}>{ item.comments }</td>
                        ,
                        ' ':
                          item =><td style={{ width: '10%'}}><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
                      }}
                    />
                }
              </>
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Losts;