import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 200;
const CARD_WIDTH = width * 0.9;
const SWIPE_THRESHOLD = -100;

interface LadderItemProps {
    item: any;
    index: number;
    total: number;
    onRemove: (id: string) => void;
}

export default function LadderItem({ item, index, total, onRemove }: LadderItemProps) {
    const isTop = index === 0;
    const router = useRouter();

    // Animation values
    const offset = useSharedValue(500); // Start from bottom
    const scale = useSharedValue(0.8);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        // Enter animation
        offset.value = withSpring(index * 15, { damping: 12 });
        scale.value = withTiming(1 - index * 0.05);
    }, [index, total]);

    const panGesture = Gesture.Pan()
        .enabled(isTop)
        .onUpdate((event) => {
            translateY.value = event.translationY;
            translateX.value = event.translationX * 0.5;
        })
        .onEnd(() => {
            if (translateY.value < SWIPE_THRESHOLD) {
                // Swipe Up detected - animate out
                translateY.value = withTiming(-500, {}, () => {
                    runOnJS(onRemove)(item.id);
                });
            } else {
                // Reset
                translateY.value = withSpring(0);
                translateX.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const currentOffset = offset.value + (isTop ? translateY.value : 0);

        return {
            transform: [
                { translateY: currentOffset },
                { translateX: isTop ? translateX.value : 0 },
                { scale: scale.value }
            ],
            zIndex: total - index,
            opacity: interpolate(index, [0, 5], [1, 0], Extrapolation.CLAMP),
        };
    });

    const handlePress = () => {
        if (!isTop) return;
        router.push({ pathname: "/mail/[id]", params: { id: item.id } });
    };

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.cardContainer, animatedStyle]}>
                <Pressable
                    style={[styles.card, { backgroundColor: item.color || '#fff' }]}
                    disabled={!isTop}
                    onPress={handlePress}
                >
                    <View style={styles.header}>
                        <Text style={styles.subject}>{item.subject}</Text>
                        <Text style={styles.sender}>{item.sender}</Text>
                    </View>
                    <Text style={styles.preview} numberOfLines={2}>{item.preview}</Text>

                    {isTop && (
                        <View style={styles.actions}>
                            <Text style={styles.actionText}>Swipe Up to Archive • Tap to Read</Text>
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute',
        alignSelf: 'center',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        top: 150, // Start position for the stack
    },
    card: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5, // Android shadow
        justifyContent: 'space-between',
    },
    header: {
        marginBottom: 10,
    },
    subject: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    sender: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    preview: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
    },
    actions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 10,
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
