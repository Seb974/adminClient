import CIcon from '@coreui/icons-react';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CRow, CValidFeedback, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import React, { useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Needs from 'src/components/supplyingPages/Needs';
import Purchase from 'src/components/supplyingPages/Purchase';
import UpdateCost from 'src/components/supplyingPages/UpdateCost';
import useWindowDimensions from 'src/helpers/screenDimensions';
import { getCheapestSupplier, getSignPostName, getSubTotalCost, getSupplierCostMessage, getTotal } from 'src/helpers/supplying';

const Supplying = (props) => {

    const itemsPerPage = 30;
    const {  width } = useWindowDimensions();
    const fields = ['Produit', 'Coût', 'Stock', 'Besoin', 'Commande', 'Sélection'];

    const [toasts, setToasts] = useState([]);
    const [mainView, setMainView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [supplied, setSupplied] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [displayedProducts, setDisplayedProducts] = useState([]);

    const addToast = newToast => setToasts([...toasts, newToast]);

    const handleSelect = item => {
        let newValue = null;
        const newProductsList = displayedProducts.map(element => {
            newValue = !element.selected;
            return element.id === item.id ? {...element, selected: newValue} : element;
        });
        setDisplayedProducts(newProductsList);
        if (newValue && selectAll)
            setSelectAll(false);
    };

    const handleCommandChange = ({ currentTarget }, item) => {
        const newProductList = displayedProducts.map(element => (element.id === item.id ? {...element, quantity: currentTarget.value} : element));
        setDisplayedProducts(newProductList);
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
                                    pagination
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
                                                                    value={ item.quantity }
                                                                    onChange={ e => handleCommandChange(e, item) }
                                                                />
                                                                <CInputGroupAppend>
                                                                    <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                                                </CInputGroupAppend>
                                                                <CValidFeedback style={{ display: 'block', color: 'black', textAlign: 'end' }}>
                                                                    { getSubTotalCost(item.product.costs, item.quantity, selectedSupplier) }
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
                                                            checked={ item.selected }
                                                            onClick={ () => handleSelect(item) }
                                                            disabled={ item.status === "WAITING" }
                                                            style={{zoom: 2.3}}
                                                        />
                                                    </td>
                                    }}
                                />
                                <CRow className="mb-4" style={{ display: displayedProducts.length === 0 && 'none'}}>
                                    <CCol xs="12" lg="12">
                                        <p style={{ textAlign: "end", fontWeight: "bold" }}>Total : { getTotal(displayedProducts, selectedSupplier) } €</p>
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
                                    setSelectAll={ setSelectAll }
                                    addToast={ addToast }
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