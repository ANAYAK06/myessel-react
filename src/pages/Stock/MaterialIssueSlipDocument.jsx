// MaterialIssueSlipPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { Download, FileText } from 'lucide-react';

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  companyInfo: {
    textAlign: 'center',
    marginBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#1f2937',
    textDecoration: 'underline',
  },
  issueInfo: {
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '25%',
    color: '#374151',
  },
  infoValue: {
    width: '25%',
    color: '#1f2937',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    color: 'white',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 8,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  col1: { width: '8%' },   // S.No
  col2: { width: '15%' },  // Item Code
  col3: { width: '25%' },  // Item Name
  col4: { width: '15%' },  // Specification
  col5: { width: '10%' },  // DCA Code
  col6: { width: '10%' },  // Units
  col7: { width: '12%' },  // Quantity
  col8: { width: '5%' },   // Space for manual qty
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryValue: {
    color: '#1f2937',
    fontWeight: 'bold',
  },
  signatures: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '30%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginTop: 40,
    paddingTop: 5,
  },
  signatureText: {
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f3f4f6',
    opacity: 0.1,
    zIndex: -1,
  },
});

// PDF Document Component
const MaterialIssueSlipDocument = ({ issueData, itemsData }) => {
  const formatQuantity = (qty) => {
    if (!qty && qty !== 0) return '0.0000';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(qty);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const totalQuantity = itemsData.reduce((sum, item) => sum + (parseFloat(item.Quantity) || 0), 0);
  const totalItems = itemsData.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>MATERIAL ISSUE</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>ESSEL PROJECTS PVT LTD</Text>
            <Text style={styles.companyAddress}>
              Plot No. 6/D, Heavy Industrial Area{'\n'}
              Hatkhoj, Bhilai, Durg-490026, Chhattisgarh{'\n'}
              Tel/Fax: 00771-4268469/4075401 | Email: info@esselprojects.com{'\n'}
              GST No: 22AABCE7701Q1ZK | PAN: AABCE7701Q
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>MATERIAL ISSUE SLIP</Text>

        {/* Issue Information */}
        <View style={styles.issueInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Issue No:</Text>
            <Text style={styles.infoValue}>{issueData?.TansactionId || '-'}</Text>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(issueData?.Date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cost Center:</Text>
            <Text style={styles.infoValue}>{issueData?.CCCode || '-'}</Text>
            <Text style={styles.infoLabel}>Reference ID:</Text>
            <Text style={styles.infoValue}>{issueData?.RId || '-'}</Text>
          </View>
          {/* {issueData?.Description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={[styles.infoValue, { width: '75%' }]}>{issueData.Description}</Text>
            </View>
          )} */}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>S.No</Text>
            <Text style={styles.col2}>Item Code</Text>
            <Text style={styles.col3}>Item Name</Text>
            <Text style={styles.col4}>Specification</Text>
            <Text style={styles.col5}>DCA Code</Text>
            <Text style={styles.col6}>Units</Text>
            <Text style={styles.col7}>Quantity</Text>
            <Text style={styles.col8}>Recv'd</Text>
          </View>

          {/* Table Rows */}
          {itemsData.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow, 
                index % 2 === 0 ? styles.tableRowEven : {}
              ]}
            >
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{item.Itemcode || '-'}</Text>
              <Text style={styles.col3}>{item.Itemname || '-'}</Text>
              <Text style={styles.col4}>{item.Specification || '-'}</Text>
              <Text style={styles.col5}>{item.DcaCode || '-'}</Text>
              <Text style={styles.col6}>{item.Units || '-'}</Text>
              <Text style={styles.col7}>{formatQuantity(item.Quantity)}</Text>
              <Text style={styles.col8}>____</Text>
            </View>
          ))}

          {/* Add empty rows if needed */}
          {itemsData.length < 10 && 
            Array.from({ length: 10 - itemsData.length }, (_, index) => (
              <View key={`empty-${index}`} style={styles.tableRow}>
                <Text style={styles.col1}>{itemsData.length + index + 1}</Text>
                <Text style={styles.col2}>-</Text>
                <Text style={styles.col3}>-</Text>
                <Text style={styles.col4}>-</Text>
                <Text style={styles.col5}>-</Text>
                <Text style={styles.col6}>-</Text>
                <Text style={styles.col7}>-</Text>
                <Text style={styles.col8}>____</Text>
              </View>
            ))
          }
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Quantity:</Text>
            <Text style={styles.summaryValue}>{formatQuantity(totalQuantity)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Issue Date:</Text>
            <Text style={styles.summaryValue}>{formatDate(issueData?.Date)}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>Issued By</Text>
            </View>
            <Text style={[styles.signatureText, { marginTop: 5 }]}>
              Name:{'\n'}Date:{'\n'}Signature:
            </Text>
          </View>
          
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>Approved By</Text>
            </View>
            <Text style={[styles.signatureText, { marginTop: 5 }]}>
              Name:{'\n'}Date:{'\n'}Signature:
            </Text>
          </View>
          
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>Received By</Text>
            </View>
            <Text style={[styles.signatureText, { marginTop: 5 }]}>
              Name:{'\n'}Date:{'\n'}Signature:
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a computer generated document. Generated on {new Date().toLocaleString('en-IN')} | Material Issue Slip - {issueData?.TansactionId || 'N/A'}
        </Text>
      </Page>
    </Document>
  );
};

// Download Button Component
export const MaterialIssueSlipDownloadButton = ({ issueData, itemsData, disabled = false }) => {
  const fileName = `Material_Issue_Slip_${issueData?.TansactionId || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  return (
    <PDFDownloadLink
      document={<MaterialIssueSlipDocument issueData={issueData} itemsData={itemsData} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <button
          disabled={disabled || loading}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          title="Download Material Issue Slip as PDF"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating PDF...</span>
            </>
          ) : error ? (
            <>
              <FileText className="h-4 w-4" />
              <span>Error</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download Issue Slip</span>
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default MaterialIssueSlipDocument;