import React, { useEffect, useState } from 'react';
import CategoryActions from '../../../services/CategoryActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Categories = (props) => {

    const itemsPerPage = 50;
    const fields = ['name', ' '];
    const [categories, setCategories] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedCategories(), []);
    useEffect(() => getDisplayedCategories(), [search]);
    useEffect(() => getDisplayedCategories(currentPage), [currentPage]);

    const getDisplayedCategories = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedCategories(search, page) : await getCategories(page);
        if (isDefined(response)) {
            setCategories(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getCategories = (page = 1) => page >=1 ? CategoryActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedCategories = (word, page = 1) => CategoryActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalCategories = [...categories];
        setCategories(categories.filter(category => category.id !== id));
        CategoryActions.delete(id)
                       .catch(error => {
                            setCategories(originalCategories);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des catégories
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/categories/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ categories }
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
              tableFilter
              onTableFilterChange={ word => setSearch(word) }
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/categories/" + item.id }>{ item.name }</Link></td>
                ,
                ' ':
                  item => <td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Categories;