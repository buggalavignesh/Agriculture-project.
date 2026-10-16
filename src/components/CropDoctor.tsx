import React, { useState, useRef } from 'react';
import { 
  Stethoscope, 
  Upload, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Save, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  X
} from 'lucide-react';
import type { AIAvailabilityStatus, CropDiagnosis, AppSettings } from '../types';
import { aiService } from '../services/ai';
import { speechService } from '../services/speech';
import { processAndCompressImage } from '../utils/imageUtils';
import { dbService } from '../services/db';

interface CropDoctorProps {
  aiStatus: AIAvailabilityStatus | null;
  settings: AppSettings;
  onOpenChatWithDiagnosis: (prompt: string, imageBase64: string) => void;
}

const COMMON_CROPS = [
  'Paddy / Rice',
  'Wheat',
  'Tomato',
  'Cotton',
  'Maize / Corn',
  'Chilli / Pepper',
  'Potato',
  'Groundnut / Peanut',
  'Sugarcane',
  'Banana',
  'Soybean',
  'Other / Unknown',
];

const COMMON_SYMPTOMS = [
  'Yellowing of leaves (Chlorosis)',
  'Brown/black spots with yellow halos',
  'White powdery coating on surface',
  'Leaves wilting or drooping',
  'Curling or distorted leaf edges',
  'Holes or insect chewing signs',
  'Dark lesions on stem or branch',
  'Fruit spots, rot or cracking',
];

