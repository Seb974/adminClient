import CIcon from '@coreui/icons-react';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CCollapse, CDataTable, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Select from 'src/components/forms/Select';
import Roles from 'src/config/Roles';
import AuthContext from 'src/contexts/AuthContext';
import PlatformContext from 'src/contexts/PlatformContext';
import { getArchiveDate, isSameDate } from 'src/helpers/days';
import useWindowDimensions from 'src/helpers/screenDimensions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import ProvisionActions from 'src/services/ProvisionActions';
import SellerActions from 'src/services/SellerActions';

const InProgress = (props) => {

    const itemsPerPage = 30;
    const { width } = useWindowDimensions();
    const { currentUser } = useContext(AuthContext);
    const  { platform } = useContext(PlatformContext);
    const fields = ['Produit', 'Quantité', 'Date de réception'];
    const [loading, setLoading] = useState(false);
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [provisions, setProvisions] = useState([]);
    const [details, setDetails] = useState([]);
    const [csvContent, setCsvContent] = useState("");
    const mainStore = { id: -1, name: "Principal" };
    const [selectedStore, setSelectedStore] = useState(mainStore);

    const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent);

    useEffect(() => fetchSellers(), []);

    useEffect(() => fetchProvisions(), [selectedSeller, selectedStore]);

    useEffect(() => setDisplayedProducts(getProducts()), [provisions]);

    useEffect(() => {
        if (isDefinedAndNotVoid(displayedProducts))
            isDefinedAndNotVoid(displayedProducts) ? setCsvContent(getCsvContent()) : setCsvContent([]);
    },[displayedProducts]);

    const fetchSellers = () => {
        SellerActions
            .findAll()
            .then(response => {
                setSellers(response);
                setSelectedSeller(response[0]);
                if (Roles.isStoreManager(currentUser))
                    setSelectedStore(response[0].stores[0])
            })
            .catch(error => console.log(error));
    };

    const fetchProvisions = () => {
        if (isDefined(selectedSeller)) {
            setLoading(true);
            const main = !isDefined(selectedStore) || selectedStore.id === mainStore.id;
            const entity = main ? platform['@id'] : selectedStore['@id'];
            ProvisionActions
                .findSellerInProgress(selectedSeller, main, entity)
                .then(response => {
                    console.log(response);
                    setProvisions(response);
                    setLoading(false);
                })
                .catch(error => setLoading(false));

        }
    };

    const getProducts = () => {
        if (isDefinedAndNotVoid(provisions)) {
            let products = [];
            provisions
                .map(p => {
                    products = [...products, ...p.goods.map(g => ({...g, provisionDate: p.provisionDate, supplier: p.supplier.name}))]
                });
            return getAgregatedProducts(products);
        }
        return [];
    }

    const getAgregatedProducts = goods => {
        let readableGoods = [];
        goods.map(good => {
            const name = getGoodName(good);
            const registeredGood = readableGoods.find(g => g.name === name);
            if (isDefined(registeredGood))
                readableGoods = readableGoods.map(g => g.name === registeredGood.name ? getFormattedAgregation(registeredGood, good) : g);
            else
                readableGoods = [...readableGoods, getFormattedProduct(good)];
        });
        return readableGoods;
    };

    const getFormattedAgregation = (registeredGood, good) => {
        return {
            ...registeredGood, 
            quantity: registeredGood.quantity + good.quantity,
            from: getFromDate(registeredGood, good),
            to: getToDate(registeredGood, good),
            details: [...registeredGood.details, getGoodDetails(good) ]
        };
    };

    const getFormattedProduct = good => {
        const name = getGoodName(good);
        const { quantity, unit, provisionDate } = good; 
        return { 
            name,
            quantity,
            unit,
            from: new Date(provisionDate),
            to: new Date(provisionDate),
            details: [ getGoodDetails(good) ]
        };
    };

    const getGoodDetails = ({ quantity, provisionDate, supplier }) => {
        return { supplier: supplier, date: new Date(provisionDate), quantity: quantity };
    };

    const getGoodName = good => {
        return good.product.name + 
            (isDefined(good.variation) && good.variation.color.length > 0 && good.variation.color !== " " ? " " + good.variation.color : "") +
            (isDefined(good.size) && good.size.name.length > 0 && good.size.name !== " " ? " " + good.size.name : "");
    };

    const handleSellerChange= ({ currentTarget }) => {
        const newSeller = sellers.find(seller => seller.id === parseInt(currentTarget.value));
        setSelectedSeller(newSeller);
    };

    const handleStoreChange = ({ currentTarget }) => {
        const newStore = isDefinedAndNotVoid(selectedSeller.stores) ? 
            selectedSeller.stores.find(s => s.id === parseInt(currentTarget.value))
        : mainStore;
        setSelectedStore(isDefined(newStore) ? newStore : mainStore);
    };

    const getFromDate = (agregated, current) => {
        const fromAgregated = new Date(agregated.from);
        const fromCurrent = new Date(current.provisionDate)
        return fromAgregated <= fromCurrent ? fromAgregated : fromCurrent;
    }

    const getToDate = (agregated, current) => {
        const toAgregated = new Date(agregated.to);
        const toCurrent = new Date(current.provisionDate);
        return toAgregated >= toCurrent ? toAgregated : toCurrent;
    };

    const getCsvContent = () => {
        const header = ['Produit', 'Fournisseur', 'Qte', 'U', 'Recuperation'].join(',');
        const body = displayedProducts.map(item => 
            item.details.map(detail => 
                [
                    item.name,
                    detail.supplier,
                    detail.quantity,
                    item.unit,
                    new Date(detail.date).toLocaleDateString(),
                ].join(',')).join('\n')
        ).join('\n');
        return [header, body].join('\n');
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

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Commandes en cours
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol xs="12" sm="6" md="6">
                                <Select className="mr-2" name="seller" label="Vendeur" onChange={ handleSellerChange } value={ isDefined(selectedSeller) ? selectedSeller.id : 0 }>
                                    { sellers.map(seller => <option key={ seller.id } value={ seller.id }>{ seller.name }</option>) }
                                </Select>
                            </CCol>

                            <CCol xs="12" sm="6" md="6">
                                <Select className="mr-2" name="store" label="Stock" onChange={ handleStoreChange } value={ isDefined(selectedStore) ? selectedStore.id : -1 }>
                                    { !Roles.isStoreManager(currentUser) && <option value={ mainStore.id }>{ mainStore.name }</option>}
                                    { isDefined(selectedSeller) && isDefinedAndNotVoid(selectedSeller.stores) && selectedSeller.stores.map(store => <option key={ store.id } value={ store.id }>{ store.name }</option>) }
                                </Select>
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
                                    items={ displayedProducts }
                                    fields={ width < 576 ? ['Produit'] : fields }
                                    bordered
                                    itemsPerPage={ itemsPerPage }
                                    pagination
                                    scopedSlots = {{
                                        'Produit':
                                            item => <td style={{width: '40%'}}>
                                                        <Link to="#" onClick={ e => { toggleDetails(item.name, e) }}>{ item.name }</Link>
                                                    </td>
                                        ,
                                        'Quantité':
                                            item => <td style={{width: '25%'}}>
                                                        { item.quantity + " " + item.unit }
                                                    </td>
                                        ,
                                        'Date de réception': 
                                            item => <td style={{width: '35%'}}>
                                                    { isSameDate(new Date(item.from), new Date(item.to)) ? 
                                                        "Le " + new Date(item.from).toLocaleDateString() : 
                                                        "Du " + new Date(item.from).toLocaleDateString() + " au " + new Date(item.to).toLocaleDateString()
                                                    }
                                                    </td>
                                        ,
                                        'details':
                                            item => <CCollapse show={details.includes(item.name)}>
                                                        <CDataTable
                                                            items={ item.details }
                                                            fields={ ['Fournisseur', 'Quantité', 'Date de réception'] }
                                                            bordered
                                                            itemsPerPage={ 15 }
                                                            pagination={{
                                                                'align': 'center',
                                                                'dots': true,
                                                            }}
                                                            scopedSlots = {{
                                                                'Fournisseur':
                                                                    detail => <td style={{width: '40%'}}>
                                                                                { detail.supplier }
                                                                            </td>
                                                                ,
                                                                'Quantité': 
                                                                    detail => <td style={{width: '25%'}}>
                                                                                { detail.quantity + " " + item.unit }
                                                                            </td>
                                                                ,
                                                                'Date de réception':
                                                                    detail => <td style={{width: '35%'}}>
                                                                                { new Date(detail.date).toLocaleDateString() }
                                                                            </td>
                                                            }}
                                                        /> 
                                                    </CCollapse>
                                    }}
                                />
                            </>
                        }
                    </CCardBody>
                    <CCardFooter>
                        { isDefinedAndNotVoid(displayedProducts) && 
                            <CRow>
                                <CCol xs="12" lg="12" className="mb-3">
                                    <CButton color="primary" className="mb-2" href={ csvCode } download={`in-progress-${ getArchiveDate(new Date()) }.csv`} target="_blank">
                                        <CIcon name="cil-cloud-download" className="mr-2"/>Télécharger (.csv)
                                    </CButton>
                                </CCol>
                            </CRow>
                        }
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default InProgress;