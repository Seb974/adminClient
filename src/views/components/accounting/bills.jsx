import React, { useContext, useEffect, useState } from 'react';
import OrderActions from '../../../services/OrderActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner'
import Select from 'src/components/forms/Select';
import { isSameDate } from 'src/helpers/days';
import PaymentForm from 'src/components/payment/PaymentForm';

const Bills = (props) => {

    const itemsPerPage = 30;
    const fields = ['client', 'facture', 'échéance', 'total HT', 'total TTC', 'etat', 'selection'];
    const { currentUser, supervisor } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [billingLoading, setBillingLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [selectAll, setSelectAll] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const isUserAdmin = Roles.hasAdminPrivileges(currentUser);
        setIsAdmin(isUserAdmin);
        if (!isUserAdmin && isDefined(supervisor)) {
            setUser(supervisor.users[0]);
        } else {
            setUser(currentUser);
        }
    }, []);


    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    useEffect(() => {
        if (isDefined(user))
            getOrders();
    }, [dates, user]);

    const getOrders = () => {
        setLoading(true);
        const UTCDates = getUTCDates();
        OrderActions
            .getInvoices(user, UTCDates)
            .then(response => {
                console.log(response);
                setOrders(response.map(data => ({...data, selected: false})));
                setLoading(false);
            })
            .catch(error => {
                console.log(error);
                setLoading(false);
            });
    }

    const handleSupervisorUserChange = ({ currentTarget }) => {
        const newUser = supervisor.users.find(u => parseInt(u.id) === parseInt(currentTarget.value));
        setUser(newUser);
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handleSelect = item => {
        let newValue = null;
        const newOrders = orders.map(element => {
            newValue = !element.selected;
            return element.id === item.id && !isDefined(element.paid_date) ? {...element, selected: !element.selected} : element;
        });
        setOrders(newOrders);
        if (!newValue && selectAll)
            setSelectAll(false);
    };

    const handleSelectAll = () => {
        const newSelection = !selectAll;
        const newOrders = orders.map(element => isDefined(element.paid_date) ? element : ({...element, selected: newSelection}));
        setSelectAll(newSelection);
        setOrders(newOrders);
    };

    const getUTCDates = () => {
        const step = isSameDate(dates.start, dates.end) ? 1 : 0;
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1 + step, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    }

    const handleSubmit = () => {
        setBillingLoading(true);
    };

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>Liste des factures</CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" md="4">
                            <RangeDatePicker
                                minDate={ dates.start }
                                maxDate={ dates.end }
                                onDateChange={ handleDateChange }
                                label="Date"
                                className = "form-control mb-3"
                            />
                            </CCol>
                            { (!(isAdmin || Roles.isPicker(currentUser)) && isDefined(supervisor)) &&
                                <>
                                    <CCol xs="12" md="4">
                                        <Select className="mr-2" name="selectedUser" label="Pour le compte de" onChange={ handleSupervisorUserChange } value={ isDefined(user) ? user.id : 0 }>
                                            { supervisor.users.map(user => <option value={ user.id }>{ user.name + " - " + user.email }</option>) }
                                        </Select>
                                    </CCol>
                                    <CCol xs="12" lg="4" className="mt-4">
                                        <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                                            <input
                                                className="mx-1 my-1"
                                                type="checkbox"
                                                name="inline-checkbox"
                                                checked={ selectAll }
                                                onClick={ handleSelectAll }
                                                disabled={ orders.find(order => order.status !== "WAITING") == undefined }
                                                style={{zoom: 2.3}}
                                            />
                                            <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tout sélectionner</label>
                                        </CFormGroup>
                                    </CCol>
                                </>
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
                                items={ orders }
                                fields={ !isAdmin ? fields : fields.filter(f => f !== 'selection')}
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
                                scopedSlots = {{
                                    'client': item => <td>{ item.company.name }</td>,
                                    'facture':
                                        item => <td>
                                                    <a href={ item.public_path } target="_blank">
                                                        { item.number }
                                                    </a><br/>
                                                    <small><i>Créée le { new Date(item.date).toLocaleDateString() }</i></small>
                                                    <br/>
                                                </td>
                                    ,
                                    'échéance':  item => <td>{ new Date(item.due_date).toLocaleDateString() }</td>,
                                    'total HT':  item => <td>{ item.pre_tax_amount.toFixed(2) + " €" }</td>,
                                    'total TTC': item => <td>{ item.total.toFixed(2) + " €" }</td>,
                                    'etat':      item => <td>{ isDefined(item.paid_date) ? "PAYÉ" : "A RÉGLER" }</td>,
                                    'selection': item => <td className="d-flex align-items-center">
                                                            <input
                                                                className="mx-1 my-1"
                                                                type="checkbox"
                                                                name="inline-checkbox"
                                                                checked={ item.selected }
                                                                onClick={ () => handleSelect(item) }
                                                                disabled={ isDefined(item.paid_date) }
                                                                style={{zoom: 2.3}}
                                                            />
                                                        </td>
                                }}
                            />
                        }
                        { orders.length > 0 &&
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                <PaymentForm name={ "Paiement" } available={ orders.findIndex(o => o.selected) !== -1 } bills={ orders.filter(b => b.selected) } orders={ orders } setOrders={ setOrders }/>
                            </CRow>
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Bills;