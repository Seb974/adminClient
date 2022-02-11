import React, { useEffect, useState } from 'react';
import DepartmentActions from '../../../services/DepartmentActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CToaster, CToast, CToastHeader, CToastBody } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';
import StoreActions from 'src/services/StoreActions';
import Select from 'src/components/forms/Select';

const Departments = (props) => {

    const itemsPerPage = 20;
    const fields = ['name', 'partagé', ' '];
    const [departments, setDepartments] = useState([]);
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
    const successMessage = "Les catégories ont bien été envoyés.";
    const failMessage = "Un problème est survenu lors de l'envoi des catégories à la boutique.\n";
    const failLoadingMessage = "Un problème est survenu lors du chargement des données. Vérifiez l'état de votre connexion.\n";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Echec de l\'envoi' };
    const failLoadingToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failLoadingMessage, title: 'Echec du chargement' };

    useEffect(() => {
      fetchStores();
      getDisplayedDepartments();
    }, []);

    useEffect(() => getDisplayedDepartments(), [search]);
    useEffect(() => getDisplayedDepartments(currentPage), [currentPage]);
    useEffect(() => isAllSelected(), [departments, newSelected]);

    const getDisplayedDepartments = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedDepartments(search, page) : await getDepartments(page);
        if (isDefined(response)) {
            setDepartments(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getDepartments = (page = 1) => page >=1 ? fetchPaginatedDepartments(page) : undefined;
    const getSearchedDepartments = (word, page = 1) => fetchDepartmentsContainingWord(word, page);

    const fetchPaginatedDepartments = (page) => {
      return DepartmentActions
                .findAllPaginated(page, itemsPerPage)
                .catch(error => addToast(failLoadingToast));
  };

    const fetchDepartmentsContainingWord = (word, page) => {
        return DepartmentActions
                  .findWord(word, page, itemsPerPage)
                  .catch(error => addToast(failLoadingToast));
    };

    const fetchStores = () => {
      StoreActions
          .findAll()
          .then(response => setStores(response))
          .catch(error => addToast(failLoadingToast));
    };

    const handleStoreChange = ({ currentTarget }) => {
        const newStore = isDefinedAndNotVoid(stores) ? 
            stores.find(s => s.id === parseInt(currentTarget.value))
        : mainStore;
        setSelectedStore(isDefined(newStore) ? newStore : mainStore);
        setNewSelected([]);
        setCurrentPage(1);
        if (isDefined(newStore))
          getHiboutikCategories(newStore);
    };

    const getHiboutikCategories = store => {
      setSearch("");
      setCurrentPage(1);
      setLoading(true);
      StoreActions
          .getCategories(store)
          .then(response => {
              const selection = [...new Set(response.map(s => parseInt(s['category_ref_ext'])))].filter(s => !isNaN(s));
              setAlreadySelected(selection);
              setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            addToast(failLoadingToast);
          });
  };

  const handleSelect = category => {
    const newSelection = newSelected.includes(category.id) ? newSelected.filter(s => s !== category.id) : [...newSelected, category.id];
    setNewSelected(newSelection);
  };

  const handleSelectAll = () => {
    const newSelection = !selectAll;
    const displayedIds = departments.map(d => d.id);
    setSelectAll(newSelection);

    if (newSelection) {
      const enlargedSelection = [...new Set([...newSelected, ...displayedIds])];
      setNewSelected(enlargedSelection);
    } else {
      const restrictedSelection = newSelected.filter(s => !displayedIds.includes(s));
      setNewSelected(restrictedSelection);
    }
  };

  const handleDelete = (id) => {
      const originalDepartments = [...departments];
      setDepartments(departments.filter(category => category.id !== id));
      DepartmentActions.delete(id)
                      .catch(error => {
                          setDepartments(originalDepartments);
                          console.log(error.response);
                      });
  };

  const handleSendCategories = e => {
    e.preventDefault();
    console.log(newSelected);
    StoreActions
        .sendSelectedCategories(selectedStore, newSelected)
        .then(response  => addToast(successToast))
        .catch(error => addToast(failToast));
    ;
};

  const isAllSelected = () => {
    if (departments.find(p => !newSelected.includes(p.id)) !== undefined)
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
            <CCardHeader>
                Liste des rayons
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/departments/new" block variant="outline" color="success">CRÉER</Link>
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
                                disabled={ departments.length === 0 }
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
                    items={ departments }
                    fields={ selectedStore.id === mainStore.id ? fields.filter(f => f !== 'partagé') : fields }
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
                        item => <td><Link to={ "/components/departments/" + item.id }>{ item.name }</Link></td>
                      ,
                      'partagé':
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
                        item => <td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
                    }}
                  />
                  { selectedStore.id !== mainStore.id &&
                      <>
                        <CRow className="my-4"></CRow>
                        <CRow className="mt-4 d-flex justify-content-center align-items-start">
                            <CButton size="sm" color="success" onClick={ handleSendCategories } className={ "ml-2" } style={{width: '140px', height: '42px'}} disabled={ newSelected.length === 0 }>
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
 
export default Departments;