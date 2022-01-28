import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup, CInputCheckbox, CLabel } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button';
import TouringDetails from 'src/components/touringPages/touringDetails';
import CIcon from '@coreui/icons-react';
import TouringActions from 'src/services/TouringActions';
import TruckLocation from 'src/components/map/touring/truckLocation';
import TouringLocation from 'src/components/map/touring/touringLocation';

const Tourings = (props) => {

    const itemsPerPage = 30;
    const fields = ['Livreur', 'Départ', 'Livraisons', 'Terminer', ' '];
    const { currentUser } = useContext(AuthContext);
    const [tourings, setTourings] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [playedTouring, setPlayedTouring] = useState(null);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        getTourings();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => {
        getTourings();
        setPlayedTouring(null);
    }, [dates]);

    const getTourings = () => {
        setLoading(true);
        const UTCDates = getUTCDates(dates);
        TouringActions
            .getOpenedTourings(UTCDates)
            .then(response =>{
                setTourings(response);
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }

    const handleDelete = item => {
        const originalTourings = [...tourings];
        setTourings(tourings.filter(order => order.id !== item.id));
        TouringActions.delete(item.id)
                      .catch(error => {
                           setTourings(originalTourings);
                           console.log(error.response);
                      });
    }

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
            newDetails.splice(position, 1)
        } else {
            newDetails = [...details, index]
        }
        setDetails(newDetails);
    }

    const getFormattedDateTime = date => {
        const backendDate = new Date(Date.parse(date));
        const timezoneOffset = parseInt( new Date(Date.parse(date)).getTimezoneOffset() );
        const formattedDate = new Date(backendDate.getFullYear(), backendDate.getMonth(), backendDate.getDate(), 
                              backendDate.getHours(), (backendDate.getMinutes() - timezoneOffset), backendDate.getSeconds());
        return formattedDate.toLocaleTimeString('fr-FR');
    };

    const handleStart = (touring) => setPlayedTouring(touring);

    const handleStop = () => setPlayedTouring(null);

    const handleSubmit = (touring) => {
        TouringActions
            .closeTouring(touring)
            .then(response => setTourings(tourings.filter(t => t.id !== touring.id)));
    }

    return (
        <>
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des commandes à livrer
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
                    { isAdmin &&
                        <CCol xs="12" lg="6" className="d-flex align-items-center pt-2">
                            <Button variant="primary" href="/#/components/tourings/visualization"><i className="fas fa-eye mr-2"></i>Visualiser</Button>
                        </CCol>
                    }
                </CRow>
                { loading ? 
                    <CRow>
                        <CCol xs="12" lg="12" className="text-center">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow> 
                    :
                    <CDataTable
                        items={ tourings }
                        fields={ fields }
                        bordered
                        itemsPerPage={ itemsPerPage }
                        pagination
                        scopedSlots = {{
                            'Livreur':
                                item => <td>
                                            <Link to="#" onClick={ e => { toggleDetails(item.id, e) }}>
                                                { isDefined(item.deliverer) ? item.deliverer.name : '-' }
                                            </Link>
                                        </td>
                            ,
                            'Départ':
                                item => <td>
                                            { getFormattedDateTime(item.start) }
                                        </td>
                            ,
                            'Livraisons':
                                item => <td>
                                            { item.orderEntities.length }
                                        </td>
                            ,
                            'Terminer':
                                item => <td className="d-flex align-items-center">
                                        <CButton color="light" href={"#/components/deliveries/" + item.id} target="_blank" className="mx-1 my-1"><i className="fas fa-clipboard-list"></i></CButton>
                                        { !isDefined(playedTouring) || (playedTouring.id !== item.id) ?
                                            <CButton color="warning" onClick={ () => handleStart(item) } className="mx-1 my-1"><i className="fas fa-play"></i></CButton> : 
                                            <CButton color="danger" onClick={ handleStop } className="mx-1 my-1"><i className="fas fa-stop"></i></CButton>
                                        }
                                        { !details.includes(item.id) &&
                                            <>
                                                <CButton color="success" onClick={ () => handleSubmit(item) } className="mx-1 my-1"><i className="fas fa-check"></i></CButton>
                                            </>
                                        }
                                        </td>
                            ,
                            ' ':
                                item => (
                                    <td className="mb-3 mb-xl-0 text-center">
                                        <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                    </td>
                                )
                            ,
                            'details':
                                item => <CCollapse show={details.includes(item.id)}>
                                            <TouringDetails tourings={ tourings } touring={ item } isAdmin={ isAdmin } setTourings={ setTourings } handleSubmit={ handleSubmit }/>
                                        </CCollapse>
                        }}
                    />
                }
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      { isDefined(playedTouring) && <TruckLocation touring={ playedTouring }/> }
      </>
    );
}

export default Tourings;