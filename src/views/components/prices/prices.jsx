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
import ProductsContext from 'src/contexts/ProductsContext';

const Prices = (props) => {

    const itemsPerPage = 30;
    const { currentUser, selectedCatalog, supervisor } = useContext(AuthContext);
    const [priceGroups, setPriceGroups] = useState([]);
    const { products } = useContext(ProductsContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPriceGroup, setSelectedPriceGroup] = useState(null);
    const [viewedProducts, setViewedProducts] = useState([]);
    const [viewedPriceGroups, setViewedPriceGroups] = useState([]);
    const [csvContent, setCsvContent] = useState("");

    const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent);

    useEffect(() => {
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
        fetchPriceGroup();
    }, []);

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
        if (isDefinedAndNotVoid(priceGroups) && !isDefined(selectedPriceGroup)) {
            if (Roles.isSupervisor(currentUser)) {
                const supervisorRoles = getSupervisorRoles(supervisor.users);
                const supervisorGroups = getAssociatedGroups(supervisorRoles);
                setViewedPriceGroups(supervisorGroups);
                setSelectedPriceGroup(supervisorGroups[0]);
            } else {
                setViewedPriceGroups(priceGroups);
                setSelectedPriceGroup(priceGroups[0]);
            }
        }
    }, [priceGroups, selectedPriceGroup]);

    useEffect(() => {
        if (isDefinedAndNotVoid(products)) {
            if (Roles.isSupervisor(currentUser)) {
                const supervisorRoles = getSupervisorRoles(supervisor.users);
                const supervisorProducts = getProductGroups(supervisorRoles);
                setViewedProducts(supervisorProducts);
            } else
                setViewedProducts(products);
        }
    }, [products]);

    useEffect(() => {
        if (isDefinedAndNotVoid(viewedProducts) && isDefined(selectedPriceGroup))
            setCsvContent(getCsvContent());
    }, [viewedProducts, selectedPriceGroup]);

    const fetchPriceGroup = () => {
        PriceGroupActions
            .findAll()
            .then(response => setPriceGroups(response))
            .catch(error => console.log(error));
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

    const getProductGroups = roles => {
        return products.filter(p => p.available && p.userGroups.find(u => roles.includes(u.value)));
    };

    const getCsvContent = () => viewedProducts.map(item => [item.name, getPriceHT(item), "euros"].join(',')).join('\n');

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
                                items={ viewedProducts }
                                fields={ ['Produit', 'Prix HT'] }
                                bordered
                                itemsPerPage={ itemsPerPage }
                                pagination
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