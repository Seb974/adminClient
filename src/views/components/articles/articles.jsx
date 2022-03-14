import React, { useEffect, useState } from 'react';
import ArticleActions from '../../../services/ArticleActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Articles = (props) => {

    const itemsPerPage = 50;
    const fields = ['title', ' '];
    const [articles, setArticles] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedArticles(), []);
    useEffect(() => getDisplayedArticles(), [search]);
    useEffect(() => getDisplayedArticles(currentPage), [currentPage]);

    const getDisplayedArticles = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedArticles(search, page) : await getArticles(page);
        if (isDefined(response)) {
            setArticles(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getArticles = (page = 1) => page >=1 ? ArticleActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedArticles = (word, page = 1) => ArticleActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalArticles = [...articles];
        setArticles(articles.filter(article => article.id !== id));
        ArticleActions
            .delete(id)
            .catch(error => {
                setArticles(originalArticles);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des articles de blog
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/articles/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ articles }
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
                'title':
                  item => <td><Link to={ "/components/articles/" + item.id }>{ item.title }</Link></td>
                ,
                ' ':
                  item =><td><CButton block color="danger" onClick={ () => handleDelete(item.id) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Articles;