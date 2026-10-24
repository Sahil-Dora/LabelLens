import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { decodeAdditive, checkICMRGuidelines } from './src/utils/healthRules';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>LabelLens needs camera access to scan food barcodes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();

      if (json.status === 1) {
        const product = json.product;
        const icmrFlags = checkICMRGuidelines(product);
        const additives = (product.additives_tags || []).map((tag: string) => decodeAdditive(tag));

        setScannedData({
          productName: product.product_name || "Unknown Product",
          ingredients: product.ingredients_text || "No ingredient list available.",
          nutriscore: product.nutriscore_grade?.toUpperCase() || "N/A",
          icmrFlags,
          additives,
        });
      } else {
        Alert.alert("Product Not Found", "This barcode is not registered in the database yet.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!scannedData ? (
        <CameraView 
          style={styles.camera} 
          facing="back"
          onBarcodeScanned={loading ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Align food barcode within the frame</Text>
            {loading && <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />}
          </View>
        </CameraView>
      ) : (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.title}>🔬 LabelLens Analysis</Text>
          <Text style={styles.productName}>{scannedData.productName}</Text>
          
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Nutri-Score: {scannedData.nutriscore}</Text>
          </View>

          {scannedData.icmrFlags.length > 0 && (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>🇮🇳 ICMR-NIN Guidelines Advisory:</Text>
              {scannedData.icmrFlags.map((flag: string, index: number) => (
                <Text key={index} style={styles.alertText}>{flag}</Text>
              ))}
            </View>
          )}

          {scannedData.additives.length > 0 && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>🧪 Detailed Chemical & Additive Breakdown:</Text>
              {scannedData.additives.map((add: any, idx: number) => (
                <View key={idx} style={styles.additiveCard}>
                  <View style={styles.additiveHeader}>
                    <Text style={styles.additiveName}>{add.name} {add.eNumber ? `(${add.eNumber})` : ''}</Text>
                    <Text style={[styles.riskBadge, { color: add.risk === 'High' ? '#DC2626' : add.risk === 'Moderate' ? '#D97706' : '#16A34A' }]}>
                      {add.risk} Risk
                    </Text>
                  </View>
                  <Text style={styles.categoryText}>🏷️ Category: {add.category}</Text>
                  <Text style={styles.additiveDesc}><Text style={{fontWeight: 'bold'}}>What it is:</Text> {add.description}</Text>
                  <Text style={styles.additiveDesc}><Text style={{fontWeight: 'bold'}}>Health Impact:</Text> {add.laymanExplanation}</Text>
                  <View style={styles.icmrBox}>
                    <Text style={styles.icmrText}><Text style={{fontWeight: 'bold'}}>FSSAI / ICMR Context:</Text> {add.icmrContext}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionHeader}>Full Ingredients List:</Text>
          <Text style={styles.bodyText}>{scannedData.ingredients}</Text>

          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => setScannedData(null)}
          >
            <Text style={styles.resetButtonText}>Scan Another Product</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0F172A' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 50 },
  overlayText: { color: '#FFF', fontSize: 16, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  text: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  productName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', marginBottom: 16 },
  badge: { backgroundColor: '#22C55E', color: '#FFF', fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, overflow: 'hidden' },
  alertBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16 },
  alertTitle: { fontSize: 13, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
  alertText: { fontSize: 12, color: '#78350F', marginTop: 2 },
  sectionBox: { marginBottom: 16 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 6 },
  additiveCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 1, borderWidth: 1, borderColor: '#E2E8F0' },
  additiveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  additiveName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  riskBadge: { fontSize: 12, fontWeight: 'bold' },
  categoryText: { fontSize: 12, color: '#2563EB', fontWeight: '600', marginBottom: 6 },
  additiveDesc: { fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 16 },
  icmrBox: { marginTop: 8, backgroundColor: '#F1F5F9', padding: 8, borderRadius: 6 },
  icmrText: { fontSize: 11, color: '#334155', lineHeight: 15 },
  bodyText: { fontSize: 14, color: '#475569', lineHeight: 20, backgroundColor: '#FFF', padding: 12, borderRadius: 8 },
  resetButton: { backgroundColor: '#2563EB', marginTop: 30, marginBottom: 40, padding: 16, borderRadius: 10, alignItems: 'center' },
  resetButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
