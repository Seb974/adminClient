import React, { useEffect, useState } from 'react';
import CatalogActions from '../../../services/CatalogActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';

const Catalogs = (props) => {

    const itemsPerPage = 15;
    const fields = ['nom', 'code', 'etat', ' '];
    const [catalogs, setCatalogs] = useState([]);

    useEffect(() => {
        CatalogActions.findAll()
            .then(response => {
              console.log(response);
              setCatalogs(response);
            })
            .catch(error => console.log(error.response));
    }, []);

    const handleDelete = (id) => {
        const originalCatalogs = [...catalogs];
        setCatalogs(catalogs.filter(catalog => catalog.id !== id));
        CatalogActions.delete(id)
                       .catch(error => {
                            setCatalogs(originalCatalogs);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des catalogues
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/catalogs/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ catalogs }
              fields={ fields }
              bordered
              itemsPerPage={ itemsPerPage }
              pagination
              scopedSlots = {{
                'nom':
                  item => <td><Link to={ "/components/catalogs/" + item.id }>{ item.name }</Link></td>
                ,
                'code':
                  item => <td><Link to={ "/components/catalogs/" + item.id }>{ item.code }</Link></td>
                ,
                'etat':
                  item => <td>{ item.isActive ? "Actif" : "-" }</td>
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
 
export default Catalogs;