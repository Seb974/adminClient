import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { isDefined } from 'src/helpers/utils';

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
        width: "20%", 
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
        width: "60%", 
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

const PackageTable = ({ _package }) => {

    const getProductName = item => {
        const { variation, size, product } = item;
        const variantName = isDefined(variation) && isDefined(size) ? getVariantName(variation.color, size.name) : "";
        return product.name + (isDefined(variantName) && variantName.length > 0 ? " - " + variantName : " ");
    };

    const getVariantName = (variantName, sizeName) => {
        const isVariantEmpty = !isDefined(variantName) || variantName.length === 0 || variantName.replace(" ","").length === 0;
        const isSizeEmpty = !isDefined(sizeName) || sizeName.length === 0 || sizeName.replace(" ","").length === 0;
        return isVariantEmpty ? sizeName : isSizeEmpty ? variantName : variantName + " - " + sizeName;
    };

    return (
        <View style={styles.table}> 
            {/* TableHeader */} 
            <View style={styles.tableRow}> 
                <View style={styles.productCol}> 
                    <Text style={styles.tableCell}>Produit</Text> 
                </View> 
                <View style={styles.tableCol}> 
                    <Text style={styles.tableCell}>Quantité</Text> 
                </View> 
            </View>
            {/* TableContent */}
            { _package.content.map(item => {
                return (
                    <View style={styles.tableRow}>
                        <View style={styles.productCol}>
                            <Text style={styles.tableCell}>{ getProductName(item) }</Text> 
                        </View> 
                        <View style={styles.tableCol}> 
                            <Text style={styles.tableCell}>{ item.orderedQty + " " + item.unit }</Text>
                        </View>
                    </View> 
                )})
            }
        </View>
    );
}

export default PackageTable;