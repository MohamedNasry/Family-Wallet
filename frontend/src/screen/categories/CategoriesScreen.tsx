import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { categoriesApi } from '../../api/categories.api';
import { Category } from '../../types/category.types';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        renderItem={({ item: cat }) => (
          <Card style={styles.catCard}>
            <View style={[styles.catIcon, { backgroundColor: (cat.color || '#0EA472') + '20' }]}>
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
            </View>
            <Text style={styles.catName}>{cat.name}</Text>
            {cat.budget != null && (
              <>
                <View style={styles.progress}>
                  <View style={[styles.progressFill, {
                    width: `${Math.min(100, ((cat.spent ?? 0) / cat.budget) * 100)}%`,
                    backgroundColor: cat.color || '#0EA472',
                  }]} />
                </View>
                <Text style={styles.budgetText}>
                  {formatCurrency(cat.spent ?? 0)} / {formatCurrency(cat.budget)}
                </Text>
              </>
            )}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7FAFE' },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1A2332' },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  catCard: { flex: 1, margin: 4, gap: 8 },
  catIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: 24 },
  catName: { fontSize: 14, fontWeight: '600', color: '#1A2332' },
  progress: { height: 6, backgroundColor: '#EDF2F7', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  budgetText: { fontSize: 11, color: '#94A3B8' },
});