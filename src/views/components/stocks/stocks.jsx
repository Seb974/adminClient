import React, { useContext, useEffect, useState } from 'react';
import ProductActions from '../../../services/ProductActions'
import { CBadge, CCard, CCardBody, CCardHeader, CCol, CDataTable, CRow, CButton, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CCardFooter } from '@coreui/react';
import { DocsLink } from 'src/reusable'
import { Link } from 'react-router-dom';
import { getFloat, isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import useWindowDimensions from 'src/helpers/screenDimensions';
import StockActions from 'src/services/StockActions';
import ProductsContext from 'src/contexts/ProductsContext';

const Stocks = (props) => {

    const itemsPerPage = 4;
    const { currentUser } = useContext(AuthContext);
    const fields = ['name', 'Sécurité', 'Alerte', 'Niveau'];
    const [stocks, setStocks] = useState([]);
    const { height, width } = useWindowDimensions();
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => getDisplayedProducts(), []);
    useEffect(() => getDisplayedProducts(), [search]);
    useEffect(() => getDisplayedProducts(currentPage), [currentPage]);

    const getDisplayedProducts = async (page = 1) => {
        const response = isDefined(search) && search.length > 0 ? await getSearchedProducts(search, page) : await getProducts(page);
        if (isDefined(response)) {
            setDisplayedProducts(response['hydra:member']);
            setTotalItems(response['hydra:totalItems']);
        }
    };

    const getProducts = (page = 1) => page >=1 ? ProductActions.findAllPaginated(page, itemsPerPage) : undefined;
    const getSearchedProducts = (word, page = 1) => ProductActions.findWord(word, page, itemsPerPage);

    useEffect(() => setStocks(defineStocks(displayedProducts)), [displayedProducts]);

    const defineStocks = products => {
        let newStocks = [];
        products.map(product => {
            newStocks = getStock(product, newStocks);
        });
        return newStocks;
    };

    const getStock = (product, stocks) => {
        if (isDefined(product.stock))
            stocks = [...stocks, {...product.stock, name: product.name, unit: product.unit, updated: false }];
        else if (isDefinedAndNotVoid(product.variations)) {
            product.variations.map(variation => {
                if (isDefinedAndNotVoid(variation.sizes)) {
                    variation.sizes.map(size => {
                        stocks = [...stocks, {...size.stock, name: getProductName(product, variation, size), unit: product.unit, updated: false}];
                    });
                }
            });
        }
        return stocks;
    };

    const getProductName = (product, variation, size) => {
        const variationName = exists(variation, variation.color) ? " - " + variation.color : "";
        const sizeName = exists(size, size.name) ? " " + size.name : "";
        return product.name + variationName + sizeName;
    };

    const exists = (entity, entityName) => {
        return isDefined(entity) && isDefined(entityName) && entityName.length > 0 && entityName !== " ";
    };

    const handleChange = ({ currentTarget }, stock) => {
        const index = stocks.findIndex(s => parseInt(s.id) === parseInt(stock.id));
        const newStocks = stocks.map((s, i) => i !== index ? s : {...stock, quantity: currentTarget.value, updated: true} );
        setStocks(newStocks);
    };

    const handleUpdate = () => {
        const stocksToUpdate = stocks.filter(stock => stock.updated);
        stocksToUpdate.map(stock => {
            const {updated, name, ...dbStock} = stock;
            StockActions
                .update(dbStock.id, {...dbStock, quantity: getFloat(dbStock.quantity)})
                .then(response => {
                    if (response.data.id === stocksToUpdate[stocksToUpdate.length - 1].id) {
                        const newStocks = stocks.map(stock => ({...stock, updated: false}));
                        setStocks(newStocks);
                    }
                })
                .catch(error => console.log(error));
        })
    };

    const getSignPostName = item => {
        return (
            item.quantity <= item.security ?
                <span className={ width >= 576 ? "" : "text-danger" }>
                    { width >= 576 ? <i className="fas fa-exclamation-triangle mr-1 text-danger"></i> : ""} { item.name }
                </span>
            : item.quantity <= item.alert ? 
                <span className={ width >= 576 ? "" : "text-warning" }>
                    { width >= 576 ? <i className="fas fa-info-circle mr-1 text-warning"></i>  : ""} { item.name }
                </span>
            : item.name
        );
    };

    return (
        <CRow>
        <CCol xs="12" lg="12">
          <CCard>
            <CCardHeader>Etat des stocks</CCardHeader>
            <CCardBody>
            <CDataTable
              items={ stocks }
              fields={ width < 576 ? ['name', 'Niveau'] : fields }
              bordered
              itemsPerPage={ stocks.length }
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
                  item => <td style={{ width: '25%'}}>{ getSignPostName(item) }</td>
                ,
                'Sécurité':
                  item => <td className="d-none d-sm-table-cell d-md-table-cell d-lg-table-cell d-xl-table-cell" style={{ width: '20%'}}>{ item.security } { item.unit }</td>
                ,
                'Alerte':
                  item => <td className="d-none d-sm-table-cell d-md-table-cell d-lg-table-cell d-xl-table-cell" style={{ width: '20%'}}>{ item.alert } { item.unit }</td>
                ,
                'Niveau':
                  item => <td>
                                <CInputGroup>
                                    <CInput
                                        name="quantity"
                                        type="number"
                                        value={ item.quantity }
                                        onChange={ e => handleChange(e, item) }
                                        style={{ maxWidth: '180px'}}
                                    />
                                    <CInputGroupAppend>
                                        <CInputGroupText style={{ minWidth: '43px'}}>{ item.unit }</CInputGroupText>
                                    </CInputGroupAppend>
                                </CInputGroup>
                        </td>
              }}
            />
            </CCardBody>
            <CCardFooter className="d-flex justify-content-center">
                <CButton size="sm" color="success" onClick={ handleUpdate } className="my-3" style={{width: '140px', height: '35px'}} disabled={ stocks.findIndex(s => s.updated) === -1 }>
                    Mettre à jour
                </CButton>
            </CCardFooter>
          </CCard>
        </CCol>

      </CRow>
    );
}
 
export default Stocks;