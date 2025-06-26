import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Image, Save } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import {
  createArtist,
  uploadFile,
  getPublicUrl,
  Artist,
} from "../../client/supabase";
import MobileHeader from "../../components/MobileHeader/MobileHeader";
import styles from "./CreateArtistProfile.module.css";

const CreateArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    twitter: "",
    instagram: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File, type: "profile" | "banner") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "profile") {
        setProfilePreview(result);
        setProfileImage(file);
      } else {
        setBannerPreview(result);
        setBannerImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToSupabase = async (
    file: File,
    path: string,
    bucket: string
  ) => {
    const { error } = await uploadFile(bucket, path, file);
    if (error) throw error;
    return getPublicUrl(bucket, path);
  };

  const handleSubmit = async () => {
    console.log("submitting");

    if (!walletAddress || !formData.name.trim()) return;
    console.log("still submitting");

    setIsLoading(true);
    try {
      let profileImageUrl = "";
      let bannerImageUrl = "";

      // Upload profile image if provided
      if (profileImage) {
        console.log("uploading profile image");
        const profilePath = `${walletAddress}-profile-${Date.now()}.${profileImage.name
          .split(".")
          .pop()}`;
        console.log("profilePath", profilePath);
        console.log("profileImage", profileImage);

        profileImageUrl = await uploadImageToSupabase(
          profileImage,
          profilePath,
          "artist-profiles"
        );

        console.log("profile image uploaded", profileImageUrl);
      }

      // Upload banner image if provided
      if (bannerImage) {
        console.log("uploading banner image");
        const bannerPath = `${walletAddress}/banner-${Date.now()}.${bannerImage.name
          .split(".")
          .pop()}`;
        bannerImageUrl = await uploadImageToSupabase(
          bannerImage,
          bannerPath,
          "artist-banners"
        );
        console.log("banner image uploaded", bannerImageUrl);
      }

      console.log("creating artist profile");
      // Create artist profile
      const artistData: Artist = {
        full_name: formData.name.trim(),
        wallet_address: walletAddress.toLowerCase(),
        bio: formData.bio.trim(),
        twitter: formData.twitter.trim(),
        instagram: formData.instagram.trim(),
        profile_image: profileImageUrl || undefined,
        banner_image: bannerImageUrl || undefined,
      };

      console.log("artist data", artistData);

      const { error } = await createArtist(artistData as any);
      if (error) throw error;

      // Navigate back to upload page
      navigate("/upload");
    } catch (error) {
      console.error("Error creating artist profile:", error);
      alert("Failed to create artist profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = formData.name.trim() !== "" && !isLoading;

  return (
    <div className={styles.createProfile}>
      <MobileHeader title="Create Artist Profile" showBack={true} />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Your Artist Profile</h1>
          <p className={styles.subtitle}>
            Set up your artist profile to start uploading tracks and connecting
            with fans
          </p>
        </div>

        <div className={styles.form}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Artist Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={styles.input}
                  placeholder="Enter your artist name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Twitter Handle</label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange("twitter", e.target.value)}
                  className={styles.input}
                  placeholder="@username"
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Instagram Handle</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) =>
                    handleInputChange("instagram", e.target.value)
                  }
                  className={styles.input}
                  placeholder="@username"
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className={styles.textarea}
                  placeholder="Tell fans about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profile Images</h2>
            <div className={styles.uploadSection}>
              <div className={styles.uploadArea}>
                <label className={styles.label}>Profile Image</label>
                <div
                  className={`${styles.dropzone} ${
                    profileImage ? styles.hasFile : ""
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
                      <p>Click to upload</p>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.uploadArea}>
                <label className={styles.label}>Banner Image</label>
                <div
                  className={`${styles.dropzone} ${
                    bannerImage ? styles.hasFile : ""
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
                      className={styles.bannerPreview}
                    />
                  ) : (
                    <>
                      <Image size={32} />
                      <h4>Banner Image</h4>
                      <p>Click to upload</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Creating your artist profile...</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              onClick={() => navigate("/discover")}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={styles.saveButton}
            >
              <Save size={18} />
              {isLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Creating ...</span>
                </div>
              ) : (
                "Create Profile"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateArtistProfile;
