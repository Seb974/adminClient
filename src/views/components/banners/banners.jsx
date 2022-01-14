import React, { useEffect, useState } from 'react';
import BannerActions from '../../../services/BannerActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import HomepageActions from 'src/services/HomepageActions';
import Select from 'src/components/forms/Select';

const Banners = ({ match, history }) => {

    const itemsPerPage = 3;
    const fields = ['title', 'espace', ' '];
    const [banners, setBanners] = useState([]);
    const [homepages, setHomepages] = useState([]);
    const [selectedHomepage, setSelectedHomepage] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => fetchHomepages(), []);
    useEffect(() => getDisplayedBanners(), [selectedHomepage, search]);
    useEffect(() => getDisplayedBanners(currentPage), [currentPage]);

    useEffect(() => {
          if (isDefinedAndNotVoid(homepages) && !isDefined(selectedHomepage))
             setSelectedHomepage(homepages.find(h => h.selected));
    }, [homepages]);

    const getDisplayedBanners = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedBanners(search, page) : isDefined(selectedHomepage) ? await getBanners(selectedHomepage['@id'], page) : undefined;
        if (isDefined(response)) {
            setBanners(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getBanners = (homepage, page = 1) => page >=1 ? BannerActions.findAllPaginated(homepage, page, itemsPerPage) : undefined;
    const getSearchedBanners = (word, page = 1) => page >=1 ? BannerActions.findWord(word, page, itemsPerPage) : undefined;

    const fetchHomepages = () => {
        HomepageActions
          .findAll()
          .then(response => setHomepages(response))
          .catch(error => {
              console.log(error);
              // TODO : Notification flash d'une erreur
              history.replace("/components/banners");
          });
    };

    const handleHomepageChange = ({ currentTarget }) => {
        setCurrentPage(1);
        const newSelection = homepages.find(h => h.id === parseInt(currentTarget.value));
        setSelectedHomepage(newSelection);
    };

    const handleDelete = (bannerToDelete) => {
        const originalBanners = [...banners];
        setBanners(banners.filter(zone => zone.id !== bannerToDelete.id));
        BannerActions
            .delete(bannerToDelete.id)
            .catch(error => {
                setBanners(originalBanners);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des espaces publicitaires
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/banners/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs="12" lg="6">
                    <Select className="mr-2" name="homepage" label="Associé à la page" onChange={ handleHomepageChange } value={ isDefined(selectedHomepage) ? selectedHomepage.id : 0 }>
                        { homepages.map(home => <option key={ home.id } value={ home.id }>{ home.name }</option>) }
                    </Select>
                </CCol>
            </CRow>
            <CDataTable
              items={ banners }
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
                  item => <td><Link to={ "/components/banners/" + item.id }>{ item.title }</Link></td>
                ,
                'espace':
                  item => <td>{ item.bannerNumber + (item.isMain ? ' - Principal' : '') }</td>
                ,
                ' ':
                  item => <td><CButton block color="danger" onClick={ () => handleDelete(item) }>Supprimer</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Banners;