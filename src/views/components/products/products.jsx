import React, { useContext, useEffect, useState } from 'react';
import ProductsContext from '../../../contexts/ProductsContext'
import ProductActions from '../../../services/ProductActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Select from 'src/components/forms/Select';
import StoreActions from 'src/services/StoreActions';
import Spinner from 'react-bootstrap/Spinner';

const Products = (props) => {

    const itemsPerPage = 4;
    const fields = ['name', 'promo', 'disponibilité', ' '];
    const { currentUser } = useContext(AuthContext);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    const mainStore = { id: -1, name: "En ligne" };
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(mainStore);
    const [alreadySelected, setAlreadySelected] = useState([]);
    const [newSelected, setNewSelected] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [toasts, setToasts] = useState([]);
    const successMessage = "Les produits ont bien été envoyés.";
    const failMessage = "Un problème est survenu lors de l'envoi des produits à la boutique.\n";
    const failLoadingMessage = "Un problème est survenu lors du chargement des données. Vérifiez l'état de votre connexion.\n";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Echec de l\'envoi' };
    const failLoadingToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failLoadingMessage, title: 'Echec du chargement' };

    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), []);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => {
      fetchStores();
      getDisplayedProducts();
    }, []);

    useEffect(() => getDisplayedProducts(), [search]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);
    useEffect(() => isAllSelected(), [displayedProducts, newSelected]);

    const getDisplayedProducts = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedProducts(search, page) : await getProducts(page);
        if (isDefined(response)) {
            setDisplayedProducts(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getProducts = (page = 1) => page >=1 ? fetchPaginatedProducts(page) : undefined;
    const getSearchedProducts = (word, page = 1) => fetchProductsContainingWord(word, page);

    const fetchPaginatedProducts = (page) => {
        return ProductActions
                  .findAllPaginated(page, itemsPerPage)
                  .catch(error => addToast(failLoadingToast));
    };

    const fetchProductsContainingWord = (word, page) => {
        return ProductActions
                  .findWord(word, page, itemsPerPage)
                  .catch(error => addToast(failLoadingToast));
    };

    const fetchStores = () => {
      StoreActions
          .findAll()
          .then(response => setStores(response))
          .catch(error => addToast(failLoadingToast));
    };

    const getHiboutikProducts = store => {
        setSearch("");
        setCurrentPage(1);
        setLoading(true);
        StoreActions
            .getProducts(store)
            .then(response => {
                const selection = [...new Set(response.map(s => parseInt(s['products_ref_ext'])))].filter(s => !isNaN(s));
                setAlreadySelected(selection);
                setLoading(false);
            })
            .catch(error => {
              setLoading(false);
              addToast(failLoadingToast);
            })
    };

    const handleDelete = (id) => {
      const originalProducts = [...displayedProducts];
      setDisplayedProducts(displayedProducts.filter(product => product.id !== id));
      ProductActions.delete(id)
                    .catch(error => {
                          setDisplayedProducts(originalProducts);
                          addToast(failLoadingToast)
                    });
    }

    const handleStoreChange = ({ currentTarget }) => {
        const newStore = isDefinedAndNotVoid(stores) ? 
            stores.find(s => s.id === parseInt(currentTarget.value))
        : mainStore;
        setSelectedStore(isDefined(newStore) ? newStore : mainStore);
        setNewSelected([]);
        setCurrentPage(1);
        if (isDefined(newStore))
          getHiboutikProducts(newStore);
    };

  const handleSelect = product => {
      const newSelection = newSelected.includes(product.id) ? newSelected.filter(s => s !== product.id) : [...newSelected, product.id];
      setNewSelected(newSelection);
  };

  const handleSelectAll = () => {
    const newSelection = !selectAll;
    const displayedIds = displayedProducts.map(p => p.id);
    setSelectAll(newSelection);

    if (newSelection) {
      const enlargedSelection = [...new Set([...newSelected, ...displayedIds])];
      setNewSelected(enlargedSelection);
    } else {
      const restrictedSelection = newSelected.filter(s => !displayedIds.includes(s));
      setNewSelected(restrictedSelection);
    }
};

  const handleSendProducts = e => {
      e.preventDefault();
      console.log(newSelected);
      StoreActions
          .sendSelectedProducts(selectedStore, newSelected)
          .then(response  => addToast(successToast))
          .catch(error => addToast(failToast));
      ;
  };

  const isAllSelected = () => {
    if (displayedProducts.find(p => !newSelected.includes(p.id)) !== undefined)
      setSelectAll(false);
    else 
      setSelectAll(true);
  };

  const addToast = newToast => setToasts([...toasts, newToast]);

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
            <CCardHeader className="d-flex align-items-center">
                <CCol col="6" sm="6" md="6">
                    Liste des produits
                </CCol>
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/products/new" variant="outline" color="success">CRÉER</Link>    
                    {/* block */}
                </CCol>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs="12" lg="6" className="my-2">
                  <Select className="mr-2" name="store" label="Lieu de vente" value={ isDefined(selectedStore) ? selectedStore.id : mainStore.id } onChange={ handleStoreChange }>
                      <option value={ mainStore.id }>{ mainStore.name }</option>
                      { isDefinedAndNotVoid(stores) && stores.map(store => <option key={ store.id } value={ store.id }>{ store.seller.name + " - " + store.name }</option>) }
                  </Select>
                </CCol>
                { selectedStore.id !== mainStore.id && 
                    <CCol xs="12" lg="6" className="mt-4 d-flex align-items-start justify-content-end pr-5">
                        <CFormGroup row variant="custom-checkbox" inline className="d-flex align-items-center">
                            <input
                                className="mx-1 my-2"
                                type="checkbox"
                                name="inline-checkbox"
                                checked={ selectAll }
                                onClick={ handleSelectAll }
                                disabled={ displayedProducts.length === 0 }
                                style={{zoom: 2.3}}
                            />
                            <label variant="custom-checkbox" htmlFor="inline-checkbox1" className="my-1">Tous</label>
                        </CFormGroup>
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
                    <>
                      <CDataTable
                        items={ displayedProducts }
                        fields={ selectedStore.id === mainStore.id ?
                            fields.filter(f => f !== 'disponibilité') :
                            fields.filter(f => f !== 'promo')
                        }
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
                        tableFilter
                        onTableFilterChange={ word => setSearch(word) }
                        scopedSlots = {{
                          'name':
                            item => <td>
                                      <Link to={ "/components/products/" + item.id }>
                                          { item.available ? <i className="fas fa-store mr-2 text-success"></i> : <i className="fas fa-store-slash mr-2 text-danger"></i> }
                                          { item.name }
                                      </Link>
                                    </td>
                          ,
                          'promo':
                            item => <td>
                                        { isDefined(item.discount) && item.discount > 0 && isDefined(item.offerEnd) && new Date(item.offerEnd) >= new Date() ?
                                            <CBadge color="warning">
                                                <span style={{ fontSize: "1.2em"}}>{ item.discount + " %" }</span>
                                            </CBadge>
                                          : <>-</>
                                        }
                                    </td>
                          ,
                          'disponibilité':
                              item => <td style={{width: '20%', textAlign: 'start'}}>
                                          <input
                                              className="mx-1 my-1"
                                              type="checkbox"
                                              name="inline-checkbox"
                                              checked={ alreadySelected.includes(item.id) || newSelected.includes(item.id) }
                                              onClick={ () => handleSelect(item) }
                                              disabled={ alreadySelected.includes(item.id) }
                                              style={{zoom: 2.3}}
                                          />
                                      </td>
                          ,
                          ' ':
                            item => <td className="mx-3 my-2 text-center">
                                      <CButton block color="danger" disabled={ !isAdmin && item.seller.users.find(user => user.id === currentUser.id) === undefined } onClick={ () => handleDelete(item.id) }>
                                        Supprimer
                                      </CButton>
                                    </td>
                        }}
                      />
                      { selectedStore.id !== mainStore.id &&
                          <>
                            <CRow className="my-4"></CRow>
                            <CRow className="mt-4 d-flex justify-content-center align-items-start">
                                <CButton size="sm" color="success" onClick={ handleSendProducts } className={ "ml-2" } style={{width: '140px', height: '42px'}} disabled={ newSelected.length === 0 }>
                                    Envoyer sur { selectedStore.name }
                                </CButton>
                            </CRow>
                          </>
                      }
                    </>
              }
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="12" lg="6">
              {Object.keys(toasters).map((toasterKey) => (
                <CToaster
                  position={toasterKey}
                  key={'toaster' + toasterKey}
                >
                  {
                    toasters[toasterKey].map((toast, key)=>{
                    return(
                      <CToast
                        key={ 'toast' + key }
                        show={ true }
                        autohide={ toast.autohide }
                        fade={ toast.fade }
                        color={ toast.color }
                        style={{ color: 'white' }}
                      >
                        <CToastHeader closeButton={ toast.closeButton }>
                            { toast.title }
                        </CToastHeader>
                        <CToastBody style={{ backgroundColor: 'white', color: "black" }}>
                            { toast.messsage }
                        </CToastBody>
                      </CToast>
                    )
                  })
                  }
                </CToaster>
              ))}
            </CCol>
      </CRow>
    );
}

export default Products;