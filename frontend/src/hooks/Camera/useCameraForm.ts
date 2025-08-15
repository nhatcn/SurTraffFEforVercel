import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zone, LaneDirection, LightZoneMapping } from '../../types/Camera/camera';
import API_URL_BE from '../../components/Link/LinkAPI';

// Type for violation type from API
interface ViolationType {
  id: number;
  typeName: string;
}

export const useCameraForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0, selected: false });
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZoneType, setActiveZoneType] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null); // Lưu file thay vì URL
  const [laneDirections, setLaneDirections] = useState<LaneDirection[]>([]);
  const [lightZoneMappings, setLightZoneMappings] = useState<LightZoneMapping[]>([]);
  
  // Speed configuration state
  const [speedLimit, setSpeedLimit] = useState<number>(50);
  
  // Violation type state - now stores ID instead of string
  const [violationTypeId, setViolationTypeId] = useState<number | null>(null);
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [isLoadingViolationTypes, setIsLoadingViolationTypes] = useState(false);
  
  // Loading states
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Fetch violation types from API
  useEffect(() => {
    const fetchViolationTypes = async () => {
      setIsLoadingViolationTypes(true);
      try {
        const response = await fetch(API_URL_BE+"api/violation-type");
        if (!response.ok) {
          throw new Error(`Failed to fetch violation types: ${response.status}`);
        }
        const data: ViolationType[] = await response.json();
        setViolationTypes(data);
        
        // Set default violation type to the first one if available (only if not set)
        if (data.length > 0 && violationTypeId === null) {
          setViolationTypeId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching violation types:", error);
        // Fallback to empty array if API fails
        setViolationTypes([]);
      } finally {
        setIsLoadingViolationTypes(false);
      }
    };

    fetchViolationTypes();
  }, []); // Remove violationTypeId from dependencies to avoid loop

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({
      lat,
      lng,
      selected: true
    });
    setLocationAddress(address);
  };

  const handleDeleteZone = (id: string) => {
    setZones(zones.filter(zone => zone.id !== id));

    // Remove related lane directions
    setLaneDirections(prev => prev.filter(dir =>
      dir.fromZoneId !== id && dir.toZoneId !== id
    ));

    // Remove related light zone mappings
    setLightZoneMappings(prev => prev.filter(mapping =>
      mapping.lightZoneId !== id && mapping.laneZoneId !== id
    ));
  };

  const extractThumbnail = async (streamUrl: string) => {
    if (!streamUrl.trim()) {
      setThumbnailError("Stream URL is required");
      return;
    }

    setIsExtractingThumbnail(true);
    setThumbnailError(null);

    try {
      const response = await fetch("http://localhost:8000/api/thumbnail/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stream_url: streamUrl })
      });

      if (!response.ok) {
        let errorMessage = `Failed to extract thumbnail: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use default error message
        }
        throw new Error(errorMessage);
      }

      // Convert the image response to a blob and create File object
      const blob = await response.blob();
      
      // Create File object with proper name and type
      const timestamp = new Date().getTime();
      const fileName = `thumbnail_${timestamp}.jpg`;
      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(blob);
      
      setThumbnailFile(file); // Lưu file để gửi
      setThumbnailUrl(imageUrl); // Lưu URL để hiển thị preview
      setThumbnailError(null);
    } catch (error: unknown) {
      console.error("Thumbnail extraction error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setThumbnailError(errorMessage);
      setThumbnailUrl(""); // Clear thumbnail on error
      setThumbnailFile(null); // Clear file on error
    } finally {
      setIsExtractingThumbnail(false);
    }
  };

  const handleStreamUrlChange = (url: string) => {
    setStreamUrl(url);
    // Clear thumbnail when URL changes and revoke previous object URL to prevent memory leaks
    if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    // Only clear if it was an extracted thumbnail, not a saved one
    if (thumbnailFile) {
      setThumbnailUrl("");
      setThumbnailFile(null); // Clear file when URL changes
    }
    setThumbnailError(null);
  };

  const handleSubmit = async () => {
    if (!name || !streamUrl || !location.selected || !locationAddress || zones.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!thumbnailUrl) {
      alert("Please extract a thumbnail from the stream URL first.");
      return;
    }

    if (violationTypeId === null) {
      alert("Please select a violation type.");
      return;
    }

    try {
      // Create setup DTO object
      const setupDTO = {
        cameraName: name,
        cameraUrl: streamUrl,
        latitude: location.lat,
        longitude: location.lng,
        location: locationAddress,
        maxSpeed: speedLimit,
        violationTypeId: violationTypeId,
        
        zones: zones.map(z => ({
          id: parseInt(z.id),
          name: z.name,
          zoneType: z.type.toLowerCase(),
          coordinates: JSON.stringify(z.coordinates)
        })),
        zoneLightLaneLinks: lightZoneMappings.map(mapping => ({
          lightZoneId: parseInt(mapping.lightZoneId),
          laneZoneId: parseInt(mapping.laneZoneId)
        })),
        laneMovements: laneDirections.map(dir => ({
          fromLaneZoneId: parseInt(dir.fromZoneId),
          toLaneZoneId: parseInt(dir.toZoneId)
        }))
      };

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add setupDTO as JSON blob with application/json content type
      const setupDTOBlob = new Blob([JSON.stringify(setupDTO)], {
        type: 'application/json'
      });
      formData.append('setupDTO', setupDTOBlob);
      
      // Add thumbnail file (must have a file for new camera)
      if (!thumbnailFile) {
        throw new Error("No thumbnail file available");
      }
      formData.append('thumbnailFile', thumbnailFile, thumbnailFile.name);

      console.log('Sending camera setup data:', setupDTO);
      console.log('Thumbnail file:', thumbnailFile.name, thumbnailFile.size, 'bytes');

      const response = await fetch(API_URL_BE+"api/cameras/setup", {
        method: "POST",
        // Don't set Content-Type header, let browser set it with boundary for multipart
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to setup camera: ${errorData}`);
      }

      alert("Camera setup successfully!");
      
      // Clean up object URL before navigating
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
      
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Setup error:", error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Cleanup function to revoke object URLs
  const cleanup = () => {
    if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailUrl);
    }
  };

  // Helper functions for form population (useful for edit mode)
  const populateForm = (data: {
    name: string;
    streamUrl: string;
    location: { lat: number; lng: number; address: string };
    speedLimit?: number;
    violationTypeId?: number;
    thumbnailUrl?: string;
    zones?: Zone[];
    laneDirections?: LaneDirection[];
    lightZoneMappings?: LightZoneMapping[];
  }) => {
    setName(data.name);
    setStreamUrl(data.streamUrl);
    setLocationAddress(data.location.address);
    setLocation({
      lat: data.location.lat,
      lng: data.location.lng,
      selected: true
    });
    
    if (data.speedLimit !== undefined) setSpeedLimit(data.speedLimit);
    if (data.violationTypeId !== undefined) setViolationTypeId(data.violationTypeId);
    if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
    if (data.zones) setZones(data.zones);
    if (data.laneDirections) setLaneDirections(data.laneDirections);
    if (data.lightZoneMappings) setLightZoneMappings(data.lightZoneMappings);
  };

  // Reset form to initial state
  const resetForm = () => {
    setName("");
    setStreamUrl("");
    setLocationAddress("");
    setLocation({ lat: 0, lng: 0, selected: false });
    setZones([]);
    setActiveZoneType(null);
    setSpeedLimit(50);
    setViolationTypeId(violationTypes.length > 0 ? violationTypes[0].id : null);
    
    // Clean up thumbnail
    if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setThumbnailUrl("");
    setThumbnailFile(null);
    setThumbnailError(null);
    
    setLaneDirections([]);
    setLightZoneMappings([]);
  };

  return {
    // Form state
    name,
    setName,
    streamUrl,
    setStreamUrl: handleStreamUrlChange,
    locationAddress,
    setLocationAddress,
    location,
    zones,
    setZones,
    activeZoneType,
    setActiveZoneType,
    thumbnailUrl,
    setThumbnailUrl,
    thumbnailFile, // Export thumbnail file
    setThumbnailFile, // Export setter for thumbnail file
    laneDirections,
    setLaneDirections,
    lightZoneMappings,
    setLightZoneMappings,
    speedLimit,
    setSpeedLimit,
    violationTypeId,
    setViolationTypeId,
    violationTypes,
    isLoadingViolationTypes,
    
    // Thumbnail extraction state
    isExtractingThumbnail,
    thumbnailError,
    
    // Handlers
    handleLocationSelect,
    handleDeleteZone,
    handleSubmit,
    extractThumbnail,
    cleanup,
    navigate,
    
    // Helper functions for form management
    populateForm,
    resetForm
  };
};