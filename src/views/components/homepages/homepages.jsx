import React, { useEffect, useState } from 'react';
import HomepageActions from '../../../services/HomepageActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable';
import { Link } from 'react-router-dom';

const Homepages = (props) => {

    const itemsPerPage = 15;
    const fields = ['name', ' '];
    const [homepages, setHomepages] = useState([]);

    useEffect(() => {
        HomepageActions.findAll()
            .then(response => setHomepages(response))
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (homepageToDelete) => {

        const originalHomepages = [...homepages];
        setHomepages(homepages.filter(zone => zone.id !== homepageToDelete.id));
        HomepageActions
            .delete(homepageToDelete.id)
            .catch(error => {
                setHomepages(originalHomepages);
                console.log(error.response);
            });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des pages d'accueil
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/homepages/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ homepages }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'name':
                  item => <td><Link to={ "/components/homepages/" + item.id }>{ item.name }</Link></td>
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
 
export default Homepages;