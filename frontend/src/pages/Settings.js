import React, { useState, createContext, useContext } from "react";
import {
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Avatar,
  IconButton,
  Box,
} from "@mui/material";        
import {
  DarkMode,
  LightMode,
  Language,
  Notifications,
  Delete,
  AddAPhoto,
} from "@mui/icons-material";

// Create a Theme Context for global theme management
const ThemeContext = createContext();

// Create a Language Context for global language management
const LanguageContext = createContext();

// Translation dictionary
const translations = {
  en: {
    settings: "Settings",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    notifications: "Notifications",
    emailNotifications: "Email Notifications",
    pushNotifications: "Push Notifications",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    deleteAccount: "Delete Account",
    deleteAccountConfirmation: "Are you sure you want to delete your account? This action cannot be undone.",
    delete: "Delete",
    profilePicture: "Profile Picture",
    uploadPhoto: "Upload Photo",
    timezone: "Timezone",
    resetSettings: "Reset to Default Settings",
    resetConfirmation: "Are you sure you want to reset all settings to default?",
    updateProfile: "Update Profile",
    name: "Name",
    email: "Email",
  },
  es: {
    settings: "Configuración",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    language: "Idioma",
    notifications: "Notificaciones",
    emailNotifications: "Notificaciones por Correo",
    pushNotifications: "Notificaciones Push",
    saveChanges: "Guardar Cambios",
    cancel: "Cancelar",
    deleteAccount: "Eliminar Cuenta",
    deleteAccountConfirmation: "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
    delete: "Eliminar",
    profilePicture: "Foto de Perfil",
    uploadPhoto: "Subir Foto",
    timezone: "Zona Horaria",
    resetSettings: "Restablecer Configuración",
    resetConfirmation: "¿Estás seguro de que deseas restablecer todas las configuraciones a los valores predeterminados?",
    updateProfile: "Actualizar Perfil",
    name: "Nombre",
    email: "Correo Electrónico",
  },
  fr: {
    settings: "Paramètres",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    language: "Langue",
    notifications: "Notifications",
    emailNotifications: "Notifications par E-mail",
    pushNotifications: "Notifications Push",
    saveChanges: "Enregistrer les Modifications",
    cancel: "Annuler",
    deleteAccount: "Supprimer le Compte",
    deleteAccountConfirmation: "Êtes-vous sûr de vouloir supprimer votre compte? Cette action ne peut pas être annulée.",
    delete: "Supprimer",
    profilePicture: "Photo de Profil",
    uploadPhoto: "Télécharger une Photo",
    timezone: "Fuseau Horaire",
    resetSettings: "Réinitialiser les Paramètres",
    resetConfirmation: "Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut?",
    updateProfile: "Mettre à Jour le Profil",
    name: "Nom",
    email: "E-mail",
  },
  de: {
    settings: "Einstellungen",
    darkMode: "Dunkler Modus",
    lightMode: "Heller Modus",
    language: "Sprache",
    notifications: "Benachrichtigungen",
    emailNotifications: "E-Mail-Benachrichtigungen",
    pushNotifications: "Push-Benachrichtigungen",
    saveChanges: "Änderungen speichern",
    cancel: "Abbrechen",
    deleteAccount: "Konto löschen",
    deleteAccountConfirmation: "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
    delete: "Löschen",
    profilePicture: "Profilbild",
    uploadPhoto: "Foto hochladen",
    timezone: "Zeitzone",
    resetSettings: "Einstellungen zurücksetzen",
    resetConfirmation: "Sind Sie sicher, dass Sie alle Einstellungen auf die Standardwerte zurücksetzen möchten?",
    updateProfile: "Profil aktualisieren",
    name: "Name",
    email: "E-Mail",
  },
  zh: {
    settings: "设置",
    darkMode: "暗模式",
    lightMode: "亮模式",
    language: "语言",
    notifications: "通知",
    emailNotifications: "电子邮件通知",
    pushNotifications: "推送通知",
    saveChanges: "保存更改",
    cancel: "取消",
    deleteAccount: "删除账户",
    deleteAccountConfirmation: "您确定要删除您的账户吗？此操作无法撤消。",
    delete: "删除",
    profilePicture: "个人资料图片",
    uploadPhoto: "上传照片",
    timezone: "时区",
    resetSettings: "重置为默认设置",
    resetConfirmation: "您确定要将所有设置重置为默认值吗？",
    updateProfile: "更新个人资料",
    name: "名字",
    email: "电子邮件",
  },
  hi: {
    settings: "सेटिंग्स",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    language: "भाषा",
    notifications: "सूचनाएं",
    emailNotifications: "ईमेल सूचनाएं",
    pushNotifications: "पुश सूचनाएं",
    saveChanges: "परिवर्तन सहेजें",
    cancel: "रद्द करें",
    deleteAccount: "खाता हटाएं",
    deleteAccountConfirmation: "क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
    delete: "हटाएं",
    profilePicture: "प्रोफाइल चित्र",
    uploadPhoto: "फोटो अपलोड करें",
    timezone: "समय क्षेत्र",
    resetSettings: "डिफ़ॉल्ट सेटिंग्स पर रीसेट करें",
    resetConfirmation: "क्या आप वाकई सभी सेटिंग्स को डिफ़ॉल्ट मानों पर रीसेट करना चाहते हैं?",
    updateProfile: "प्रोफाइल अपडेट करें",
    name: "नाम",
    email: "ईमेल",
  },
};

// Theme Provider Wrapper
export const ThemeProviderWrapper = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Ensures consistent baseline styles */}
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Language Provider Wrapper
export const LanguageProviderWrapper = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to access theme context
export const useThemeContext = () => useContext(ThemeContext);

