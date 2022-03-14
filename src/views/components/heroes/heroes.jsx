import React, { useEffect, useState } from 'react';
import HeroActions from '../../../services/HeroActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import HomepageActions from 'src/services/HomepageActions';
import Select from 'src/components/forms/Select';

const Heroes = ({ history }) => {

    const itemsPerPage = 50;
    const fields = ['title', ' '];
    const [heroes, setHeroes] = useState([]);
    const [homepages, setHomepages] = useState([]);
    const [selectedHomepage, setSelectedHomepage] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => fetchHomepages(), []);
    useEffect(() => getDisplayedHeroes(), [selectedHomepage, search]);
    useEffect(() => getDisplayedHeroes(currentPage), [currentPage]);

    useEffect(() => {
          if (isDefinedAndNotVoid(homepages) && !isDefined(selectedHomepage))
             setSelectedHomepage(homepages.find(h => h.selected));
    }, [homepages]);

    const getDisplayedHeroes = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedHeroes(search, page) : isDefined(selectedHomepage) ? await getHeroes(selectedHomepage['@id'], page) : undefined;
        if (isDefined(response)) {
            setHeroes(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getHeroes = (homepage, page = 1) => page >=1 ? HeroActions.findAllPaginated(homepage, page, itemsPerPage) : undefined;
    const getSearchedHeroes = (word, page = 1) => page >=1 ? HeroActions.findWord(word, page, itemsPerPage) : undefined;

    const fetchHomepages = () => {
        HomepageActions
          .findAll()
          .then(response => setHomepages(response))
          .catch(error => history.replace("/components/heroes"));
    };

    const handleHomepageChange = ({ currentTarget }) => {
        setCurrentPage(1);
        const newSelection = homepages.find(h => h.id === parseInt(currentTarget.value));
        setSelectedHomepage(newSelection);
    };

    const handleDelete = (heroToDelete) => {
        const originalHeroes = [...heroes];
        setHeroes(heroes.filter(zone => zone.id !== heroToDelete.id));
        HeroActions
            .delete(heroToDelete.id)
            .catch(error => {
                setHeroes(originalHeroes);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des slides Hero
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/heroes/new" block variant="outline" color="success">CRÉER</Link>
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
              items={ heroes }
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
                  item => <td><Link to={ "/components/heroes/" + item.id }>{ item.title }</Link></td>
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
 
export default Heroes;