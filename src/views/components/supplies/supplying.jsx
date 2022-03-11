import CIcon from '@coreui/icons-react';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CRow, CValidFeedback, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Needs from 'src/components/supplyingPages/Needs';
import Purchase from 'src/components/supplyingPages/Purchase';
import UpdateCost from 'src/components/supplyingPages/UpdateCost';
import useWindowDimensions from 'src/helpers/screenDimensions';
import { getCheapestSupplier, getSelectedQuantity, getSignPostName, getSubTotalCost, getSupplierCostMessage, getTotal, isItemProduct, isSelectedItem } from 'src/helpers/supplying';
import { isDefined } from 'src/helpers/utils';

const Supplying = (props) => {

    const itemsPerPage = 3;
    const {  width } = useWindowDimensions();
    const fields = ['Produit', 'Coût', 'Stock', 'Besoin', 'Commande', 'Sélection'];

    const [toasts, setToasts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [mainView, setMainView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [supplied, setSupplied] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [previousSupplier, setPreviousSupplier] = useState(null);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [selection, setSelection] = useState([]);

    useEffect(() => initializeSelections(), [selectedSeller, selectedStore, mainView]);

    useEffect(() => isAllSelected(), [displayedProducts, selection])

    const addToast = newToast => setToasts([...toasts, newToast]);

    const handleSelect = item => updateSelection(item);

    const handleCommandChange = ({ currentTarget }, item) => {
        const newItem = {...item, quantity: currentTarget.value};
        const newProductList = displayedProducts.map(element => (element.id === newItem.id ? newItem : element));
        setDisplayedProducts(newProductList);
        updateSelectionQuantity(newItem);
    };

    const updateSelection = item => {
        const select = selection.find(s => isItemProduct(item, s));
        const newSelection = !isDefined(select) ? [...selection, item] : selection.filter(s => !isItemProduct(s, item));
        setSelection(newSelection);
    };

    const updateSelectionQuantity = item => {
        const previousItem = selection.find(s => isItemProduct(item, s));
        if (isDefined(previousItem)) {
            const newSelection = selection.map(s => isItemProduct(s, item) ? item : s);
            setSelection(newSelection);
        }
    };

    const initializeSelections = () => {
        setSelection([]);
        setSelectAll(false);
    }

    const isAllSelected = () => {
        if (displayedProducts.length === 0 || displayedProducts.find(p => !isSelectedItem(p, selection)) !== undefined)
          setSelectAll(false);
        else 
          setSelectAll(true);
      };

    const toasters = (()=>{
        return toasts.reduce((toasters, toast) => {
          toasters[toast.position] = toasters[toast.position] || []
          toasters[toast.position].push(toast)
          return toasters
        }, {})
    })();

    return (
        <CRow>
            <CCol xs="12" lg="12">
                <CCard>
                    <CCardHeader>
                        Définition des besoins
                    </CCardHeader>
                    <CCardBody>
                        <Needs 
                            displayedProducts= { displayedProducts } 
                            setDisplayedProducts={ setDisplayedProducts }
                            selectedSeller={ selectedSeller }
                            setSelectedSeller={ setSelectedSeller }
                            selectedSupplier={ selectedSupplier } 
                            setSelectedSupplier={ setSelectedSupplier }
                            selectedStore={ selectedStore }
                            setSelectedStore={ setSelectedStore }
                            supplied={ supplied }
                            loading={ loading } 
                            setLoading={ setLoading }
                            mainView={ mainView }
                            setMainView={ setMainView }
                            selectAll={ selectAll }
                            setSelectAll={ setSelectAll }
                            addToast={ addToast }
                            currentPage={ currentPage }
                            setCurrentPage={ setCurrentPage }
                            itemsPerPage={ itemsPerPage }
                            totalItems={ totalItems }
                            setTotalItems={ setTotalItems }
                            selection={ selection }
                            setSelection={ setSelection }
                            previousSupplier={ previousSupplier }
                            setPreviousSupplier={ setPreviousSupplier }
                        />
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
                                    fields={ width < 576 ? ['Produit', 'Commande', 'Sélection'] : fields }
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
                                        'Produit':
                                            item => <td style={{width: '25%'}}>
                                                        <UpdateCost 
                                                            name={ getSignPostName(item, width) } 
                                                            product={ item.product } 
                                                            supplier={ selectedSupplier }
                                                            items= { displayedProducts }
                                                            setItems={ setDisplayedProducts }
                                                        />
                                                        <br/>
                                                        <span className="font-italic" style={{ fontSize: "0.7em"}}>
                                                            { getCheapestSupplier(item.product.costs, selectedSupplier, 'name') }
                                                        </span>
                                                    </td>
                                        ,
                                        'Coût':
                                            item => <td style={{width: '15%'}}>
                                                        { getSupplierCostMessage(item.product, selectedSupplier) }
                                                    </td>
                                        ,
                                        'Stock':
                                            item => <td style={{width: '15%'}}>
                                                        { item.stock.quantity + " " + item.unit }<br/>
                                                        <span className="font-italic" style={{ fontSize: "0.7em"}}>
                                                            { "Sécurité : " + item.stock.security + " " + item.unit }
                                                        </span>
                                                    </td>
                                        ,
                                        'Besoin':
                                            item => <td style={{width: '15%'}}>{ item.sales + " " + item.unit }</td>
                                        ,
                                        'Commande':
                                            item => <td style={{width: '20%'}}>
                                                        <CFormGroup>
                                                            <CInputGroup>
                                                                <CInput
                                                                    type="number"
                                                                    name={ item.id }
                                                                    value={ !isSelectedItem(item, selection) ? item.quantity : getSelectedQuantity(item, selection) }
                                                                    onChange={ e => handleCommandChange(e, item) }
                                                                />
                                                                <CInputGroupAppend>
                                                                    <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                                </CInputGroupAppend>
                                                                <CValidFeedback style={{ display: 'block', color: 'black', textAlign: 'end' }}>
                                                                    { getSubTotalCost(item.product.costs, (!isSelectedItem(item, selection) ? item.quantity : getSelectedQuantity(item, selection)), selectedSupplier) }
                                                                </CValidFeedback>
                                                            </CInputGroup>
                                                        </CFormGroup>
                                                    </td>
                                        ,
                                        'Sélection':
                                            item => <td style={{width: '10%', textAlign: 'center'}}>
                                                        <input
                                                            className="mx-1 my-1"
                                                            type="checkbox"
                                                            name="inline-checkbox"
                                                            // checked={ item.selected }
                                                            checked={ isSelectedItem(item, selection) }
                                                            onClick={ () => handleSelect(item) }
                                                            disabled={ item.status === "WAITING" }
                                                            style={{zoom: 2.3}}
                                                        />
                                                    </td>
                                    }}
                                />
                                <CRow className="mb-4" style={{ display: displayedProducts.length === 0 && 'none'}}>
                                    <CCol xs="12" lg="12">
                                        <p style={{ textAlign: "end", fontWeight: "bold" }}>Total : { getTotal(selection, selectedSupplier) } €</p>
                                    </CCol>
                                </CRow>
                                <Purchase 
                                    displayedProducts={ displayedProducts } 
                                    selectedSupplier={ selectedSupplier }
                                    selectedSeller={ selectedSeller }
                                    selectedStore={ selectedStore }
                                    mainView={ mainView }
                                    supplied={ supplied }
                                    setSupplied={ setSupplied }
                                    addToast={ addToast }
                                    selection={ selection }
                                    setSelection={ setSelection }
                                    />
                            </>
                        }
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol sm="12" lg="6">
              { Object.keys(toasters).map((toasterKey) => (
                <CToaster position={toasterKey} key={'toaster' + toasterKey}>
                    { toasters[toasterKey].map((toast, key)=> {
                        return (
                            <CToast key={ 'toast' + key } 
                                    show={ true } 
                                    autohide={ toast.autohide } 
                                    fade={ toast.fade } 
                                    color={ toast.color } 
                                    style={{ color: 'white' }}
                            >
                                <CToastHeader closeButton={ toast.closeButton }>{ toast.title }</CToastHeader>
                                <CToastBody style={{ backgroundColor: 'white', color: "black" }}>{ toast.messsage }</CToastBody>
                            </CToast>
                        )})
                    }
                </CToaster>
              ))}
            </CCol>
        </CRow>
    );
}

export default Supplying;