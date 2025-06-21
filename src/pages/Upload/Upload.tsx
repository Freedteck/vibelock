import React, { useState } from 'react';
import { Upload as UploadIcon, Music, Users, Coins, Eye, Image } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import styles from './Upload.module.css';

interface Collaborator {
  name: string;
  role: string;
  percentage: number;
}

const Upload: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [trackData, setTrackData] = useState({
    title: '',
    artist: '',
    genre: 'Electronic',
    description: '',
    coinPrice: 0.01,
    maxSupply: 1000
  });
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { name: '', role: 'Artist', percentage: 100 }
  ]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');

  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  const genres = [
    'Electronic', 'Hip-Hop', 'Indie', 'Ambient', 'House', 
    'Techno', 'R&B', 'Pop', 'Rock', 'Jazz'
  ];

  const steps = [
    { number: 1, title: 'Track Files', icon: <Music size={20} /> },
    { number: 2, title: 'Track Info', icon: <UploadIcon size={20} /> },
    { number: 3, title: 'Collaborators', icon: <Users size={20} /> },
    { number: 4, title: 'Coin Settings', icon: <Coins size={20} /> },
    { number: 5, title: 'Preview', icon: <Eye size={20} /> }
  ];

  const handleFileUpload = (file: File, type: 'preview' | 'full' | 'artwork') => {
    if (type === 'preview') {
      setPreviewFile(file);
    } else if (type === 'full') {
      setFullFile(file);
    } else if (type === 'artwork') {
      setArtworkFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setArtworkPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCollaborator = () => {
    setCollaborators([...collaborators, { name: '', role: 'Producer', percentage: 0 }]);
  };

  const removeCollaborator = (index: number) => {
    if (collaborators.length > 1) {
      const newCollabs = collaborators.filter((_, i) => i !== index);
      setCollaborators(newCollabs);
    }
  };

  const updateCollaborator = (index: number, field: keyof Collaborator, value: string | number) => {
    const newCollabs = [...collaborators];
    newCollabs[index] = { ...newCollabs[index], [field]: value };
    setCollaborators(newCollabs);
  };

  const getTotalPercentage = () => {
    return collaborators.reduce((sum, collab) => sum + collab.percentage, 0);
  };

  const handleSubmit = async () => {
    // Create URLs for the files (in a real app, these would be uploaded to a server)
    const previewUrl = previewFile ? URL.createObjectURL(previewFile) : '';
    const fullUrl = fullFile ? URL.createObjectURL(fullFile) : '';
    const artworkUrl = artworkPreview || 'https://images.pexels.com/photos/1144261/pexels-photo-1144261.jpeg?auto=compress&cs=tinysrgb&w=300';

    const newTrack = {
      id: Date.now(), // Simple ID generation
      title: trackData.title,
      artist: trackData.artist,
      genre: trackData.genre,
      duration: '3:24', // Would be calculated from audio file
      previewUrl,
      fullUrl,
      artwork: artworkUrl,
      coinPrice: trackData.coinPrice,
      holders: 0,
      isUnlocked: false,
      releaseDate: new Date().toISOString().split('T')[0],
      playCount: 0,
      maxSupply: trackData.maxSupply,
      currentSupply: 0,
      description: trackData.description,
      collaborators: collaborators.filter(c => c.name.trim() !== ''),
      tradingHistory: []
    };

    dispatch({ type: 'ADD_TRACK', payload: newTrack });
    
    // Navigate to the new track
    navigate(`/track/${newTrack.id}`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return previewFile && fullFile && artworkFile;
      case 2:
        return trackData.title && trackData.artist;
      case 3:
        return getTotalPercentage() === 100 && collaborators.every(c => c.name);
      case 4:
        return trackData.coinPrice > 0 && trackData.maxSupply > 0;
      default:
        return true;
    }
  };

  return (
    <div className={styles.upload}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upload Your Track</h1>
          <p className={styles.subtitle}>
            Share your music with the world and let fans unlock your creativity
          </p>
        </div>

        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {steps.map((step) => (
            <div
              key={step.number}
              className={`${styles.step} ${
                currentStep >= step.number ? styles.active : ''
              } ${currentStep === step.number ? styles.current : ''}`}
            >
              <div className={styles.stepIcon}>
                {currentStep > step.number ? '✓' : step.icon}
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>
          
          {/* Step 1: Track Files */}
          {currentStep === 1 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepHeading}>Upload Track Files</h2>
              <p className={styles.stepDescription}>
                Upload your preview, full track, and artwork
              </p>

              <div className={styles.uploadGrid}>
                <div className={styles.uploadArea}>
                  <div className={`${styles.dropzone} ${previewFile ? styles.hasFile : ''}`}>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'preview')}
                      className={styles.fileInput}
                    />
                    <UploadIcon size={48} />
                    <h3>Preview Track</h3>
                    <p>{previewFile ? previewFile.name : 'Drop your preview file here or click to browse'}</p>
                    <span className={styles.fileNote}>30-45 seconds recommended</span>
                  </div>
                </div>

                <div className={styles.uploadArea}>
                  <div className={`${styles.dropzone} ${fullFile ? styles.hasFile : ''}`}>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'full')}
                      className={styles.fileInput}
                    />
                    <Music size={48} />
                    <h3>Full Track</h3>
                    <p>{fullFile ? fullFile.name : 'Drop your full track here or click to browse'}</p>
                    <span className={styles.fileNote}>Full version for unlocked users</span>
                  </div>
                </div>
              </div>

              <div className={styles.artworkSection}>
                <div className={styles.uploadArea}>
                  <div className={`${styles.dropzone} ${artworkFile ? styles.hasFile : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'artwork')}
                      className={styles.fileInput}
                    />
                    {artworkPreview ? (
                      <img src={artworkPreview} alt="Artwork preview" className={styles.artworkPreview} />
                    ) : (
                      <>
                        <Image size={48} />
                        <h3>Track Artwork</h3>
                        <p>Drop your artwork here or click to browse</p>
                        <span className={styles.fileNote}>Square format recommended (1000x1000px)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Track Info */}
          {currentStep === 2 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepHeading}>Track Information</h2>
              <p className={styles.stepDescription}>
                Provide details about your track
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Track Title *</label>
                  <input
                    type="text"
                    value={trackData.title}
                    onChange={(e) => setTrackData({ ...trackData, title: e.target.value })}
                    className={styles.input}
                    placeholder="Enter track title"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Artist Name *</label>
                  <input
                    type="text"
                    value={trackData.artist}
                    onChange={(e) => setTrackData({ ...trackData, artist: e.target.value })}
                    className={styles.input}
                    placeholder="Enter artist name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Genre</label>
                  <select
                    value={trackData.genre}
                    onChange={(e) => setTrackData({ ...trackData, genre: e.target.value })}
                    className={styles.select}
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    value={trackData.description}
                    onChange={(e) => setTrackData({ ...trackData, description: e.target.value })}
                    className={styles.textarea}
                    placeholder="Tell fans about your track..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Collaborators */}
          {currentStep === 3 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepHeading}>Collaborators & Revenue Split</h2>
              <p className={styles.stepDescription}>
                Add collaborators and set revenue split percentages (must total 100%)
              </p>

              <div className={styles.collaboratorsList}>
                {collaborators.map((collab, index) => (
                  <div key={index} className={styles.collaboratorRow}>
                    <div className={styles.collabInput}>
                      <label className={styles.label}>Name</label>
                      <input
                        type="text"
                        value={collab.name}
                        onChange={(e) => updateCollaborator(index, 'name', e.target.value)}
                        className={styles.input}
                        placeholder="Collaborator name"
                      />
                    </div>

                    <div className={styles.collabInput}>
                      <label className={styles.label}>Role</label>
                      <select
                        value={collab.role}
                        onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                        className={styles.select}
                      >
                        <option value="Artist">Artist</option>
                        <option value="Producer">Producer</option>
                        <option value="Writer">Writer</option>
                        <option value="Vocalist">Vocalist</option>
                        <option value="Instrumentalist">Instrumentalist</option>
                      </select>
                    </div>

                    <div className={styles.collabInput}>
                      <label className={styles.label}>Percentage</label>
                      <input
                        type="number"
                        value={collab.percentage}
                        onChange={(e) => updateCollaborator(index, 'percentage', parseInt(e.target.value) || 0)}
                        className={styles.input}
                        min="0"
                        max="100"
                      />
                    </div>

                    {collaborators.length > 1 && (
                      <button
                        onClick={() => removeCollaborator(index)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.collaboratorActions}>
                <button onClick={addCollaborator} className={styles.addButton}>
                  Add Collaborator
                </button>
                <div className={styles.percentageTotal}>
                  Total: {getTotalPercentage()}%
                  {getTotalPercentage() !== 100 && (
                    <span className={styles.percentageError}>Must equal 100%</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Coin Settings */}
          {currentStep === 4 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepHeading}>Coin Settings</h2>
              <p className={styles.stepDescription}>
                Set the price and supply for your song coin
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Coin Price (ETH) *</label>
                  <input
                    type="number"
                    step="0.001"
                    value={trackData.coinPrice}
                    onChange={(e) => setTrackData({ ...trackData, coinPrice: parseFloat(e.target.value) || 0 })}
                    className={styles.input}
                    min="0.001"
                  />
                  <span className={styles.inputNote}>Price per coin in ETH</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Maximum Supply *</label>
                  <input
                    type="number"
                    value={trackData.maxSupply}
                    onChange={(e) => setTrackData({ ...trackData, maxSupply: parseInt(e.target.value) || 0 })}
                    className={styles.input}
                    min="1"
                  />
                  <span className={styles.inputNote}>Total coins available</span>
                </div>
              </div>

              <div className={styles.coinPreview}>
                <h3>Coin Preview</h3>
                <div className={styles.coinCard}>
                  <div className={styles.coinInfo}>
                    <h4>{trackData.title || 'Your Track'} Coin</h4>
                    <p>Price: {trackData.coinPrice} ETH</p>
                    <p>Supply: {trackData.maxSupply} coins</p>
                    <p>Total Value: {(trackData.coinPrice * trackData.maxSupply).toFixed(3)} ETH</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Preview */}
          {currentStep === 5 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepHeading}>Preview & Publish</h2>
              <p className={styles.stepDescription}>
                Review your track details before publishing
              </p>

              <div className={styles.previewCard}>
                <div className={styles.previewSection}>
                  <h3>Track Details</h3>
                  <div className={styles.previewGrid}>
                    <div><strong>Title:</strong> {trackData.title}</div>
                    <div><strong>Artist:</strong> {trackData.artist}</div>
                    <div><strong>Genre:</strong> {trackData.genre}</div>
                    <div><strong>Description:</strong> {trackData.description || 'No description'}</div>
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3>Collaborators</h3>
                  {collaborators.filter(c => c.name.trim() !== '').map((collab, index) => (
                    <div key={index} className={styles.previewCollab}>
                      {collab.name} - {collab.role} ({collab.percentage}%)
                    </div>
                  ))}
                </div>

                <div className={styles.previewSection}>
                  <h3>Coin Details</h3>
                  <div className={styles.previewGrid}>
                    <div><strong>Price:</strong> {trackData.coinPrice} ETH</div>
                    <div><strong>Supply:</strong> {trackData.maxSupply} coins</div>
                    <div><strong>Total Value:</strong> {(trackData.coinPrice * trackData.maxSupply).toFixed(3)} ETH</div>
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3>Files</h3>
                  <div className={styles.previewGrid}>
                    <div><strong>Preview:</strong> {previewFile?.name}</div>
                    <div><strong>Full Track:</strong> {fullFile?.name}</div>
                    <div><strong>Artwork:</strong> {artworkFile?.name}</div>
                  </div>
                </div>

                {artworkPreview && (
                  <div className={styles.previewSection}>
                    <h3>Artwork Preview</h3>
                    <img src={artworkPreview} alt="Track artwork" className={styles.finalArtworkPreview} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className={styles.backButton}
            >
              Back
            </button>
          )}
          
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className={styles.nextButton}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className={styles.publishButton}
            >
              Publish Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;