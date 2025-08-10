import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import axios from 'axios';
import dayjs from 'dayjs';

const API_URL = 'http://192.168.1.33:5000/entries';

// Enable animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HistoryScreen() {
    const [entries, setEntries] = useState([]);
    const [expandedMonths, setExpandedMonths] = useState({});

    useEffect(() => {
        axios.get(API_URL)
            .then(res => setEntries(res.data))
            .catch(err => console.log(err));
    }, []);

    // Group entries by month
    const groupedEntries = useMemo(() => {
        const groups = {};
        entries.forEach(entry => {
            const monthKey = dayjs(entry.date).format('MMMM YYYY');
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(entry);
        });

        // Sort dates inside each month (descending)
        Object.keys(groups).forEach(month => {
            groups[month].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
        });

        return groups;
    }, [entries]);

    // Month keys in descending order
    const monthKeys = Object.keys(groupedEntries).sort(
        (a, b) => dayjs(b, 'MMMM YYYY').valueOf() - dayjs(a, 'MMMM YYYY').valueOf()
    );

    const toggleMonth = (month) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedMonths(prev => ({
            ...prev,
            [month]: !prev[month]
        }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Your Progress</Text>
                <Text style={styles.subtitle}>
                    Consistency is a Myth when you are overloaded
                </Text>
            </View>
            <FlatList
                data={monthKeys}
                keyExtractor={(month) => month}
                renderItem={({ item: month }) => {
                    const isExpanded = expandedMonths[month] || false;
                    const monthCount = groupedEntries[month].length;

                    return (
                        <View style={styles.monthCard}>
                            <TouchableOpacity onPress={() => toggleMonth(month)} style={styles.monthHeader}>
                                <Text style={styles.monthTitle}>{month}</Text>
                                <Text style={styles.monthSummary}>
                                    You improved {monthCount} day{monthCount !== 1 ? 's' : ''}
                                </Text>
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.entryList}>
                                    {groupedEntries[month].map(entry => (
                                        <View key={entry._id} style={styles.entryCard}>
                                            <Text style={styles.entryDate}>
                                                {dayjs(entry.date).format('DD MMM YYYY')}
                                            </Text>
                                            <Text style={styles.entryText}>{entry.response}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 80 },
    monthCard: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    monthHeader: {
        padding: 15,
        backgroundColor: '#e2e8f0',
        flexDirection: 'column',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    monthTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
    monthSummary: { fontSize: 14, color: '#555', marginTop: 4 },
    entryList: { padding: 10 },
    entryCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
    },
    entryDate: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 4 },
    entryText: { fontSize: 15, color: '#333' },
    titleContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#222',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
        fontStyle: 'italic',
    },

});
