import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const BACKGROUND_OVERLAY = require('@/assets/images/background-overlay.png');

export default function MailDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const mailData = useQuery((api as any).mails.getById, { id: id as string });

    const handleClose = () => {
        router.back();
    };

    if (mailData === undefined) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                <ActivityIndicator size="large" color="black" />
                <StatusBar style="light" />
            </View>
        );
    }

    if (!mailData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                <Text style={{ color: 'black' }}>Mail not found</Text>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                </Pressable>
            </View>
        );
    }

    // Map Convex data to UI
    const mail = {
        subject: mailData.subject,
        sender: mailData.sender,
        body: mailData.body,
        color: mailData.color || '#4ECDC4',
    };

    return (
        <View style={[styles.container]}>
            <Image source={BACKGROUND_OVERLAY} style={styles.backgroundOverlay} />
            <Pressable onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeText}>Close</Text>
            </Pressable>

            <View style={styles.content}>
                <Text style={styles.subject}>{mail.subject}</Text>
                <Text style={styles.sender}>From: {mail.sender}</Text>
                <View style={styles.divider} />
                <Text style={styles.body}>{mail.body}</Text>
            </View>
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#faf4e5',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
        resizeMode: 'contain',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
        marginBottom: 10
    },
    closeText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold'
    },
    content: {
        flex: 1,
        paddingVertical: 97,
        paddingHorizontal: 20,
    },
    subject: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    sender: {
        fontSize: 18,
        color: 'black',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginBottom: 20,
    },
    body: {
        fontSize: 20,
        lineHeight: 30,
        color: 'black',
    },
});
