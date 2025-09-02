import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../constants/theme';
import NoDataAnimation from './NoDataAnimation';
import IconAsset from '../../assets/icons/IconAsset';

const NoDataAnimationExample = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Basic usage */}
            <View style={styles.section}>
                <NoDataAnimation
                    message="No data available"
                    subtitle="This is a basic example"
                />
            </View>

            {/* With custom icon */}
            <View style={styles.section}>
                <NoDataAnimation
                    message="No referrals found"
                    subtitle="Try adjusting your filters or check back later"
                    icon={IconAsset.emptyStateIcon}
                />
            </View>

            {/* Small size */}
            <View style={styles.section}>
                <NoDataAnimation
                    message="No results"
                    subtitle="Try a different search term"
                    icon={IconAsset.emptyStateIcon}
                    size="small"
                />
            </View>

            {/* Large size */}
            <View style={styles.section}>
                <NoDataAnimation
                    message="No items in this category"
                    subtitle="Check back later for new additions"
                    icon={IconAsset.emptyStateIcon}
                    size="large"
                />
            </View>

            {/* Without animation */}
            <View style={styles.section}>
                <NoDataAnimation
                    message="Static message"
                    subtitle="No animation for this one"
                    icon={IconAsset.emptyStateIcon}
                    showAnimation={false}
                />
            </View>

            {/* Custom styles */}
            <View style={styles.section}>
                <NoDataAnimation
                    message="Custom styled"
                    subtitle="With custom background and colors"
                    icon={IconAsset.emptyStateIcon}
                    customStyles={{
                        backgroundColor: theme.colors.primary[50],
                        borderRadius: theme.borderRadius.lg,
                        margin: theme.spacing.md,
                    }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    contentContainer: {
        paddingVertical: theme.spacing.lg,
    },
    section: {
        height: 300,
        marginBottom: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
});

export default NoDataAnimationExample;
