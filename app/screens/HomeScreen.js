import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = 'http://192.168.1.33:5000/entries';

export default function HomeScreen() {
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
    const [answer, setAnswer] = useState('');
    const [showQuestion2, setShowQuestion2] = useState(false);

    const today = dayjs().format('YYYY-MM-DD');

    useEffect(() => {
        // Check if submitted today
        axios.get(`${API_URL}/${today}`)
            .then(() => setHasSubmittedToday(true))
            .catch(() => setHasSubmittedToday(false));

        // Check for missed 2+ days
        axios.get(API_URL)
            .then(res => {
                if (res.data.length > 0) {
                    const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    // Find the most recent date that is NOT today
                    const lastEntry = sorted.find(entry => dayjs(entry.date).format('YYYY-MM-DD') !== today);
                    if (lastEntry) {
                        const diff = dayjs(today).diff(dayjs(lastEntry.date), 'day');
                        if (diff >= 2) {
                            Alert.alert("Aim For:", "Don't miss twice in a row.");
                        }
                    }
                }
            })
            .catch(err => console.log(err));
    }, []);

    const handleYesClick = () => setShowQuestion2(true);

    const handleSubmit = async () => {
        try {
            await axios.post(API_URL, { date: today, response: answer });
            setHasSubmittedToday(true);
            setShowQuestion2(false);
            Alert.alert("Great Job!", "You are done for today!");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Something went wrong");
        }
    };

    if (hasSubmittedToday) {
        return (
            <View style={styles.container}>
                <Text style={styles.doneText}>Great Job! You are done for today 🎉</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                {!showQuestion2 ? (
                    <>
                        <Text style={styles.question}>Did I try today?</Text>
                        <TouchableOpacity style={styles.yesButton} onPress={handleYesClick}>
                            <Text style={styles.yesButtonText}>YES ✅</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.question}>{`What's one thing you did for yourself today?`}</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            value={answer}
                            onChangeText={setAnswer}
                            placeholder="Type your answer here..."
                            placeholderTextColor="gray"
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    question: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
        color: '#000'
    },
    yesButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 3
    },
    yesButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    textArea: {
        height: 100,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        color: '#000',
        backgroundColor: '#fff',
        borderRadius: 8
    },
    submitButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    doneText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'green',
        textAlign: 'center'
    }
});
