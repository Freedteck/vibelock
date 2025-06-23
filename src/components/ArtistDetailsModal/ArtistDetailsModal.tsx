import React, { useState } from "react";
import { X, User, Image } from "lucide-react";
import styles from "./ArtistDetailsModal.module.css";

interface ArtistDetails {
  name: string;
  bio: string;
  twitter: string;
  instagram: string;
  profileImage: File | null;
  bannerImage: File | null;
}

interface ArtistDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: ArtistDetails) => void;
}

const ArtistDetailsModal: React.FC<ArtistDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [details, setDetails] = useState<ArtistDetails>({
    name: "",
    bio: "",
    twitter: "",
    instagram: "",
    profileImage: null,
    bannerImage: null,
  });
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const handleFileUpload = (file: File, type: "profile" | "banner") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "profile") {
        setProfilePreview(result);
        setDetails((prev) => ({ ...prev, profileImage: file }));
      } else {
        setBannerPreview(result);
        setDetails((prev) => ({ ...prev, bannerImage: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(details);
    onClose();
    // Reset form
    setDetails({
      name: "",
      bio: "",
      twitter: "",
      instagram: "",
      profileImage: null,
      bannerImage: null,
    });
    setProfilePreview("");
    setBannerPreview("");
  };

  const canSave = details.name.trim() !== "";

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Artist Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Artist Name *</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                className={styles.input}
                placeholder="Enter your artist name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              <textarea
                value={details.bio}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, bio: e.target.value }))
                }
                className={styles.textarea}
                placeholder="Tell fans about yourself..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Image</label>
              <div className={styles.uploadArea}>
                <div
                  className={`${styles.dropzone} ${
                    details.profileImage ? styles.hasFile : ""
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], "profile")
                    }
                    className={styles.fileInput}
                  />
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className={styles.imagePreview}
                    />
                  ) : (
                    <>
                      <User size={32} />
                      <h4>Profile Image</h4>
                      <p>Click to upload or drag and drop</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Banner Image</label>
              <div className={styles.uploadArea}>
                <div
                  className={`${styles.dropzone} ${
                    details.bannerImage ? styles.hasFile : ""
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], "banner")
                    }
                    className={styles.fileInput}
                  />
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className={styles.imagePreview}
                    />
                  ) : (
                    <>
                      <Image size={32} />
                      <h4>Banner Image</h4>
                      <p>Click to upload or drag and drop</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.socialInputs}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Twitter</label>
                <input
                  type="text"
                  value={details.twitter}
                  onChange={(e) =>
                    setDetails((prev) => ({ ...prev, twitter: e.target.value }))
                  }
                  className={styles.input}
                  placeholder="@username"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Instagram</label>
                <input
                  type="text"
                  value={details.instagram}
                  onChange={(e) =>
                    setDetails((prev) => ({
                      ...prev,
                      instagram: e.target.value,
                    }))
                  }
                  className={styles.input}
                  placeholder="@username"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={styles.saveButton}
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailsModal;
