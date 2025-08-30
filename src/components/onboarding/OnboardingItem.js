import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

const OnboardingItem = memo(({ item }) => (
    <View style={styles.slide}>
        <View style={styles.iconContainer}>
            <item.icon width={'100%'} height={'100%'} style={styles.icon} />
        </View>

        <View style={styles.contentContainer}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
            {item.description && <Text style={styles.description}>{item.description}</Text>}
        </View>
    </View>
));

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        width: theme.responsive.screen().width,
        alignItems: 'center',
    },
    iconContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        width: theme.responsive.screen().width,
        height: theme.responsive.height(theme.responsive.screen().height * 0.14),
        minHeight: theme.responsive.height(100),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.white,
        paddingHorizontal: theme.responsive.width(theme.responsive.screen().width * 0.2),
    },
    title: {
        ...theme.typography.h3,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.h4,
        color: theme.colors.primary[500],
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    description: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});

OnboardingItem.displayName = 'OnboardingItem';

export default OnboardingItem;
