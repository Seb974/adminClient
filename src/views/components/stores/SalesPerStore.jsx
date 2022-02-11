import React, { useEffect, useState } from 'react';
import StoreActions from '../../../services/StoreActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { useContext } from 'react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import Spinner from 'react-bootstrap/Spinner';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';

const SalesPerStore = (props) => {

    const itemsPerPage = 10;
    const fields = ['name', 'TOTAL', 'CB', 'ESP', 'CHE'];
    const [stores, setStores] = useState([]);
    const [turnovers, setTurnovers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [loading, setLoading] = useState(false);

    useEffect(() => getDisplayedStores(), []);
    useEffect(() => getDisplayedStores(currentPage), [currentPage]);

    useEffect(() => {
        if (isDefinedAndNotVoid(stores)) {
          getTurnovers();
        } else {
          setLoading(false);
        }
    }, [stores, dates]);

    const getTurnovers = async () => {
        try {
          const UTCDates = getUTCDates(dates);
          const newTurnovers = await Promise.all(stores.map( async store => {
              const turnover = await StoreActions.getTurnover(store, UTCDates);
              return {...store, turnover};
          }));
          setTurnovers(newTurnovers);
          setLoading(false);
          return newTurnovers;
        } catch (e) {
          setLoading(false);
        }
    };

    const getUTCDates = () => {
      const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
      const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
      return {start: UTCStart, end: UTCEnd};
  };

    const getDisplayedStores = async (page = 1) => {
      try {
          setLoading(true);
          const response = await getStores(page);
          if (isDefined(response)) {
              setStores(response['hydra:member']);
              setTotalItems(response['hydra:totalItems']);
          }
      } catch(e) {
          setLoading(false);
      } 
    };

    const getStores = (page = 1) => page >=1 ? StoreActions.findAllPaginated(page, itemsPerPage) : undefined;

    const handleDateChange = datetime => {
      if (isDefined(datetime[1])) {
          setLoading(true);
          const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
          const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
          setDates({start: newStart, end: newEnd});
      }
  };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des boutiques physiques
            </CCardHeader>
            <CCardBody>
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
                items={ turnovers }
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
                  'name':
                    item => <td>{ item.name }</td>
                  ,
                  'TOTAL':
                    item => <td>{ item.turnover['TOTAL'].toFixed(2) } €</td>
                  ,
                  'CB':
                    item => <td>{ item.turnover['CB'].toFixed(2) } €</td>
                  ,
                  'ESP':
                    item => <td>{ item.turnover['ESP'].toFixed(2) } €</td>
                  ,
                  'CHE':
                    item => <td>{ item.turnover['CHE'].toFixed(2) } €</td>
                }}
              />
            }
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default SalesPerStore;