import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import { colors } from '../../constants/colors';

const LoadingIndicatorDemo = () => {
    const [selectedType, setSelectedType] = useState('spinner');

    const types = [
        { key: 'spinner', label: 'Spinner' },
        { key: 'pulse', label: 'Pulse' },
        { key: 'dots', label: 'Dots' },
        { key: 'wave', label: 'Wave' },
    ];

    const sizes = ['small', 'medium', 'large'];

    const colorOptions = [
        { name: 'Primary', color: colors.primary[500] },
        { name: 'Secondary', color: colors.secondary[500] },
        { name: 'Success', color: colors.success[500] },
        { name: 'Warning', color: colors.warning[500] },
        { name: 'Error', color: colors.error[500] },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Loading Indicator Demo</Text>

            {/* Type Selector */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Animation Types</Text>
                <View style={styles.typeContainer}>
                    {types.map((type) => (
                        <TouchableOpacity
                            activeOpacity={1}
                            key={type.key}
                            style={[
                                styles.typeButton,
                                selectedType === type.key && styles.selectedTypeButton,
                            ]}
                            onPress={() => setSelectedType(type.key)}
                        >
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    selectedType === type.key && styles.selectedTypeButtonText,
                                ]}
                            >
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Main Demo */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Animation</Text>
                <View style={styles.demoContainer}>
                    <LoadingIndicator
                        type={selectedType}
                        size="large"
                        color={colors.primary[500]}
                    />
                </View>
            </View>

            {/* Size Variations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Size Variations</Text>
                <View style={styles.sizeContainer}>
                    {sizes.map((size) => (
                        <View key={size} style={styles.sizeItem}>
                            <Text style={styles.sizeLabel}>{size}</Text>
                            <LoadingIndicator
                                type={selectedType}
                                size={size}
                                color={colors.primary[500]}
                            />
                        </View>
                    ))}
                </View>
            </View>

            {/* Color Variations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Color Variations</Text>
                <View style={styles.colorContainer}>
                    {colorOptions.map((colorOption) => (
                        <View key={colorOption.name} style={styles.colorItem}>
                            <Text style={styles.colorLabel}>{colorOption.name}</Text>
                            <LoadingIndicator
                                type={selectedType}
                                size="medium"
                                color={colorOption.color}
                            />
                        </View>
                    ))}
                </View>
            </View>

            {/* All Types */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Animation Types</Text>
                <View style={styles.allTypesContainer}>
                    {types.map((type) => (
                        <View key={type.key} style={styles.typeItem}>
                            <Text style={styles.typeLabel}>{type.label}</Text>
                            <LoadingIndicator
                                type={type.key}
                                size="medium"
                                color={colors.primary[500]}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 15,
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    typeButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border.light,
        marginHorizontal: 5,
        marginBottom: 10,
    },
    selectedTypeButton: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    typeButtonText: {
        color: colors.text.primary,
        fontWeight: '500',
    },
    selectedTypeButtonText: {
        color: colors.text.inverse,
    },
    demoContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
    },
    sizeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    sizeItem: {
        alignItems: 'center',
    },
    sizeLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 10,
        textTransform: 'capitalize',
    },
    colorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    colorItem: {
        alignItems: 'center',
        marginBottom: 20,
        width: '30%',
    },
    colorLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 10,
    },
    allTypesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    typeItem: {
        alignItems: 'center',
        marginBottom: 20,
        width: '45%',
    },
    typeLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 10,
    },
});

export default LoadingIndicatorDemo; 