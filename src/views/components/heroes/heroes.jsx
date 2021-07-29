import React, { useEffect, useState } from 'react';
import HeroActions from '../../../services/HeroActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import HomepageActions from 'src/services/HomepageActions';
import Select from 'src/components/forms/Select';

const Heroes = ({ match, history }) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [heroes, setHeroes] = useState([]);
    const [homepages, setHomepages] = useState([]);
    const [selectedHomepage, setSelectedHomepage] = useState(null);

    useEffect(() => {
        fetchHomepages();
        fetchHeroes();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(homepages) && !isDefined(selectedHomepage))
            setSelectedHomepage(homepages.find(h => h.selected));
    }, [homepages]);

    useEffect(() => fetchHeroes(), [selectedHomepage]);

    const fetchHeroes = () => {
        HeroActions.findAll()
          .then(response => {
              const associatedHeroes = isDefined(selectedHomepage) ? response.filter(h => h.homepage.id === selectedHomepage.id) : response;
              setHeroes(associatedHeroes);
          })
          .catch(error => console.log(error.response));
    };

    const fetchHomepages = () => {
        HomepageActions
          .findAll()
          .then(response => setHomepages(response))
          .catch(error => {
              console.log(error);
              // TODO : Notification flash d'une erreur
              history.replace("/components/heroes");
          });
    };

    const handleHomepageChange = ({ currentTarget }) => {
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
              pagination
              scopedSlots = {{
                'name':
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