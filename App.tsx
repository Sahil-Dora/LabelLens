import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { decodeAdditive, checkICMRGuidelines } from './src/utils/healthRules';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const lastScannedCode = useRef<string | null>(null);
  const scanLock = useRef(false);

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
    const cleanBarcode = data ? data.trim() : '';
    if (scanLock.current || loading || scannedData || cleanBarcode.length < 6) return;
    
    if (lastScannedCode.current === cleanBarcode) return;

    scanLock.current = true;
    lastScannedCode.current = cleanBarcode;
    setLoading(true);
    
    try {
      // 1. Query Global Open Food Facts API v2
      let response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
      let json = await response.json();

      // 2. Fallback to Indian Regional Database if not found globally
      if (!json.product || json.status === 0) {
        response = await fetch(`https://in.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`);
        json = await response.json();
      }

      if (json.product && (json.status === 1 || json.product.product_name)) {
        const product = json.product;

        // Non-food safety guardrail
        const categories = (product.categories || product.categories_tags || []).join(' ').toLowerCase();
        const loweredName = (product.product_name || product.generic_name || '').toLowerCase();
        const strictNonFoodKeywords = ['shampoo', 'body wash', 'detergent', 'toothpaste', 'dishwash', 'lotion', 'battery', 'electronic', 'deodorant spray'];
        const isClearlyNonFood = strictNonFoodKeywords.some(kw => loweredName.includes(kw) && !categories.includes('food') && !categories.includes('beverage'));
        
        if (isClearlyNonFood) {
          Alert.alert(
            "⚠️ Non-Food Product Detected",
            `"${product.product_name || 'This item'}" is a non-consumable household or cosmetic good.`,
            [{ text: "Scan Another", onPress: () => { scanLock.current = false; setLoading(false); } }]
          );
          setLoading(false);
          return;
        }

        const icmrFlags = checkICMRGuidelines(product);
        const additives = (product.additives_tags || []).map((tag: string) => decodeAdditive(tag));

        // Heuristic Health Score Calculation out of 5.0
        let healthScore = 4.2;
        if (icmrFlags.length > 0) healthScore -= (icmrFlags.length * 0.7);
        const highRiskAdditives = additives.filter((a: any) => a.risk === 'High').length;
        healthScore -= (highRiskAdditives * 0.5);
        if (healthScore < 1.0) healthScore = 1.0;
        if (healthScore > 5.0) healthScore = 5.0;

        let nutriscore = product.nutriscore_grade ? product.nutriscore_grade.toUpperCase() : null;
        if (!nutriscore || nutriscore === 'N/A') {
          nutriscore = icmrFlags.length >= 2 ? 'D' : icmrFlags.length === 1 ? 'C' : 'B';
        }

        setScannedData({
          barcode: cleanBarcode,
          brand: product.brands || product.brand_owner || "Indian / Local Brand",
          productName: product.product_name || product.generic_name || "Packaged Food Product",
          ingredients: product.ingredients_text || product.ingredients_text_en || "Ingredients list not explicitly printed on database record. Please inspect physical product packaging.",
          nutriscore,
          healthScore: healthScore.toFixed(1),
          icmrFlags,
          additives,
        });
      } else {
        setScannedData({
          barcode: cleanBarcode,
          brand: "Unregistered / Local Item",
          productName: `Scanned Product (${cleanBarcode})`,
          ingredients: "This barcode is not yet indexed in the Open Food Facts database. Please review the ingredients label directly on the product packaging.",
          nutriscore: "C",
          healthScore: "3.0",
          icmrFlags: ["ℹ️ Unregistered Product: Database record pending. Inspect nutrition panel manually."],
          additives: [],
        });
      }
    } catch (error) {
      Alert.alert(
        "Network Error", 
        "Please check your internet connection and try scanning again.",
        [{ text: "OK", onPress: () => { scanLock.current = false; } }]
      );
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
          torch={torchOn}
          onBarcodeScanned={loading ? undefined : handleBarCodeScanned}
        >
          {/* Top Header & Torch Control */}
          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>⚡ LabelLens Scanner</Text>
            <TouchableOpacity 
              style={[styles.torchButton, torchOn && styles.torchActive]} 
              onPress={() => setTorchOn(!torchOn)}
            >
              <Text style={styles.torchText}>{torchOn ? '🔦 Flash ON' : '💡 Flash OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* Precision Viewfinder Frame */}
          <View style={styles.viewfinderContainer}>
            <View style={styles.scanReticle}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.overlayText}>Align barcode inside frame to scan</Text>
            {loading && <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 20 }} />}
          </View>
        </CameraView>
      ) : (
        <ScrollView style={styles.resultContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.title}>🔬 LabelLens Health Analysis</Text>
          <Text style={styles.brandName}>🏷️ Brand: {scannedData.brand}</Text>
          <Text style={styles.productName}>{scannedData.productName}</Text>
          <Text style={styles.barcodeMeta}>Barcode ID: {scannedData.barcode}</Text>
          
          {/* Rating Badges Row */}
          <View style={styles.badgeRow}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Nutri-Score</Text>
              <Text style={styles.scoreValue}>{scannedData.nutriscore} / E</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Health Rating</Text>
              <Text style={styles.scoreValue}>{scannedData.healthScore} ⭐ / 5.0</Text>
            </View>
          </View>

          {/* ICMR-NIN Guidelines Advisory */}
          {scannedData.icmrFlags.length > 0 && (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>🇮🇳 ICMR-NIN & FSSAI Guidelines Advisory:</Text>
              {scannedData.icmrFlags.map((flag: string, index: number) => (
                <Text key={index} style={styles.alertText}>{flag}</Text>
              ))}
            </View>
          )}

          {/* Detailed Chemical & Additive Breakdown (INS Unmasker) */}
          {scannedData.additives.length > 0 && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>🧪 INS & E-Code Additive Unmasker:</Text>
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
            onPress={() => {
              scanLock.current = false;
              lastScannedCode.current = null;
              setScannedData(null);
            }}
          >
            <Text style={styles.resetButtonText}>📷 Scan Another Product</Text>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  torchButton: { backgroundColor: 'rgba(15, 23, 42, 0.7)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  torchActive: { backgroundColor: '#2563EB', borderColor: '#60A5FA' },
  torchText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  viewfinderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  scanReticle: { width: 260, height: 160, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#38BDF8', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  overlayText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 24, overflow: 'hidden' },
  text: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  brandName: { fontSize: 14, fontWeight: '700', color: '#2563EB', marginBottom: 4 },
  productName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  barcodeMeta: { fontSize: 11, color: '#64748B', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  scoreCard: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', elevation: 1 },
  scoreLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  scoreValue: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
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
  bodyText: { fontSize: 14, color: '#475569', lineHeight: 20, backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  resetButton: { backgroundColor: '#2563EB', marginTop: 20, padding: 16, borderRadius: 10, alignItems: 'center' },
  resetButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
