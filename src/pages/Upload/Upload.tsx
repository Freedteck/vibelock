import React, { useState, useEffect } from "react";
import {
  Upload as UploadIcon,
  Music,
  Users,
  Eye,
  Image,
  Wallet,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { getArtist } from "../../client/supabase";
import MobileHeader from "../../components/MobileHeader/MobileHeader";
import styles from "./Upload.module.css";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

interface Collaborator {
  name: string;
  role: string;
  walletAddress: string;
  percentage: number;
}

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { addTrack } = useAppContext();
  const { isConnected, walletAddress, connectWallet, isConnecting } =
    useWallet();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingArtist, setIsCheckingArtist] = useState(false);
  const [artistExists, setArtistExists] = useState(false);
  const [artistName, setArtistName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [trackData, setTrackData] = useState({
    title: "",
    description: "",
    genre: "Electronic",
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { name: artistName, role: "Artist", walletAddress: "", percentage: 100 },
  ]);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fullFile, setFullFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>("");

  const genres = [
    "Electronic",
    "Hip-Hop",
    "Indie",
    "Ambient",
    "House",
    "Techno",
    "R&B",
    "Pop",
    "Rock",
    "Jazz",
  ];

  const steps = [
    { number: 1, title: "Track Files", icon: <Music size={20} /> },
    { number: 2, title: "Track Info", icon: <UploadIcon size={20} /> },
    { number: 3, title: "Collaborators", icon: <Users size={20} /> },
    { number: 4, title: "Preview", icon: <Eye size={20} /> },
  ];

  // Check if user is connected and has artist profile
  useEffect(() => {
    const checkArtistProfile = async () => {
      if (!isConnected || !walletAddress) return;

      setIsCheckingArtist(true);
      try {
        const { data, error } = await getArtist(walletAddress.toLowerCase());
        if (data && !error) {
          setArtistExists(true);
          setArtistName(data.full_name || "Unknown Artist");
        } else {
          setArtistExists(false);
        }
      } catch (error) {
        console.error("Error checking artist profile:", error);
        setArtistExists(false);
      } finally {
        setIsCheckingArtist(false);
      }
    };

    checkArtistProfile();
  }, [isConnected, walletAddress]);

  const handleFileUpload = (
    file: File,
    type: "preview" | "full" | "artwork"
  ) => {
    if (type === "preview") {
      setPreviewFile(file);
    } else if (type === "full") {
      setFullFile(file);
    } else if (type === "artwork") {
      setArtworkFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setArtworkPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCollaborator = () => {
    setCollaborators([
      ...collaborators,
      { name: "", role: "Producer", walletAddress: "", percentage: 0 },
    ]);
  };

  const removeCollaborator = (index: number) => {
    if (collaborators.length > 1) {
      const newCollabs = collaborators.filter((_, i) => i !== index);
      setCollaborators(newCollabs);
    }
  };

  const updateCollaborator = (
    index: number,
    field: keyof Collaborator,
    value: string | number
  ) => {
    const newCollabs = [...collaborators];
    newCollabs[index] = { ...newCollabs[index], [field]: value };
    setCollaborators(newCollabs);
  };

  const getTotalPercentage = () => {
    return collaborators.reduce((sum, collab) => sum + collab.percentage, 0);
  };

  const handleSubmit = async () => {
    if (!walletAddress) return;

    setIsUploading(true);
    try {
      await toast.promise(
        addTrack({
          trackData,
          artistName,
          walletAddress,
          artworkFile: artworkFile!,
          previewFile: previewFile!,
          fullFile: fullFile!,
          collaborators,
        }),
        {
          loading: "Adding track...",
          success: "Track added successfully! 🎵",
          error: (err) => `Failed to add track: ${err.message}`,
        }
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error uploading track:", error);
      // Toast already handled the error - no need for alert
    } finally {
      setIsUploading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return previewFile && fullFile && artworkFile;
      case 2:
        return trackData.title.trim() !== "";
      case 3:
        return (
          getTotalPercentage() === 100 &&
          collaborators.every((c) => c.name && c.walletAddress)
        );
      default:
        return true;
    }
  };

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className={styles.upload}>
        <MobileHeader title="Upload Track" showBack={true} />

        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Connect Your Wallet</h1>
            <p className={styles.subtitle}>
              You need to connect your wallet to upload tracks and manage your
              music
            </p>
          </div>

          <div className={styles.stepContent}>
            <div
              className={styles.stepPanel}
              style={{ textAlign: "center", padding: "3rem 2rem" }}
            >
              <Wallet
                size={64}
                style={{ margin: "0 auto 2rem", color: "#8b5cf6" }}
              />
              <h2
                style={{ color: "var(--text-primary)", marginBottom: "1rem" }}
              >
                Wallet Required
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                  lineHeight: 1.5,
                }}
              >
                Connect your wallet to start uploading tracks, manage your
                music, and earn from your creations.
              </p>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={styles.publishButton}
                style={{ margin: "0 auto" }}
              >
                {isConnecting ? (
                  <>
                    <div
                      className={styles.spinner}
                      style={{ width: "18px", height: "18px" }}
                    />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking artist profile
  if (isCheckingArtist) {
    return (
      <div className={styles.upload}>
        <MobileHeader title="Upload Track" showBack={true} />

        <div className={styles.container}>
          <div className={styles.stepContent}>
            <div
              className={styles.stepPanel}
              style={{ textAlign: "center", padding: "3rem 2rem" }}
            >
              <div
                className={styles.spinner}
                style={{ margin: "0 auto 2rem", width: "48px", height: "48px" }}
              />
              <h2
                style={{ color: "var(--text-primary)", marginBottom: "1rem" }}
              >
                Checking Profile...
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Please wait while we verify your artist profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show artist profile creation prompt if artist doesn't exist
  if (!artistExists) {
    return (
      <div className={styles.upload}>
        <MobileHeader title="Upload Track" showBack={true} />

        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create Artist Profile</h1>
            <p className={styles.subtitle}>
              You need to create your artist profile before you can upload
              tracks
            </p>
          </div>

          <div className={styles.stepContent}>
            <div
              className={styles.stepPanel}
              style={{ textAlign: "center", padding: "3rem 2rem" }}
            >
              <Music
                size={64}
                style={{ margin: "0 auto 2rem", color: "#8b5cf6" }}
              />
              <h2
                style={{ color: "var(--text-primary)", marginBottom: "1rem" }}
              >
                Artist Profile Required
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "2rem",
                  lineHeight: 1.5,
                }}
              >
                Before you can upload tracks, you need to create your artist
                profile. This helps fans discover and connect with your music.
              </p>
              <Link
                to="/create-artist-profile"
                className={styles.publishButton}
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  margin: "0 auto",
                }}
              >
                <Users size={18} />
                Create Artist Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.upload}>
      <MobileHeader title="Upload Track" showBack={true} />

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
                currentStep >= step.number ? styles.active : ""
              } ${currentStep === step.number ? styles.current : ""}`}
            >
              <div className={styles.stepIcon}>
                {currentStep > step.number ? "✓" : step.icon}
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
                  <div
                    className={`${styles.dropzone} ${
                      previewFile ? styles.hasFile : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], "preview")
                      }
                      className={styles.fileInput}
                    />
                    <UploadIcon size={48} />
                    <h3>Preview Track</h3>
                    <p>
                      {previewFile
                        ? previewFile.name
                        : "Drop your preview file here or click to browse"}
                    </p>
                    <span className={styles.fileNote}>
                      30-45 seconds recommended
                    </span>
                  </div>
                </div>

                <div className={styles.uploadArea}>
                  <div
                    className={`${styles.dropzone} ${
                      fullFile ? styles.hasFile : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], "full")
                      }
                      className={styles.fileInput}
                    />
                    <Music size={48} />
                    <h3>Full Track</h3>
                    <p>
                      {fullFile
                        ? fullFile.name
                        : "Drop your full track here or click to browse"}
                    </p>
                    <span className={styles.fileNote}>
                      Full version for unlocked users
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.artworkSection}>
                <div className={styles.uploadArea}>
                  <div
                    className={`${styles.dropzone} ${
                      artworkFile ? styles.hasFile : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], "artwork")
                      }
                      className={styles.fileInput}
                    />
                    {artworkPreview ? (
                      <img
                        src={artworkPreview}
                        alt="Artwork preview"
                        className={styles.artworkPreview}
                      />
                    ) : (
                      <>
                        <Image size={48} />
                        <h3>Track Artwork</h3>
                        <p>Drop your artwork here or click to browse</p>
                        <span className={styles.fileNote}>
                          Square format recommended (1000x1000px)
                        </span>
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
                    onChange={(e) =>
                      setTrackData({ ...trackData, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="Enter track title"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Artist Name</label>
                  <input
                    type="text"
                    value={artistName}
                    className={styles.input}
                    disabled
                    style={{ opacity: 0.7, cursor: "not-allowed" }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Genre</label>
                  <select
                    value={trackData.genre}
                    onChange={(e) =>
                      setTrackData({ ...trackData, genre: e.target.value })
                    }
                    className={styles.select}
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    value={trackData.description}
                    onChange={(e) =>
                      setTrackData({
                        ...trackData,
                        description: e.target.value,
                      })
                    }
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
              <h2 className={styles.stepHeading}>
                Collaborators & Revenue Split
              </h2>
              <p className={styles.stepDescription}>
                Add collaborators with their wallet addresses and set revenue
                split percentages (must total 100%)
              </p>

              <div className={styles.collaboratorsList}>
                {collaborators.map((collab, index) => (
                  <div key={index} className={styles.collaboratorRow}>
                    <div className={styles.collabInput}>
                      <label className={styles.label}>Name</label>
                      <input
                        type="text"
                        value={collab.name}
                        onChange={(e) =>
                          updateCollaborator(index, "name", e.target.value)
                        }
                        className={styles.input}
                        placeholder="Collaborator name"
                      />
                    </div>

                    <div className={styles.collabInput}>
                      <label className={styles.label}>Role</label>
                      <select
                        value={collab.role}
                        onChange={(e) =>
                          updateCollaborator(index, "role", e.target.value)
                        }
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
                      <label className={styles.label}>Wallet Address</label>
                      <input
                        type="text"
                        value={collab.walletAddress}
                        onChange={(e) =>
                          updateCollaborator(
                            index,
                            "walletAddress",
                            e.target.value
                          )
                        }
                        className={styles.input}
                        placeholder="0x..."
                      />
                    </div>

                    <div
                      className={styles.collabInput}
                      style={{ maxWidth: "100px" }}
                    >
                      <label className={styles.label}>%</label>
                      <input
                        type="number"
                        value={collab.percentage}
                        onChange={(e) =>
                          updateCollaborator(
                            index,
                            "percentage",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className={styles.input}
                        min="0"
                        max="100"
                        style={{ textAlign: "center" }}
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
                    <span className={styles.percentageError}>
                      Must equal 100%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepHeading}>Preview & Publish</h2>
              <p className={styles.stepDescription}>
                Review your track details before publishing
              </p>

              <div className={styles.previewCard}>
                <div className={styles.previewSection}>
                  <h3>Track Details</h3>
                  <div className={styles.previewGrid}>
                    <div>
                      <strong>Title:</strong> {trackData.title}
                    </div>
                    <div>
                      <strong>Artist:</strong> {artistName}
                    </div>
                    <div>
                      <strong>Genre:</strong> {trackData.genre}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {trackData.description || "No description"}
                    </div>
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3>Collaborators</h3>
                  {collaborators
                    .filter((c) => c.name.trim() !== "")
                    .map((collab, index) => (
                      <div key={index} className={styles.previewCollab}>
                        {collab.name} - {collab.role} ({collab.percentage}%) -{" "}
                        {collab.walletAddress}
                      </div>
                    ))}
                </div>

                <div className={styles.previewSection}>
                  <h3>Files</h3>
                  <div className={styles.previewGrid}>
                    <div>
                      <strong>Preview:</strong> {previewFile?.name}
                    </div>
                    <div>
                      <strong>Full Track:</strong> {fullFile?.name}
                    </div>
                    <div>
                      <strong>Artwork:</strong> {artworkFile?.name}
                    </div>
                  </div>
                </div>

                {artworkPreview && (
                  <div className={styles.previewSection}>
                    <h3>Artwork Preview</h3>
                    <img
                      src={artworkPreview}
                      alt="Track artwork"
                      className={styles.finalArtworkPreview}
                    />
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
              disabled={isUploading}
            >
              Back
            </button>
          )}

          {currentStep < 4 ? (
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
              disabled={isUploading}
              className={styles.publishButton}
            >
              {isUploading ? (
                <>
                  <div
                    className={styles.spinner}
                    style={{ width: "18px", height: "18px" }}
                  />
                  Publishing...
                </>
              ) : (
                "Publish Track"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
