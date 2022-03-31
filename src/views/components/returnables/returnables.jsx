import React, { useContext, useEffect, useState } from 'react';
import AuthContext from 'src/contexts/AuthContext';
import SellerActions from '../../../services/SellerActions';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInputGroup, CInput, CInputGroupAppend, CInputGroupText } from '@coreui/react';
import { Link } from 'react-router-dom';
import { getInt, isDefined } from 'src/helpers/utils';
import Roles from 'src/config/Roles';
import PackageActions from 'src/services/PackageActions';

const Returnables = () => {

    const itemsPerPage = 50;
    const { currentUser } = useContext(AuthContext);
    const fields = ['nom', 'ChezLeClient', 'Récupéré', ' '];
    const [packages, setPackages] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => fetchPackages(), []);

    const fetchPackages = () => {
        PackageActions
            .findPackagesNeedingReturn()
            .then(response => {
                const returns = response.map(r => ({...r, returned: 0}));
                setPackages(returns);
            })
            .catch(error => console.log(error));
    };

    const handleReturn = (item) => {
        console.log(item);
        PackageActions
            .updateReturns(item.id, {...item, returned: getInt(item.returned), container: item.container['@id'], orderEntity: item.orderEntity['@id']})
            .then(response => setPackages(packages.filter(p => p.id !== item.id)))
            .catch(error => console.log(error));
    }

    const handleReturnChange = ({ currentTarget }, item) => {
        const newPackages = packages.map(p => p.id !== getInt(currentTarget.name) ? p : {...item, returned: currentTarget.value});
        setPackages(newPackages);
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des consignes
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ packages }
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
              scopedSlots = {{
                'nom':
                  item => <td>{ item.orderEntity.name }</td>
                ,
                'ChezLeClient':
                  item => <td>{ item.quantityToReturn } U</td>
                ,
                'Récupéré':
                  item => <td>
                              <CInputGroup>
                                  <CInput
                                      type="number"
                                      name={ item.id }
                                      value={ item.returned }
                                      onChange={ e => handleReturnChange(e, item) }
                                      style={{ maxWidth: '180px'}}
                                  />
                                  <CInputGroupAppend>
                                      <CInputGroupText style={{ minWidth: '43px'}}>U</CInputGroupText>
                                  </CInputGroupAppend>
                              </CInputGroup>
                          </td>
                ,
                ' ':
                  item =><td><CButton block color="success" disabled={ !(item.returned > 0) } onClick={ () => handleReturn(item) } style={{ maxWidth: '120px' }}>Valider</CButton></td>
              }}
            />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    );
};

export default Returnables;