import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ScreenHeader from './ScreenHeader';
import { colors, spacing, typography } from '../../constants/theme';

/**
 * ScreenHeader Examples
 * Demonstrates various configurations and use cases for the ScreenHeader component
 */
const ScreenHeaderExamples = () => {
    const handleBackPress = () => {
        console.log('Back button pressed');
    };

    const handleMenuPress = () => {
        console.log('Menu button pressed');
    };

    const handleActionPress = () => {
        console.log('Action button pressed');
    };

    // Custom icon component example
    const CustomIcon = ({ name, onPress, style }) => (
        <TouchableOpacity
            style={[styles.iconButton, style]}
            onPress={onPress}
            activeOpacity={1}
        >
            <Text style={styles.iconText}>{name}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Basic Header */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Basic Header</Text>
                <ScreenHeader
                    title="Screen Title"
                    subtitle="Optional subtitle"
                />
            </View>

            {/* Header with Back Button */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Header with Back Button</Text>
                <ScreenHeader
                    title="Profile"
                    showBackButton
                    onBackPress={handleBackPress}
                />
            </View>

            {/* Header with Custom Back Text */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Custom Back Text</Text>
                <ScreenHeader
                    title="Settings"
                    showBackButton
                    onBackPress={handleBackPress}
                    backButtonText="← Back"
                />
            </View>

            {/* Header with Right Action */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Header with Right Action</Text>
                <ScreenHeader
                    title="Messages"
                    rightComponent={
                        <CustomIcon
                            name="+"
                            onPress={handleActionPress}
                            style={styles.actionButton}
                        />
                    }
                />
            </View>

            {/* Header with Left and Right Components */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Header with Left and Right Components</Text>
                <ScreenHeader
                    title="Dashboard"
                    leftComponent={
                        <CustomIcon
                            name="☰"
                            onPress={handleMenuPress}
                        />
                    }
                    rightComponent={
                        <CustomIcon
                            name="⚙️"
                            onPress={handleActionPress}
                        />
                    }
                />
            </View>

            {/* Elevated Header */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Elevated Header</Text>
                <ScreenHeader
                    title="Elevated Header"
                    subtitle="With shadow effect"
                    variant="elevated"
                    showShadow={true}
                />
            </View>

            {/* Transparent Header */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Transparent Header</Text>
                <View style={styles.transparentBackground}>
                    <ScreenHeader
                        title="Transparent Header"
                        subtitle="Over content"
                        variant="transparent"
                        titleColor={colors.text.white}
                        subtitleColor={colors.text.white}
                    />
                </View>
            </View>

            {/* Custom Styled Header */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Custom Styled Header</Text>
                <ScreenHeader
                    title="Custom Style"
                    backgroundColor={colors.primary[500]}
                    titleColor={colors.text.white}
                    titleStyle={styles.customTitle}
                />
            </View>

            {/* Header with Custom Center Component */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Custom Center Component</Text>
                <ScreenHeader
                    centerComponent={
                        <View style={styles.customCenter}>
                            <Text style={styles.customCenterTitle}>Custom Center</Text>
                            <View style={styles.statusIndicator} />
                        </View>
                    }
                />
            </View>

            {/* Header without Safe Area */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Header without Safe Area</Text>
                <ScreenHeader
                    title="No Safe Area"
                    safeArea={false}
                />
            </View>

            {/* Header with Multiple Right Actions */}
            <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>Multiple Right Actions</Text>
                <ScreenHeader
                    title="Multiple Actions"
                    rightComponent={
                        <View style={styles.multipleActions}>
                            <CustomIcon
                                name="🔍"
                                onPress={handleActionPress}
                                style={styles.smallIcon}
                            />
                            <CustomIcon
                                name="📱"
                                onPress={handleActionPress}
                                style={styles.smallIcon}
                            />
                            <CustomIcon
                                name="💬"
                                onPress={handleActionPress}
                                style={styles.smallIcon}
                            />
                        </View>
                    }
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    exampleSection: {
        marginBottom: spacing.lg,
        backgroundColor: colors.background.white,
        borderRadius: 8,
        marginHorizontal: spacing.screenPadding,
        overflow: 'hidden',
    },
    sectionTitle: {
        ...typography.h5,
        color: colors.text.primary,
        padding: spacing.md,
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 18,
        color: colors.primary[600],
    },
    actionButton: {
        backgroundColor: colors.primary[500],
    },
    transparentBackground: {
        backgroundColor: colors.primary[500],
        paddingBottom: spacing.md,
    },
    customTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    customCenter: {
        alignItems: 'center',
    },
    customCenterTitle: {
        ...typography.h4,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success[500],
    },
    multipleActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    smallIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
});

export default ScreenHeaderExamples; 