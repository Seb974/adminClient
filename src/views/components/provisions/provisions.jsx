import React, { useContext, useEffect, useState } from 'react';
import ProvisionActions from '../../../services/ProvisionActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CCollapse, CFormGroup, CInputCheckbox, CLabel, CWidgetIcon } from '@coreui/react';
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import RangeDatePicker from 'src/components/forms/RangeDatePicker';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import { isSameDate, getDateFrom } from 'src/helpers/days';
import Spinner from 'react-bootstrap/Spinner'
import OrderDetails from 'src/components/preparationPages/orderDetails';
import SelectMultiple from 'src/components/forms/SelectMultiple';
import SupplierActions from 'src/services/SupplierActions';
import SellerActions from 'src/services/SellerActions';
import ProvisionModal from 'src/components/provisionPages/provisionModal';
import CIcon from '@coreui/icons-react';
import MercureContext from 'src/contexts/MercureContext';
import { updateSuppliersBetween } from 'src/data/dataProvider/eventHandlers/provisionEvents';

const Provisions = (props) => {

    const itemsPerPage = 10;
    const fields = ['Vendeur', 'Fournisseur', 'Date', 'Total', ' '];
    const { currentUser, seller } = useContext(AuthContext);
    const [provisions, setProvisions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({start: new Date(), end: new Date() });
    const [details, setDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedSellers, setSelectedSellers] = useState([]);
    const { updatedProvisions, setUpdatedProvisions } = useContext(MercureContext);
    const [mercureOpering, setMercureOpering] = useState(false);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchSuppliers();
        fetchSellers();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => fetchProvisions(), [dates, selectedSuppliers, selectedSellers]);
    useEffect(() => fetchProvisions(currentPage), [currentPage]);

    useEffect(() => {
        if (isDefinedAndNotVoid(updatedProvisions) && !mercureOpering) {
            setMercureOpering(true);
            updateSuppliersBetween(getUTCDates(), provisions, setProvisions, updatedProvisions, setUpdatedProvisions, currentUser, seller, sellers, suppliers)
                .then(response => setMercureOpering(response));
        }
    }, [updatedProvisions]);

    const fetchProvisions = (page = 1) => {
        if (page >= 1 && isDefinedAndNotVoid(selectedSuppliers) && isDefinedAndNotVoid(selectedSellers)) {
            setLoading(true);
            const UTCDates = getUTCDates(dates);
            ProvisionActions.findPaginatedProvisionsPerSupplier(UTCDates, selectedSuppliers, selectedSellers, page, itemsPerPage)
                    .then(response => {
                        console.log(response['hydra:member']);
                        setProvisions(response['hydra:member']);
                        setTotalItems(response['hydra:totalItems']);
                        setLoading(false);
                    })
                    .catch(error => {
                        console.log(error);
                        setLoading(false);
                    });
        }
    };

    const fetchSuppliers = () => {
        SupplierActions
            .findAll()
            .then(response => {
                setSuppliers(response);
                setSelectedSuppliers(getFormattedEntities(response));
            })
            .catch(error => console.log(error));
    };

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => {
                setSellers(response);
                setSelectedSellers(getFormattedEntities(response));
            })
            .catch(error => console.log(error));
    };

    const handleDelete = item => {
        const originalProvisions = [...provisions];
        setProvisions(provisions.filter(provision => provision.id !== item.id));
        ProvisionActions.delete(item, isAdmin)
                      .catch(error => {
                           setProvisions(originalProvisions);
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

    const handleSuppliersChange = suppliers => setSelectedSuppliers(suppliers);
    const handleSellersChange = sellers => setSelectedSellers(sellers);

    const getUTCDates = () => {
        const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
        const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
        return {start: UTCStart, end: UTCEnd};
    };

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

    const getFormattedEntities = suppliers => {
        return suppliers.map(supplier => ({ value: supplier['@id'], label: supplier.name, isFixed: false }));
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, 'color') ? " - " + variation.color : "";
        const sizeName = exists(size, 'name') ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const getWarehouseName = provision => {
        if (!isDefined(provision.store) || !isDefined(seller) || !isDefinedAndNotVoid(seller.stores)) {
            return "Principal";
        }
        else {
            const store = seller.stores.find(s => s['@id'] === provision.store);
            return isDefined(store) ? store.name : "";
        }
    };

    const exists = (entity, variable) => {
        return isDefined(entity) && isDefined(entity[variable]) && entity[variable].length > 0 && entity[variable] !== " ";
    };

    const getTotalProvision = provision => provision.goods.reduce((sum, current) => {
        return sum + ((isDefined(current.received) ? current.received : 0) * (isDefined(current.price) ? current.price : 0))
    }, 0);
    const getSupplierCount = () => [...new Set(provisions.map(provision => provision.supplier.id))].length;
    const getTurnover = () => provisions.reduce((sum, current) => sum + getTotalProvision(current), 0);

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader className="d-flex align-items-center">
                        Liste des approvisionnements
                        <CCol col="6" sm="4" md="2" className="ml-auto">
                            <Link role="button" to="/components/provisions/new" block variant="outline" color="success">CRÉER</Link>
                        </CCol>
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" sm="6" lg="3">
                                <CWidgetIcon text="Commandes" header={ provisions.length } color="primary" iconPadding={false}>
                                    <CIcon width={24} name="cil-clipboard"/>
                                </CWidgetIcon>
                                </CCol>
                                <CCol xs="12" sm="6" lg="3">
                                <CWidgetIcon text="Fournisseurs" header={ getSupplierCount() } color="info" iconPadding={false}>
                                    <CIcon width={24} name="cil-people"/>
                                </CWidgetIcon>
                                </CCol>
                                <CCol xs="12" sm="6" lg="3">
                                <CWidgetIcon text="Moyenne" header={ (provisions.length > 0 ? (getTurnover() / provisions.length).toFixed(2) : "0.00") + " €"} color="warning" iconPadding={false}>
                                    <CIcon width={24} name="cil-chart"/>
                                </CWidgetIcon>
                                </CCol>
                                <CCol xs="12" sm="6" lg="3">
                                <CWidgetIcon text="Total" header={ getTurnover().toFixed(2) + " €" } color="danger" iconPadding={false}>
                                    <CIcon width={24} name="cil-money"/>
                                </CWidgetIcon>
                            </CCol>
                        </CRow>
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
                        <CRow>
                            <CCol xs="12" lg="6">
                                <SelectMultiple name="sellers" label="Vendeurs" value={ selectedSellers } onChange={ handleSellersChange } data={ getFormattedEntities(sellers) }/>
                            </CCol>
                            <CCol xs="12" lg="6">
                                <SelectMultiple name="suppliers" label="Founisseurs" value={ selectedSuppliers } onChange={ handleSuppliersChange } data={ getFormattedEntities(suppliers) }/>
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
                                items={ provisions }
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
                                hover
                                scopedSlots = {{
                                    'Vendeur':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        { isDefined(item.store) ? item.store.name : item.seller.name }
                                                        <br/>
                                                        <span style={{ fontSize: '0.75em', fontStyle: 'italic'}}>
                                                            { getWarehouseName(item) }
                                                        </span>
                                                    </Link>
                                                </td>
                                    ,
                                    'Fournisseur':
                                        item => <td>
                                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >
                                                        { item.supplier.name }
                                                        <br/>
                                                    </Link>
                                                </td>
                                    ,
                                    'Date':
                                        item => <td style={{color: item.status === "RECEIVED" ? "dimgray" : "black"}}>
                                                    { isSameDate(new Date(item.provisionDate), new Date()) ? "Aujourd'hui" : 
                                                    isSameDate(new Date(item.provisionDate), getDateFrom(new Date(), -1)) ? "Hier" :
                                                    isSameDate(new Date(item.provisionDate), getDateFrom(new Date(), 1)) ? "Demain" :
                                                    (new Date(item.provisionDate)).toLocaleDateString('fr-FR', { timeZone: 'UTC'})
                                                    }
                                                </td>
                                    ,
                                    'Total':
                                        item => <td style={{color: item.status === "RECEIVED" ? "dimgray" : "black"}}>
                                                    { item.status === "RECEIVED" ? (getTotalProvision(item)).toFixed(2) + " €" : "-"}
                                                </td>
                                    ,
                                    ' ':
                                        item => (
                                            <td className="mb-3 mb-xl-0 text-right">
                                                { item.status === "ORDERED" && <ProvisionModal item={ item } provisions={ provisions } setProvisions={ setProvisions }/> }
                                                <CButton color="warning" disabled={ !isAdmin } href={ "#/components/provisions/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                                <CButton color="danger" disabled={ !isAdmin } onClick={ () => handleDelete(item) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                            </td>
                                        )
                                    ,
                                    'details':
                                        item => <CCollapse show={details.includes(item.id)}>
                                                    <CDataTable
                                                        items={ item.goods }
                                                        fields={ ['Produit', 'Commandé', 'Reçu', 'Prix U','Sous-total'] }
                                                        bordered
                                                        itemsPerPage={ itemsPerPage }
                                                        pagination
                                                        hover
                                                        scopedSlots = {{
                                                            'Produit':
                                                                item => <td>{ getProductName(item.product, item.variation, item.size) }</td>
                                                            ,
                                                            'Commandé':
                                                                item => <td>{ item.quantity.toFixed(2) + " " + item.unit }</td>
                                                            ,
                                                            'Reçu':
                                                                item => <td>{ isDefined(item.received) ? item.received.toFixed(2) + " " + item.unit : "-" }</td>        //  item.received.toFixed(2) + " " + item.unit item.received + " U :" + (typeof item.received)
                                                            ,
                                                            'Prix U':
                                                                item => <td>{ isDefined(item.price) ? item.price.toFixed(2) + " €" : "-" }</td>     // item.price.toFixed(2) + " €"  item.price + " € :" + (typeof item.price)
                                                            ,
                                                            'Sous-total':
                                                                item => <td>{ isDefined(item.price) && isDefined(item.received) ? (item.received * item.price).toFixed(2) + " €" : "-" }</td>
                                                        }}
                                                    />
                                                </CCollapse>
                                }}
                            />
                        }
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default Provisions;