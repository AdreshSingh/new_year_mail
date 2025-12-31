import LadderItem from '@/components/LadderItem';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { api } from '../convex/_generated/api';

const BACKGROUND_IMAGE = require('@/assets/images/background.png');

const CORNER_OVERLAYS = [
    require('@/assets/images/cat-overlay.png'),
    require('@/assets/images/flower-overlay.png'),
    require('@/assets/images/paw-overlay.png'),
    require('@/assets/images/cheese-overlay.png'),
];

const RAW_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F9C74F'];
const COLOR_GRADIENTS: Record<string, string[]> = {
    '#FF6B6B': ['#FF6B6B', '#FF8E8E'],
    '#4ECDC4': ['#4ECDC4', '#7EDBD4'],
    '#FFE66D': ['#FFE66D', '#FFD93D'],
    '#1A535C': ['#1A535C', '#2E8691'],
    '#F9C74F': ['#F9C74F', '#FAD980']
};

export default function HomeScreen() {
    // Fetch mails from Convex
    // Cast to any to avoid type errors with mock API
    const convexMails = useQuery((api as any).mails.get);
    const [hiddenCount, setHiddenCount] = useState(0);
    const [selectedSender, setSelectedSender] = useState<string | null>(null);
    const router = useRouter();

    const randomOverlay = useMemo(() => {
        const index = Math.floor(Math.random() * CORNER_OVERLAYS.length);
        return CORNER_OVERLAYS[index];
    }, []);

    // Process mails with colors and filter
    const allMails = useMemo(() => {
        return (convexMails || []).map((m: any, i: number) => {
            const baseColor = m.color || RAW_COLORS[i % RAW_COLORS.length];
            return {
                ...m,
                id: m._id,
                subject: m.subject,
                sender: m.sender,
                preview: m.preview,
                color: baseColor,
                gradient: COLOR_GRADIENTS[baseColor] || [baseColor, baseColor]
            };
        });
    }, [convexMails]);

    const senders = useMemo(() => {
        const names = new Set(allMails.map((m: any) => m.sender));
        return Array.from(names);
    }, [allMails]);

    const visibleMails = useMemo(() => {
        let filtered = allMails;
        if (selectedSender) {
            filtered = allMails.filter((m: any) => m.sender === selectedSender);
        }
        return filtered.slice(hiddenCount);
    }, [allMails, hiddenCount, selectedSender]);

    const handleRemoveTop = useCallback(() => {
        setHiddenCount(c => c + 1);
    }, []);

    const handleRefresh = () => {
        setHiddenCount(0);
        setSelectedSender(null);
    };

    const [isTimedOut, setIsTimedOut] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (convexMails === undefined) {
                setIsTimedOut(true);
            }
        }, 10000);
        return () => clearTimeout(timer);
    }, [convexMails]);

    if (convexMails === undefined) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Checking Mailbox...</Text>
                {isTimedOut && (
                    <View style={{ marginTop: 20, padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: 'red', textAlign: 'center' }}>
                            Connection taking longer than usual.
                        </Text>
                        <Text style={{ marginTop: 10, color: '#666' }}>
                            Debug URL: {process.env.EXPO_PUBLIC_CONVEX_URL || 'Using Fallback: academic-kudu-403'}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    /* 
       If no mails or all hidden. 
    */
    if (visibleMails.length === 0 && allMails.length > 0) {
        return (
            <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
                <Image source={randomOverlay} style={styles.cornerOverlay} />

                <View style={styles.center}>
                    <Text>No more new mails to read!</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.button}>
                        <Text style={styles.buttonText}>Read Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/compose')} style={[styles.button, { marginTop: 10 }]}>
                        <Text style={styles.buttonText}>Compose New</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }

    if (allMails.length === 0) {
        return (
            <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
                <Image source={randomOverlay} style={styles.cornerOverlay} />

                <View style={styles.center}>
                    <Text>No mails found.</Text>
                    <TouchableOpacity onPress={() => router.push('/compose')} style={styles.button}>
                        <Text style={styles.buttonText}>Compose First Mail</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
                <Image source={randomOverlay} style={styles.cornerOverlay} />

                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Refresh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/compose')} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Compose</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterBubble, !selectedSender && styles.filterBubbleActive]}
                            onPress={() => setSelectedSender(null)}
                        >
                            <Text style={[styles.filterText, !selectedSender && styles.filterTextActive]}>All</Text>
                        </TouchableOpacity>
                        {senders.map((sender: any, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.filterBubble, selectedSender === sender && styles.filterBubbleActive]}
                                onPress={() => {
                                    setHiddenCount(0); // Reset stack when filtering
                                    setSelectedSender(sender === selectedSender ? null : sender);
                                }}
                            >
                                <Text style={[styles.filterText, selectedSender === sender && styles.filterTextActive]}>{sender}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.ladderContainer}>
                    {visibleMails.map((mail: any, index: number) => (
                        <LadderItem
                            key={mail.id || index}
                            item={mail}
                            index={index}
                            total={visibleMails.length}
                            onRemove={handleRemoveTop}
                        />
                    ))}
                </View>
                <View style={styles.instructions}>
                    <Text style={styles.instructionText}>Read or swipe up to dismiss</Text>
                </View>
            </ImageBackground>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0', // Fallback
    },
    cornerOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 150, // Adjust size as appropriate
        height: 150,
        resizeMode: 'contain',
        opacity: 0.9,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterBubble: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    filterBubbleActive: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    filterText: {
        color: '#fff',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#007AFF',
    },
    headerButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent pill
        borderRadius: 20,
    },
    headerButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ladderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructions: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center'
    },
    instructionText: {
        color: '#444',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    }
});
