import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
  Avatar,
  Grid,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Description as DescriptionIcon,
  CloudDownload as CloudDownloadIcon,
  Upload as UploadIcon,
  FolderZip as ZipIcon,
  PictureAsPdf as PdfIcon,
  Article as WordIcon,
  InsertChart as ExcelIcon,
  Slideshow as SlideshowIcon,
  Image as ImageIcon,
  TextSnippet as TextSnippetIcon,
  TableChart as TableChartIcon,
  Article as ArticleIcon,
  
} from "@mui/icons-material";
import { motion } from "framer-motion";
import axios from "axios";

const getFileType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return "PDF";
    case "doc":
    case "docx":
      return "Word";
    case "zip":
      return "Archive";
    default:
      return "Other";
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const DocumentView = ({ darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openUpload, setOpenUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: "",
    file: null,
    description: "",
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:8000/Sims/temps/",
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Temp Data:", response.data);
      setCurrentUser(response.data);
      localStorage.setItem("emp_id", response.data.emp_id);
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to load user information");
    }
  };

  // Document type mapping for display names and filtering
const DOCUMENT_TYPES = {
  'Resume': 'Resume',
  'Adhaar Card': 'Adhaar Card',
  'Bonafide Certificate': 'Bonafide Certificate',
  'College ID': 'College ID'
};

  // Fetch documents from backend
  const fetchDocuments = async () => {
    const token = localStorage.getItem("token");
    const emp_id = localStorage.getItem("emp_id");
    try {
      const response = await axios.get(
        `http://localhost:8000/Sims/documents/emp/${emp_id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("Documents Data:", response.data);

      // Transform the response data to match the expected format
    // Filter and transform the response data
    const formattedDocs = response.data.results
      .filter(doc => {
        // Check if document title matches any of our required types
        return Object.values(DOCUMENT_TYPES).includes(doc.title);
      })
      .map(doc => {
        // Get file extension for type detection
        const fileExt = doc.file ? doc.file.split('.').pop().toLowerCase() : '';
        const fileName = doc.file ? doc.file.split('/').pop() : 'No file name';
        
        return {
          ...doc,
          id: doc.id,
          fileName: doc.title, // Use the title as the display name
          originalFileName: fileName,
          fileType: getFileType(fileName),
          fileSize: doc.file_size ? formatFileSize(doc.file_size) : '0 Bytes',
          uploadedAt: new Date(doc.created_at).toLocaleDateString(),
          fileUrl: doc.file,
          status: doc.status
        };
      });

    // Sort documents by title for consistent ordering
    formattedDocs.sort((a, b) => a.fileName.localeCompare(b.fileName));
    
    setDocuments(formattedDocs);
  } catch (error) {
    console.error("Error fetching documents:", error);
    alert("Failed to load documents. Please try again later.");
  }
};

  // Fetch on component mount
  useEffect(() => {
    fetchCurrentUser();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF":
        return (
          <PdfIcon
            sx={{
              color: darkMode ? "#FF616F" : "#FF4567",
              fontSize: 32,
            }}
          />
        );
      case "Word":
        return (
          <WordIcon
            sx={{
              color: darkMode ? "#4A90E2" : "#2B579A",
              fontSize: 32,
            }}
          />
        );
      case "Excel":
        return (
          <ArticleIcon // Using ArticleIcon as placeholder - you might want to import InsertChartIcon for Excel
            sx={{
              color: darkMode ? "#4CAF50" : "#2E7D32",
              fontSize: 32,
            }}
          />
        );
      case "PowerPoint":
        return (
          <SlideshowIcon // You'll need to import this: import SlideshowIcon from '@mui/icons-material/Slideshow';
            sx={{
              color: darkMode ? "#FF7043" : "#E64A19",
              fontSize: 32,
            }}
          />
        );
      case "Archive":
        return (
          <ZipIcon
            sx={{
              color: darkMode ? "#FFC400" : "#F9A825",
              fontSize: 32,
            }}
          />
        );
      case "Image":
        return (
          <ImageIcon // import ImageIcon from '@mui/icons-material/Image';
            sx={{
              color: darkMode ? "#AB47BC" : "#8E24AA",
              fontSize: 32,
            }}
          />
        );
      case "Text":
        return (
          <TextSnippetIcon // import TextSnippetIcon from '@mui/icons-material/TextSnippet';
            sx={{
              color: darkMode ? "#78909C" : "#546E7A",
              fontSize: 32,
            }}
          />
        );
      case "CSV":
        return (
          <TableChartIcon // import TableChartIcon from '@mui/icons-material/TableChart';
            sx={{
              color: darkMode ? "#26A69A" : "#00897B",
              fontSize: 32,
            }}
          />
        );
      default:
        return (
          <DescriptionIcon
            sx={{
              color: darkMode ? "#A1A1AA" : "#757575",
              fontSize: 32,
            }}
          />
        );
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadData((prev) => ({
        ...prev,
        file: file,
        title: file.name.split(".")[0], // Remove extension from title
      }));
    }
  };

  const handleSubmitUpload = async () => {
    if (!uploadData.file || !currentUser) return;

    const formData = new FormData();
    formData.append("title", uploadData.title);
    formData.append("file", uploadData.file);
    formData.append("description", uploadData.description);
    formData.append("uploader", currentUser.emp_id);
    formData.append("receiver", currentUser.emp_id);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:8000/Sims/documents/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // After successful upload, fetch the fresh list
      await fetchDocuments();

      setOpenUpload(false);
      setUploadData({ title: "", file: null, description: "" });
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        (error.response?.data && JSON.stringify(error.response.data)) ||
          error.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const docItem = documents.find((doc) => doc.id === id);
      
      if (!docItem) {
        throw new Error("Document not found");
      }
  
      const downloadUrl = `http://localhost:8000/Sims/documents/${id}/download/`;
      
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: {
          Authorization: `Token ${token}`,
        },
      });
  
      // Extract filename from Content-Disposition header if available
      let filename = docItem.file_name || docItem.name;
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
  
      // Create blob URL
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const blobUrl = window.URL.createObjectURL(blob);
  
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };
    
  const columns = [
    {
      field: "name",
      headerName: "Document Name",
      flex: 2.5,
      minWidth: 300,
      renderCell: (params) => (
        <Box
          sx={{ display: "center", alignItems: "flex", gap: 2, width: "100%" }}
        >
          <Avatar
            sx={{
              bgcolor: darkMode ? "#2A2A2A" : "#F5F5F5",
              borderRadius: 2,
              width: 50,
              paddingBottom: 0,
              height: 35,
              flexShrink: 0,
            }}
          >
            {getFileIcon(params.row.fileType)}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              variant="body1"
              noWrap
              sx={{
                fontWeight: 600,
                background: darkMode
                  ? "linear-gradient(45deg, #8B5CF6, #EC4899)"
                  : "linear-gradient(45deg, #6366F1, #3B82F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {params.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: darkMode ? "#A1A1AA" : "#64748B" }}
            >
              {params.row.fileSize}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "uploadedAt",
      headerName: "Upload Date",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: darkMode ? "#D1D5DB" : "#374151",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      paddingBottom: 10,
      minWidth: 120,
      renderCell: (params) => (
        <Box
          sx={{
            display: "center",
            alignItems: "flex",
            gap: 2,
            width: "100%",
            height: 35,
            paddingtop: 3,
            flexShrink: 0,
          }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={() => handleDownload(params.row.id)}
              sx={{
                bgcolor: darkMode ? "#3F3F46" : "#E0E7FF",
                "&:hover": { bgcolor: darkMode ? "#52525B" : "#C7D2FE" },
              }}
            >
              <CloudDownloadIcon
                sx={{ color: darkMode ? "#A78BFA" : "#4F46E5" }}
              />
            </IconButton>
          </motion.div>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -16,
            left: 0,
            right: 0,
            height: "2px",
            background: darkMode
              ? "linear-gradient(90deg, transparent, #6366F1, transparent)"
              : "linear-gradient(90deg, transparent, #3B82F6, transparent)",
            opacity: 0.3,
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: darkMode
              ? "linear-gradient(45deg, #8B5CF6, #EC4899)"
              : "linear-gradient(45deg, #6366F1, #3B82F6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.05em",
          }}
        >
          Document Hub
        </Typography>
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenUpload(true)}
            sx={{
              bgcolor: darkMode ? "#3B82F6" : "#6366F1",
              color: "white",
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              "&:hover": {
                bgcolor: darkMode ? "#2563EB" : "#4F46E5",
                boxShadow: theme.shadows[6],
              },
            }}
          >
            New Upload
          </Button>
        </motion.div>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              bgcolor: darkMode ? "#2A2A2A" : "#F8FAFC",
              borderRadius: 4,
              boxShadow: theme.shadows[2],
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: darkMode ? "#3B82F620" : "#3B82F610",
                    color: "#3B82F6",
                    width: 48,
                    height: 48,
                  }}
                >
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: darkMode ? "#E5E7EB" : "#1F2937" }}
                  >
                    {documents.length} Documents
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: darkMode ? "#9CA3AF" : "#6B7280" }}
                  >
                    Total Files
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Documents Table */}
      <Card
        sx={{
          bgcolor: darkMode ? "#18181B" : "white",
          borderRadius: 4,
          boxShadow: theme.shadows[4],
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={documents}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-row": {
              marginBottom: "16px",
              borderRadius: "8px",
              "&:last-child": {
                marginBottom: 0,
              },
            },
            "& .MuiDataGrid-cell": {
              border: "none",
              padding: "16px",
              backgroundColor: darkMode ? "#18181B" : "white",
            },
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: darkMode ? "#3F3F46" : "#F3F4F6",
              borderRadius: 0,
              fontSize: "1rem",
              border: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: darkMode ? "#3F3F46" : "#F3F4F6",
              border: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              padding: "0 16px",
              marginTop: "16px",
            },
          }}
          getRowSpacing={(params) => ({
            top: 0,
            bottom: params.isLastVisible ? 0 : 16,
          })}
          showCellVerticalBorder={false}
          showColumnVerticalBorder={false}
        />
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        PaperProps={{
          sx: {
            bgcolor: darkMode ? "#18181B" : "white",
            borderRadius: 4,
            boxShadow: theme.shadows[6],
            minWidth: isMobile ? "90%" : "500px",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: darkMode ? "#3F3F46" : "#F3F4F6",
            color: darkMode ? "#E4E4E7" : "#111827",
            fontWeight: 600,
            py: 2,
            borderRadius: "12px 12px 0 0",
          }}
        >
          Upload New Document
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={uploadData.title}
              onChange={(e) =>
                setUploadData((prev) => ({ ...prev, title: e.target.value }))
              }
              sx={{
                "& .MuiInputBase-root": {
                  bgcolor: darkMode ? "#2A2A2A" : "#F8FAFC",
                  borderRadius: 2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            />
            <Box>
              <input
                accept=".pdf,.doc,.docx,.zip"
                type="file"
                id="upload-file"
                hidden
                onChange={handleFileChange}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{
                    bgcolor: darkMode ? "#3F3F46" : "#F8FAFC",
                    color: darkMode ? "#E4E4E7" : "#111827",
                    borderColor: darkMode ? "#52525B" : "#E5E7EB",
                    "&:hover": {
                      bgcolor: darkMode ? "#52525B" : "#F1F5F9",
                      borderColor: darkMode ? "#71717A" : "#D1D5DB",
                    },
                  }}
                >
                  Choose File
                </Button>
              </label>
              <Typography
                variant="caption"
                sx={{ ml: 2, color: darkMode ? "#A1A1AA" : "#64748B" }}
              >
                {uploadData.file ? uploadData.file.name : "No file selected"}
              </Typography>
            </Box>
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={uploadData.description}
              onChange={(e) =>
                setUploadData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{
                "& .MuiInputBase-root": {
                  bgcolor: darkMode ? "#2A2A2A" : "#F8FAFC",
                  borderRadius: 2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            />
            {isUploading && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            bgcolor: darkMode ? "#3F3F46" : "#F3F4F6",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Button
            onClick={() => setOpenUpload(false)}
            sx={{
              color: darkMode ? "#A1A1AA" : "#64748B",
              "&:hover": {
                bgcolor: darkMode ? "#52525B20" : "#F1F5F9",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitUpload}
            disabled={isUploading || !uploadData.file || !currentUser}
            sx={{
              bgcolor: darkMode ? "#3B82F6" : "#6366F1",
              color: "white",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                bgcolor: darkMode ? "#2563EB" : "#4F46E5",
              },
              "&:disabled": {
                bgcolor: darkMode ? "#3F3F46" : "#E5E7EB",
                color: darkMode ? "#71717A" : "#9CA3AF",
              },
            }}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentView;