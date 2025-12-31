import LadderItem from '@/components/LadderItem';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { api } from '../convex/_generated/api';

export default function HomeScreen() {
    // Fetch mails from Convex
    // Cast to any to avoid type errors with mock API
    const convexMails = useQuery((api as any).mails.get);
    const [hiddenCount, setHiddenCount] = useState(0);
    const router = useRouter();

    const RAW_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F9C74F'];
    const mails = (convexMails || []).map((m: any, i: number) => ({
        ...m,
        id: m._id,
        subject: m.subject,
        sender: m.sender,
        preview: m.preview,
        color: m.color || RAW_COLORS[i % RAW_COLORS.length]
    }));
    const visibleMails = mails.slice(hiddenCount);

    const handleRemoveTop = useCallback(() => {
        setHiddenCount(c => c + 1);
    }, []);

    const handleRefresh = () => {
        setHiddenCount(0);
        // Convex queries update automatically, so we just reset our local view
    };

    if (convexMails === undefined) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Checking Mailbox...</Text>
            </View>
        );
    }

    /* 
       If no mails or all hidden. 
       Note: visibleMails.length === 0 could mean we read them all OR there were none.
    */
    if (visibleMails.length === 0 && mails.length > 0) {
        return (
            <View style={styles.center}>
                <Text>No more new mails to read!</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.button}>
                    <Text style={styles.buttonText}>Read Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/compose')} style={[styles.button, { marginTop: 10 }]}>
                    <Text style={styles.buttonText}>Compose New</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (mails.length === 0) {
        return (
            <View style={styles.center}>
                <Text>No mails found.</Text>
                <TouchableOpacity onPress={() => router.push('/compose')} style={styles.button}>
                    <Text style={styles.buttonText}>Compose First Mail</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/compose')} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Compose</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.ladderContainer}>
                {visibleMails.map((mail: any, index: number) => (
                    <LadderItem
                        key={mail._id || index}
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
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: '#fff',
        elevation: 2,
    },
    headerButton: {
        padding: 8,
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
        color: '#888',
        fontSize: 16
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
