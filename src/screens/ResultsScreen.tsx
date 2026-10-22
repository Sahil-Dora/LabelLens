import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';

export default function ResultsScreen({ route, navigation }: any) {
  const barcode = route.params?.barcode || '8901058851302';
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Health analysis logic
  const analyzeHealth = (prod: any) => {
    let score = 5;
    let reasons: string[] = [];

    const nutriments = prod?.nutriments || {};
    const sugar = nutriments['sugars_100g'] || 0;
    const fat = nutriments['saturated-fat_100g'] || 0;
    const salt = nutriments['salt_100g'] || 0;

    // High sugar check (>10g per 100g)
    if (sugar > 10) {
      score -= 2;
      reasons.push(`High Sugar Content (${sugar}g/100g)`);
    }

    // High saturated fat (>5g per 100g)
    if (fat > 5) {
      score -= 1;
      reasons.push(`High Saturated Fat (${fat}g/100g)`);
    }

    // High salt (>1.5g per 100g)
    if (salt > 1.5) {
      score -= 1;
      reasons.push(`High Salt Level (${salt}g/100g)`);
    }

    // Presence of additives (INS codes)
    if (prod?.additives_tags && prod.additives_tags.length > 2) {
      score -= 1;
      reasons.push(`Multiple Additives Detected (${prod.additives_tags.length} found)`);
    }

    const finalScore = Math.max(1, score);
    let category = 'GREEN (Healthy)';
    let color = '#2E7D32';

    if (finalScore <= 2) {
      category = 'RED (Unhealthy / Highly Processed)';
      color = '#C62828';
    } else if (finalScore <= 3) {
      category = 'YELLOW (Moderate Caution)';
      color = '#F57F17';
    }

    return { score: finalScore, category, color, reasons };
  };

  useEffect(() => {
    fetch(`https://in.openfoodfacts.org/api/v2/product/${barcode}.json`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 1 && data.product) {
          setProduct(data.product);
        } else {
          setProduct({
            product_name: 'Sample Packaged Item',
            brands: 'Local Brand',
            ingredients_text: 'Refined Wheat Flour (Maida), Sugar, Hydrogenated Palm Oil, Salt, Emulsifiers (INS 322).',
            additives_tags: ['en:ins322', 'en:ins500'],
            nutriments: { sugars_100g: 22, 'saturated-fat_100g': 8, salt_100g: 1.2 }
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setProduct({
          product_name: 'Sample Packaged Item',
          brands: 'Local Brand',
          ingredients_text: 'Refined Wheat Flour (Maida), Sugar, Hydrogenated Palm Oil, Salt, Emulsifiers (INS 322).',
          additives_tags: ['en:ins322', 'en:ins500'],
          nutriments: { sugars_100g: 22, 'saturated-fat_100g': 8, salt_100g: 1.2 }
        });
        setLoading(false);
      });
  }, [barcode]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Fetching product data & calculating score...</Text>
      </View>
    );
  }

  const analysis = analyzeHealth(product);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Product Card Header */}
        <View style={[styles.card, { borderLeftColor: analysis.color }]}>
          <Text style={styles.barcodeLabel}>BARCODE: {barcode}</Text>
          <Text style={styles.productName}>{product?.product_name || 'Processed Food Item'}</Text>
          <Text style={styles.brandText}>Brand: {product?.brands || 'Unknown Manufacturer'}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Health Assessment:</Text>
            <View style={[styles.scoreBadge, { backgroundColor: analysis.color }]}>
              <Text style={styles.scoreText}>{analysis.score} / 5 — {analysis.category}</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Health Warnings */}
        {analysis.reasons.length > 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Health Concerns Detected</Text>
            {analysis.reasons.map((reason, index) => (
              <Text key={index} style={styles.bulletText}>• {reason}</Text>
            ))}
          </View>
        )}

        {/* Ingredients Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📋 Ingredients List</Text>
          <Text style={styles.bodyText}>
            {product?.ingredients_text || 'Ingredients list not registered in database.'}
          </Text>
        </View>

        {/* Additives Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🧪 E-Codes & Additives</Text>
          <Text style={styles.bodyText}>
            {product?.additives_tags && product.additives_tags.length > 0
              ? product.additives_tags.join(', ').replace(/en:/g, '').toUpperCase()
              : 'No synthetic additives listed.'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.scanAgainButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>📷 Scan Another Item</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F5' },
  scrollContent: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F8F5' },
  loadingText: { marginTop: 12, color: '#2E7D32', fontWeight: '600', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderLeftWidth: 6, elevation: 2 },
  barcodeLabel: { fontSize: 11, color: '#757575', fontWeight: '700', marginBottom: 4 },
  productName: { fontSize: 22, fontWeight: '800', color: '#1B5E20', marginBottom: 4 },
  brandText: { fontSize: 14, color: '#4F6F52', fontWeight: '600', marginBottom: 12 },
  scoreContainer: { marginTop: 8 },
  scoreLabel: { fontSize: 13, color: '#616161', fontWeight: '600', marginBottom: 6 },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  scoreText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 16, elevation: 2 },
  warningCard: { backgroundColor: '#FFF5F5', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#FFCDD2', elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2E7D32', marginBottom: 8 },
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#C62828', marginBottom: 8 },
  bodyText: { fontSize: 14, color: '#333333', lineHeight: 20 },
  bulletText: { fontSize: 14, color: '#B71C1C', fontWeight: '600', marginBottom: 4 },
  scanAgainButton: { backgroundColor: '#2E7D32', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
