import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decodeAdditive, checkICMRGuidelines } from '../utils/healthRules';

export default function OcrScanScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const takePhotoOrPick = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Camera permission is required to snap ingredient labels.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      analyzeIngredientText(uri);
    }
  };

  const analyzeIngredientText = (uri: string) => {
    setAnalyzing(true);
    // Simulate smart AI OCR text parsing of Indian back-of-pack labels
    setTimeout(() => {
      // Mocking extracted text analysis for demonstration
      const simulatedText = "Ingredients: Refined wheat flour (maida), sugar, palm oil, emulsifier (INS 322), raising agent (INS 500), synthetic color (INS 102), and permitted preservatives (INS 211).";
      
      const mockProduct = {
        ingredients_text: simulatedText,
        nutriments: {
          'sugars_100g': 18.5,
          'saturated-fat_100g': 8.2,
          'sodium_100g': 0.6
        }
      };

      const icmrFlags = checkICMRGuidelines(mockProduct);
      // Detect E-codes from simulated text
      const foundAdditives = ['102', '211', '322', '500'].map(code => decodeAdditive(code));

      setAnalysisResult({
        extractedText: simulatedText,
        icmrFlags,
        additives: foundAdditives,
        healthScore: "2.1"
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>📸 AI Back-of-Pack OCR</Text>
      <Text style={styles.subtitle}>Snap the ingredient label on local Indian snacks or unbranded items without barcodes.</Text>

      {!imageUri ? (
        <TouchableOpacity style={styles.captureButton} onPress={takePhotoOrPick}>
          <Text style={styles.captureButtonText}>📷 Snap Ingredient Label</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.retakeButton} onPress={() => { setImageUri(null); setAnalysisResult(null); }}>
            <Text style={styles.retakeButtonText}>🔄 Retake Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {analyzing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingText}>🤖 AI is parsing ingredients & checking ICMR rules...</Text>
        </View>
      )}

      {analysisResult && (
        <View style={styles.resultBox}>
          <Text style={styles.sectionHeader}>📝 Extracted OCR Text:</Text>
          <Text style={styles.ocrText}>{analysisResult.extractedText}</Text>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Estimated Health Rating</Text>
            <Text style={styles.scoreValue}>{analysisResult.healthScore} ⭐ / 5.0</Text>
          </View>

          {analysisResult.icmrFlags.length > 0 && (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>🇮🇳 ICMR-NIN Guidelines Advisory:</Text>
              {analysisResult.icmrFlags.map((flag: string, index: number) => (
                <Text key={index} style={styles.alertText}>{flag}</Text>
              ))}
            </View>
          )}

          {analysisResult.additives.length > 0 && (
            <View>
              <Text style={styles.sectionHeader}>🧪 Detected Additives & E-Codes:</Text>
              {analysisResult.additives.map((add: any, idx: number) => (
                <View key={idx} style={styles.additiveCard}>
                  <View style={styles.additiveHeader}>
                    <Text style={styles.additiveName}>{add.name} {add.eNumber ? `(${add.eNumber})` : ''}</Text>
                    <Text style={[styles.riskBadge, { color: add.risk === 'High' ? '#DC2626' : add.risk === 'Moderate' ? '#D97706' : '#16A34A' }]}>
                      {add.risk} Risk
                    </Text>
                  </View>
                  <Text style={styles.additiveDesc}><Text style={{fontWeight: 'bold'}}>Impact:</Text> {add.laymanExplanation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginTop: 30, marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 20, lineHeight: 18 },
  captureButton: { backgroundColor: '#2563EB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  captureButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  previewContainer: { alignItems: 'center', marginTop: 10 },
  previewImage: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12, resizeMode: 'cover' },
  retakeButton: { backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retakeButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  loadingBox: { alignItems: 'center', marginTop: 30 },
  loadingText: { color: '#38BDF8', marginTop: 12, fontSize: 14, fontWeight: '600' },
  resultBox: { marginTop: 20, backgroundColor: '#1E293B', padding: 16, borderRadius: 12 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#E2E8F0', marginTop: 12, marginBottom: 6 },
  ocrText: { fontSize: 13, color: '#CBD5E1', fontStyle: 'italic', backgroundColor: '#0F172A', padding: 10, borderRadius: 8 },
  scoreCard: { backgroundColor: '#0F172A', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  scoreLabel: { fontSize: 12, color: '#94A3B8' },
  scoreValue: { fontSize: 18, fontWeight: 'bold', color: '#38BDF8', marginTop: 2 },
  alertBox: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginTop: 12 },
  alertTitle: { fontSize: 13, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
  alertText: { fontSize: 12, color: '#78350F', marginTop: 2 },
  additiveCard: { backgroundColor: '#0F172A', padding: 10, borderRadius: 8, marginTop: 8 },
  additiveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  additiveName: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
  riskBadge: { fontSize: 11, fontWeight: 'bold' },
  additiveDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 }
});
