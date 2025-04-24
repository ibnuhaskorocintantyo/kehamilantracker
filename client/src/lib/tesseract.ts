import { apiRequest } from "./queryClient";

export async function processMedicalDocument(imageFile: File): Promise<string> {
  try {
    // In a real implementation, this would use Tesseract.js for client-side OCR
    // or upload the image to the server for processing
    // For this demo, we'll simulate the OCR process with a backend request
    
    // Convert file to base64 for sending to the server
    const base64Image = await fileToBase64(imageFile);
    
    // Make a request to the API endpoint
    const response = await apiRequest("POST", "/api/analyze-document", {
      image: base64Image
    });
    
    // In a real implementation, this would be the extracted text from Tesseract
    // For demo purposes, we'll return a simulated result
    return simulateOCRResult(imageFile.name);
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error("Failed to process document");
  }
}

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

// Simulate OCR result for demo purposes
function simulateOCRResult(filename: string): string {
  // Different simulated results based on filename patterns
  if (filename.toLowerCase().includes('ultrasound')) {
    return `
ULTRASOUND EXAMINATION REPORT

Patient Name: Sarah Johnson
Date of Examination: ${new Date().toLocaleDateString()}
Gestational Age: 24 weeks

FINDINGS:
Single live intrauterine pregnancy
Fetal heart rate: 148 bpm (normal range: 120-160 bpm)
Estimated fetal weight: 590g (50th percentile)
Amniotic fluid: Normal volume
Placenta: Posterior, normal appearance, grade II maturity
Cervical length: 3.8cm (normal)

ANATOMICAL SURVEY:
Brain: Normal ventricular size
Spine: Normal alignment
Heart: Four chambers visualized, normal function
Stomach and kidneys: Visualized and normal
Bladder: Visualized and normal
Limbs: All four extremities visualized

GENDER: Female

CONCLUSION:
Normal growth and development for gestational age
No structural abnormalities detected
Follow-up recommended at 28 weeks for growth scan
`;
  } else if (filename.toLowerCase().includes('blood') || filename.toLowerCase().includes('lab')) {
    return `
LABORATORY RESULTS

Patient: Sarah Johnson
Collection Date: ${new Date().toLocaleDateString()}
Sample Type: Venous Blood
Referring Physician: Dr. Emily Chen

TEST RESULTS:
Complete Blood Count (CBC)
- Hemoglobin: 11.5 g/dL (Reference: 11.5-15.0)
- Hematocrit: 34% (Reference: 34-44%)
- WBC: 9.5 x10^9/L (Reference: 4.0-11.0)
- Platelets: 250 x10^9/L (Reference: 150-400)

Glucose Screen
- Glucose (fasting): 84 mg/dL (Reference: 70-100)

Prenatal Panel
- Blood Type: O Positive
- Rubella: Immune
- HBsAg: Negative
- HIV: Negative
- Syphilis: Non-reactive

IMPRESSION:
Results within normal reference ranges for gestational age
Hemoglobin at lower limit of normal; recommend continuing iron supplementation
`;
  } else {
    return `
PRENATAL VISIT SUMMARY

Patient: Sarah Johnson
Date of Visit: ${new Date().toLocaleDateString()}
Gestational Age: 24 weeks
Provider: Dr. Emily Chen, OB/GYN

VITALS:
BP: 118/72 mmHg
Pulse: 76 bpm
Weight: 145 lbs (gain of 14 lbs from pre-pregnancy)
Fundal Height: 24 cm
Fetal Heart Rate: 150 bpm

ASSESSMENT:
- Pregnancy progressing normally
- Appropriate weight gain
- No signs of gestational diabetes or preeclampsia
- Patient reports mild lower back discomfort

RECOMMENDATIONS:
- Continue prenatal vitamins with iron
- Schedule glucose tolerance test for next visit
- Review labor and delivery classes options
- Recommended prenatal yoga for back discomfort
- Next appointment scheduled in 4 weeks

If you experience severe headaches, visual changes, abdominal pain, vaginal bleeding, or decreased fetal movement, please contact our office immediately.
`;
  }
}
