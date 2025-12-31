import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../convex/_generated/api";

export default function ComposeScreen() {
    const [subject, setSubject] = useState("");
    const [sender, setSender] = useState("");
    const [preview, setPreview] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const sendMail = useMutation(api.mails.send);
    const router = useRouter();

    const handleSend = async () => {
        if (!subject || !sender || !preview || !message) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const RAW_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F9C74F'];
        const randomColor = RAW_COLORS[Math.floor(Math.random() * RAW_COLORS.length)];

        setSending(true);
        try {
            await sendMail({
                subject,
                sender,
                preview,
                body: message,
                color: randomColor
            });
            Alert.alert("Success", "Mail sent successfully!");
            router.back();
        } catch (e) {
            Alert.alert("Error", "Failed to send mail");
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter subject..."
                value={subject}
                onChangeText={setSubject}
            />

            <Text style={styles.label}>Sender</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter sender..."
                value={sender}
                onChangeText={setSender}
            />

            <Text style={styles.label}>Preview</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter preview text..."
                value={preview}
                onChangeText={setPreview}
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Type your message..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
            />

            <TouchableOpacity style={styles.button} onPress={handleSend} disabled={sending}>
                <Text style={styles.buttonText}>{sending ? "Sending..." : "Send Mail"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()} disabled={sending}>
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    cancelButton: {
        backgroundColor: '#888',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
