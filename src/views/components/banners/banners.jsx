import React, { useEffect, useState } from 'react';
import BannerActions from '../../../services/BannerActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable';
import { Link } from 'react-router-dom';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import HomepageActions from 'src/services/HomepageActions';
import Select from 'src/components/forms/Select';

const Banners = ({ match, history }) => {

    const itemsPerPage = 15;
    const fields = ['name', 'espace', ' '];
    const [banners, setBanners] = useState([]);
    const [homepages, setHomepages] = useState([]);
    const [selectedHomepage, setSelectedHomepage] = useState(null);

    useEffect(() => {
        fetchHomepages();
        fetchBanners();
    }, []);

    useEffect(() => {
        if (isDefinedAndNotVoid(homepages) && !isDefined(selectedHomepage))
            setSelectedHomepage(homepages.find(h => h.selected));
    }, [homepages]);

    useEffect(() => fetchBanners(), [selectedHomepage]);

    const fetchBanners = () => {
        BannerActions.findAll()
          .then(response => {
              const associatedHeroes = isDefined(selectedHomepage) ? response.filter(h => h.homepage.id === selectedHomepage.id) : response;
              console.log(associatedHeroes);
              setBanners(associatedHeroes);
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
              history.replace("/components/banners");
          });
    };

    const handleHomepageChange = ({ currentTarget }) => {
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
              pagination
              scopedSlots = {{
                'name':
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