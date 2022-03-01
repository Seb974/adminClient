import React, { useEffect, useState } from 'react';
import CIcon from '@coreui/icons-react';
import { CFormGroup, CInput, CInputGroupText, CInputGroupAppend, CInputGroup } from '@coreui/react';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import ProductActions from 'src/services/ProductActions';
import { Spinner } from 'react-bootstrap';
import '../../assets/css/searchBar.css';

const ProductSearch = ({ product, setProduct, variation, setVariation, size, setSize, seller = null, supplier = null, withVariants = true, readOnly = false }) => {

    const [productSearch, setProductSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [hasResults, setHasResults] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productSearch.length === 0)
            setSuggestions([]);
            setHasResults(false);
    }, [productSearch]);

    const handleProductSearch = ({ currentTarget }) => setProductSearch(currentTarget.value);
    const handleDeleteSelection = ({ currentTarget }) => {
        setSize(null);
        setVariation(null);
        setProduct(null);
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            let response = null;
            if (!isDefined(seller) && !isDefined(supplier))
                response = await getAllProductsContainingWord(productSearch);
            else if (isDefined(seller) && !isDefined(supplier))
                response = await getSellerProductsContainingWord(productSearch, seller);
            else if (!isDefined(seller) && isDefined(supplier))
                response = await getSupplierProductsContainingWord(productSearch, supplier);
            else
                response = await getSellerProductsFromSupplierContainingWord(productSearch, seller, supplier);
            
            if (isDefined(response)) {
                const newSuggestions = withVariants ? 
                    getSuggestionsWithVariants(response['hydra:member']) : 
                    getSuggestionsWithoutVariants(response['hydra:member']);
                setSuggestions(newSuggestions);
                setHasResults(true);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getAllProductsContainingWord = async (word) => {
        return await ProductActions.getAllProductsContainingWord(word);
    };

    const getSellerProductsContainingWord = async (word, seller) => {
        return await ProductActions.getSellerProductsContainingWord(word, seller);
    };

    const getSupplierProductsContainingWord = async (word, supplier) => {
        return await ProductActions.getSupplierProductsContainingWord(word, supplier);
    };

    const getSellerProductsFromSupplierContainingWord = async (word, seller, supplier) => {
        return await ProductActions.getSellerProductsFromSupplierContainingWord(word, seller, supplier);
    };

    const getSuggestionsWithVariants = products => {
        let newSuggestions = [];
        products.map(p => {
            if (!isDefinedAndNotVoid(p.variations)) {
                newSuggestions = [...newSuggestions, {product: p, variation: null, size: null}];
            } else {
                p.variations.map((v, i) => {
                    v.sizes.map((s, j) => {
                        newSuggestions = [...newSuggestions, {product: p, variation: v, size: s}];
                    })
                });
            }
        });
        return newSuggestions;
    };

    const getSuggestionsWithoutVariants = products => products.map(p => ({ product: p}));

    const handleSelect = suggestion => {
        setProduct(suggestion.product);
        setVariation(suggestion.variation);
        setSize(suggestion.size);
        setSuggestions([]);
        setProductSearch("");
        setHasResults(false);
    };

    const getSelectionName = () => {
        const variationName = isDefined(variation) && variation.color.length > 0 && variation.color !== " " ? " " + variation.color : '';
        const sizeName = isDefined(size) && size.name.length > 0 && size.name !== " " ? " " + size.name : '';
        return  product.name + variationName + sizeName;
    };

    return isDefined(product) ? 
        <CFormGroup>
            <CInputGroup>
                <CInput
                    name="product"
                    value={ getSelectionName() }
                    disabled={ true }
                />
                { !readOnly &&
                    <CInputGroupAppend>
                        <CInputGroupText onClick={ handleDeleteSelection }>
                            <i class="fas fa-times"></i>
                        </CInputGroupText>
                    </CInputGroupAppend>
                }
            </CInputGroup> 
        </CFormGroup>
    : 
        <CFormGroup>
            <CInputGroup>
                <CInput
                    id="productSearch"
                    name="productSearch"
                    value={ productSearch }
                    onChange={ handleProductSearch }
                    placeholder="Rechercher..."
                />
                <CInputGroupAppend>
                    { loading ? 
                        <CInputGroupText>
                            <Spinner animation="border" variant="warning" size="sm"/>
                        </CInputGroupText> : 
                        <CInputGroupText onClick={ handleSearch }>
                            <span className={ productSearch.length === 0 ? "" : "text-success" }>
                                <CIcon name="cil-magnifying-glass"/>
                            </span>
                        </CInputGroupText>
                    }
                </CInputGroupAppend>
            </CInputGroup>
            <div className="mapboxgl-ctrl-geocoder">
                <div className="suggestions-wrapper">
                    { !isDefinedAndNotVoid(suggestions) && !hasResults ? <></> :
                    !isDefinedAndNotVoid(suggestions) ?
                        <ul className="suggestions no-suggestion" >
                            <li>
                                <a>
                                    <div className="mapboxgl-ctrl-geocoder--suggestion">
                                        <div className="mapboxgl-ctrl-geocoder--suggestion-title"> </div>
                                        <div className="mapboxgl-ctrl-geocoder--suggestion-address">
                                            <small className="text-danger"><i>Aucun produit ne correspond à votre recherche.</i></small>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    :
                        <ul className="suggestions" >
                            { suggestions.map((suggestion, i) => {
                                return (
                                    <li key={ i } onClick={ e => handleSelect(suggestion) }>
                                        <a>
                                            <div className="mapboxgl-ctrl-geocoder--suggestion">
                                                <div className="mapboxgl-ctrl-geocoder--suggestion-title">{ suggestion.product.name }</div>
                                                { isDefined(suggestion.variation) && isDefined(suggestion.size) &&
                                                    <div className="mapboxgl-ctrl-geocoder--suggestion-address">{ suggestion.variation.color + " " + suggestion.size.name }</div>
                                                }
                                            </div>
                                        </a>
                                    </li>
                                )})
                            }
                        </ul>

                    }
                </div>
            </div>
        </CFormGroup>
    ;
}
 
export default ProductSearch;