import React, { useContext, useEffect, useState } from 'react';
import PriceGroupActions from '../../../services/PriceGroupActions';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CCardFooter, CButton } from '@coreui/react';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';
import Select from 'src/components/forms/Select';
import CIcon from '@coreui/icons-react';
import { getArchiveDate } from 'src/helpers/days';
import ProductActions from 'src/services/ProductActions';

const Prices = (props) => {

    const itemsPerPage = 500;
    const { currentUser, selectedCatalog, supervisor } = useContext(AuthContext);
    const [priceGroups, setPriceGroups] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPriceGroup, setSelectedPriceGroup] = useState(null);
    const [viewedPriceGroups, setViewedPriceGroups] = useState([]);
    const [csvContent, setCsvContent] = useState("");
    const [userGroups, setUserGroups] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);

    const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);
    
    useEffect(() => fetchPriceGroup(), []);

    useEffect(() => getDisplayedProducts(), [userGroups]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);
    useEffect(() => definePriceGroups(), [priceGroups, selectedPriceGroup]);

    useEffect(() => {
        if (isDefinedAndNotVoid(displayedProducts) && isDefined(selectedPriceGroup))
            setCsvContent(getCsvContent());
    }, [displayedProducts, selectedPriceGroup]);

    const fetchPriceGroup = () => {
        PriceGroupActions
            .findAll()
            .then(response => setPriceGroups(response))
            .catch(error => console.log(error));
    };

    const getDisplayedProducts = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getProducts(page);
            if (isDefined(response)) {
                setDisplayedProducts(response['hydra:member']);
                setTotalItems(response['hydra:totalItems']);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const getProducts = async (page = 1) => {
        if (page >= 1) {
            if (Roles.isSupervisor(currentUser)) {
                if (isDefinedAndNotVoid(userGroups))
                    return await ProductActions.findAvailablePaginated(userGroups, page, itemsPerPage);
            } else {
                return await ProductActions.findAllPaginated(page, itemsPerPage);
            }
        }
        return new Promise((resolve, reject) => resolve(null));
    };

    const definePriceGroups = () => {
        if (isDefinedAndNotVoid(priceGroups) && !isDefined(selectedPriceGroup)) {
            if (Roles.isSupervisor(currentUser)) {
                const supervisorRoles = getSupervisorRoles(supervisor.users);
                const supervisorGroups = getAssociatedGroups(supervisorRoles);
                setUserGroups(supervisorRoles);
                setViewedPriceGroups(supervisorGroups);
                setSelectedPriceGroup(supervisorGroups[0]);
            } else {
                setUserGroups([]);
                setViewedPriceGroups(priceGroups);
                setSelectedPriceGroup(priceGroups[0]);
            }
        }
    };

    const handlePriceGroupChange = ({ currentTarget }) => {
        const newPriceGroup = priceGroups.find(p => p.id === parseInt(currentTarget.value));
        setSelectedPriceGroup(newPriceGroup);
    };

    const getPriceHT = product => {
        const price = getPriceAmount(product);
        return price.toFixed(2);
    };

    const getPriceTTC = product => {
        const price = getPriceAmount(product);
        const tax = product.tax.catalogTaxes.find(t => t.catalog.id === selectedCatalog.id);
        return (price * (1 + tax.percent)).toFixed(2);
    };

    const getPriceAmount = product => {
        const priceEntity = product.prices.find(p => p.priceGroup.name === selectedPriceGroup.name);
        return priceEntity.amount;
    };

    const getSupervisorRoles = users => {
        let rolesArray = [];
        users.map(u => u.roles.map(r => rolesArray = rolesArray.includes(r) || r === "ROLE_USER" ? rolesArray : [...rolesArray, r]));
        return rolesArray;
    };

    const getAssociatedGroups = roles => {
        return priceGroups.filter(p => p.userGroup.find(u => roles.includes(u.value)));
    };

    const getCsvContent = () => displayedProducts.map(item => [item.name, getPriceHT(item), "euros"].join(',')).join('\n');

    return !isDefined(selectedPriceGroup) ? <></> : (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader className="d-flex align-items-center">
                        Liste des prix
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mb-2">
                            { isDefinedAndNotVoid(viewedPriceGroups) && viewedPriceGroups.length > 1 &&
                                <CCol xs="12" lg="6">
                                    <Select className="mr-2" name="priceGroup" label="Catégorie" value={ isDefined(selectedPriceGroup) ? selectedPriceGroup.id : 0 } onChange={ handlePriceGroupChange }>
                                        { viewedPriceGroups.map(p => <option key={ p.id } value={ p.id }>{ p.name }</option>)}
                                    </Select>
                                </CCol>
                            }
                            <CCol xs="12" lg="6" className="mt-4">
                                <CButton color="primary" className="mb-2" href={csvCode} download={`Tarifs-FraisPei-${ getArchiveDate(new Date()) }.csv`} target="_blank">
                                    <CIcon name="cil-cloud-download" className="mr-2"/>Télécharger (.csv)
                                </CButton>
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
                                items={ displayedProducts }
                                fields={ ['Produit', 'Prix HT'] }
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
                                    'Produit':
                                        item => <td>
                                                    { item.name }
                                                </td>
                                    ,
                                    'Prix HT':
                                        item => <td>{ getPriceHT(item) + " €" }</td>
                                    ,
                                    'Prix TTC':
                                        item => <td>{ getPriceTTC(item) + " €" }</td>
                                }}
                            />
                        }
                    </CCardBody>
                    <CCardFooter className="d-flex justify-content-center">
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Prices;