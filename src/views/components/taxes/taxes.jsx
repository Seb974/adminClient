import React, { useEffect, useState } from 'react';
import TaxActions from '../../../services/TaxActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { isDefined } from 'src/helpers/utils';

const Taxes = (props) => {

    const itemsPerPage = 2;
    const fields = ['name', ' '];
    const [taxes, setTaxes] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedTaxes(), []);
    useEffect(() => getDisplayedTaxes(), [search]);
    useEffect(() => getDisplayedTaxes(currentPage), [currentPage]);

    const getDisplayedTaxes = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedTaxes(search, page) : await getTaxes(page);
        if (isDefined(response)) {
            setTaxes(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getTaxes = (page = 1) => page >=1 ? TaxActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedTaxes = (word, page = 1) => TaxActions.findWord(word, page, itemsPerPage);

    const handleDelete = (id) => {
        const originalTaxes = [...taxes];
        setTaxes(taxes.filter(tax => tax.id !== id));
        TaxActions.delete(id)
                       .catch(error => {
                            setTaxes(originalTaxes);
                            console.log(error.response);
                       });
    }

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>
                Liste des taxes
                <CCol col="6" sm="4" md="2" className="ml-auto">
                    <Link role="button" to="/components/taxes/new" block variant="outline" color="success">CRÉER</Link>
                </CCol>
            </CCardHeader>
            <CCardBody>
            <CDataTable
              items={ taxes }
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
                  item => <td><Link to={ "/components/taxes/" + item.id }>{ item.name }</Link></td>
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
 
export default Taxes;