// Custom hook to access language context
export const useLanguageContext = () => useContext(LanguageContext);

const Settings = () => {
  const { darkMode, toggleTheme } = useThemeContext();
  const { language, changeLanguage } = useLanguageContext();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  // State for notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // State for account deletion dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // State for reset settings dialog
  const [openResetDialog, setOpenResetDialog] = useState(false);

  // State for user profile
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    profilePicture: null,
  });

  // State for form fields
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // State for form validation errors
  const [emailError, setEmailError] = useState("");

  // Function to determine avatar based on email
  const getAvatar = (email) => {
    if (email.includes("male") || email.includes("john")) {
      return "https://www.w3schools.com/howto/img_avatar.png"; // Male avatar
    } else if (email.includes("female") || email.includes("jane")) {
      return "https://www.w3schools.com/howto/img_avatar2.png"; // Female avatar
    } else {
      return "https://www.w3schools.com/howto/img_avatar.png"; // Default avatar
    }
  };

  // Handle language change
  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({ ...user, profilePicture: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle delete account dialog
  const handleDeleteDialogOpen = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  // Handle reset settings dialog
  const handleResetDialogOpen = () => {
    setOpenResetDialog(true);
  };

  const handleResetDialogClose = () => {
    setOpenResetDialog(false);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    console.log("Account deleted");
    setOpenDeleteDialog(false);
  };

  // Handle reset to default settings
  const handleResetSettings = () => {
    // Reset all settings to default values
    toggleTheme(false); // Reset to light mode
    changeLanguage("en"); // Reset to English
    setEmailNotifications(true); // Reset email notifications to on
    setPushNotifications(false); // Reset push notifications to off
    setUser({
      name: "John Doe",
      email: "john.doe@example.com",
      profilePicture: null,
    }); // Reset user profile
    setName("John Doe"); // Reset name
    setEmail("john.doe@example.com"); // Reset email
    setOpenResetDialog(false); // Close the reset dialog
    console.log("Settings reset to default");
  };

  // Handle profile update
  const handleUpdateProfile = () => {
    if (name && email) {
      setUser({ ...user, name, email });
      console.log("Profile updated");
    }
  };

  // Get translations based on the selected language
  const t = translations[language];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* User Profile Section */}
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar
          src={user.profilePicture || getAvatar(user.email)}
          sx={{ width: 100, height: 100, mr: 2 }}
        />
        <Box>
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="body1">{user.email}</Typography>
        </Box>
      </Box>

      {/* Theme Toggle */}
      <FormControlLabel
        control={
          <Switch checked={darkMode} onChange={toggleTheme} color="primary" />
        }
        label={darkMode ? t.darkMode : t.lightMode}
        sx={{ mb: 2 }}
      />
      {darkMode ? <DarkMode sx={{ mr: 1 }} /> : <LightMode sx={{ mr: 1 }} />}

      {/* Language Selection */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        <Language sx={{ mr: 1 }} />
        {t.language}
      </Typography>
      <Select value={language} onChange={handleLanguageChange} fullWidth sx={{ mb: 2 }}>
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="zh">中文</MenuItem>
        <MenuItem value="hi">हिंदी</MenuItem>
      </Select>

      {/* Profile Picture Upload */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        {t.profilePicture}
      </Typography>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="profile-picture-upload"
        type="file"
        onChange={handleProfilePictureUpload}
      />
      <label htmlFor="profile-picture-upload">
        <Button variant="contained" component="span" startIcon={<AddAPhoto />}>
          {t.uploadPhoto}
        </Button>
      </label>

      {/* Update Profile Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        {t.updateProfile}
      </Typography>
      <TextField
        label={t.name}
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label={t.email}
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!emailError}
        helperText={emailError}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleUpdateProfile}>
        {t.saveChanges}
      </Button>

      {/* Notification Preferences */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        <Notifications sx={{ mr: 1 }} />
        {t.notifications}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            color="primary"
          />
        }
        label={t.emailNotifications}
        sx={{ mb: 1 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
            color="primary"
          />
        }
        label={t.pushNotifications}
        sx={{ mb: 2 }}
      />

      {/* Reset to Default Settings */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        {t.resetSettings}
      </Typography>
      <Button variant="contained" color="warning" onClick={handleResetDialogOpen}>
        {t.resetSettings}
      </Button>

      {/* Reset Settings Confirmation Dialog */}
      <Dialog open={openResetDialog} onClose={handleResetDialogClose}>
        <DialogTitle>{t.resetSettings}</DialogTitle>
        <DialogContent>
          <Typography>{t.resetConfirmation}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetDialogClose} color="primary">
            {t.cancel}
          </Button>
          <Button onClick={handleResetSettings} color="warning">
            {t.resetSettings}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        <Delete sx={{ mr: 1 }} />
        {t.deleteAccount}
      </Typography>
      <Button variant="contained" color="error" onClick={handleDeleteDialogOpen}>
        {t.deleteAccount}
      </Button>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>{t.deleteAccount}</DialogTitle>
        <DialogContent>
          <Typography>{t.deleteAccountConfirmation}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            {t.cancel}
          </Button>
          <Button onClick={handleDeleteAccount} color="error">
            {t.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Wrap the app with the ThemeProviderWrapper and LanguageProviderWrapper
const App = () => {
  return (
    <ThemeProviderWrapper>
      <LanguageProviderWrapper>
        <Settings />
      </LanguageProviderWrapper>
    </ThemeProviderWrapper>
  );
};

export default App;