import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductActions from 'src/services/ProductActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CRow } from '@coreui/react';
import { getFormattedVariations, getFormattedComponents, getProductToWrite, getComponentsToWrite, getVariationToWrite, formatProduct, defineType } from 'src/helpers/products';
import CIcon from '@coreui/icons-react';
import CategoryActions from 'src/services/CategoryActions';
import Stock from 'src/components/productPages/stock';
import Price from 'src/components/productPages/price';
import Options from 'src/components/productPages/options';
import Characteristics from 'src/components/productPages/characteristics';
import ProductsContext from 'src/contexts/ProductsContext';
import Type from 'src/components/productPages/type';
import AuthContext from 'src/contexts/AuthContext';
import Roles from 'src/config/Roles';
import { getDateFrom } from 'src/helpers/utils';

const ProductPage = ({ match, history }) => {

    const now = new Date();
    const today = getDateFrom(now, 0, 4, 0, 0);
    const { id = "new" } = match.params;
    const defaultSize = {count: 0, name: ""};
    const [editing, setEditing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const { currentUser } = useContext(AuthContext);
    const { products } = useContext(ProductsContext);
    const defaultVariant = null;
    const defaultVariantSize = defaultVariant !== null && products[0].variations[0].sizes && products[0].variations[0].sizes.length > 0 ? products[0].variations[0].sizes[0] : null;
    const defaultProduct = {product: products[0], variation: defaultVariant, size: defaultVariantSize};
    const defaultComponent = {...defaultProduct, count: 0, quantity: ""};
    const defaultStock = {quantity: 0, alert: "", security:""};
    const defaultVariation = {count: 0, name: "", image: null, sizes: [defaultSize]};
    const [product, setProduct] = useState({name: "", weight:"", contentWeight:"", seller: {id: -1, name: ""}, userGroups: [], catalogs: [], image: null, unit: "Kg", productGroup: "J + 1", fullDescription: "", stock: defaultStock, stockManaged: true, tax: "-1", uniquePrice: true, prices: [], available: true, requireLegalAge: false, requireDeclaration: true, new: true, isMixed: false, categories: [], discount: "", offerEnd: today});
    const [errors, setErrors] = useState({name: "", weight: "", contentWeight:"", seller: "", userGroups: "", catalogs: [], image: "", unit: "", productGroup: "", fullDescription: "", stock: {alert: "", security:""}, stockManaged: "", tax: "", uniquePrice: "", prices: [{name: 'BASE', price:""}, {name: 'USER_VIP', price:""}, {name: 'PRO_CHR', price:""}, {name: 'PRO_GC', price:""}, {name: 'PRO_VIP', price:""}], available: "", requireLegalAge: "", new: "", isMixed: "", categories: "", discount: "", offerEnd: ""});
    const [variations, setVariations] = useState([defaultVariation]);
    const [components, setComponents] = useState([defaultComponent]);
    const [type, setType] = useState("simple");
    
    useEffect(() => {
        fetchCategories();
        fetchProduct(id);
        setIsAdmin(Roles.hasAdminPrivileges(currentUser));
    }, []);

    useEffect(() => fetchProduct(id), [id]);
    useEffect(() => setIsAdmin(Roles.hasAdminPrivileges(currentUser)), [currentUser]);

    useEffect(() => setProduct({...product, available: isAdmin }), [isAdmin]);

    const fetchProduct = id => {
        if (id !== "new") {
            setEditing(true);
            let request = ProductActions.find(id);
            request
                .then(response => {
                    const formattedProduct = formatProduct(response, defaultStock);
                    setProduct(formattedProduct)
                    setType(defineType(response));
                    setVariations(getFormattedVariations(response.variations, defaultVariation));
                    setComponents(getFormattedComponents(response.components, defaultComponent));
                })
                .catch(error => {
                    console.log(error);
                    // TODO : Notification flash d'une erreur
                    // history.replace("/components/products");
                });
        } else
            setEditing(false);
    };

    const fetchCategories = () => {
        let request = CategoryActions.findAll()
        request
            .then(response => setCategories(response))
            .catch(error => {
                // TODO : Notification flash d'une erreur
                history.replace("/components/products");
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (type === "with-variations" && JSON.stringify(variations) !== JSON.stringify([defaultVariation])) {
            const writingVariations = await writeVariations();
            adaptProduct(writingVariations);
        } else if (type === "mixed" && JSON.stringify(components) !== JSON.stringify([defaultComponent])) {
            const adaptedComponents = getComponentsToWrite(components);
            adaptProduct([], adaptedComponents);
        } else
            adaptProduct();
    };

    const adaptProduct = (variations = [], adaptedComponents = []) => {
        const { image } = product;
        const productToWrite = getProductToWrite(product, type, categories, variations, adaptedComponents, components);
        if (image && !image.filePath) {
            ProductActions.createImage(product.image)
                          .then(image => writeProduct({...productToWrite, image}));
        } else {
            writeProduct(productToWrite);
        }
    }

    const writeProduct = productToWrite => {
        const request = !editing ? ProductActions.create(productToWrite) : ProductActions.update(id, productToWrite);
        request.then(response => {
                    setErrors({name: ""});
                    //TODO : Flash notification de succès
                    history.replace("/components/products");
                })
               .catch( ({ response }) => {
                    const { violations } = response.data;
                    if (violations) {
                        const apiErrors = {};
                        violations.forEach(({propertyPath, message}) => {
                            apiErrors[propertyPath] = message;
                        });
                        setErrors(apiErrors);
                    }
                    //TODO : Flash notification d'erreur
                });
    };

    const writeVariations = async () => {
        const savedVariations = await Promise.all(variations.map( async variation => {
            const { image } = variation;
            const suitedVariation = getVariationToWrite(variation, product);
            if (image && !image.filePath) {
                const savedImage = await ProductActions.createImage(image);
                return await suitedVariation['@id'] ? 
                    ProductActions.updateVariation(suitedVariation.id, {...suitedVariation, image: savedImage}) :
                    ProductActions.createVariation({...suitedVariation, image: savedImage});
            } else
                return await suitedVariation['@id'] ? 
                    ProductActions.updateVariation(suitedVariation.id, suitedVariation) :
                    ProductActions.createVariation(suitedVariation);
        }));
        return savedVariations;
    };

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>{!editing ? "Créer un produit" : "Modifier " + product.name }</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <Characteristics
                                product={product}
                                categories={categories}
                                type={type}
                                errors={errors}
                                setProduct={setProduct}
                            />
                            <Type
                                type={ type }
                                product={product}
                                components={ components }
                                variations={ variations }
                                defaultSize={ defaultSize }
                                defaultVariation={ defaultVariation }
                                defaultComponent={ defaultComponent }
                                setType={ setType }
                                setProduct={ setProduct }
                                setComponents={ setComponents }
                                setVariations={ setVariations }
                            />
                            <Price product={ product } setProduct={ setProduct }/>

                            { type !== "mixed" && 
                                <Stock product={ product } setProduct={ setProduct }/> 
                            }

                            <Options product={ product } setProduct={ setProduct }/>

                            <hr className="mt-5 mb-5"/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/products" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default ProductPage;