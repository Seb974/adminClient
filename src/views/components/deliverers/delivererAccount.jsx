import { CButton, CCard, CCardBody, CCardHeader, CCol, CDataTable, CFormGroup, CRow, CWidgetIcon } from '@coreui/react';
import React, { useContext, useEffect, useState } from 'react';
import Select from 'src/components/forms/Select';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import DelivererActions from 'src/services/DelivererActions';
import TouringActions from 'src/services/TouringActions';
import CIcon from '@coreui/icons-react';
import { Spinner } from 'react-bootstrap';

const DelivererAccount = (props) => {

    const itemsPerPage = 3;
    const { currentUser } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [details, setDetails] = useState([]);
    const [deliverers, setDeliverers] = useState([]);
    const [tourings, setTourings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [viewedDeliveries, setViewedDeliveries] = useState([]);
    const [selectedDeliverer, setSelectedDeliverer] = useState(null);
    const [priceView, setPriceView] = useState("HT");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selection, setSelection] = useState([]);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });

    useEffect(() => {
        fetchDeliverers();
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => fetchTourings(currentPage), [currentPage]);
    useEffect(() => {
            fetchTourings();
            setSelection([]);
    }, [selectedDeliverer, dates, selectedStatus]);

    useEffect(() => isAllSelected(), [viewedDeliveries, selection]);
    useEffect(() => setViewedDeliveries(getDeliveries()), [tourings, selectedStatus]);

    const fetchTourings = (page = 1) => {
        if (page >= 1 && isDefined(selectedDeliverer)) {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            const regulation = selectedStatus == "all" ? null : selectedStatus == "true" ? true : false;
            TouringActions.findPaginatedTouringsBetween(UTCDates, selectedDeliverer, regulation, page, itemsPerPage)
                    .then(response => {
                        setSelectAll(false);
                        setLoading(false);
                        setTourings(response['hydra:member']);
                        setTotalItems(response['hydra:totalItems']);
                    })
                    .catch(error => {
                        console.log(error);
                        setLoading(false);
                    });
        }
    };

    const fetchDeliverers = () => {
        DelivererActions
            .findExterns()
            .then(response => {
                setDeliverers(response);
                setSelectedDeliverer(response[0]);
            })
            .catch(error => console.log(error));
    };

    const handleDelivererChange = ({ currentTarget }) => {
        const newSelection = deliverers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedDeliverer(newSelection);
    };

    const handleDateChange = datetime => {
        if (isDefined(datetime[1])){
            const newStart = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 0, 0, 0);
            const newEnd = new Date(datetime[1].getFullYear(), datetime[1].getMonth(), datetime[1].getDate(), 23, 59, 0);
            setDates({start: newStart, end: newEnd});
        }
    };

    const handlePriceView = ({ currentTarget }) => setPriceView(currentTarget.value);

    const handleStatusChange = ({ currentTarget }) => setSelectedStatus(currentTarget.value);

    const handlePay = () => {
        const newTourings = selection.map(({id, totalHT, totalTTC, totalToPay, totalToPayTTC, count, ...touring}) => {
            return {
                ...touring, 
                regulated: true, 
                orderEntities: touring.orderEntities.map(o => o['@id']), 
                deliverer: touring.deliverer['@id']
            };
        });
        updateTourings(newTourings)
            .then(response => {
                const newDeliveries = viewedDeliveries.map(delivery => {
                    const index = response.findIndex(update => update.data['@id'] === delivery['@id']);
                    return index !== -1 ? response[index].data : delivery;
                });
                const filteredDeliveries = getFilteredResults(newDeliveries);
                setViewedDeliveries(filteredDeliveries);
            });
    };

    const handleSelect = item => updateSelection(item);

    const handleSelectAll = () => {
        let newSelection = [];
        const newSelectState = !selectAll;
        if (newSelectState)
            newSelection = [...new Set([...selection, ...viewedDeliveries.filter(d => !d.regulated && !isSelectedDelivery(d))])];
        else 
            newSelection = selection.filter(s => viewedDeliveries.find(d => s.id === d.id && isSelectedDelivery(d)) === undefined)
        setSelectAll(newSelectState);
        setSelection(newSelection);
    };

    const updateSelection = item => {
        const select = selection.find(s => s.id === item.id);
        const newSelection = !isDefined(select) ? [...selection, item] : selection.filter(s => s.id !== item.id);
        setSelection(newSelection);
    };

    const isSelectedDelivery = delivery => {
        return selection.findIndex(s => s.id === delivery.id) !== -1;
    };

    const isAllSelected = () => {
        const notRegulatedDeliveries = viewedDeliveries.filter(d => !d.regulated);
        const hasNotSelected = notRegulatedDeliveries.find(d => !isSelectedDelivery(d)) !== undefined;
        if (notRegulatedDeliveries.length === 0 || hasNotSelected)
          setSelectAll(false);
        else 
          setSelectAll(true);
    };

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

    const getDeliveries = () => {
        const selectedTourings = tourings.map(touring => {
            const totalHT = getTotalHT(touring);
            const totalTTC = getTotalTTC(touring);
            const ownerPart = selectedDeliverer.ownerRate;
            return {
                ...touring,
                id: touring.id.toString().padStart(10, '0'),
                totalHT,
                totalTTC,
                totalToPay: getPartToPay(totalHT, ownerPart),
                totalToPayTTC: getPartToPay(totalTTC, ownerPart),
                count: touring.orderEntities.length,
            };
        });
        return getFilteredResults(selectedTourings);
    };

    const getFilteredResults = tourings => {
        return tourings.filter(touring => {
            return selectedStatus === "all" || 
                   (selectedStatus === "true" && touring.regulated) ||
                   (selectedStatus === "false" && !touring.regulated);
        });
    }

    const getTotalHT = touring => selectedDeliverer.cost * (isDefinedAndNotVoid(touring.orderEntities) ? touring.orderEntities.length : 0);

    const getTotalTTC = touring => {
        const delivererTax = !selectedDeliverer.isIntern ? selectedDeliverer.tax.catalogTaxes.find(catalogTax => catalogTax.catalog.id === selectedDeliverer.catalog.id) : 0;
        return getTotalHT(touring) * (1 + delivererTax.percent)
    };

    const getPartToPay = (total, rate) => total * (1 - (rate / 100));

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index);
        let newDetails = details.slice();
        if (position !== -1) {
            newDetails.splice(position, 1);
        } else {
            newDetails = [...details, index];
        }
        setDetails(newDetails);
    };

    const getTotalStat = () => {
        const selection = priceView === "HT" ? 'totalHT' : 'totalTTC';
        return viewedDeliveries.reduce((sum, current) => sum += current[selection], 0);
    };

    const getTotalToPayStat = () => {
        const selection = priceView === "HT" ? 'totalToPay' : 'totalToPayTTC';
        return viewedDeliveries.reduce((sum, current) => sum += current[selection], 0);
    };

    const getTotalDeliveriesStat = () => {
        return viewedDeliveries.reduce((sum, current) => sum += current.count, 0);
    };

    const getEarnedTotal = () => {
        const total = getTotalStat();
        const totalToPay = getTotalToPayStat();
        return total - totalToPay;
    }

    const updateTourings = async (newTourings) => {
        const savedTourings = await Promise.all(newTourings.map( async touring => {
            return await TouringActions.update(touring.id, touring);
        }));
        return savedTourings;
    };

    return !isDefined(viewedDeliveries) ? <></> : (
        <CCard>
            <CCardHeader className="d-flex align-items-center">
                Liste des livraisons par livreur
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text={"Livraisons - " + viewedDeliveries.length + " tournées"} header={ getTotalDeliveriesStat() } color="primary" iconPadding={false}>
                            <CIcon width={24} name="cil-truck"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Chiffre d'affaires" header={(viewedDeliveries.length > 0 ? (getTotalStat()).toFixed(2) : "0.00") + " €"} color="info" iconPadding={false}>
                            <CIcon width={24} name="cil-chart"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="Revenus" header={(viewedDeliveries.length > 0 ? (getEarnedTotal()).toFixed(2) : "0.00") + " €"} color="warning" iconPadding={false}>
                            <CIcon width={24} name="cil-wallet"/>
                        </CWidgetIcon>
                        </CCol>
                        <CCol xs="12" sm="6" lg="3">
                        <CWidgetIcon text="A payer" header={ (viewedDeliveries.length > 0 ? (getTotalToPayStat()).toFixed(2) : "0.00") + " €" } color="danger" iconPadding={false}>
                            <CIcon width={24} name="cil-money"/>
                        </CWidgetIcon>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol xs="12" sm="12" md="6" className="mt-4">
                        <Select className="mr-2" name="deliverer" label="Vendeur" onChange={ handleDelivererChange } value={ isDefined(selectedDeliverer) ? selectedDeliverer.id : 0 }>
                            { deliverers.map(deliverer => <option key={ deliverer.id } value={ deliverer.id }>{ deliverer.name }</option>) }
                        </Select>
                    </CCol>
                    <CCol xs="12" sm="12" md="6" className="mt-4">
                        <RangeDatePicker
                            minDate={ dates.start }
                            maxDate={ dates.end }
                            onDateChange={ handleDateChange }
                            label="Date"
                            className = "form-control mb-3"
                        />
                    </CCol>
                </CRow>
                <CRow>
                    <CCol xs="12" sm="12" md="6" className="mt-4">
                        <Select className="mr-2" name="status" label="Statuts" onChange={ handleStatusChange } value={ selectedStatus }>
                            <option value={ "all" }>{ "Toutes" }</option>
                            <option value={ false }>{ "A régler" }</option>
                            <option value={ true }>{ "Réglées" }</option>
                        </Select>
                    </CCol>
                    <CCol xs="12" sm="12" md="4" className="mt-4">
                        <Select className="mr-2" name="priceView" label="Affichage" onChange={ handlePriceView } value={ priceView }>
                            <option value={ "HT" }>{ "Hors taxe" }</option>
                            <option value={ "TTC" }>{ "Taxes comprises" }</option>
                        </Select>
                    </CCol>
                    <CCol xs="12" md="2" className="mt-4 d-flex align-items-center justify-content-end pr-5">
                        <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                            <input
                                className="mx-1 my-2"
                                type="checkbox"
                                name="inline-checkbox"
                                checked={ selectAll }
                                onClick={ handleSelectAll }
                                disabled={ viewedDeliveries.length === 0 }
                                style={{zoom: 2.3}}
                                disabled={ viewedDeliveries.filter(d => !d.regulated).length <= 0 }
                            />
                            <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tous</label>
                        </CFormGroup>
                    </CCol>
                </CRow>
                { loading ?
                    <CRow>
                        <CCol xs="12" lg="12" className="text-center">
                            <Spinner animation="border" variant="danger"/>
                        </CCol>
                    </CRow>
                :
                    <>
                        <CDataTable
                            items={ viewedDeliveries }
                            fields={ ['Date', 'Commandes', 'Total', 'Total Net', 'Selection'] }
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
                            hover
                            scopedSlots = {{
                                'Date':
                                    item => <td>
                                                { item.regulated ? 
                                                    <i className="far fa-check-circle mr-2 text-success"></i> :
                                                    <i className="far fa-times-circle mr-2 text-warning"></i>
                                                }
                                                { (new Date(item.start)).toLocaleString('fr-FR', { timeZone: 'UTC'}) }
                                            </td>
                                ,
                                'Commandes':
                                    item => <td>
                                                { item.count }
                                            </td>
                                ,
                                'Total':
                                    item => <td>
                                                { priceView === "HT" ? item.totalHT.toFixed(2) : item.totalTTC.toFixed(2) } €
                                            </td>
                                ,
                                'Total Net':
                                    item => <td>
                                                { priceView === "HT" ? item.totalToPay.toFixed(2): item.totalToPayTTC.toFixed(2) } €
                                            </td>
                                ,
                                'Selection':
                                    item => <td style={{width: '10%', textAlign: 'center'}}>
                                                <input
                                                    className="mx-1 my-1"
                                                    type="checkbox"
                                                    name="inline-checkbox"
                                                    checked={ isSelectedDelivery(item) }
                                                    onClick={ () => handleSelect(item) }
                                                    style={{zoom: 2.3}}
                                                    disabled={ item.regulated }
                                                />
                                            </td>
                                }}
                        />
                        { isAdmin && viewedDeliveries.filter(d => !d.regulated).length > 0 &&
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                <CButton size="sm" color="success" onClick={ handlePay } style={{width: '140px', height: '35px'}} disabled={ selection.length === 0 }>
                                    Clôturer
                                </CButton>
                            </CRow>
                        }
                    </>
                }
            </CCardBody>
        </CCard>
    );
}
 
export default DelivererAccount;