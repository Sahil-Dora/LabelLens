import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function HomeScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>LabelLens needs camera access to scan products.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: any) => {
    if (!scanned) {
      setScanned(true);
      setIsScanning(false);
      navigation.navigate('Results', { barcode: data });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isScanning ? (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'],
          }}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.title}>LabelLens</Text>
          <Button
            title="Start Scanning"
            onPress={() => {
              setScanned(false);
              setIsScanning(true);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', backgroundColor: '#F1F8F5' }, camera: { flex: 1 }, center: { alignItems: 'center' }, title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#1B5E20' }, text: { textAlign: 'center', marginBottom: 10 } });