export const CropDoctor: React.FC<CropDoctorProps> = ({
  aiStatus,
  settings,
  onOpenChatWithDiagnosis,
}) => {
  const [selectedCrop, setSelectedCrop] = useState(COMMON_CROPS[0]);
  const [customCropName, setCustomCropName] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomNotes, setSymptomNotes] = useState('');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file: File) => {
    try {
      setErrorNotice(null);
      setAnalysisText(null);
      setSavedSuccess(false);
      const processed = await processAndCompressImage(file, 1024, 0.85);
      setImagePreview(processed.base64);
      setImageMime(processed.mimeType);
    } catch (err: any) {
      setErrorNotice(`Failed to process image: ${err.message || 'Unknown format'}`);
    }
  };

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleRunDiagnosis = async () => {
    if (!imagePreview) {
      setErrorNotice('Please upload or take a clear photo of the affected plant or leaf first.');
      return;
    }

    if (!aiStatus?.isAvailable) {
      setErrorNotice('Local AI is not available. Please verify Ollama is running in Settings.');
      return;
    }

    if (!aiStatus.selectedModelHasVision) {
      setErrorNotice(
        `Selected model '${aiStatus.selectedModel}' does not support Vision. Please switch to a vision model (e.g. gemma4:12b or llava) in Settings.`
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorNotice(null);
    setAnalysisText('');
    setSavedSuccess(false);

    const cropName = selectedCrop === 'Other / Unknown' && customCropName ? customCropName : selectedCrop;
    const symptomsDesc = [
      ...selectedSymptoms,
      symptomNotes ? `Additional notes: ${symptomNotes}` : '',
    ].filter(Boolean).join('; ');

    try {
      let accumulated = '';
      await aiService.analyzeCropImage({
        imageBase64: imagePreview,
        imageMimeType: imageMime,
        cropType: cropName,
        symptomsDescription: symptomsDesc,
        model: aiStatus.selectedModel || 'gemma4:12b',
        endpoint: settings.ollamaEndpoint,
        onChunk: (chunk) => {
          accumulated = chunk;
          setAnalysisText(accumulated);
        },
      });

      // Auto save to database
      const diagnosisRecord: CropDiagnosis = {
        id: `diag-${Date.now()}`,
        timestamp: Date.now(),
        cropType: cropName,
        customCropName,
        selectedSymptoms,
        symptomNotes,
        imageBase64: imagePreview,
        imageMimeType: imageMime,
        analysisResult: accumulated,
        modelUsed: aiStatus.selectedModel,
      };

      await dbService.saveDiagnosis(diagnosisRecord);
      setSavedSuccess(true);

      if (settings.autoSpeakAnswer && accumulated) {
        handleToggleSpeak(accumulated);
      }
    } catch (err: any) {
      setErrorNotice(`Analysis failed: ${err.message || 'Error communicating with vision model'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleSpeak = (text: string) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    speechService.speakText(text, {
      lang: settings.preferredLanguage,
      rate: settings.speechRate,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleFollowUpInChat = () => {
    if (!analysisText || !imagePreview) return;
    const cropName = selectedCrop === 'Other / Unknown' && customCropName ? customCropName : selectedCrop;
    const prompt = `Here is the Crop Doctor diagnosis for my ${cropName}:\n\n${analysisText}\n\nI have a follow-up question: What precautions should I take before applying any treatment?`;
    onOpenChatWithDiagnosis(prompt, imagePreview);
  };

  return (
    <div className="crop-doctor-page">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Page Header */}
      <div className="doctor-header-card">
        <div className="doctor-icon-badge">
          <Stethoscope size={28} />
        </div>
        <div className="doctor-header-titles">
          <h2>Crop Doctor • Visual Plant Diagnosis</h2>
          <p>
            Capture or upload a leaf, stem, or fruit photo. Our local vision AI analyzes visible patterns and provides 
            cautious, structured, low-risk farming recommendations without sending photos to any cloud.
          </p>
        </div>
      </div>

      {/* Error or Alert banner */}
      {errorNotice && (
        <div className="doctor-error-banner">
          <AlertTriangle size={18} />
          <span>{errorNotice}</span>
          <button className="btn-close-banner" onClick={() => setErrorNotice(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form & Image Grid */}
      <div className="doctor-grid">
        {/* Left Column: Image Upload & Crop Metadata */}
        <div className="doctor-input-column">
          {/* Image Upload Box */}
          <div className="image-capture-box">
            {imagePreview ? (
              <div className="preview-active-container">
                <img src={imagePreview} alt="Selected crop leaf" className="doctor-preview-img" />
                <div className="preview-overlay-actions">
                  <button
                    className="btn-overlay"
                    onClick={() => fileInputRef.current?.click()}
                    title="Choose a different image"
                  >
                    <RefreshCw size={16} />
                    <span>Change Image</span>
                  </button>
                  <button
                    className="btn-overlay btn-overlay-danger"
                    onClick={() => setImagePreview(null)}
                    title="Remove image"
                  >
                    <X size={16} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-dropzone">
                <div className="dropzone-icon">
                  <Upload size={32} />
                </div>
                <h3>Add Crop Photo</h3>
                <p>Choose clear photo of diseased or abnormal plant parts</p>
                <div className="dropzone-buttons">
                  <button
                    className="btn-outline-farm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>Upload Image</span>
                  </button>
                  <button
                    className="btn-primary-farm"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    <span>Take Photo</span>
                  </button>
                </div>
                <div className="dropzone-hint">
                  <Info size={13} />
                  <span>Tip: Hold leaf steady in natural daylight with symptoms in sharp focus</span>
                </div>
              </div>
            )}
          </div>

          {/* Crop Selector Card */}
          <div className="doctor-card-sub">
            <label className="input-group-label">1. Select Crop Type</label>
            <div className="crop-pills-container">
              {COMMON_CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  className={`crop-pill-btn ${selectedCrop === crop ? 'crop-pill-selected' : ''}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  {crop}
                </button>
              ))}
            </div>

            {selectedCrop === 'Other / Unknown' && (
              <input
                type="text"
                className="input-custom-crop"
                placeholder="Specify crop name (e.g. Mango, Brinjal, Onion)..."
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
              />
            )}
          </div>

          {/* Observable Symptoms Tagging */}
          <div className="doctor-card-sub">
            <label className="input-group-label">2. Observed Visual Symptoms (Select all visible)</label>
            <div className="symptoms-checklist">
              {COMMON_SYMPTOMS.map((symptom) => (
                <label key={symptom} className="symptom-check-item">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleToggleSymptom(symptom)}
                  />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>

            <textarea
              className="notes-textarea"
              placeholder="Additional observations (e.g. started 3 days ago after heavy rain, whole field or few patches)..."
              value={symptomNotes}
              onChange={(e) => setSymptomNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Run Diagnosis Button */}
          <button
            className="btn-diagnose-main"
            onClick={handleRunDiagnosis}
            disabled={!imagePreview || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={20} className="spin-icon" />
                <span>Analyzing Image with {aiStatus?.selectedModel || 'Local Model'}...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Run Vision Diagnosis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Diagnosis Results & Safety Guidance */}
        <div className="doctor-results-column">
          {analysisText ? (
            <div className="results-card">
              <div className="results-header">
                <div className="results-badge">
                  <CheckCircle size={16} />
                  <span>Visual Analysis Complete</span>
                </div>
                <div className="results-controls">
                  <button
                    className={`btn-action-icon ${isSpeaking ? 'btn-speaking-active' : ''}`}
                    onClick={() => handleToggleSpeak(analysisText)}
                    title={isSpeaking ? 'Stop speaking' : 'Read aloud with Text-to-Speech'}
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                  </button>

                  {savedSuccess && (
                    <span className="badge-saved">
                      <Save size={13} /> Saved to History
                    </span>
                  )}
                </div>
              </div>

              {/* Formatted Analysis Content */}
              <div className="results-body">
                <div className="formatted-markdown">{analysisText}</div>
              </div>

              {/* Crucial Agricultural Safety Disclaimer */}
              <div className="mandatory-safety-box">
                <div className="safety-title">
                  <ShieldCheck size={18} className="text-emerald" />
                  <h4>Agricultural Safety & Disclaimer</h4>
                </div>
                <p>
                  <strong>Visual symptoms are not absolute confirmation:</strong> Nutrient deficiencies, insect bites, 
                  salinity, and environmental stress can produce lesions that look identical to fungal or viral pathogens. 
                  Never apply chemical pesticide cocktails without confirmation from an accredited agricultural extension 
                  officer or Krishi Vigyan Kendra (KVK).
                </p>
              </div>

              {/* Next Step Actions */}
              <div className="results-footer-actions">
                <button className="btn-primary-farm" onClick={handleFollowUpInChat}>
                  <span>Ask Follow-up in AI Chat</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-results-card">
              <div className="empty-icon-leaf">🌿</div>
              <h3>Ready for Plant Diagnosis</h3>
              <p>Upload a photo on the left and tap <strong>Run Vision Diagnosis</strong> to see structured findings.</p>

              <div className="diagnosis-steps-preview">
                <div className="step-preview-item">
                  <span className="step-num">1</span>
                  <span><strong>Observable Signs:</strong> Detailed examination of discoloration, pustules, and margins</span>
                </div>
                <div className="step-preview-item">
                  <span className="step-num">2</span>
                  <span><strong>Possible Causes:</strong> Evaluates fungal, bacterial, viral, and nutrient alternatives</span>
                </div>
                <div className="step-preview-item">
                  <span className="step-num">3</span>
                  <span><strong>Low-Risk Next Steps:</strong> Sanitation, spacing, biologicals, and safe cultural practices</span>
                </div>
                <div className="step-preview-item">
                  <span className="step-num">4</span>
                  <span><strong>Safety & Verification:</strong> Safe guidance without harmful chemical dosages</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
