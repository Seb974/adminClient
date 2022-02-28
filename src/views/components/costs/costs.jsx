import React, { useEffect, useState } from 'react';
import ProductActions from '../../../services/ProductActions'
import { CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CCardFooter, CCollapse } from '@coreui/react';
import { Link } from 'react-router-dom';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import useWindowDimensions from 'src/helpers/screenDimensions';
import { getWritableProduct } from 'src/helpers/products';

const Costs = (props) => {

    const itemsPerPage = 30;
    const fields = ['name', 'Avantageux', 'Coût HT'];
    const { width } = useWindowDimensions();
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [details, setDetails] = useState([]);

    useEffect(() => getDisplayedProducts(), []);
    useEffect(() => getDisplayedProducts(), [search]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);

    const getDisplayedProducts = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedProducts(search, page) : await getProducts(page);
        if (isDefined(response)) {
            const simpleProducts = response['hydra:member'].filter(p => !isDefinedAndNotVoid(p.components));
            const products = getProductsWithCosts(simpleProducts);
            setDisplayedProducts(products);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getProducts = (page = 1) => page >=1 ? ProductActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedProducts = (word, page = 1) => ProductActions.findWord(word, page, itemsPerPage);


    const getProductsWithCosts = products => {
        return products.map(product => {
            let costs = product.costs;
            product.suppliers.map(supplier => {
                const pricedSuppliers = getPricedSuppliers(product.costs);
                if (!pricedSuppliers.includes(supplier.id)) {
                    costs = [...costs, { supplier, value: 0 }]
                }
            });
            return {...product, costs};
        });
    };

    const getPricedSuppliers = costs => costs.map(c => isDefined(c.supplier) ? c.supplier.id : 0).filter(c => c > 0);

    const toggleDetails = (index, e) => {
        e.preventDefault();
        const position = details.indexOf(index);
        let newDetails = details.slice();
        if (position !== -1) {
            newDetails.splice(position, 1);
        } else {
            newDetails = [...details, index];
        }
        setDetails(newDetails);
    };

    const handleUpdate = async () => {
        await Promise.all(
            displayedProducts
                .filter(p => hasUpdated(p))
                .map( async product => {
                    const writableProduct = getWritableProduct(product)
                    return await ProductActions
                                     .update(product.id, {...writableProduct, costs : product.costs.map(({updated, ...c}) => ({...c, supplier: c.supplier['@id'], value: getFloat(c.value)}))})
                                     .catch(error => console.log(error));

                }));
        setDisplayedProducts(displayedProducts.map(p => ({...p, costs: p.costs.map(c => ({...c, updated: false}))})));
    };

    const handlePriceChange = ({ currentTarget }, item, cost) => {
        const newCost = { ...cost, value: currentTarget.value, updated: true };
        const newProduct = { ...item, costs: item.costs.map(c => c.supplier.id === cost.supplier.id ? newCost : c)};
        const newProducts = displayedProducts.map(p => p.id === newProduct.id ? newProduct : p);
        setDisplayedProducts(newProducts);
    };

    const needsUpdate = () => displayedProducts.findIndex(p => hasUpdated(p)) === -1;
    const hasUpdated = product => product.costs.findIndex(c => isDefined(c.updated) && c.updated) !== -1;

    const getCheapestSupplier = (costs, parameter) => {

        const cheapest = costs.reduce((less, curr) => {
            return less = !isDefined(less) || curr.value < less.value ? curr : less;
        }, null);
        return !isDefined(cheapest) || cheapest.value === 0 ? "-" : parameter === "name" ? cheapest.supplier.name : cheapest.value + " €" ;
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>Coût d'achat des produits</CCardHeader>
            <CCardBody>
            <CDataTable
              items={ displayedProducts }
              fields={ width < 576 ? ['name', 'Avantageux'] : fields }
              bordered
              itemsPerPage={ displayedProducts.length }
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
                    item => <td style={{ width: '25%'}}>
                                <Link to="#" onClick={ e => { toggleDetails(item.id, e) }} >{ item.name }</Link>
                            </td>
                ,
                'Avantageux':
                    item => <td style={{ width: '25%'}}>{ getCheapestSupplier(item.costs, "name") }</td>
                ,
                'Coût HT':
                    item => <td style={{ width: '25%'}}>{ getCheapestSupplier(item.costs, "cost") }</td>
                ,
                'details':
                    item => <CCollapse show={details.includes(item.id)}>
                                <CDataTable
                                    items={ item.costs }
                                    fields={ [
                                        { key: 'Fournisseur', _style: { width: '50%'} },
                                        { key: 'PrixHT', _style: { width: '50%'} }
                                    ] }
                                    bordered
                                    itemsPerPage={ 10 }
                                    hover
                                    scopedSlots = {{
                                        'Fournisseur':
                                            cost => <td>{ cost.supplier.name }</td>
                                        ,
                                        'PrixHT':
                                            cost => <td>
                                                        <CInputGroup>
                                                            <CInput
                                                                type="number"
                                                                name={ cost.id }
                                                                value={ cost.value }
                                                                onChange={ e => handlePriceChange(e, item, cost) }
                                                                style={{ maxWidth: '180px'}}
                                                            />
                                                            <CInputGroupAppend>
                                                                <CInputGroupText style={{ minWidth: '43px'}}>€</CInputGroupText>
                                                            </CInputGroupAppend>
                                                        </CInputGroup>
                                                    </td>
                                    }}
                                />
                            </CCollapse>
              }}
            />
            </CCardBody>
            <CCardFooter className="d-flex justify-content-center">
                <CButton size="sm" color="success" onClick={ handleUpdate } className="my-3" style={{width: '140px', height: '35px'}} disabled={ needsUpdate() }>
                    Mettre à jour
                </CButton>
            </CCardFooter>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Costs;