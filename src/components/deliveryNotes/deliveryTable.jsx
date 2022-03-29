import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { isDefined } from 'src/helpers/utils';
import { getContainerCosts, getContainerPrice, getSubTotalHT, getTotalHT, getTotalTax, getTotalTTC } from 'src/helpers/orders';

const styles = StyleSheet.create({
    table: {
        display: "table", 
        width: "auto", 
        borderStyle: "solid", 
        borderWidth: 1,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        marginLeft: 30,
        marginRight: 30
    },
    tableRow: {
        width: '100vw',
        flexDirection: "row" 
    },
    tableCol: {
        width: "15%", 
        borderStyle: "solid", 
        borderWidth: 0, 
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 1,
    },
    footerCol: {
        width: "15%", 
        borderStyle: "solid", 
        borderWidth: 0, 
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    productCol: {
        width: "30%", 
        borderStyle: "solid", 
        borderWidth: 0, 
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 1,
    },
    productFooterCol: {
        width: "30%", 
        borderStyle: "solid", 
        borderWidth: 0, 
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    tableCell: {
        margin: "auto",
        marginTop: 5,
        fontSize: 10
    }
});

const DeliveryTable = ({ order, items, currentPage, numberOfPages }) => {

    const getProductName = item => {
        const { variation, size, product } = item;
        if (isDefined(product)) {
            const variantName = isDefined(variation) && isDefined(size) ? getVariantName(variation.color, size.name) : "";
            return product.name + (isDefined(variantName) && variantName.length > 0 ? " - " + variantName : " ");
        }
        return "";
    };

    const getVariantName = (variantName, sizeName) => {
        const isVariantEmpty = !isDefined(variantName) || variantName.length === 0 || variantName.replace(" ","").length === 0;
        const isSizeEmpty = !isDefined(sizeName) || sizeName.length === 0 || sizeName.replace(" ","").length === 0;
        return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    };

    return (
        <View style={styles.table}> 
            <View style={styles.tableRow}> 
                <View style={styles.productCol}> 
                    <Text style={{...styles.tableCell, fontWeight: 'extrabold'}}>Produit</Text> 
                </View> 
                <View style={styles.tableCol}> 
                    <Text style={{...styles.tableCell, fontWeight: 'extrabold'}}>Commandé</Text> 
                </View> 
                <View style={styles.tableCol}> 
                    <Text style={{...styles.tableCell, fontWeight: 'extrabold'}}>Livré</Text>
                </View> 
                <View style={styles.tableCol}> 
                    <Text style={{...styles.tableCell, fontWeight: 'extrabold'}}>Prix U HT</Text> 
                </View>
                <View style={styles.tableCol}> 
                    <Text style={{...styles.tableCell, fontWeight: 'extrabold'}}>Prix</Text> 
                </View> 
            </View>
            { items.map((item, i) => {
                if (!item.isPackage) {
                    const invoicedQty = !isDefined(order.user) || isDefined(order.paymentId) ? item.orderedQty : item.preparedQty;
                    return (
                        <View key={ i } style={styles.tableRow}>
                            <View style={styles.productCol}>
                                <Text style={styles.tableCell}>{ getProductName(item) }</Text> 
                            </View> 
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ item.orderedQty }</Text>
                            </View>
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ invoicedQty }</Text>
                            </View> 
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ item.price + ' €' }</Text> 
                            </View>
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ (Math.round(invoicedQty * item.price * 100) / 100).toFixed(2) + ' €' }</Text> 
                            </View>
                        </View> 
                    )
                } 
                else {
                    const containerPrice = getContainerPrice(item.container, order.catalog);
                    return (
                        <View style={styles.tableRow}>
                            <View style={styles.productCol}>
                                <Text style={styles.tableCell}>{ item.container.name }</Text> 
                            </View> 
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ item.quantity }</Text>
                            </View>
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ item.quantity }</Text>
                            </View> 
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ containerPrice + ' €' }</Text> 
                            </View>
                            <View style={styles.tableCol}> 
                                <Text style={styles.tableCell}>{ (Math.round(item.quantity * containerPrice * 100) / 100).toFixed(2) + ' €' }</Text> 
                            </View>
                        </View> 
                    )
                }
              }
            )}
            { currentPage + 1 !== numberOfPages ? 
                <>
                    <View style={styles.tableRow}> 
                        <View style={styles.productFooterCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text>
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>Sous-total page { currentPage + 1 }</Text> 
                        </View>
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ (getSubTotalHT(items, isDefined(order.paymentId))).toFixed(2) + " €" }</Text>
                        </View> 
                    </View>
                </>
            :
                <>
                    <View style={styles.tableRow}>
                        <View style={styles.productCol}>
                            <Text style={styles.tableCell}>{ "Livraison" }</Text> 
                        </View> 
                        <View style={styles.tableCol}> 
                            <Text style={styles.tableCell}>{ "" }</Text>
                        </View>
                        <View style={styles.tableCol}> 
                            <Text style={styles.tableCell}>{ "" }</Text>
                        </View> 
                        <View style={styles.tableCol}> 
                            <Text style={styles.tableCell}>{ "" }</Text> 
                        </View>
                        <View style={styles.tableCol}> 
                            <Text style={styles.tableCell}>{ isDefined(order.appliedCondition) && order.appliedCondition.minForFree > getTotalHT(order) ? order.appliedCondition.price.toFixed(2) + " €" : "Offerte" }</Text> 
                        </View>
                    </View> 
                    { numberOfPages > 1 &&
                        <>
                            <View style={styles.tableRow}> 
                                <View style={styles.productFooterCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text> 
                                </View> 
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text> 
                                </View> 
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text>
                                </View> 
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>Sous-total page { currentPage + 1 }</Text> 
                                </View>
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ (
                                        getSubTotalHT(items, isDefined(order.paymentId)) + 
                                        (isDefined(order.appliedCondition) && order.appliedCondition.minForFree > getTotalHT(order) ? order.appliedCondition.price : 0) +
                                        getContainerCosts(items, order.catalog)
                                        ).toFixed(2) + " €" }</Text>
                                </View> 
                            </View>
                            <View style={styles.tableRow}> 
                                <View style={styles.productFooterCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text> 
                                </View> 
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text> 
                                </View> 
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text>
                                </View> 
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text> 
                                </View>
                                <View style={styles.footerCol}> 
                                    <Text style={styles.tableCell}>{ " " }</Text>
                                </View> 
                            </View>
                        </>
                    }
                    <View style={styles.tableRow}> 
                        <View style={styles.productFooterCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text>
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>TOTAL HT</Text> 
                        </View>
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ (getTotalHT(order)).toFixed(2) + " €" }</Text>
                        </View> 
                    </View>
                    <View style={styles.tableRow}> 
                        <View style={styles.productFooterCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text>
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>TVA</Text> 
                        </View>
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ (getTotalTax(order)).toFixed(2) + " €" }</Text>
                        </View> 
                    </View>
                    <View style={styles.tableRow}> 
                        <View style={styles.productFooterCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text> 
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ " " }</Text>
                        </View> 
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>TOTAL TTC</Text> 
                        </View>
                        <View style={styles.footerCol}> 
                            <Text style={styles.tableCell}>{ (getTotalTTC(order)).toFixed(2) + " €" }</Text> 
                        </View> 
                    </View>
                </>
            }
        </View>
    );
}

export default DeliveryTable;