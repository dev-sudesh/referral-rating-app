import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import ScreenContainer from './ScreenContainer';
import { theme } from '../../constants/theme';

/**
 * Examples demonstrating different ways to use ScreenContainer
 * This file shows various configurations and use cases
 */

// Example 1: Basic usage with default settings
export const BasicScreenExample = () => (
    <ScreenContainer>
        <Text style={{ ...theme.typography.h1, color: theme.colors.text.primary }}>
            Basic Screen
        </Text>
        <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
            This is a basic screen with default settings
        </Text>
    </ScreenContainer>
);

// Example 2: Using auth preset
export const AuthScreenExample = () => (
    <ScreenContainer {...ScreenContainer.presets.auth}>
        <Text style={{ ...theme.typography.h1, color: theme.colors.text.primary }}>
            Login Screen
        </Text>
        <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
            Centered content with extra padding
        </Text>
    </ScreenContainer>
);

// Example 3: Custom background and status bar
export const CustomThemedScreenExample = () => (
    <ScreenContainer
        backgroundColor={theme.colors.primary[500]}
        statusBarStyle="light-content"
        statusBarColor={theme.colors.primary[600]}
    >
        <Text style={{ ...theme.typography.h1, color: 'white' }}>
            Custom Themed Screen
        </Text>
        <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.primary[100] }}>
            Primary background with light status bar
        </Text>
    </ScreenContainer>
);

// Example 4: Scrollable content
export const ScrollableScreenExample = () => (
    <ScreenContainer {...ScreenContainer.presets.scrollable}>
        {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={{
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                backgroundColor: theme.colors.neutral[100],
                borderRadius: theme.borderRadius.md
            }}>
                <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.primary }}>
                    Scrollable Item {i + 1}
                </Text>
            </View>
        ))}
    </ScreenContainer>
);

// Example 5: Modal style
export const ModalScreenExample = () => (
    <ScreenContainer {...ScreenContainer.presets.modal}>
        <Text style={{ ...theme.typography.h2, color: theme.colors.text.primary }}>
            Modal Screen
        </Text>
        <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
            Secondary background with larger padding
        </Text>
    </ScreenContainer>
);

// Example 6: List style
export const ListScreenExample = () => (
    <ScreenContainer {...ScreenContainer.presets.list}>
        {Array.from({ length: 10 }, (_, i) => (
            <TouchableOpacity
                key={i}
                style={{
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.sm,
                    backgroundColor: theme.colors.background.primary,
                    borderRadius: theme.borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border.light,
                }}
            >
                <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.primary }}>
                    List Item {i + 1}
                </Text>
            </TouchableOpacity>
        ))}
    </ScreenContainer>
);

// Example 7: Full screen without padding
export const FullScreenExample = () => (
    <ScreenContainer {...ScreenContainer.presets.full}>
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.primary[500],
        }}>
            <Text style={{ ...theme.typography.h1, color: 'white' }}>
                Full Screen
            </Text>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.primary[100] }}>
                No padding, full background
            </Text>
        </View>
    </ScreenContainer>
);

// Example 8: Custom padding
export const CustomPaddingExample = () => (
    <ScreenContainer
        paddingCustom={{
            top: theme.spacing.xxxl,
            left: theme.spacing.xl,
            right: theme.spacing.xl,
            bottom: theme.spacing.xxxl,
        }}
    >
        <Text style={{ ...theme.typography.h2, color: theme.colors.text.primary }}>
            Custom Padding
        </Text>
        <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
            Different padding on each side
        </Text>
    </ScreenContainer>
);

// Example 9: Centered content
export const CenteredContentExample = () => (
    <ScreenContainer {...ScreenContainer.presets.centered}>
        <View style={{
            alignItems: 'center',
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.neutral[100],
            borderRadius: theme.borderRadius.lg,
        }}>
            <Text style={{ ...theme.typography.h2, color: theme.colors.text.primary }}>
                Centered Content
            </Text>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary, textAlign: 'center' }}>
                This content is centered both vertically and horizontally
            </Text>
        </View>
    </ScreenContainer>
);

// Example 10: Detail screen
export const DetailScreenExample = () => (
    <ScreenContainer {...ScreenContainer.presets.detail}>
        <Text style={{ ...theme.typography.h1, color: theme.colors.text.primary, marginBottom: theme.spacing.lg }}>
            Detail Screen
        </Text>

        <View style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
        }}>
            <Text style={{ ...theme.typography.h3, color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
                Section 1
            </Text>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
                This is a detail screen with scrollable content and proper spacing.
            </Text>
        </View>

        <View style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
        }}>
            <Text style={{ ...theme.typography.h3, color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
                Section 2
            </Text>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
                Another section with more content to demonstrate scrolling.
            </Text>
        </View>

        <View style={{
            backgroundColor: theme.colors.background.secondary,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
        }}>
            <Text style={{ ...theme.typography.h3, color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
                Section 3
            </Text>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
                Final section to complete the detail screen example.
            </Text>
        </View>
    </ScreenContainer>
);

// Example 11: No safe area (for overlays or modals)
export const NoSafeAreaExample = () => (
    <ScreenContainer safeArea={false} backgroundColor={theme.colors.overlay.dark}>
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <View style={{
                backgroundColor: theme.colors.background.primary,
                padding: theme.spacing.xl,
                borderRadius: theme.borderRadius.lg,
                margin: theme.spacing.lg,
            }}>
                <Text style={{ ...theme.typography.h2, color: theme.colors.text.primary }}>
                    Overlay Modal
                </Text>
                <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.text.secondary }}>
                    No safe area, full screen overlay
                </Text>
            </View>
        </View>
    </ScreenContainer>
);

// Example 12: Custom edges for safe area
export const CustomSafeAreaExample = () => (
    <ScreenContainer
        edges={['top']} // Only apply safe area to top
        backgroundColor={theme.colors.primary[500]}
        statusBarStyle="light-content"
    >
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text style={{ ...theme.typography.h1, color: 'white' }}>
                Custom Safe Area
            </Text>
            <Text style={{ ...theme.typography.bodyMedium, color: theme.colors.primary[100] }}>
                Only top safe area applied
            </Text>
        </View>
    </ScreenContainer>
); 