import React, { useContext, useEffect, useState } from 'react';
import AuthContext from 'src/contexts/AuthContext';
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInputGroup, CInput, CInputGroupAppend, CInputGroupText } from '@coreui/react';
import { getInt } from 'src/helpers/utils';
import PackageActions from 'src/services/PackageActions';

const Returnables = () => {

    const itemsPerPage = 50;
    const { currentUser } = useContext(AuthContext);
    const fields = ['Client', 'ChezLeClient', 'Récupéré', ' '];
    const [packages, setPackages] = useState([]);

    useEffect(() => fetchPackages(), []);

    const fetchPackages = () => {
        PackageActions
            .findPackagesNeedingReturn()
            .then(response => {
                const returnablesOwner = [...new Set(response.map(p => p.orderEntity.email))];
                const returnables = returnablesOwner.map(o => {
                    const returnable = response.find(r => r.orderEntity.email === o);
                    const quantity = response.reduce((sum, curr) => sum += curr.orderEntity.email === o ? curr.quantityToReturn : 0, 0);
                    return {...returnable, quantity, returned: 0}
                })
                setPackages(returnables);
            })
            .catch(error => console.log(error));
    };

    const handleReturn = (item) => {
        const newPackage = getUpdatedPackage(item);
        PackageActions
            .updateReturns(item.id, newPackage)
            .then(response => {
                const newPackage = {...item, quantity: Math.max(item.quantity - item.returned, 0), returned: 0}
                const newPackages = packages.map(p => p.id === newPackage.id ? newPackage : p).filter(p => p.quantity > 0);
                setPackages(newPackages);
            })
            .catch(error => console.log(error));
    };

    const getUpdatedPackage = item => {
      const { container, orderEntity, returned, quantity, ..._package } = item;
      return {
        ..._package,
        container: container['@id'],
        orderEntity: orderEntity['@id'],
        returned: getInt(returned)
      }
    };

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
              pagination
              scopedSlots = {{
                'Client':
                  item => <td>
                              <b>{ item.orderEntity.name }</b> - <i style={{ fontSize: '0.7em' }}>{ item.orderEntity.metas.phone }</i><br/>
                              <i style={{ fontSize: '0.7em' }}>{ item.orderEntity.email }</i>
                          </td>
                ,
                'ChezLeClient':
                  item => <td>{ item.quantity } U</td>
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