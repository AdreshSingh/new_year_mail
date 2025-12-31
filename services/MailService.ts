import { MOCK_MAILS } from '@/constants/Mails';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAIL_RATE = 0.0; // 0% fail for now
const STORAGE_KEY = 'mails_v1';

export const MailService = {
    /**
     * Checks for default mails in storage, otherwise fetches from "API".
     */
    getMails: async () => {
        try {
            // 1. Check Local Storage
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                console.log('Fetching mails from Local Storage');
                return JSON.parse(stored);
            }

            // 2. Fetch from Backend (Mock)
            console.log('Fetching mails from API (Mock)');
            const mails = await MailService.fetchFromApi();

            // 3. Save to Local Storage defaults
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mails));

            return mails;
        } catch (e) {
            console.error('Error in getMails:', e);
            return [];
        }
    },

    fetchFromApi: () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < FAIL_RATE) {
                    reject(new Error('Network error'));
                } else {
                    resolve(MOCK_MAILS);
                }
            }, 1500); // Simulate network delay
        });
    },

    saveMails: async (mails: any[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mails));
        } catch (e) {
            console.error("Failed to save mails", e);
        }
    },

    clearStorage: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
};
