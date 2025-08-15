"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Camera,
  User,
  Mail,
  Car,
  MapPin,
  Clock,
  Edit3,
  Save,
  X,
  ImageIcon,
  Video,
  Shield,
  FileText,
  Sparkles,
  Eye,
} from "lucide-react"
import { Button } from "../../components/UI/AccidentUI/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/UI/AccidentUI/card"
import { Textarea } from "../../components/UI/AccidentUI/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/UI/AccidentUI/dialog"
import { LoadingScreen, ErrorScreen } from "../../components/UI/AccidentUI/loading"
import { getStatusBadge } from "../../components/Accidents/status-badge"
import { getYouTubeEmbedUrl } from "../../components/Accidents/video-utils"
import type { AccidentType } from "../../types/Accident/accident"
import { motion } from "framer-motion"
import API_URL_BE from "../Link/LinkAPI"

export default function AccidentDetailsTable() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [accident, setAccident] = useState<AccidentType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageKey, setImageKey] = useState(Date.now())
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setImageLoading(true)
    setDisplayImageUrl(null)
    fetch(API_URL_BE+`api/accident/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched accident data:", data)
        console.log("Raw status from API:", data.status)
        setAccident({
          ...data,
          camera: { id: data.cameraId, name: data.cameraName || "Unknown" },
          accidentTime: new Date(data.accidentTime).toISOString(),
          createdAt: new Date(data.createdAt).toISOString(),
          userFullName: data.userFullName || "No data",
          userEmail: data.userEmail || "No data",
          licensePlate: data.licensePlate || "No data",
          status: data.status ? data.status.toLowerCase() : "unknown",
        })
        setEditDescription(data.description || "")
        setDisplayImageUrl(data.imageUrl ? `${data.imageUrl}?t=${Date.now()}` : null)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch accident data:", error)
        setError("Failed to load accident data")
        setLoading(false)
        setImageLoading(false)
      })
  }, [id])

  const handleSave = async () => {
    if (!accident) return
    try {
      const updatedAccident = { description: editDescription }
      const res = await fetch(API_URL_BE+`api/accident/${accident.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccident),
      })
      const updatedData = await res.json()
      if (!res.ok) {
        alert("Failed to update description.")
        return
      }
      setAccident({
        ...updatedData,
        camera: {
          id: updatedData.cameraId,
          name: updatedData.cameraName || "Unknown",
        },
        accidentTime: new Date(updatedData.accidentTime).toISOString(),
        createdAt: new Date(updatedData.createdAt).toISOString(),
        userFullName: updatedData.userFullName || "No data",
        userEmail: updatedData.userEmail || "No data",
        licensePlate: updatedData.licensePlate || "No data",
        status: updatedData.status ? updatedData.status.toLowerCase() : "unknown",
      })
      setIsEditing(false)
      setShowConfirm(false)
    } catch (error) {
      console.error("Error saving description:", error)
      alert("An error occurred while updating the description.")
    }
  }

  const handleApprove = async () => {
    if (!accident) return
    try {
      const res = await fetch(API_URL_BE+`api/accident/${accident.id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
      const responseText = await res.text()
      let updatedData
      try {
        updatedData = JSON.parse(responseText)
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError)
        alert("Invalid response from server.")
        return
      }
      if (!res.ok) {
        alert("Failed to approve accident.")
        return
      }
      setAccident({
        ...updatedData,
        camera: {
          id: updatedData.cameraId,
          name: updatedData.cameraName || "Unknown",
        },
        accidentTime: new Date(updatedData.accidentTime).toISOString(),
        createdAt: new Date(updatedData.createdAt).toISOString(),
        userFullName: updatedData.userFullName || "No data",
        userEmail: updatedData.userEmail || "No data",
        licensePlate: updatedData.licensePlate || "No data",
        status: updatedData.status ? updatedData.status.toLowerCase() : "unknown",
      })
      navigate("/accidentdashboard")
    } catch (error) {
      console.error("Error approving accident:", error)
      alert("An error occurred while approving the accident.")
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !accident) {
    return <ErrorScreen error={error || "Accident Not Found"} onBackClick={() => navigate("/accidentdashboard")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements - More subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-50/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="mb-8 bg-gradient-to-r from-white/90 via-blue-50/90 to-purple-50/90 rounded-2xl shadow-xl border border-blue-200/70 p-6 backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Accident Details
                </h1>
                <p className="text-gray-600 font-medium flex items-center"></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(accident.status)}
              {accident.status === "pending" &&
                (!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="primary" className="inline-flex items-center">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setShowConfirm(true)} variant="success" className="inline-flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setEditDescription(accident.description || "")
                      }}
                      variant="secondary"
                      className="inline-flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-white/95 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-5">
                  <CardTitle className="flex items-center text-white text-xl">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mr-3 shadow-inner">
                      <Calendar className="w-5 h-5" />
                    </div>
                    Incident Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Incident Time</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {new Date(accident.accidentTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Reported At</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {new Date(accident.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Location</p>
                      <p className="text-gray-900 font-semibold text-lg">{accident.location}</p>
                    </div>
                  </div>
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Camera Source</p>
                      <p className="text-gray-900 font-semibold text-lg">{accident.camera.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vehicle Owner Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/95 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-5">
                  <CardTitle className="flex items-center text-white text-xl">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mr-3 shadow-inner">
                      <User className="w-5 h-5" />
                    </div>
                    Vehicle Owner Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Full Name</p>
                      <p className="text-gray-900 font-semibold text-lg">{accident.userFullName}</p>
                    </div>
                  </div>
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Email Address</p>
                      <p className="text-gray-900 font-semibold text-lg">{accident.userEmail}</p>
                    </div>
                  </div>
                  <div className="group flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md md:col-span-2">
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">License Plate</p>
                      <div className="mt-2">
                        <span className="inline-block text-gray-900 font-mono font-bold text-xl bg-blue-100 px-5 py-2 rounded-xl border-2 border-blue-200 shadow-sm transition-all duration-300 hover:shadow-md">
                          {accident.licensePlate}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white/95 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-5">
                  <CardTitle className="flex items-center text-white text-xl">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mr-3 shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                    Incident Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Enter incident description..."
                      className="min-h-[150px] resize-y focus:ring-4 focus:ring-blue-300 border-2 hover:border-blue-300 rounded-xl p-4 text-lg"
                      rows={5}
                    />
                  ) : (
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 hover:shadow-md transition-all duration-300">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg">
                        {accident.description || "No description available."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Media & Actions */}
          <div className="space-y-6">
            {/* Incident Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white/95 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-5">
                  <CardTitle className="flex items-center text-white text-xl">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mr-3 shadow-inner">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    Incident Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative">
                    {displayImageUrl ? (
                      <div className="relative group">
                        {imageLoading && (
                          <div className="bg-blue-50 rounded-xl p-8 text-center animate-pulse border border-blue-200 min-h-[250px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-blue-700 font-medium ml-3">Loading image...</p>
                          </div>
                        )}
                        <img
                          key={imageKey}
                          src={displayImageUrl || "/placeholder.svg?height=300&width=400"}
                          alt="Incident"
                          className="w-full rounded-xl object-cover shadow-lg border border-gray-200 transition-all duration-500 group-hover:scale-102 group-hover:shadow-xl"
                          style={{
                            maxHeight: "350px",
                            minHeight: "250px",
                            display: imageLoading ? "none" : "block",
                          }}
                          data-image-url={displayImageUrl}
                          onLoad={() => {
                            console.log("Image loaded successfully:", displayImageUrl)
                            setImageLoading(false)
                          }}
                          onError={() => {
                            console.error("Failed to load image:", displayImageUrl)
                            setDisplayImageUrl("/placeholder.svg?height=300&width=400")
                            setImageLoading(false)
                            setImageKey(Date.now())
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                          <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white shadow-xl">
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-200 hover:shadow-md transition-all duration-300 min-h-[250px] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-blue-700 font-medium text-lg">No image available for this accident</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Incident Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-white/95 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-5">
                  <CardTitle className="flex items-center text-white text-xl">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mr-3 shadow-inner">
                      <Video className="w-5 h-5" />
                    </div>
                    Incident Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {accident.videoUrl ? (
                    <div className="relative group">
                      {getYouTubeEmbedUrl(accident.videoUrl)?.includes("youtube.com") ? (
                        <iframe
                          className="w-full rounded-xl shadow-lg border border-gray-200 transition-all duration-300 group-hover:shadow-xl"
                          style={{ height: "250px" }}
                          src={getYouTubeEmbedUrl(accident.videoUrl) || ""}
                          title="Incident Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <video
                            src={accident.videoUrl || ""}
                            controls
                            className="w-full rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
                            style={{ maxHeight: "250px" }}
                            onError={(e) => {
                              console.error("Failed to load video:", accident.videoUrl)
                              e.currentTarget.style.display = "none"
                              if (e.currentTarget.nextElementSibling) {
                                ;(e.currentTarget.nextElementSibling as HTMLElement).style.display = "block"
                              }
                            }}
                          />
                          <div
                            className="bg-blue-50 rounded-xl p-8 text-center border border-blue-200 min-h-[250px] flex flex-col items-center justify-center"
                            style={{ display: "none" }}
                          >
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Video className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-blue-700 font-medium text-lg">Failed to load video</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-200 hover:shadow-md transition-all duration-300 min-h-[250px] flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-blue-700 font-medium text-lg">No video available for this accident</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Approval Action */}
            {accident.status === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-2 border-blue-300 bg-blue-50/95 shadow-2xl hover:shadow-3xl rounded-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-5">
                    <CardTitle className="flex items-center text-white text-xl">
                      <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mr-3 shadow-inner">
                        <Shield className="w-5 h-5" />
                      </div>
                      Review Action
                      <Sparkles className="w-5 h-5 ml-2 animate-pulse-slow" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button
                      onClick={handleApprove}
                      variant="success"
                      className="w-full shadow-xl hover:shadow-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 text-lg py-3 flex items-center justify-center" // Added flex items-center justify-center
                      size="lg"
                    >
                      Approve Accident
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-white border-2 border-blue-200 shadow-2xl rounded-2xl p-8">
          <DialogHeader>
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
              <Save className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-blue-800 mb-2">Confirm Changes</DialogTitle>
            <DialogDescription className="text-center text-gray-600 text-lg">
              Are you sure you want to save the updated description? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="flex items-center px-6 py-3 text-lg"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
