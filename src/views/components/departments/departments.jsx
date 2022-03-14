import React, { useEffect, useState } from 'react';
import DepartmentActions from '../../../services/DepartmentActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CFormGroup, CToaster, CToast, CToastHeader, CToastBody, CCollapse } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import Spinner from 'react-bootstrap/Spinner';
import StoreActions from 'src/services/StoreActions';
import Select from 'src/components/forms/Select';
import ParentDepartmentActions from 'src/services/ParentDepartmentActions';

const Departments = (props) => {

    const itemsPerPage = 50;
    const fields = ['name', ' '];
    const [details, setDetails] = useState([]);
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
    const notThrowableMessage = "Le département ne peut être supprimé car celui-ci contient des rayons.\n";
    const successToast = { position: 'top-right', autohide: 3000, closeButton: true, fade: true, color: 'success', messsage: successMessage, title: 'Succès' };
    const failToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failMessage, title: 'Echec de l\'envoi' };
    const failLoadingToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'warning', messsage: failLoadingMessage, title: 'Echec du chargement' };
    const notThrowableToast = { position: 'top-right', autohide: 7000, closeButton: true, fade: true, color: 'danger', messsage: notThrowableMessage, title: 'Suppression impossible' };

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
      return ParentDepartmentActions
                .findAllPaginated(page, itemsPerPage)
                .catch(error => addToast(failLoadingToast));
  };

    const fetchDepartmentsContainingWord = (word, page) => {
        return ParentDepartmentActions
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
    let displayedIds = [];
    departments.map(p => {
        displayedIds = [...displayedIds, ...p.departments.map(d => d.id)];
    });
    setSelectAll(newSelection);

    if (newSelection) {
      const enlargedSelection = [...new Set([...newSelected, ...displayedIds])];
      setNewSelected(enlargedSelection);
    } else {
      const restrictedSelection = newSelected.filter(s => !displayedIds.includes(s));
      setNewSelected(restrictedSelection);
    }
  };

  const handleDeleteDepartment = (departmentId, parentDepartmentId) => {
      const originalDepartments = [...departments];
      const newDepartment = departments.find(d => d.id === parseInt(parentDepartmentId));
      setDepartments(departments.map(d => d.id === newDepartment.id ? {...newDepartment, departments: newDepartment.departments.filter(d => d.id !== parseInt(departmentId))} : d));
      DepartmentActions
          .delete(departmentId)
          .catch(error => {
              setDepartments(originalDepartments);
              console.log(error.response);
          });
  };

  const handleDeleteParent = (id) => {
    const parentToDelete = departments.find(d => d.id === parseInt(id));

    if (isDefined(parentToDelete) && isDefinedAndNotVoid(parentToDelete.departments)) {
        addToast(notThrowableToast);
        return ;
    }

    const originalDepartments = [...departments];
    setDepartments(departments.filter(category => category.id !== id));
    ParentDepartmentActions
        .delete(id)
        .catch(error => {
            setDepartments(originalDepartments);
            console.log(error.response);
        });
  }

  const handleSendCategories = e => {
    e.preventDefault();
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
  }

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
              <CRow className="my-2">
                <CCol sm="12" md="6">
                    <p>Liste des rayons</p>
                </CCol>
                <CCol sm="6" md="6" className="d-flex justify-content-end">
                    <Link role="button" to="/components/departments/parent/new" block variant="outline" color="success" className="mr-4">CRÉER UN DÉPARTEMENT</Link>
                    <Link role="button" to="/components/departments/new" block variant="outline" color="success" className="mx-2">CRÉER UN RAYON</Link>
                </CCol>
              </CRow>
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
                    hover
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
                                    <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} disabled={ item.status === "WAITING" }>
                                      { item.name }
                                    </Link>
                                </td>
                      ,
                      ' ':
                        item => <td className="">
                                  <CButton color="warning" href={ "#/components/departments/parent/" + item.id } className="mx-1 my-1"><i className="fas fa-pen"></i></CButton>
                                  <CButton color="danger" onClick={ () => handleDeleteParent(item.id) } className="mx-1 my-1"><i className="fas fa-trash"></i></CButton>
                                </td>
                      ,
                      'details':
                        item => <CCollapse show={details.includes(item.id)}>
                                    <CDataTable
                                        items={ item.departments }
                                        fields={ selectedStore.id === mainStore.id ? ['Rayon', ' '] : ['Rayon', 'partagé', ' '] }
                                        bordered
                                        hover
                                        scopedSlots = {{
                                          'Rayon':
                                            child => <td>
                                                      <Link to={ "/components/departments/" + child.id }>{ child.name }</Link>
                                                    </td>
                                          ,
                                          'partagé':
                                            child => <td style={{width: '20%', textAlign: 'start'}}>
                                                          <input
                                                              className="mx-1 my-1"
                                                              type="checkbox"
                                                              name="inline-checkbox"
                                                              checked={ alreadySelected.includes(child.id) || newSelected.includes(child.id) }
                                                              onClick={ () => handleSelect(child) }
                                                              disabled={ alreadySelected.includes(child.id) }
                                                              style={{zoom: 2.3}}
                                                          />
                                                      </td>
                                          ,
                                          ' ':
                                            child => <td>
                                                        <CButton color="danger" onClick={ () => handleDeleteDepartment(child.id, item.id) }className="mx-1 my-1">
                                                            <i className="fas fa-trash"></i>
                                                        </CButton>
                                                      </td>
                                        }}
                                    />
                                </CCollapse>
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